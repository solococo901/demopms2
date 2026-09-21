"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  Ban,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Wifi,
} from "lucide-react";

import {
  usePms,
} from "@/context/PmsContext";

import Modal from "@/components/Modal";


const blankForm = {
  propertyId: "",
  roomTypeId: "",
  ratePlanId: "",
  date: "",
  rate: 0,
  minimumStay: 1,
  stopSell: false,
};


function todayString() {
  const date =
    new Date();

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}


function nowText() {
  return new Date().toLocaleString(
    "vi-VN"
  );
}


function makeId() {
  return `ratecalendar_${Date.now()}_${Math.random()
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


function formatDate(
  value
) {
  if (
    !value
  ) {
    return "—";
  }


  const [
    year,
    month,
    day,
  ] =
    value.split("-");


  return `${day}/${month}/${year}`;
}


function addDays(
  dateString,
  days
) {
  const date =
    new Date(
      `${dateString}T00:00:00`
    );


  date.setDate(
    date.getDate() +
      days
  );


  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );


  return `${year}-${month}-${day}`;
}


function StopSellBadge({
  stopSell,
}) {
  return (
    <span
      className={`status-badge ${
        stopSell
          ? "status-danger"
          : "status-success"
      }`}
    >
      {stopSell
        ? "Stop Sell"
        : "Open"}
    </span>
  );
}


function SyncBadge({
  synced,
}) {
  return (
    <span
      className={`status-badge ${
        synced
          ? "status-info"
          : "status-warning"
      }`}
    >
      {synced
        ? "Đã đồng bộ"
        : "Chưa đồng bộ"}
    </span>
  );
}


export default function RateCalendarManager() {
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
    ratePlanFilter,
    setRatePlanFilter,
  ] = useState("");


  const [
    dateFilter,
    setDateFilter,
  ] = useState(
    todayString()
  );


  const [
    formOpen,
    setFormOpen,
  ] = useState(false);


  const [
    editingId,
    setEditingId,
  ] = useState(null);


  const [
    form,
    setForm,
  ] = useState(
    blankForm
  );


  const [
    bulkOpen,
    setBulkOpen,
  ] = useState(false);


  const [
    bulkForm,
    setBulkForm,
  ] = useState({
    propertyId: "",
    roomTypeId: "",
    ratePlanId: "",
    startDate: "",
    endDate: "",
    rate: 0,
    minimumStay: 1,
    stopSell: false,
  });


  const [
    syncId,
    setSyncId,
  ] = useState(null);


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


  function getRatePlan(
    ratePlanId
  ) {
    return ratePlans.find(
      (ratePlan) =>
        ratePlan.id ===
        ratePlanId
    );
  }


  function getPropertyRoomTypes(
    propertyId
  ) {
    return roomTypes.filter(
      (roomType) =>
        roomType.propertyId ===
        propertyId
    );
  }


  function getRoomTypeRatePlans(
    roomTypeId
  ) {
    return ratePlans.filter(
      (ratePlan) =>
        ratePlan.roomTypeId ===
        roomTypeId
    );
  }


  const availableRoomTypes =
    useMemo(
      () => {
        if (
          !propertyFilter
        ) {
          return roomTypes;
        }


        return roomTypes.filter(
          (roomType) =>
            roomType.propertyId ===
            propertyFilter
        );
      },
      [
        roomTypes,
        propertyFilter,
      ]
    );


  const availableRatePlans =
    useMemo(
      () => {
        if (
          !roomTypeFilter
        ) {
          if (
            !propertyFilter
          ) {
            return ratePlans;
          }


          return ratePlans.filter(
            (ratePlan) =>
              ratePlan.propertyId ===
              propertyFilter
          );
        }


        return ratePlans.filter(
          (ratePlan) =>
            ratePlan.roomTypeId ===
            roomTypeFilter
        );
      },
      [
        ratePlans,
        propertyFilter,
        roomTypeFilter,
      ]
    );


  const filtered =
    useMemo(
      () => {
        const q =
          search
            .trim()
            .toLowerCase();


        return rateCalendar
          .filter(
            (entry) => {
              const property =
                getProperty(
                  entry.propertyId
                );


              const roomType =
                getRoomType(
                  entry.roomTypeId
                );


              const ratePlan =
                getRatePlan(
                  entry.ratePlanId
                );


              const text = `
                ${property?.name || ""}
                ${property?.code || ""}
                ${roomType?.name || ""}
                ${roomType?.code || ""}
                ${ratePlan?.name || ""}
                ${ratePlan?.code || ""}
                ${entry.date}
              `.toLowerCase();


              return (
                (
                  !q ||
                  text.includes(
                    q
                  )
                ) &&
                (
                  !propertyFilter ||
                  entry.propertyId ===
                    propertyFilter
                ) &&
                (
                  !roomTypeFilter ||
                  entry.roomTypeId ===
                    roomTypeFilter
                ) &&
                (
                  !ratePlanFilter ||
                  entry.ratePlanId ===
                    ratePlanFilter
                ) &&
                (
                  !dateFilter ||
                  entry.date ===
                    dateFilter
                )
              );
            }
          )
          .sort(
            (
              a,
              b
            ) =>
              a.date.localeCompare(
                b.date
              )
          );
      },
      [
        rateCalendar,
        properties,
        roomTypes,
        ratePlans,
        search,
        propertyFilter,
        roomTypeFilter,
        ratePlanFilter,
        dateFilter,
      ]
    );


  const stats =
    useMemo(
      () => {
        const today =
          todayString();


        const todayEntries =
          rateCalendar.filter(
            (entry) =>
              entry.date ===
              today
          );


        return {
          total:
            rateCalendar.length,

          today:
            todayEntries.length,

          stopSell:
            todayEntries.filter(
              (entry) =>
                entry.stopSell
            ).length,

          unsynced:
            rateCalendar.filter(
              (entry) =>
                !entry.synced
            ).length,
        };
      },
      [
        rateCalendar,
      ]
    );


  function updateCalendar(
    nextCalendar
  ) {
    setData(
      (current) => ({
        ...current,

        rateCalendar:
          nextCalendar,
      })
    );
  }


  function getInitialProperty() {
    return (
      properties.find(
        (property) =>
          property.status ===
          "Active"
      ) ||
      properties[0]
    );
  }


  function openCreate() {
    if (
      properties.length ===
      0
    ) {
      alert(
        "Chưa có Property."
      );

      return;
    }


    if (
      roomTypes.length ===
      0
    ) {
      alert(
        "Chưa có Room Type."
      );

      return;
    }


    if (
      ratePlans.length ===
      0
    ) {
      alert(
        "Chưa có Rate Plan. Vui lòng hoàn thành Bước 04 trước."
      );

      return;
    }


    const property =
      getInitialProperty();


    const propertyRoomTypes =
      getPropertyRoomTypes(
        property.id
      );


    const roomType =
      propertyRoomTypes[0];


    const roomTypeRatePlans =
      getRoomTypeRatePlans(
        roomType?.id
      );


    const ratePlan =
      roomTypeRatePlans[0];


    setEditingId(
      null
    );


    setForm({
      propertyId:
        property?.id ||
        "",

      roomTypeId:
        roomType?.id ||
        "",

      ratePlanId:
        ratePlan?.id ||
        "",

      date:
        dateFilter ||
        todayString(),

      rate:
        Number(
          ratePlan?.baseRate ||
            0
        ),

      minimumStay:
        Number(
          ratePlan?.minimumStay ||
            1
        ),

      stopSell:
        Boolean(
          ratePlan?.stopSell
        ),
    });


    setFormOpen(
      true
    );
  }


  function openEdit(
    entry
  ) {
    setEditingId(
      entry.id
    );


    setForm({
      propertyId:
        entry.propertyId,

      roomTypeId:
        entry.roomTypeId,

      ratePlanId:
        entry.ratePlanId,

      date:
        entry.date,

      rate:
        Number(
          entry.rate ||
            0
        ),

      minimumStay:
        Number(
          entry.minimumStay ||
            1
        ),

      stopSell:
        Boolean(
          entry.stopSell
        ),
    });


    setFormOpen(
      true
    );
  }


  function handlePropertyChange(
    propertyId
  ) {
    const roomType =
      getPropertyRoomTypes(
        propertyId
      )[0];


    const ratePlan =
      getRoomTypeRatePlans(
        roomType?.id
      )[0];


    setForm(
      (current) => ({
        ...current,

        propertyId,

        roomTypeId:
          roomType?.id ||
          "",

        ratePlanId:
          ratePlan?.id ||
          "",

        rate:
          Number(
            ratePlan?.baseRate ||
              0
          ),

        minimumStay:
          Number(
            ratePlan?.minimumStay ||
              1
          ),

        stopSell:
          Boolean(
            ratePlan?.stopSell
          ),
      })
    );
  }


  function handleRoomTypeChange(
    roomTypeId
  ) {
    const ratePlan =
      getRoomTypeRatePlans(
        roomTypeId
      )[0];


    setForm(
      (current) => ({
        ...current,

        roomTypeId,

        ratePlanId:
          ratePlan?.id ||
          "",

        rate:
          Number(
            ratePlan?.baseRate ||
              0
          ),

        minimumStay:
          Number(
            ratePlan?.minimumStay ||
              1
          ),

        stopSell:
          Boolean(
            ratePlan?.stopSell
          ),
      })
    );
  }


  function handleRatePlanChange(
    ratePlanId
  ) {
    const ratePlan =
      getRatePlan(
        ratePlanId
      );


    setForm(
      (current) => ({
        ...current,

        ratePlanId,

        rate:
          Number(
            ratePlan?.baseRate ||
              0
          ),

        minimumStay:
          Number(
            ratePlan?.minimumStay ||
              1
          ),

        stopSell:
          Boolean(
            ratePlan?.stopSell
          ),
      })
    );
  }


  function saveEntry() {
    const property =
      getProperty(
        form.propertyId
      );


    const roomType =
      getRoomType(
        form.roomTypeId
      );


    const ratePlan =
      getRatePlan(
        form.ratePlanId
      );


    const rate =
      Number(
        form.rate ||
          0
      );


    const minimumStay =
      Number(
        form.minimumStay ||
          1
      );


    if (
      !property ||
      !roomType ||
      !ratePlan
    ) {
      alert(
        "Property, Room Type hoặc Rate Plan không hợp lệ."
      );

      return;
    }


    if (
      roomType.propertyId !==
      property.id
    ) {
      alert(
        "Room Type không thuộc Property."
      );

      return;
    }


    if (
      ratePlan.roomTypeId !==
      roomType.id
    ) {
      alert(
        "Rate Plan không thuộc Room Type."
      );

      return;
    }


    if (
      !form.date
    ) {
      alert(
        "Vui lòng chọn ngày."
      );

      return;
    }


    if (
      rate < 0
    ) {
      alert(
        "Daily Rate không hợp lệ."
      );

      return;
    }


    if (
      minimumStay < 1
    ) {
      alert(
        "Minimum Stay phải từ 1 đêm."
      );

      return;
    }


    const duplicate =
      rateCalendar.some(
        (entry) =>
          entry.ratePlanId ===
            form.ratePlanId &&
          entry.date ===
            form.date &&
          entry.id !==
            editingId
      );


    if (
      duplicate
    ) {
      alert(
        "Rate Plan này đã có cấu hình cho ngày đã chọn."
      );

      return;
    }


    if (
      editingId
    ) {
      updateCalendar(
        rateCalendar.map(
          (entry) =>
            entry.id ===
            editingId
              ? {
                  ...entry,

                  ...form,

                  rate,

                  minimumStay,

                  synced:
                    false,

                  updatedAt:
                    nowText(),
                }
              : entry
        )
      );
    }

    else {
      updateCalendar([
        {
          id:
            makeId(),

          ...form,

          rate,

          minimumStay,

          synced:
            false,

          lastSync:
            "",

          createdAt:
            nowText(),

          updatedAt:
            nowText(),
        },

        ...rateCalendar,
      ]);
    }


    setFormOpen(
      false
    );
  }


  function openBulk() {
    if (
      ratePlans.length ===
      0
    ) {
      alert(
        "Chưa có Rate Plan."
      );

      return;
    }


    const property =
      getInitialProperty();


    const roomType =
      getPropertyRoomTypes(
        property.id
      )[0];


    const ratePlan =
      getRoomTypeRatePlans(
        roomType?.id
      )[0];


    const startDate =
      dateFilter ||
      todayString();


    setBulkForm({
      propertyId:
        property?.id ||
        "",

      roomTypeId:
        roomType?.id ||
        "",

      ratePlanId:
        ratePlan?.id ||
        "",

      startDate,

      endDate:
        addDays(
          startDate,
          6
        ),

      rate:
        Number(
          ratePlan?.baseRate ||
            0
        ),

      minimumStay:
        Number(
          ratePlan?.minimumStay ||
            1
        ),

      stopSell:
        Boolean(
          ratePlan?.stopSell
        ),
    });


    setBulkOpen(
      true
    );
  }


  function applyBulk() {
    const {
      propertyId,
      roomTypeId,
      ratePlanId,
      startDate,
      endDate,
    } =
      bulkForm;


    if (
      !propertyId ||
      !roomTypeId ||
      !ratePlanId ||
      !startDate ||
      !endDate
    ) {
      alert(
        "Vui lòng nhập đầy đủ thông tin."
      );

      return;
    }


    if (
      endDate <
      startDate
    ) {
      alert(
        "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu."
      );

      return;
    }


    const rate =
      Number(
        bulkForm.rate ||
          0
      );


    const minimumStay =
      Number(
        bulkForm.minimumStay ||
          1
      );


    if (
      rate < 0 ||
      minimumStay < 1
    ) {
      alert(
        "Rate hoặc Minimum Stay không hợp lệ."
      );

      return;
    }


    const next =
      [
        ...rateCalendar,
      ];


    let currentDate =
      startDate;


    while (
      currentDate <=
      endDate
    ) {
      const index =
        next.findIndex(
          (entry) =>
            entry.ratePlanId ===
              ratePlanId &&
            entry.date ===
              currentDate
        );


      const payload = {
        propertyId,
        roomTypeId,
        ratePlanId,

        date:
          currentDate,

        rate,

        minimumStay,

        stopSell:
          Boolean(
            bulkForm.stopSell
          ),

        synced:
          false,

        lastSync:
          "",

        updatedAt:
          nowText(),
      };


      if (
        index >= 0
      ) {
        next[index] = {
          ...next[index],

          ...payload,
        };
      }

      else {
        next.push({
          id:
            makeId(),

          ...payload,

          createdAt:
            nowText(),
        });
      }


      currentDate =
        addDays(
          currentDate,
          1
        );
    }


    updateCalendar(
      next
    );


    setBulkOpen(
      false
    );
  }


  function syncEntry(
    entry
  ) {
    setSyncId(
      entry.id
    );


    setTimeout(
      () => {
        updateCalendar(
          rateCalendar.map(
            (item) =>
              item.id ===
              entry.id
                ? {
                    ...item,

                    synced:
                      true,

                    lastSync:
                      nowText(),
                  }
                : item
          )
        );


        setSyncId(
          null
        );
      },
      350
    );
  }


  function syncAllVisible() {
    if (
      filtered.length ===
      0
    ) {
      return;
    }


    const ids =
      filtered.map(
        (item) =>
          item.id
      );


    updateCalendar(
      rateCalendar.map(
        (entry) =>
          ids.includes(
            entry.id
          )
            ? {
                ...entry,

                synced:
                  true,

                lastSync:
                  nowText(),
              }
            : entry
      )
    );
  }


  function changeDate(
    days
  ) {
    const current =
      dateFilter ||
      todayString();


    setDateFilter(
      addDays(
        current,
        days
      )
    );
  }


  if (
    !ready
  ) {
    return (
      <div className="panel loading-panel">
        Đang tải dữ liệu PMS...
      </div>
    );
  }


  return (
    <>
      <div className="page-header">

        <div>

          <div className="eyebrow">
            BƯỚC 05 — LỊCH GIÁ
          </div>

          <h1>
            Quản lý lịch giá{" "}
            <span className="heading-en">
              (Rate Calendar)
            </span>
          </h1>

          <p>
            Điều chỉnh Daily Rate, Minimum Stay và Stop Sell
            theo từng ngày cho từng Rate Plan, sau đó đồng bộ
            các thay đổi sang Channex.
          </p>

        </div>


        <div className="page-header-actions">

          <button
            className="button button-light button-lg"
            onClick={
              openBulk
            }
          >
            <CalendarDays
              size={17}
            />

            Áp dụng theo khoảng ngày
          </button>


          <button
            className="button button-dark button-lg"
            onClick={
              openCreate
            }
          >
            <Plus
              size={17}
            />

            Thêm giá theo ngày
          </button>

        </div>

      </div>


      <section className="explain-card">

        <div className="explain-icon">
          <CalendarDays
            size={21}
          />
        </div>


        <div>

          <strong>
            Rate Calendar override cấu hình mặc định của Rate Plan
          </strong>

          <p>
            Ví dụ BAR của Deluxe có Base Rate 1.500.000đ.
            Ngày cuối tuần có thể tăng thành 1.850.000đ,
            Minimum Stay 2 đêm hoặc Stop Sell riêng cho ngày đó.
          </p>


          <div className="rate-calendar-flow">

            <span>
              Deluxe
            </span>

            <b>→</b>

            <span>
              BAR
            </span>

            <b>→</b>

            <span>
              26/09
            </span>

            <b>→</b>

            <span>
              1.850.000đ
            </span>

          </div>

        </div>

      </section>


      <div className="metric-grid">

        <Metric
          label="Tổng cấu hình theo ngày"
          value={
            stats.total
          }
        />

        <Metric
          label="Cấu hình hôm nay"
          value={
            stats.today
          }
        />

        <Metric
          label="Stop Sell hôm nay"
          value={
            stats.stopSell
          }
        />

        <Metric
          label="Chờ đồng bộ"
          value={
            stats.unsynced
          }
        />

      </div>


      <section className="panel rate-calendar-date-panel">

        <button
          className="icon-button"
          onClick={
            () =>
              changeDate(
                -1
              )
          }
        >
          <ChevronLeft
            size={18}
          />
        </button>


        <div>

          <div className="eyebrow">
            NGÀY ĐANG XEM
          </div>

          <strong>
            {
              formatDate(
                dateFilter
              )
            }
          </strong>

        </div>


        <input
          type="date"

          value={
            dateFilter
          }

          onChange={
            (event) =>
              setDateFilter(
                event.target.value
              )
          }
        />


        <button
          className="button button-light"
          onClick={
            () =>
              setDateFilter(
                todayString()
              )
          }
        >
          Hôm nay
        </button>


        <button
          className="icon-button"
          onClick={
            () =>
              changeDate(
                1
              )
          }
        >
          <ChevronRight
            size={18}
          />
        </button>

      </section>


      <section className="panel">

        <div className="panel-toolbar">

          <div className="rate-calendar-toolbar">

            <div className="rate-calendar-filter-grid">

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

                  placeholder="Tìm Property, Room Type, Rate Plan..."
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

                    setRatePlanFilter(
                      ""
                    );
                  }
                }
              >

                <option value="">
                  Tất cả khách sạn
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
                  (event) => {
                    setRoomTypeFilter(
                      event.target.value
                    );

                    setRatePlanFilter(
                      ""
                    );
                  }
                }
              >

                <option value="">
                  Tất cả Room Type
                </option>


                {
                  availableRoomTypes.map(
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
                  ratePlanFilter
                }

                onChange={
                  (event) =>
                    setRatePlanFilter(
                      event.target.value
                    )
                }
              >

                <option value="">
                  Tất cả Rate Plan
                </option>


                {
                  availableRatePlans.map(
                    (ratePlan) => (

                      <option
                        key={
                          ratePlan.id
                        }
                        value={
                          ratePlan.id
                        }
                      >
                        {
                          ratePlan.name
                        }
                      </option>

                    )
                  )
                }

              </select>

            </div>


            <button
              className="button button-light"
              onClick={
                syncAllVisible
              }
            >
              <RefreshCw
                size={16}
              />

              Đồng bộ danh sách
            </button>

          </div>

        </div>


        <div className="table-wrap">

          <table className="data-table rate-calendar-table">

            <thead>

              <tr>

                <th>
                  Ngày
                </th>

                <th>
                  Khách sạn
                </th>

                <th>
                  Room Type
                </th>

                <th>
                  Rate Plan
                </th>

                <th>
                  Daily Rate
                </th>

                <th>
                  Minimum Stay
                </th>

                <th>
                  Stop Sell
                </th>

                <th>
                  Channel Sync
                </th>

                <th className="text-right">
                  Thao tác
                </th>

              </tr>

            </thead>


            <tbody>

              {
                filtered.map(
                  (entry) => {
                    const property =
                      getProperty(
                        entry.propertyId
                      );


                    const roomType =
                      getRoomType(
                        entry.roomTypeId
                      );


                    const ratePlan =
                      getRatePlan(
                        entry.ratePlanId
                      );


                    return (
                      <tr
                        key={
                          entry.id
                        }
                      >

                        <td>

                          <strong>
                            {
                              formatDate(
                                entry.date
                              )
                            }
                          </strong>

                        </td>


                        <td>

                          <strong className="table-secondary-title">
                            {
                              property?.name ||
                              "—"
                            }
                          </strong>

                          <div className="code muted">
                            {
                              property?.code ||
                              "—"
                            }
                          </div>

                        </td>


                        <td>

                          <strong>
                            {
                              roomType?.name ||
                              "—"
                            }
                          </strong>

                          <div className="code muted">
                            {
                              roomType?.code ||
                              "—"
                            }
                          </div>

                        </td>


                        <td>

                          <strong>
                            {
                              ratePlan?.name ||
                              "—"
                            }
                          </strong>

                          <div className="code muted">
                            {
                              ratePlan?.code ||
                              "—"
                            }
                          </div>

                        </td>


                        <td>

                          <strong>
                            {
                              money(
                                entry.rate
                              )
                            }
                          </strong>

                          {
                            ratePlan &&
                            Number(
                              entry.rate
                            ) !==
                              Number(
                                ratePlan.baseRate
                              ) && (

                              <div className="small-copy muted">
                                Base:{" "}
                                {
                                  money(
                                    ratePlan.baseRate
                                  )
                                }
                              </div>

                            )
                          }

                        </td>


                        <td>

                          {
                            entry.minimumStay
                          }{" "}
                          đêm

                        </td>


                        <td>

                          <StopSellBadge
                            stopSell={
                              entry.stopSell
                            }
                          />

                        </td>


                        <td>

                          <SyncBadge
                            synced={
                              entry.synced
                            }
                          />

                          {
                            entry.lastSync && (

                              <div className="small-copy muted">
                                {
                                  entry.lastSync
                                }
                              </div>

                            )
                          }

                        </td>


                        <td>

                          <div className="action-row">

                            <button
                              className="table-action"

                              title="Chỉnh sửa"

                              onClick={
                                () =>
                                  openEdit(
                                    entry
                                  )
                              }
                            >
                              <Pencil
                                size={15}
                              />
                            </button>


                            <button
                              className="table-action"

                              title="Đồng bộ Channex"

                              disabled={
                                syncId ===
                                entry.id
                              }

                              onClick={
                                () =>
                                  syncEntry(
                                    entry
                                  )
                              }
                            >
                              <Wifi
                                size={15}
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


          {
            filtered.length ===
              0 && (

              <div className="empty-state">

                <CalendarDays
                  size={38}
                />

                <strong>
                  Chưa có giá cho ngày này
                </strong>

                <span>
                  Tạo Daily Rate hoặc áp dụng giá theo khoảng ngày.
                </span>

              </div>

            )
          }

        </div>

      </section>


      <section className="panel business-panel">

        <div className="eyebrow">
          MÔ TẢ NGHIỆP VỤ
        </div>

        <h2>
          Rate Calendar kiểm soát điều gì?
        </h2>


        <div className="business-grid">

          <BusinessItem
            number="01"
            icon={
              <CircleDollarSign
                size={18}
              />
            }
            title="Daily Rate"
            text="Thay đổi giá bán của Rate Plan theo từng ngày mà không sửa Base Rate gốc."
          />


          <BusinessItem
            number="02"
            icon={
              <CalendarDays
                size={18}
              />
            }
            title="Minimum Stay By Date"
            text="Ví dụ cuối tuần hoặc lễ yêu cầu khách phải đặt tối thiểu 2 hoặc 3 đêm."
          />


          <BusinessItem
            number="03"
            icon={
              <Ban
                size={18}
              />
            }
            title="Stop Sell By Date"
            text="Đóng bán đúng những ngày cần thiết mà không khóa toàn bộ Rate Plan."
          />


          <BusinessItem
            number="04"
            icon={
              <Wifi
                size={18}
              />
            }
            title="Channel Sync"
            text="Sau khi giá hoặc restriction thay đổi, đồng bộ dữ liệu mới sang Channex."
          />

        </div>

      </section>


      <Modal
        open={
          formOpen
        }

        title={
          editingId
            ? "Chỉnh sửa giá theo ngày"
            : "Thêm giá theo ngày"
        }

        subtitle="RATE CALENDAR"

        onClose={
          () =>
            setFormOpen(false)
        }

        size="lg"

        footer={
          <>

            <button
              className="button button-light"
              onClick={
                () =>
                  setFormOpen(
                    false
                  )
              }
            >
              Hủy
            </button>


            <button
              className="button button-dark"
              onClick={
                saveEntry
              }
            >
              Lưu thay đổi
            </button>

          </>
        }
      >

        <RateCalendarForm
          form={
            form
          }

          setForm={
            setForm
          }

          properties={
            properties
          }

          roomTypes={
            roomTypes
          }

          ratePlans={
            ratePlans
          }

          editing={
            Boolean(
              editingId
            )
          }

          onPropertyChange={
            handlePropertyChange
          }

          onRoomTypeChange={
            handleRoomTypeChange
          }

          onRatePlanChange={
            handleRatePlanChange
          }
        />

      </Modal>


      <Modal
        open={
          bulkOpen
        }

        title="Áp dụng giá theo khoảng ngày"

        subtitle="BULK RATE UPDATE"

        onClose={
          () =>
            setBulkOpen(
              false
            )
        }

        size="lg"

        footer={
          <>

            <button
              className="button button-light"
              onClick={
                () =>
                  setBulkOpen(
                    false
                  )
              }
            >
              Hủy
            </button>


            <button
              className="button button-dark"
              onClick={
                applyBulk
              }
            >
              Áp dụng
            </button>

          </>
        }
      >

        <BulkRateForm
          form={
            bulkForm
          }

          setForm={
            setBulkForm
          }

          properties={
            properties
          }

          roomTypes={
            roomTypes
          }

          ratePlans={
            ratePlans
          }
        />

      </Modal>

    </>
  );
}


function Metric({
  label,
  value,
}) {
  return (
    <div className="metric-card">

      <div className="metric-label">
        {label}
      </div>

      <div className="metric-value">
        {value}
      </div>

    </div>
  );
}


function BusinessItem({
  number,
  icon,
  title,
  text,
}) {
  return (
    <article className="business-item">

      <div className="business-item-top">

        <span>
          {number}
        </span>

        {icon}

      </div>

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>

    </article>
  );
}


function Field({
  label,
  help,
  children,
}) {
  return (
    <label className="form-field">

      <span className="form-label">
        {label}
      </span>

      {children}

      {
        help && (
          <small>
            {help}
          </small>
        )
      }

    </label>
  );
}


function RateCalendarForm({
  form,
  setForm,
  properties,
  roomTypes,
  ratePlans,
  editing,
  onPropertyChange,
  onRoomTypeChange,
  onRatePlanChange,
}) {
  const availableRoomTypes =
    roomTypes.filter(
      (roomType) =>
        roomType.propertyId ===
        form.propertyId
    );


  const availableRatePlans =
    ratePlans.filter(
      (ratePlan) =>
        ratePlan.roomTypeId ===
        form.roomTypeId
    );


  function patch(
    key,
    value
  ) {
    setForm(
      (current) => ({
        ...current,

        [key]:
          value,
      })
    );
  }


  return (
    <>
      <div className="form-section-title">
        1. Rate Plan
      </div>


      <div className="form-grid three">

        <Field
          label="Property *"
        >

          <select
            disabled={
              editing
            }

            value={
              form.propertyId
            }

            onChange={
              (event) =>
                onPropertyChange(
                  event.target.value
                )
            }
          >

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

        </Field>


        <Field
          label="Room Type *"
        >

          <select
            disabled={
              editing
            }

            value={
              form.roomTypeId
            }

            onChange={
              (event) =>
                onRoomTypeChange(
                  event.target.value
                )
            }
          >

            {
              availableRoomTypes.map(
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

        </Field>


        <Field
          label="Rate Plan *"
        >

          <select
            disabled={
              editing
            }

            value={
              form.ratePlanId
            }

            onChange={
              (event) =>
                onRatePlanChange(
                  event.target.value
                )
            }
          >

            {
              availableRatePlans.map(
                (ratePlan) => (

                  <option
                    key={
                      ratePlan.id
                    }
                    value={
                      ratePlan.id
                    }
                  >
                    {
                      ratePlan.name
                    }
                  </option>

                )
              )
            }

          </select>

        </Field>

      </div>


      <div className="form-section-title">
        2. Ngày áp dụng
      </div>


      <div className="form-grid">

        <Field
          label="Ngày *"
        >

          <input
            type="date"

            disabled={
              editing
            }

            value={
              form.date
            }

            onChange={
              (event) =>
                patch(
                  "date",
                  event.target.value
                )
            }
          />

        </Field>

      </div>


      <div className="form-section-title">
        3. Giá & Restriction
      </div>


      <div className="form-grid">

        <Field
          label="Daily Rate"
          help="Giá bán áp dụng riêng cho ngày này."
        >

          <div className="input-suffix">

            <input
              type="number"

              min="0"

              value={
                form.rate
              }

              onChange={
                (event) =>
                  patch(
                    "rate",
                    event.target.value
                  )
              }
            />

            <span>
              VND
            </span>

          </div>

        </Field>


        <Field
          label="Minimum Stay"
          help="Số đêm tối thiểu cho ngày này."
        >

          <div className="input-suffix">

            <input
              type="number"

              min="1"

              value={
                form.minimumStay
              }

              onChange={
                (event) =>
                  patch(
                    "minimumStay",
                    event.target.value
                  )
              }
            />

            <span>
              đêm
            </span>

          </div>

        </Field>

      </div>


      <div className="rate-plan-stop-sell">

        <div>

          <strong>
            Stop Sell ngày này
          </strong>

          <p>
            Khi bật, Rate Plan sẽ ngừng bán trong ngày đã chọn.
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
                patch(
                  "stopSell",
                  event.target.checked
                )
            }
          />

          <span className="switch-slider" />

        </label>

      </div>


      <div className="info-note roomtype-note">

        <strong>
          Channel Sync
        </strong>

        <p>
          Sau khi lưu, dữ liệu được đánh dấu
          “Chưa đồng bộ”. Nhân viên có thể kiểm tra
          trước khi đẩy Rate và Restriction sang Channex.
        </p>

      </div>

    </>
  );
}


function BulkRateForm({
  form,
  setForm,
  properties,
  roomTypes,
  ratePlans,
}) {
  const availableRoomTypes =
    roomTypes.filter(
      (roomType) =>
        roomType.propertyId ===
        form.propertyId
    );


  const availableRatePlans =
    ratePlans.filter(
      (ratePlan) =>
        ratePlan.roomTypeId ===
        form.roomTypeId
    );


  function patch(
    key,
    value
  ) {
    setForm(
      (current) => ({
        ...current,

        [key]:
          value,
      })
    );
  }


  function propertyChanged(
    propertyId
  ) {
    const roomType =
      roomTypes.find(
        (item) =>
          item.propertyId ===
          propertyId
      );


    const ratePlan =
      ratePlans.find(
        (item) =>
          item.roomTypeId ===
          roomType?.id
      );


    setForm(
      (current) => ({
        ...current,

        propertyId,

        roomTypeId:
          roomType?.id ||
          "",

        ratePlanId:
          ratePlan?.id ||
          "",

        rate:
          Number(
            ratePlan?.baseRate ||
              0
          ),

        minimumStay:
          Number(
            ratePlan?.minimumStay ||
              1
          ),

        stopSell:
          Boolean(
            ratePlan?.stopSell
          ),
      })
    );
  }


  function roomTypeChanged(
    roomTypeId
  ) {
    const ratePlan =
      ratePlans.find(
        (item) =>
          item.roomTypeId ===
          roomTypeId
      );


    setForm(
      (current) => ({
        ...current,

        roomTypeId,

        ratePlanId:
          ratePlan?.id ||
          "",

        rate:
          Number(
            ratePlan?.baseRate ||
              0
          ),

        minimumStay:
          Number(
            ratePlan?.minimumStay ||
              1
          ),

        stopSell:
          Boolean(
            ratePlan?.stopSell
          ),
      })
    );
  }


  function ratePlanChanged(
    ratePlanId
  ) {
    const ratePlan =
      ratePlans.find(
        (item) =>
          item.id ===
          ratePlanId
      );


    setForm(
      (current) => ({
        ...current,

        ratePlanId,

        rate:
          Number(
            ratePlan?.baseRate ||
              0
          ),

        minimumStay:
          Number(
            ratePlan?.minimumStay ||
              1
          ),

        stopSell:
          Boolean(
            ratePlan?.stopSell
          ),
      })
    );
  }


  return (
    <>
      <div className="form-section-title">
        1. Chọn Rate Plan
      </div>


      <div className="form-grid three">

        <Field
          label="Property"
        >

          <select
            value={
              form.propertyId
            }

            onChange={
              (event) =>
                propertyChanged(
                  event.target.value
                )
            }
          >

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

        </Field>


        <Field
          label="Room Type"
        >

          <select
            value={
              form.roomTypeId
            }

            onChange={
              (event) =>
                roomTypeChanged(
                  event.target.value
                )
            }
          >

            {
              availableRoomTypes.map(
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

        </Field>


        <Field
          label="Rate Plan"
        >

          <select
            value={
              form.ratePlanId
            }

            onChange={
              (event) =>
                ratePlanChanged(
                  event.target.value
                )
            }
          >

            {
              availableRatePlans.map(
                (ratePlan) => (

                  <option
                    key={
                      ratePlan.id
                    }
                    value={
                      ratePlan.id
                    }
                  >
                    {
                      ratePlan.name
                    }
                  </option>

                )
              )
            }

          </select>

        </Field>

      </div>


      <div className="form-section-title">
        2. Khoảng ngày
      </div>


      <div className="form-grid">

        <Field
          label="Từ ngày"
        >

          <input
            type="date"

            value={
              form.startDate
            }

            onChange={
              (event) =>
                patch(
                  "startDate",
                  event.target.value
                )
            }
          />

        </Field>


        <Field
          label="Đến ngày"
        >

          <input
            type="date"

            value={
              form.endDate
            }

            onChange={
              (event) =>
                patch(
                  "endDate",
                  event.target.value
                )
            }
          />

        </Field>

      </div>


      <div className="form-section-title">
        3. Giá & Restriction
      </div>


      <div className="form-grid">

        <Field
          label="Daily Rate"
        >

          <div className="input-suffix">

            <input
              type="number"

              min="0"

              value={
                form.rate
              }

              onChange={
                (event) =>
                  patch(
                    "rate",
                    event.target.value
                  )
              }
            />

            <span>
              VND
            </span>

          </div>

        </Field>


        <Field
          label="Minimum Stay"
        >

          <div className="input-suffix">

            <input
              type="number"

              min="1"

              value={
                form.minimumStay
              }

              onChange={
                (event) =>
                  patch(
                    "minimumStay",
                    event.target.value
                  )
              }
            />

            <span>
              đêm
            </span>

          </div>

        </Field>

      </div>


      <div className="rate-plan-stop-sell">

        <div>

          <strong>
            Stop Sell toàn bộ khoảng ngày
          </strong>

          <p>
            Tất cả ngày trong khoảng sẽ nhận cùng trạng thái Stop Sell.
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
                patch(
                  "stopSell",
                  event.target.checked
                )
            }
          />

          <span className="switch-slider" />

        </label>

      </div>

    </>
  );
}