"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  Ban,
  BedDouble,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  ConciergeBell,
  Globe2,
  Link2,
  Pencil,
  Plus,
  RadioTower,
  Search,
  Trash2,
} from "lucide-react";

import {
  usePms,
} from "@/context/PmsContext";

import Modal from "@/components/Modal";


/* =====================================================
   HELPERS
===================================================== */

function nowText() {
  return new Date().toLocaleString(
    "vi-VN"
  );
}


function makeId(
  prefix
) {
  return `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}


function money(
  value
) {
  return `${Number(
    value || 0
  ).toLocaleString(
    "vi-VN"
  )} ₫`;
}


/* =====================================================
   SALES CHANNEL

   Existing Rate Plan chưa có salesChannel.
   Ta infer để tương thích data cũ.

   - WEB...       => Website Direct
   - FRONT / FD   => Front Desk
   - Có Channex   => OTA
   - BAR/BB cũ    => OTA
===================================================== */

function getSalesChannel(
  ratePlan
) {
  if (
    ratePlan?.salesChannel
  ) {
    return ratePlan.salesChannel;
  }


  const code =
    String(
      ratePlan?.code ||
      ""
    ).toUpperCase();


  if (
    code.includes(
      "WEB"
    )
  ) {
    return "Website Direct";
  }


  if (
    code.includes(
      "FRONT"
    ) ||
    code.includes(
      "WALK"
    ) ||
    code ===
      "FD"
  ) {
    return "Front Desk";
  }


  if (
    ratePlan?.mapped ||
    ratePlan?.channexRatePlanId
  ) {
    return "OTA";
  }


  /*
   * Data demo cũ chủ yếu là
   * BAR / Room Only / Breakfast.
   *
   * Tạm xem là OTA cho tới khi
   * người dùng Edit và chọn channel.
   */
  return "OTA";
}


/* =====================================================
   RATE POLICY

   Sales Channel = bán ở đâu.
   Rate Policy   = bán theo điều kiện gì.
===================================================== */

function getRatePolicy(
  ratePlan
) {
  if (
    ratePlan?.ratePolicy
  ) {
    return ratePlan.ratePolicy;
  }


  const name =
    String(
      ratePlan?.name ||
      ""
    ).toLowerCase();


  if (
    name.includes(
      "breakfast"
    )
  ) {
    return "Breakfast Included";
  }


  if (
    name.includes(
      "room only"
    )
  ) {
    return "Room Only";
  }


  if (
    name.includes(
      "non-refundable"
    ) ||
    name.includes(
      "non refundable"
    )
  ) {
    return "Non-refundable";
  }


  return "Flexible";
}


/* =====================================================
   CHANNEL META
===================================================== */

function getChannelMeta(
  channel
) {
  if (
    channel ===
    "Website Direct"
  ) {
    return {
      label:
        "Website Direct",

      shortLabel:
        "Website",

      description:
        "cityhousebooking.com",

      badgeClass:
        "status-success",

      icon:
        Globe2,
    };
  }


  if (
    channel ===
    "Front Desk"
  ) {
    return {
      label:
        "Front Desk",

      shortLabel:
        "Front Desk",

      description:
        "Walk-in / Phone",

      badgeClass:
        "status-info",

      icon:
        ConciergeBell,
    };
  }


  return {
    label:
      "OTA / Channex",

    shortLabel:
      "OTA",

    description:
      "Booking.com / Agoda / OTA",

    badgeClass:
      "status-warning",

    icon:
      RadioTower,
  };
}


/* =====================================================
   EMPTY FORM
===================================================== */

function createEmptyForm() {
  return {
    propertyId:
      "",

    roomTypeId:
      "",

    name:
      "",

    code:
      "",

    salesChannel:
      "Website Direct",

    ratePolicy:
      "Room Only",

    baseRate:
      "",

    minimumStay:
      1,

    stopSell:
      false,

    channexRatePlanId:
      "",
  };
}


/* =====================================================
   MAIN
===================================================== */

export default function RatePlanManager() {
  const {
    data,
    setData,
    ready,
  } = usePms();


  const properties =
    data.properties || [];

  const roomTypes =
    data.roomTypes || [];

  const ratePlans =
    data.ratePlans || [];

  const rateCalendar =
    data.rateCalendar || [];

  const reservations =
    data.reservations || [];


  /* ===================================================
     FILTER
  =================================================== */

  const [
    search,
    setSearch,
  ] = useState("");


  const [
    propertyFilter,
    setPropertyFilter,
  ] = useState("");


  const [
    roomTypeFilter,
    setRoomTypeFilter,
  ] = useState("");


  const [
    channelFilter,
    setChannelFilter,
  ] = useState("");


  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");


  /* ===================================================
     MODAL
  =================================================== */

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);


  const [
    editingId,
    setEditingId,
  ] = useState(null);


  const [
    form,
    setForm,
  ] = useState(
    createEmptyForm()
  );


  /* ===================================================
     LOOKUP
  =================================================== */

  function getProperty(
    propertyId
  ) {
    return properties.find(
      (property) =>
        property.id ===
        propertyId
    );
  }


  function getRoomType(
    roomTypeId
  ) {
    return roomTypes.find(
      (roomType) =>
        roomType.id ===
        roomTypeId
    );
  }


  /* ===================================================
     SUMMARY
  =================================================== */

  const summary =
    useMemo(
      () => {
        return {
          total:
            ratePlans.length,

          website:
            ratePlans.filter(
              (ratePlan) =>
                getSalesChannel(
                  ratePlan
                ) ===
                "Website Direct"
            ).length,

          ota:
            ratePlans.filter(
              (ratePlan) =>
                getSalesChannel(
                  ratePlan
                ) ===
                "OTA"
            ).length,

          frontDesk:
            ratePlans.filter(
              (ratePlan) =>
                getSalesChannel(
                  ratePlan
                ) ===
                "Front Desk"
            ).length,
        };
      },
      [
        ratePlans,
      ]
    );


  /* ===================================================
     FILTERED ROOM TYPE OPTIONS
  =================================================== */

  const filterRoomTypes =
    useMemo(
      () =>
        roomTypes.filter(
          (roomType) =>
            !propertyFilter ||
            roomType.propertyId ===
              propertyFilter
        ),
      [
        roomTypes,
        propertyFilter,
      ]
    );


  const formRoomTypes =
    useMemo(
      () =>
        roomTypes.filter(
          (roomType) =>
            !form.propertyId ||
            roomType.propertyId ===
              form.propertyId
        ),
      [
        roomTypes,
        form.propertyId,
      ]
    );


  /* ===================================================
     FILTERED DATA
  =================================================== */

  const filteredRatePlans =
    useMemo(
      () => {
        const q =
          search
            .trim()
            .toLowerCase();


        return ratePlans.filter(
          (ratePlan) => {
            const property =
              properties.find(
                (item) =>
                  item.id ===
                  ratePlan.propertyId
              );


            const roomType =
              roomTypes.find(
                (item) =>
                  item.id ===
                  ratePlan.roomTypeId
              );


            const channel =
              getSalesChannel(
                ratePlan
              );


            const searchMatch =
              !q ||
              [
                ratePlan.name,
                ratePlan.code,
                property?.name,
                roomType?.name,
                channel,
                getRatePolicy(
                  ratePlan
                ),
                ratePlan.channexRatePlanId,
              ]
                .join(
                  " "
                )
                .toLowerCase()
                .includes(
                  q
                );


            const propertyMatch =
              !propertyFilter ||
              ratePlan.propertyId ===
                propertyFilter;


            const roomTypeMatch =
              !roomTypeFilter ||
              ratePlan.roomTypeId ===
                roomTypeFilter;


            const channelMatch =
              !channelFilter ||
              channel ===
                channelFilter;


            const statusMatch =
              !statusFilter ||
              (
                statusFilter ===
                  "Open" &&
                !ratePlan.stopSell
              ) ||
              (
                statusFilter ===
                  "Stop Sell" &&
                Boolean(
                  ratePlan.stopSell
                )
              );


            return (
              searchMatch &&
              propertyMatch &&
              roomTypeMatch &&
              channelMatch &&
              statusMatch
            );
          }
        );
      },
      [
        ratePlans,
        properties,
        roomTypes,
        search,
        propertyFilter,
        roomTypeFilter,
        channelFilter,
        statusFilter,
      ]
    );


  /* ===================================================
     CREATE
  =================================================== */

  function openCreate() {
    setEditingId(
      null
    );


    setForm(
      createEmptyForm()
    );


    setModalOpen(
      true
    );
  }


  /* ===================================================
     EDIT
  =================================================== */

  function openEdit(
    ratePlan
  ) {
    setEditingId(
      ratePlan.id
    );


    setForm({
      propertyId:
        ratePlan.propertyId ||
        "",

      roomTypeId:
        ratePlan.roomTypeId ||
        "",

      name:
        ratePlan.name ||
        "",

      code:
        ratePlan.code ||
        "",

      salesChannel:
        getSalesChannel(
          ratePlan
        ),

      ratePolicy:
        getRatePolicy(
          ratePlan
        ),

      baseRate:
        ratePlan.baseRate ??
        "",

      minimumStay:
        ratePlan.minimumStay ??
        1,

      stopSell:
        Boolean(
          ratePlan.stopSell
        ),

      channexRatePlanId:
        ratePlan.channexRatePlanId ||
        "",
    });


    setModalOpen(
      true
    );
  }


  /* ===================================================
     CLOSE
  =================================================== */

  function closeModal() {
    setModalOpen(
      false
    );


    setEditingId(
      null
    );


    setForm(
      createEmptyForm()
    );
  }


  /* ===================================================
     CHANGE PROPERTY

     Khi đổi Property => clear Room Type
     để tránh chọn Room Type của khách sạn khác.
  =================================================== */

  function handlePropertyChange(
    propertyId
  ) {
    setForm(
      (current) => ({
        ...current,

        propertyId,

        roomTypeId:
          "",
      })
    );
  }


  /* ===================================================
     CHANGE SALES CHANNEL
  =================================================== */

  function handleSalesChannelChange(
    salesChannel
  ) {
    setForm(
      (current) => ({
        ...current,

        salesChannel,

        /*
         * Website / Front Desk
         * không cần Channex Mapping.
         */

        channexRatePlanId:
          salesChannel ===
          "OTA"
            ? current.channexRatePlanId
            : "",
      })
    );
  }


  /* ===================================================
     SAVE
  =================================================== */

  function saveRatePlan() {
    if (
      !form.propertyId
    ) {
      alert(
        "Vui lòng chọn Property."
      );

      return;
    }


    if (
      !form.roomTypeId
    ) {
      alert(
        "Vui lòng chọn Room Type."
      );

      return;
    }


    if (
      !form.name.trim()
    ) {
      alert(
        "Vui lòng nhập tên Rate Plan."
      );

      return;
    }


    if (
      !form.code.trim()
    ) {
      alert(
        "Vui lòng nhập Code."
      );

      return;
    }


    if (
      form.baseRate ===
        "" ||
      Number(
        form.baseRate
      ) <
        0
    ) {
      alert(
        "Base Rate không hợp lệ."
      );

      return;
    }


    if (
      Number(
        form.minimumStay
      ) <
      1
    ) {
      alert(
        "Minimum Stay phải từ 1 đêm."
      );

      return;
    }


    /*
     * Code không được trùng
     * trong cùng Property + Room Type.
     */

    const duplicate =
      ratePlans.some(
        (ratePlan) =>
          ratePlan.id !==
            editingId &&
          ratePlan.propertyId ===
            form.propertyId &&
          ratePlan.roomTypeId ===
            form.roomTypeId &&
          String(
            ratePlan.code
          ).toUpperCase() ===
            form.code
              .trim()
              .toUpperCase()
      );


    if (
      duplicate
    ) {
      alert(
        "Code này đã tồn tại trong Room Type đang chọn."
      );

      return;
    }


    const actionTime =
      nowText();


    const isOta =
      form.salesChannel ===
      "OTA";


    const channexId =
      isOta
        ? form.channexRatePlanId.trim()
        : "";


    const payload = {
      propertyId:
        form.propertyId,

      roomTypeId:
        form.roomTypeId,

      name:
        form.name.trim(),

      code:
        form.code
          .trim()
          .toUpperCase(),

      /*
       * FIELD MỚI
       *
       * Website Direct
       * OTA
       * Front Desk
       */

      salesChannel:
        form.salesChannel,

      /*
       * FIELD MỚI
       *
       * Room Only
       * Breakfast Included
       * Flexible
       * Non-refundable
       */

      ratePolicy:
        form.ratePolicy,

      baseRate:
        Number(
          form.baseRate
        ),

      minimumStay:
        Number(
          form.minimumStay ||
          1
        ),

      stopSell:
        Boolean(
          form.stopSell
        ),

      /*
       * Chỉ OTA mới mapping Channex.
       */

      channexRatePlanId:
        channexId,

      mapped:
        Boolean(
          isOta &&
          channexId
        ),

      lastSync:
        isOta &&
        channexId
          ? actionTime
          : "",
    };


    /* ===============================================
       UPDATE
    =============================================== */

    if (
      editingId
    ) {
      setData(
        (current) => ({
          ...current,

          ratePlans:
            (
              current.ratePlans ||
              []
            ).map(
              (ratePlan) =>
                ratePlan.id ===
                editingId
                  ? {
                      ...ratePlan,

                      ...payload,

                      updatedAt:
                        actionTime,

                      logs: [
                        `${actionTime} — Đã cập nhật Rate Plan ${payload.code}`,

                        `${actionTime} — Sales Channel: ${payload.salesChannel}`,

                        ...(
                          ratePlan.logs ||
                          []
                        ),
                      ],
                    }
                  : ratePlan
            ),
        })
      );


      closeModal();

      return;
    }


    /* ===============================================
       CREATE
    =============================================== */

    const newRatePlan = {
      id:
        makeId(
          "rateplan"
        ),

      ...payload,

      createdAt:
        actionTime,

      updatedAt:
        actionTime,

      logs: [
        `${actionTime} — Đã tạo Rate Plan`,

        `${actionTime} — Sales Channel: ${payload.salesChannel}`,
      ],
    };


    setData(
      (current) => ({
        ...current,

        ratePlans: [
          newRatePlan,

          ...(
            current.ratePlans ||
            []
          ),
        ],
      })
    );


    closeModal();
  }


  /* ===================================================
     STOP SELL
  =================================================== */

  function toggleStopSell(
    ratePlan
  ) {
    const actionTime =
      nowText();


    const nextValue =
      !ratePlan.stopSell;


    setData(
      (current) => ({
        ...current,

        ratePlans:
          (
            current.ratePlans ||
            []
          ).map(
            (item) =>
              item.id ===
                ratePlan.id
                ? {
                    ...item,

                    stopSell:
                      nextValue,

                    updatedAt:
                      actionTime,

                    logs: [
                      `${actionTime} — ${
                        nextValue
                          ? "Đã Stop Sell"
                          : "Đã mở bán lại"
                      } Rate Plan`,

                      ...(
                        item.logs ||
                        []
                      ),
                    ],
                  }
                : item
          ),
      })
    );
  }


  /* ===================================================
     DELETE
  =================================================== */

  function deleteRatePlan(
    ratePlan
  ) {
    const usedByReservation =
      reservations.some(
        (reservation) =>
          reservation.ratePlanId ===
          ratePlan.id
      );


    const usedByCalendar =
      rateCalendar.some(
        (calendar) =>
          calendar.ratePlanId ===
          ratePlan.id
      );


    if (
      usedByReservation ||
      usedByCalendar
    ) {
      alert(
        "Rate Plan này đang được Reservation hoặc Rate Calendar sử dụng. Không nên xóa. Hãy dùng Stop Sell để ngừng bán."
      );

      return;
    }


    const accepted =
      window.confirm(
        `Xóa Rate Plan "${ratePlan.name}"?`
      );


    if (
      !accepted
    ) {
      return;
    }


    setData(
      (current) => ({
        ...current,

        ratePlans:
          (
            current.ratePlans ||
            []
          ).filter(
            (item) =>
              item.id !==
              ratePlan.id
          ),
      })
    );
  }


  /* ===================================================
     LOADING
  =================================================== */

  if (
    !ready
  ) {
    return (
      <div className="panel loading-panel">
        Đang tải Chính sách giá...
      </div>
    );
  }


  return (
    <>
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-header">

        <div>

          <div className="eyebrow">
            BƯỚC 04 — RATE MANAGEMENT
          </div>


          <h1>
            Chính sách giá{" "}
            <span className="heading-en">
              / Rate Plan
            </span>
          </h1>


          <p>
            Quản lý giá theo từng Room Type và từng kênh bán:
            Website Direct, OTA / Channex và Front Desk.
          </p>

        </div>


        <button
          className="button button-dark button-lg"

          onClick={
            openCreate
          }
        >
          <Plus
            size={17}
          />

          Tạo chính sách giá
        </button>

      </div>


      {/* =================================================
          EXPLAIN
      ================================================= */}

      <section className="explain-card">

        <div className="explain-icon">

          <CircleDollarSign
            size={21}
          />

        </div>


        <div>

          <strong>
            Một Room Type có thể có giá khác nhau theo từng kênh bán
          </strong>


          <p>
            Ví dụ cùng một phòng Studio, Website CITYHOUSE có thể
            bán 1.150.000đ, Front Desk 1.200.000đ và OTA
            1.250.000đ. Giá thực tế từng ngày tiếp tục được
            quản lý ở Rate Calendar.
          </p>


          <div className="rate-plan-flow">

            <span>
              Room Type
            </span>

            <b>→</b>

            <span>
              Rate Plan
            </span>

            <b>→</b>

            <span>
              Sales Channel
            </span>

            <b>→</b>

            <span>
              Rate Calendar
            </span>

            <b>→</b>

            <span>
              Website / Channex / Front Desk
            </span>

          </div>

        </div>

      </section>


      {/* =================================================
          METRICS
      ================================================= */}

      <div className="metric-grid">

        <Metric
          label="Rate Plans"

          value={
            summary.total
          }
        />


        <Metric
          label="Website Direct"

          value={
            summary.website
          }
        />


        <Metric
          label="OTA / Channex"

          value={
            summary.ota
          }
        />


        <Metric
          label="Front Desk"

          value={
            summary.frontDesk
          }
        />

      </div>


      {/* =================================================
          CHANNEL STRATEGY
      ================================================= */}

      <section className="panel business-panel">

        <div className="eyebrow">
          SALES CHANNEL STRATEGY
        </div>


        <h2>
          Giá theo từng kênh bán
        </h2>


        <div className="rate-plan-summary">

          <ChannelCard
            icon={
              <Globe2
                size={18}
              />
            }

            title="Website Direct"

            code="WEB-DIRECT"

            description="Giá bán trực tiếp trên cityhousebooking.com. Không bắt buộc đi qua Channex."

            example="Ví dụ: 1.150.000 ₫"

            status={`${summary.website} Rate Plan`}
          />


          <ChannelCard
            icon={
              <RadioTower
                size={18}
              />
            }

            title="OTA / Channex"

            code="OTA-BAR"

            description="Giá phân phối qua Channex đến Booking.com, Agoda và các OTA."

            example="Ví dụ: 1.250.000 ₫"

            status={`${summary.ota} Rate Plan`}
          />


          <ChannelCard
            icon={
              <ConciergeBell
                size={18}
              />
            }

            title="Front Desk"

            code="FRONT-DESK"

            description="Giá dành cho Walk-in, Phone Booking hoặc nhân viên Reservation tạo trực tiếp."

            example="Ví dụ: 1.200.000 ₫"

            status={`${summary.frontDesk} Rate Plan`}
          />

        </div>

      </section>


      {/* =================================================
          FILTER
      ================================================= */}

      <section className="panel">

        <div className="panel-toolbar">

          <div className="rate-plan-filter-grid">

            <label className="search-box">

              <Search
                size={16}
              />


              <input
                value={
                  search
                }

                onChange={
                  (event) =>
                    setSearch(
                      event.target.value
                    )
                }

                placeholder="Tìm Rate Plan, code, channel..."
              />

            </label>


            <select
              value={
                propertyFilter
              }

              onChange={
                (event) => {
                  setPropertyFilter(
                    event.target.value
                  );

                  setRoomTypeFilter(
                    ""
                  );
                }
              }
            >
              <option value="">
                Tất cả Property
              </option>


              {
                properties.map(
                  (property) => (

                    <option
                      key={
                        property.id
                      }

                      value={
                        property.id
                      }
                    >
                      {
                        property.name
                      }
                    </option>

                  )
                )
              }

            </select>


            <select
              value={
                roomTypeFilter
              }

              onChange={
                (event) =>
                  setRoomTypeFilter(
                    event.target.value
                  )
              }
            >
              <option value="">
                Tất cả Room Type
              </option>


              {
                filterRoomTypes.map(
                  (roomType) => (

                    <option
                      key={
                        roomType.id
                      }

                      value={
                        roomType.id
                      }
                    >
                      {
                        roomType.name
                      }
                    </option>

                  )
                )
              }

            </select>


            <select
              value={
                channelFilter
              }

              onChange={
                (event) =>
                  setChannelFilter(
                    event.target.value
                  )
              }
            >
              <option value="">
                Tất cả kênh bán
              </option>

              <option value="Website Direct">
                Website Direct
              </option>

              <option value="OTA">
                OTA / Channex
              </option>

              <option value="Front Desk">
                Front Desk
              </option>

            </select>


            <select
              value={
                statusFilter
              }

              onChange={
                (event) =>
                  setStatusFilter(
                    event.target.value
                  )
              }
            >
              <option value="">
                Tất cả trạng thái
              </option>

              <option value="Open">
                Open
              </option>

              <option value="Stop Sell">
                Stop Sell
              </option>

            </select>

          </div>

        </div>


        {/* =================================================
            TABLE
        ================================================= */}

        {
          filteredRatePlans.length >
            0
            ? (
              <div className="table-wrap">

                <table className="data-table rate-plan-table">

                  <thead>

                    <tr>

                      <th>
                        Rate Plan
                      </th>

                      <th>
                        Property / Room
                      </th>

                      <th>
                        Sales Channel
                      </th>

                      <th>
                        Rate Policy
                      </th>

                      <th className="text-right">
                        Base Rate
                      </th>

                      <th>
                        Min Stay
                      </th>

                      <th>
                        Sales Status
                      </th>

                      <th>
                        Channex
                      </th>

                      <th className="text-right">
                        Thao tác
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {
                      filteredRatePlans.map(
                        (ratePlan) => {

                          const property =
                            getProperty(
                              ratePlan.propertyId
                            );


                          const roomType =
                            getRoomType(
                              ratePlan.roomTypeId
                            );


                          const channel =
                            getSalesChannel(
                              ratePlan
                            );


                          const channelMeta =
                            getChannelMeta(
                              channel
                            );


                          const ChannelIcon =
                            channelMeta.icon;


                          return (
                            <tr
                              key={
                                ratePlan.id
                              }
                            >

                              {/* RATE PLAN */}

                              <td>

                                <strong>
                                  {
                                    ratePlan.name
                                  }
                                </strong>


                                <div className="small-copy muted code">
                                  {
                                    ratePlan.code
                                  }
                                </div>

                              </td>


                              {/* PROPERTY / ROOM */}

                              <td>

                                <strong className="table-secondary-title">
                                  {
                                    property?.name ||
                                    "—"
                                  }
                                </strong>


                                <div className="small-copy muted">
                                  {
                                    roomType?.name ||
                                    "—"
                                  }
                                </div>

                              </td>


                              {/* CHANNEL */}

                              <td>

                                <span
                                  className={`status-badge ${channelMeta.badgeClass}`}
                                >
                                  <ChannelIcon
                                    size={12}
                                  />

                                  {
                                    channelMeta.shortLabel
                                  }
                                </span>


                                <div className="small-copy muted">
                                  {
                                    channelMeta.description
                                  }
                                </div>

                              </td>


                              {/* POLICY */}

                              <td>

                                <strong>
                                  {
                                    getRatePolicy(
                                      ratePlan
                                    )
                                  }
                                </strong>

                              </td>


                              {/* BASE RATE */}

                              <td className="text-right">

                                <strong>
                                  {
                                    money(
                                      ratePlan.baseRate
                                    )
                                  }
                                </strong>

                              </td>


                              {/* MIN STAY */}

                              <td>

                                <span className="status-badge status-neutral">
                                  {
                                    ratePlan.minimumStay ||
                                    1
                                  }{" "}
                                  đêm
                                </span>

                              </td>


                              {/* SALES STATUS */}

                              <td>

                                {
                                  ratePlan.stopSell
                                    ? (
                                      <span className="status-badge status-danger">
                                        <Ban
                                          size={12}
                                        />

                                        Stop Sell
                                      </span>
                                    )
                                    : (
                                      <span className="status-badge status-success">
                                        <CheckCircle2
                                          size={12}
                                        />

                                        Open
                                      </span>
                                    )
                                }

                              </td>


                              {/* CHANNEX */}

                              <td>

                                {
                                  channel ===
                                  "OTA"
                                    ? (
                                      ratePlan.mapped &&
                                      ratePlan.channexRatePlanId
                                        ? (
                                          <>

                                            <span className="status-badge status-success">
                                              <Link2
                                                size={12}
                                              />

                                              Mapped
                                            </span>


                                            <div className="small-copy muted code">
                                              {
                                                ratePlan.channexRatePlanId
                                              }
                                            </div>

                                          </>
                                        )
                                        : (
                                          <span className="status-badge status-warning">
                                            Not mapped
                                          </span>
                                        )
                                    )
                                    : (
                                      <span className="status-badge status-neutral">
                                        Internal
                                      </span>
                                    )
                                }

                              </td>


                              {/* ACTION */}

                              <td>

                                <div className="action-row">

                                  <button
                                    className="button button-light button-sm"

                                    onClick={
                                      () =>
                                        toggleStopSell(
                                          ratePlan
                                        )
                                    }
                                  >
                                    {
                                      ratePlan.stopSell
                                        ? "Open"
                                        : "Stop"
                                    }
                                  </button>


                                  <button
                                    className="table-action"

                                    title="Chỉnh sửa"

                                    onClick={
                                      () =>
                                        openEdit(
                                          ratePlan
                                        )
                                    }
                                  >
                                    <Pencil
                                      size={14}
                                    />
                                  </button>


                                  <button
                                    className="table-action danger"

                                    title="Xóa"

                                    onClick={
                                      () =>
                                        deleteRatePlan(
                                          ratePlan
                                        )
                                    }
                                  >
                                    <Trash2
                                      size={14}
                                    />
                                  </button>

                                </div>

                              </td>

                            </tr>
                          );
                        }
                      )
                    }

                  </tbody>

                </table>

              </div>
            )
            : (
              <div className="empty-state">

                <CircleDollarSign
                  size={38}
                />


                <strong>
                  Không tìm thấy Rate Plan
                </strong>


                <span>
                  Thử thay đổi bộ lọc hoặc tạo chính sách giá mới.
                </span>

              </div>
            )
        }

      </section>


      {/* =================================================
          BUSINESS EXPLANATION
      ================================================= */}

      <section className="panel business-panel">

        <div className="eyebrow">
          RATE ARCHITECTURE
        </div>


        <h2>
          Phân biệt Channel và Rate Policy
        </h2>


        <div className="business-grid">

          <div className="business-item">

            <div className="business-item-top">

              <span>
                01
              </span>

              <Globe2
                size={16}
              />

            </div>


            <h3>
              Sales Channel
            </h3>


            <p>
              Xác định giá được bán ở đâu:
              Website, OTA hay Front Desk.
            </p>

          </div>


          <div className="business-item">

            <div className="business-item-top">

              <span>
                02
              </span>

              <BedDouble
                size={16}
              />

            </div>


            <h3>
              Rate Policy
            </h3>


            <p>
              Xác định gói giá: Room Only,
              Breakfast, Flexible hoặc Non-refundable.
            </p>

          </div>


          <div className="business-item">

            <div className="business-item-top">

              <span>
                03
              </span>

              <CircleDollarSign
                size={16}
              />

            </div>


            <h3>
              Base Rate
            </h3>


            <p>
              Giá nền của chính sách.
              Rate Calendar có thể override theo từng ngày.
            </p>

          </div>


          <div className="business-item">

            <div className="business-item-top">

              <span>
                04
              </span>

              <RadioTower
                size={16}
              />

            </div>


            <h3>
              Distribution
            </h3>


            <p>
              Chỉ Rate Plan OTA cần mapping
              Channex để phân phối ra OTA.
            </p>

          </div>

        </div>

      </section>


      {/* =================================================
          MODAL
      ================================================= */}

      <Modal
        open={
          modalOpen
        }

        title={
          editingId
            ? "Chỉnh sửa chính sách giá"
            : "Tạo chính sách giá"
        }

        subtitle="RATE PLAN"

        onClose={
          closeModal
        }

        footer={
          <>

            <button
              className="button button-light"

              onClick={
                closeModal
              }
            >
              Hủy
            </button>


            <button
              className="button button-dark"

              onClick={
                saveRatePlan
              }
            >
              {
                editingId
                  ? "Lưu thay đổi"
                  : "Tạo Rate Plan"
              }
            </button>

          </>
        }
      >

        {/* ===============================================
            PROPERTY / ROOM TYPE
        =============================================== */}

        <div className="form-section-title">
          Room Information
        </div>


        <div className="form-grid">

          <label className="form-field">

            <span className="form-label">
              Property *
            </span>


            <select
              value={
                form.propertyId
              }

              onChange={
                (event) =>
                  handlePropertyChange(
                    event.target.value
                  )
              }
            >
              <option value="">
                Chọn Property
              </option>


              {
                properties.map(
                  (property) => (

                    <option
                      key={
                        property.id
                      }

                      value={
                        property.id
                      }
                    >
                      {
                        property.name
                      }
                    </option>

                  )
                )
              }

            </select>

          </label>


          <label className="form-field">

            <span className="form-label">
              Room Type *
            </span>


            <select
              value={
                form.roomTypeId
              }

              disabled={
                !form.propertyId
              }

              onChange={
                (event) =>
                  setForm(
                    (current) => ({
                      ...current,

                      roomTypeId:
                        event.target.value,
                    })
                  )
              }
            >
              <option value="">
                Chọn Room Type
              </option>


              {
                formRoomTypes.map(
                  (roomType) => (

                    <option
                      key={
                        roomType.id
                      }

                      value={
                        roomType.id
                      }
                    >
                      {
                        roomType.name
                      }
                    </option>

                  )
                )
              }

            </select>

          </label>

        </div>


        {/* ===============================================
            RATE PLAN INFO
        =============================================== */}

        <div className="form-section-title">
          Rate Plan Information
        </div>


        <div className="form-grid">

          <label className="form-field">

            <span className="form-label">
              Tên Rate Plan *
            </span>


            <input
              value={
                form.name
              }

              onChange={
                (event) =>
                  setForm(
                    (current) => ({
                      ...current,

                      name:
                        event.target.value,
                    })
                  )
              }

              placeholder="Ví dụ: Website Direct"
            />

          </label>


          <label className="form-field">

            <span className="form-label">
              Code *
            </span>


            <input
              value={
                form.code
              }

              onChange={
                (event) =>
                  setForm(
                    (current) => ({
                      ...current,

                      code:
                        event.target.value,
                    })
                  )
              }

              placeholder="WEB-DIRECT"
            />

          </label>


          {/* =============================================
              SALES CHANNEL
          ============================================= */}

          <label className="form-field">

            <span className="form-label">
              Kênh bán *
            </span>


            <select
              value={
                form.salesChannel
              }

              onChange={
                (event) =>
                  handleSalesChannelChange(
                    event.target.value
                  )
              }
            >
              <option value="Website Direct">
                Website Direct
              </option>

              <option value="OTA">
                OTA / Channex
              </option>

              <option value="Front Desk">
                Front Desk / Walk-in
              </option>

            </select>


            <small>
              Xác định Rate Plan này được bán trên kênh nào.
            </small>

          </label>


          {/* =============================================
              RATE POLICY
          ============================================= */}

          <label className="form-field">

            <span className="form-label">
              Rate Policy
            </span>


            <select
              value={
                form.ratePolicy
              }

              onChange={
                (event) =>
                  setForm(
                    (current) => ({
                      ...current,

                      ratePolicy:
                        event.target.value,
                    })
                  )
              }
            >
              <option value="Room Only">
                Room Only
              </option>

              <option value="Breakfast Included">
                Breakfast Included
              </option>

              <option value="Flexible">
                Flexible
              </option>

              <option value="Non-refundable">
                Non-refundable
              </option>

              <option value="Other">
                Other
              </option>

            </select>


            <small>
              Chính sách bán khác với kênh bán.
            </small>

          </label>

        </div>


        {/* ===============================================
            PRICE
        =============================================== */}

        <div className="form-section-title">
          Price & Restriction
        </div>


        <div className="form-grid">

          <label className="form-field">

            <span className="form-label">
              Base Rate *
            </span>


            <div className="input-suffix">

              <input
                type="number"

                min="0"

                value={
                  form.baseRate
                }

                onChange={
                  (event) =>
                    setForm(
                      (current) => ({
                        ...current,

                        baseRate:
                          event.target.value,
                      })
                    )
                }

                placeholder="1150000"
              />


              <span>
                VND
              </span>

            </div>


            <small>
              Giá này là giá nền. Rate Calendar có thể thay đổi theo ngày.
            </small>

          </label>


          <label className="form-field">

            <span className="form-label">
              Minimum Stay
            </span>


            <input
              type="number"

              min="1"

              value={
                form.minimumStay
              }

              onChange={
                (event) =>
                  setForm(
                    (current) => ({
                      ...current,

                      minimumStay:
                        event.target.value,
                    })
                  )
              }
            />


            <small>
              Số đêm tối thiểu khách phải đặt.
            </small>

          </label>

        </div>


        {/* ===============================================
            CHANNEL PREVIEW
        =============================================== */}

        <div className="rate-plan-summary">

          <div className="rate-plan-summary-item">

            <span>
              Sales Channel
            </span>


            <strong>
              {
                form.salesChannel
              }
            </strong>

          </div>


          <div className="rate-plan-summary-item">

            <span>
              Base Rate
            </span>


            <strong>
              {
                form.baseRate
                  ? money(
                      form.baseRate
                    )
                  : "—"
              }
            </strong>

          </div>


          <div className="rate-plan-summary-item">

            <span>
              Distribution
            </span>


            <strong>
              {
                form.salesChannel ===
                "OTA"
                  ? "Channex → OTA"
                  : form.salesChannel ===
                      "Website Direct"
                    ? "CITYHOUSE Website"
                    : "PMS Internal"
              }
            </strong>

          </div>

        </div>


        {/* ===============================================
            STOP SELL
        =============================================== */}

        <div className="rate-plan-stop-sell">

          <div>

            <strong>
              Stop Sell
            </strong>


            <p>
              Đóng bán Rate Plan này nhưng vẫn giữ lại dữ liệu,
              lịch giá và lịch sử Reservation.
            </p>

          </div>


          <label className="switch">

            <input
              type="checkbox"

              checked={
                form.stopSell
              }

              onChange={
                (event) =>
                  setForm(
                    (current) => ({
                      ...current,

                      stopSell:
                        event.target.checked,
                    })
                  )
              }
            />


            <span className="switch-slider" />

          </label>

        </div>


        {/* ===============================================
            CHANNEX

            Chỉ show nếu OTA
        =============================================== */}

        {
          form.salesChannel ===
            "OTA" && (

            <>

              <div className="form-section-title">
                Channex Distribution
              </div>


              <div className="info-note">

                <strong>
                  OTA Rate Plan
                </strong>


                <p>
                  Rate Plan OTA có thể được map với Channex.
                  Sau khi mapping, Rate Calendar có thể đẩy
                  giá và Restriction sang Booking.com,
                  Agoda và các OTA được kết nối.
                </p>

              </div>


              <label className="form-field">

                <span className="form-label">
                  Channex Rate Plan ID
                </span>


                <input
                  value={
                    form.channexRatePlanId
                  }

                  onChange={
                    (event) =>
                      setForm(
                        (current) => ({
                          ...current,

                          channexRatePlanId:
                            event.target.value,
                        })
                      )
                  }

                  placeholder="Ví dụ: chx-rate-co-std-ota-001"
                />


                <small>
                  Có thể để trống và mapping ở module Channex sau.
                </small>

              </label>

            </>

          )
        }


        {/* ===============================================
            DIRECT WEBSITE NOTE
        =============================================== */}

        {
          form.salesChannel ===
            "Website Direct" && (

            <div className="info-note status-note">

              <strong>
                Website Direct
              </strong>


              <p>
                Rate Plan này dành cho hệ thống booking trực tiếp
                của CITYHOUSE. Không bắt buộc phải mapping Channex.
                Website có thể lấy Rate Calendar trực tiếp từ PMS.
              </p>

            </div>

          )
        }


        {/* ===============================================
            FRONT DESK NOTE
        =============================================== */}

        {
          form.salesChannel ===
            "Front Desk" && (

            <div className="info-note status-note">

              <strong>
                Front Desk / Walk-in
              </strong>


              <p>
                Rate Plan này dùng nội bộ cho lễ tân,
                Reservation, Phone Booking hoặc Walk-in.
                Không phân phối ra OTA.
              </p>

            </div>

          )
        }

      </Modal>

    </>
  );
}


/* =====================================================
   METRIC
===================================================== */

function Metric({
  label,
  value,
}) {
  return (
    <article className="metric-card">

      <div className="metric-label">
        {label}
      </div>


      <div className="metric-value">
        {value}
      </div>

    </article>
  );
}


/* =====================================================
   CHANNEL CARD
===================================================== */

function ChannelCard({
  icon,
  title,
  code,
  description,
  example,
  status,
}) {
  return (
    <article className="rate-plan-summary-item">

      <div className="business-item-top">

        <span>
          {code}
        </span>

        {icon}

      </div>


      <strong
        style={{
          display:
            "block",

          marginTop:
            10,

          fontSize:
            14,
        }}
      >
        {title}
      </strong>


      <p
        style={{
          margin:
            "6px 0 0",

          color:
            "#667085",

          fontSize:
            11,

          lineHeight:
            1.55,
        }}
      >
        {description}
      </p>


      <div
        style={{
          marginTop:
            12,
        }}
      >

        <span className="status-badge status-neutral">
          {example}
        </span>

      </div>


      <div
        style={{
          marginTop:
            7,
        }}
      >
        <span className="small-copy muted">
          {status}
        </span>
      </div>

    </article>
  );
}