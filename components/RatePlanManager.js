"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  Ban,
  BedDouble,
  CalendarRange,
  CircleDollarSign,
  Eye,
  Link2,
  Pencil,
  Plus,
  Search,
  Wifi,
} from "lucide-react";

import {
  usePms,
} from "@/context/PmsContext";

import Modal from "@/components/Modal";

import Drawer from "@/components/Drawer";


const blankForm = {
  propertyId: "",
  roomTypeId: "",
  name: "",
  code: "",
  baseRate: 0,
  minimumStay: 1,
  stopSell: false,
};


function nowText() {
  return new Date().toLocaleString(
    "vi-VN"
  );
}


function makeId() {
  return `rateplan_${Date.now()}_${Math.random()
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
        ? "Đang đóng bán"
        : "Đang mở bán"}
    </span>
  );
}


function MappingBadge({
  mapped,
}) {
  return (
    <span
      className={`status-badge ${
        mapped
          ? "status-info"
          : "status-warning"
      }`}
    >
      {mapped
        ? "Đã mapping"
        : "Chưa mapping"}
    </span>
  );
}


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
    sellFilter,
    setSellFilter,
  ] = useState("");


  const [
    mappingFilter,
    setMappingFilter,
  ] = useState("");


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
    detailId,
    setDetailId,
  ] = useState(null);


  const [
    mappingId,
    setMappingId,
  ] = useState(null);


  const [
    mappingValue,
    setMappingValue,
  ] = useState("");


  const [
    stopSellId,
    setStopSellId,
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


  function getPropertyRoomTypes(
    propertyId
  ) {
    return roomTypes.filter(
      (roomType) =>
        roomType.propertyId ===
        propertyId
    );
  }


  const filterRoomTypes =
    useMemo(() => {
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
    }, [
      roomTypes,
      propertyFilter,
    ]);


  const filtered =
    useMemo(() => {
      const q =
        search
          .trim()
          .toLowerCase();


      return ratePlans.filter(
        (ratePlan) => {
          const property =
            getProperty(
              ratePlan.propertyId
            );


          const roomType =
            getRoomType(
              ratePlan.roomTypeId
            );


          const text = `
            ${ratePlan.name}
            ${ratePlan.code}
            ${property?.name || ""}
            ${property?.code || ""}
            ${roomType?.name || ""}
            ${roomType?.code || ""}
          `.toLowerCase();


          const sellStatus =
            ratePlan.stopSell
              ? "StopSell"
              : "Open";


          const mappingStatus =
            ratePlan.mapped
              ? "Mapped"
              : "NotMapped";


          return (
            (
              !q ||
              text.includes(q)
            ) &&
            (
              !propertyFilter ||
              ratePlan.propertyId ===
                propertyFilter
            ) &&
            (
              !roomTypeFilter ||
              ratePlan.roomTypeId ===
                roomTypeFilter
            ) &&
            (
              !sellFilter ||
              sellStatus ===
                sellFilter
            ) &&
            (
              !mappingFilter ||
              mappingStatus ===
                mappingFilter
            )
          );
        }
      );
    }, [
      ratePlans,
      properties,
      roomTypes,
      search,
      propertyFilter,
      roomTypeFilter,
      sellFilter,
      mappingFilter,
    ]);


  const stats =
    useMemo(
      () => ({
        total:
          ratePlans.length,

        open:
          ratePlans.filter(
            (item) =>
              !item.stopSell
          ).length,

        stopSell:
          ratePlans.filter(
            (item) =>
              item.stopSell
          ).length,

        mapped:
          ratePlans.filter(
            (item) =>
              item.mapped
          ).length,
      }),
      [
        ratePlans,
      ]
    );


  function updateRatePlans(
    nextRatePlans
  ) {
    setData(
      (current) => ({
        ...current,

        ratePlans:
          nextRatePlans,
      })
    );
  }


  function openCreate() {
    if (
      properties.length === 0
    ) {
      alert(
        "Chưa có Property. Vui lòng hoàn thành Bước 01."
      );

      return;
    }


    if (
      roomTypes.length === 0
    ) {
      alert(
        "Chưa có Room Type. Vui lòng hoàn thành Bước 02."
      );

      return;
    }


    const property =
      properties.find(
        (item) =>
          item.status ===
          "Active"
      ) ||
      properties[0];


    const availableRoomTypes =
      getPropertyRoomTypes(
        property.id
      );


    if (
      availableRoomTypes.length ===
      0
    ) {
      alert(
        "Property này chưa có Room Type."
      );

      return;
    }


    const roomType =
      availableRoomTypes[0];


    setEditingId(null);


    setForm({
      ...blankForm,

      propertyId:
        property.id,

      roomTypeId:
        roomType.id,

      baseRate:
        Number(
          roomType.baseRate ||
            0
        ),
    });


    setFormOpen(true);
  }


  function openEdit(
    ratePlan
  ) {
    setEditingId(
      ratePlan.id
    );


    setForm({
      propertyId:
        ratePlan.propertyId,

      roomTypeId:
        ratePlan.roomTypeId,

      name:
        ratePlan.name,

      code:
        ratePlan.code,

      baseRate:
        Number(
          ratePlan.baseRate ||
            0
        ),

      minimumStay:
        Number(
          ratePlan.minimumStay ||
            1
        ),

      stopSell:
        Boolean(
          ratePlan.stopSell
        ),
    });


    setFormOpen(true);
  }


  function handlePropertyChange(
    propertyId
  ) {
    const availableRoomTypes =
      getPropertyRoomTypes(
        propertyId
      );


    const firstRoomType =
      availableRoomTypes[0];


    setForm(
      (current) => ({
        ...current,

        propertyId,

        roomTypeId:
          firstRoomType?.id ||
          "",

        baseRate:
          Number(
            firstRoomType
              ?.baseRate ||
              0
          ),
      })
    );
  }


  function handleRoomTypeChange(
    roomTypeId
  ) {
    const roomType =
      getRoomType(
        roomTypeId
      );


    setForm(
      (current) => ({
        ...current,

        roomTypeId,

        baseRate:
          Number(
            roomType?.baseRate ||
              current.baseRate ||
              0
          ),
      })
    );
  }


  function saveRatePlan() {
    const propertyId =
      form.propertyId;

    const roomTypeId =
      form.roomTypeId;

    const name =
      form.name
        .trim();

    const code =
      form.code
        .trim()
        .toUpperCase();

    const baseRate =
      Number(
        form.baseRate ||
          0
      );

    const minimumStay =
      Number(
        form.minimumStay ||
          1
      );


    const property =
      getProperty(
        propertyId
      );


    const roomType =
      getRoomType(
        roomTypeId
      );


    if (
      !property
    ) {
      alert(
        "Property không hợp lệ."
      );

      return;
    }


    if (
      !roomType
    ) {
      alert(
        "Room Type không hợp lệ."
      );

      return;
    }


    if (
      roomType.propertyId !==
      propertyId
    ) {
      alert(
        "Room Type không thuộc Property đã chọn."
      );

      return;
    }


    if (
      !name ||
      !code
    ) {
      alert(
        "Vui lòng nhập Tên Rate Plan và Mã Rate Plan."
      );

      return;
    }


    if (
      baseRate < 0
    ) {
      alert(
        "Base Rate không được nhỏ hơn 0."
      );

      return;
    }


    if (
      minimumStay < 1
    ) {
      alert(
        "Minimum Stay phải từ 1 đêm trở lên."
      );

      return;
    }


    const duplicate =
      ratePlans.some(
        (ratePlan) =>
          ratePlan.propertyId ===
            propertyId &&
          ratePlan.roomTypeId ===
            roomTypeId &&
          ratePlan.code
            .toUpperCase() ===
            code &&
          ratePlan.id !==
            editingId
      );


    if (
      duplicate
    ) {
      alert(
        "Mã Rate Plan này đã tồn tại cho Room Type."
      );

      return;
    }


    if (
      editingId
    ) {
      updateRatePlans(
        ratePlans.map(
          (ratePlan) =>
            ratePlan.id ===
            editingId
              ? {
                  ...ratePlan,

                  ...form,

                  propertyId,

                  roomTypeId,

                  name,

                  code,

                  baseRate,

                  minimumStay,

                  logs: [
                    `${nowText()} — Đã cập nhật Rate Plan`,

                    ...(
                      ratePlan.logs ||
                      []
                    ),
                  ],
                }
              : ratePlan
        )
      );
    } else {
      updateRatePlans([
        {
          id:
            makeId(),

          ...form,

          propertyId,

          roomTypeId,

          name,

          code,

          baseRate,

          minimumStay,

          channexRatePlanId:
            "",

          mapped:
            false,

          lastSync:
            "",

          logs: [
            `${nowText()} — Đã tạo Rate Plan`,
          ],
        },

        ...ratePlans,
      ]);
    }


    setFormOpen(false);
  }


  function openMapping(
    ratePlan
  ) {
    setMappingId(
      ratePlan.id
    );


    setMappingValue(
      ratePlan.channexRatePlanId ||
        ""
    );
  }


  function testMapping() {
    if (
      mappingValue
        .trim()
        .length < 8
    ) {
      alert(
        "Channex Rate Plan ID chưa hợp lệ."
      );

      return;
    }


    updateRatePlans(
      ratePlans.map(
        (ratePlan) =>
          ratePlan.id ===
          mappingId
            ? {
                ...ratePlan,

                lastSync:
                  nowText(),

                logs: [
                  `${nowText()} — Kiểm tra Channex Rate Plan Mapping thành công`,

                  ...(
                    ratePlan.logs ||
                    []
                  ),
                ],
              }
            : ratePlan
      )
    );
  }


  function saveMapping() {
    if (
      mappingValue
        .trim()
        .length < 8
    ) {
      alert(
        "Vui lòng nhập Channex Rate Plan ID hợp lệ."
      );

      return;
    }


    updateRatePlans(
      ratePlans.map(
        (ratePlan) =>
          ratePlan.id ===
          mappingId
            ? {
                ...ratePlan,

                channexRatePlanId:
                  mappingValue
                    .trim(),

                mapped:
                  true,

                lastSync:
                  nowText(),

                logs: [
                  `${nowText()} — Đã mapping Rate Plan với Channex`,

                  ...(
                    ratePlan.logs ||
                    []
                  ),
                ],
              }
            : ratePlan
      )
    );
  }


  function removeMapping() {
    updateRatePlans(
      ratePlans.map(
        (ratePlan) =>
          ratePlan.id ===
          mappingId
            ? {
                ...ratePlan,

                channexRatePlanId:
                  "",

                mapped:
                  false,

                lastSync:
                  nowText(),

                logs: [
                  `${nowText()} — Đã gỡ Channex Rate Plan Mapping`,

                  ...(
                    ratePlan.logs ||
                    []
                  ),
                ],
              }
            : ratePlan
      )
    );


    setMappingValue("");
  }


  function toggleStopSell() {
    const ratePlan =
      ratePlans.find(
        (item) =>
          item.id ===
          stopSellId
      );


    if (
      !ratePlan
    ) {
      return;
    }


    const nextValue =
      !ratePlan.stopSell;


    updateRatePlans(
      ratePlans.map(
        (item) =>
          item.id ===
          ratePlan.id
            ? {
                ...item,

                stopSell:
                  nextValue,

                logs: [
                  `${nowText()} — ${
                    nextValue
                      ? "Đã Stop Sell Rate Plan"
                      : "Đã mở bán lại Rate Plan"
                  }`,

                  ...(
                    item.logs ||
                    []
                  ),
                ],
              }
            : item
      )
    );


    setStopSellId(null);
  }


  const detailRatePlan =
    ratePlans.find(
      (item) =>
        item.id ===
        detailId
    );


  const mappingRatePlan =
    ratePlans.find(
      (item) =>
        item.id ===
        mappingId
    );


  const stopSellRatePlan =
    ratePlans.find(
      (item) =>
        item.id ===
        stopSellId
    );


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
            BƯỚC 04 — CHÍNH SÁCH GIÁ
          </div>

          <h1>
            Quản lý chính sách giá{" "}
            <span className="heading-en">
              (Rate Plan)
            </span>
          </h1>

          <p>
            Tạo các gói giá bán cho từng loại phòng,
            thiết lập Base Rate, Minimum Stay,
            Stop Sell và mapping Rate Plan với Channex.
          </p>

        </div>


        <button
          className="button button-dark button-lg"
          onClick={
            openCreate
          }
        >
          <Plus size={17} />

          Thêm Rate Plan
        </button>

      </div>


      <section className="explain-card">

        <div className="explain-icon">
          <CircleDollarSign
            size={21}
          />
        </div>


        <div>

          <strong>
            Rate Plan là cách một Room Type được bán
          </strong>

          <p>
            Cùng một loại phòng Deluxe có thể có nhiều
            chính sách giá khác nhau như BAR,
            Room Only hoặc Breakfast Included.
          </p>


          <div className="roomtype-flow">

            <span>
              Deluxe
            </span>

            <b>→</b>

            <span>
              BAR
            </span>

            <b>→</b>

            <span>
              Base Rate
            </span>

            <b>→</b>

            <span>
              Rate Calendar
            </span>

          </div>

        </div>

      </section>


      <div className="metric-grid">

        <Metric
          label="Tổng Rate Plan"
          value={
            stats.total
          }
        />

        <Metric
          label="Đang mở bán"
          value={
            stats.open
          }
        />

        <Metric
          label="Đang Stop Sell"
          value={
            stats.stopSell
          }
        />

        <Metric
          label="Đã mapping Channex"
          value={
            stats.mapped
          }
        />

      </div>


      <section className="panel">

        <div className="panel-toolbar">

          <div className="rate-plan-filter-grid">

            <label className="search-box">

              <Search size={16} />

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
                placeholder="Tìm tên hoặc mã Rate Plan..."
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
                sellFilter
              }
              onChange={
                (event) =>
                  setSellFilter(
                    event.target.value
                  )
              }
            >

              <option value="">
                Tất cả trạng thái bán
              </option>

              <option value="Open">
                Đang mở bán
              </option>

              <option value="StopSell">
                Stop Sell
              </option>

            </select>


            <select
              value={
                mappingFilter
              }
              onChange={
                (event) =>
                  setMappingFilter(
                    event.target.value
                  )
              }
            >

              <option value="">
                Tất cả mapping
              </option>

              <option value="Mapped">
                Đã mapping
              </option>

              <option value="NotMapped">
                Chưa mapping
              </option>

            </select>

          </div>

        </div>


        <div className="table-wrap">

          <table className="data-table rate-plan-table">

            <thead>

              <tr>

                <th>
                  Rate Plan
                </th>

                <th>
                  Khách sạn
                </th>

                <th>
                  Room Type
                </th>

                <th>
                  Base Rate
                </th>

                <th>
                  Minimum Stay
                </th>

                <th>
                  Trạng thái bán
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
                filtered.map(
                  (ratePlan) => {
                    const property =
                      getProperty(
                        ratePlan.propertyId
                      );


                    const roomType =
                      getRoomType(
                        ratePlan.roomTypeId
                      );


                    return (
                      <tr
                        key={
                          ratePlan.id
                        }
                      >

                        <td>

                          <strong>
                            {
                              ratePlan.name
                            }
                          </strong>

                          <div className="code muted">
                            {
                              ratePlan.code
                            }
                          </div>

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
                          {
                            money(
                              ratePlan.baseRate
                            )
                          }
                        </td>


                        <td>
                          {
                            ratePlan.minimumStay
                          }{" "}
                          đêm
                        </td>


                        <td>

                          <StopSellBadge
                            stopSell={
                              ratePlan.stopSell
                            }
                          />

                        </td>


                        <td>

                          <MappingBadge
                            mapped={
                              ratePlan.mapped
                            }
                          />

                        </td>


                        <td>

                          <div className="action-row">

                            <ActionButton
                              title="Xem chi tiết"
                              onClick={
                                () =>
                                  setDetailId(
                                    ratePlan.id
                                  )
                              }
                            >
                              <Eye
                                size={15}
                              />
                            </ActionButton>


                            <ActionButton
                              title="Chỉnh sửa"
                              onClick={
                                () =>
                                  openEdit(
                                    ratePlan
                                  )
                              }
                            >
                              <Pencil
                                size={15}
                              />
                            </ActionButton>


                            <ActionButton
                              title="Channex Mapping"
                              onClick={
                                () =>
                                  openMapping(
                                    ratePlan
                                  )
                              }
                            >
                              <Link2
                                size={15}
                              />
                            </ActionButton>


                            <ActionButton
                              title={
                                ratePlan.stopSell
                                  ? "Mở bán lại"
                                  : "Stop Sell"
                              }
                              onClick={
                                () =>
                                  setStopSellId(
                                    ratePlan.id
                                  )
                              }
                            >
                              <Ban
                                size={15}
                              />
                            </ActionButton>

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

                <CircleDollarSign
                  size={38}
                />

                <strong>
                  Chưa có Rate Plan phù hợp
                </strong>

                <span>
                  Hãy thêm Rate Plan hoặc thay đổi bộ lọc.
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
          Rate Plan được sử dụng như thế nào?
        </h2>


        <div className="business-grid">

          <BusinessItem
            number="01"
            icon={
              <BedDouble
                size={18}
              />
            }
            title="Gắn với Room Type"
            text="Mỗi Rate Plan được tạo cho một Room Type cụ thể như Deluxe hoặc Studio."
          />


          <BusinessItem
            number="02"
            icon={
              <CircleDollarSign
                size={18}
              />
            }
            title="Base Rate"
            text="Thiết lập mức giá cơ sở dùng làm giá mặc định của Rate Plan."
          />


          <BusinessItem
            number="03"
            icon={
              <CalendarRange
                size={18}
              />
            }
            title="Minimum Stay"
            text="Quy định số đêm tối thiểu khách phải đặt với Rate Plan."
          />


          <BusinessItem
            number="04"
            icon={
              <Wifi
                size={18}
              />
            }
            title="Stop Sell & Channex"
            text="Có thể đóng bán Rate Plan và mapping với Rate Plan tương ứng trên Channex."
          />

        </div>

      </section>


      <Modal
        open={
          formOpen
        }

        title={
          editingId
            ? "Chỉnh sửa Rate Plan"
            : "Thêm Rate Plan"
        }

        subtitle={
          editingId
            ? "CHỈNH SỬA CHÍNH SÁCH GIÁ"
            : "TẠO CHÍNH SÁCH GIÁ"
        }

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
                  setFormOpen(false)
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
              Lưu Rate Plan
            </button>

          </>
        }
      >

        <RatePlanForm
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
        />

      </Modal>


      <Drawer
        open={
          Boolean(
            detailRatePlan
          )
        }

        title={
          detailRatePlan?.name ||
          ""
        }

        subtitle="CHI TIẾT RATE PLAN"

        onClose={
          () =>
            setDetailId(null)
        }
      >

        {
          detailRatePlan && (

            <RatePlanDetail
              ratePlan={
                detailRatePlan
              }

              property={
                getProperty(
                  detailRatePlan.propertyId
                )
              }

              roomType={
                getRoomType(
                  detailRatePlan.roomTypeId
                )
              }

              onEdit={
                () => {
                  setDetailId(
                    null
                  );

                  openEdit(
                    detailRatePlan
                  );
                }
              }

              onMapping={
                () => {
                  setDetailId(
                    null
                  );

                  openMapping(
                    detailRatePlan
                  );
                }
              }
            />

          )
        }

      </Drawer>


      <Modal
        open={
          Boolean(
            mappingRatePlan
          )
        }

        title="Mapping Rate Plan với Channex"

        subtitle="CHANNEX RATE PLAN MAPPING"

        onClose={
          () =>
            setMappingId(null)
        }

        footer={
          <>

            <button
              className="button button-danger-outline"
              onClick={
                removeMapping
              }
            >
              Gỡ mapping
            </button>


            <div className="footer-actions">

              <button
                className="button button-light"
                onClick={
                  testMapping
                }
              >
                Kiểm tra
              </button>


              <button
                className="button button-dark"
                onClick={
                  saveMapping
                }
              >
                Lưu mapping
              </button>

            </div>

          </>
        }
      >

        {
          mappingRatePlan && (

            <RatePlanMapping
              ratePlan={
                mappingRatePlan
              }

              property={
                getProperty(
                  mappingRatePlan.propertyId
                )
              }

              roomType={
                getRoomType(
                  mappingRatePlan.roomTypeId
                )
              }

              mappingValue={
                mappingValue
              }

              setMappingValue={
                setMappingValue
              }
            />

          )
        }

      </Modal>


      <Modal
        open={
          Boolean(
            stopSellRatePlan
          )
        }

        title={
          stopSellRatePlan?.stopSell
            ? "Mở bán Rate Plan"
            : "Stop Sell Rate Plan"
        }

        onClose={
          () =>
            setStopSellId(null)
        }

        footer={
          <>

            <button
              className="button button-light"
              onClick={
                () =>
                  setStopSellId(null)
              }
            >
              Hủy
            </button>


            <button
              className="button button-dark"
              onClick={
                toggleStopSell
              }
            >
              Xác nhận
            </button>

          </>
        }
      >

        {
          stopSellRatePlan && (

            <div className="confirm-copy">

              Rate Plan{" "}

              <strong>
                {
                  stopSellRatePlan.name
                }
              </strong>

              {" "}
              sẽ chuyển sang{" "}

              <strong>

                {
                  stopSellRatePlan.stopSell
                    ? "Đang mở bán"
                    : "Stop Sell"
                }

              </strong>

              .


              <div className="info-note status-note">

                Stop Sell dùng để ngừng bán Rate Plan khi cần.
                Ở Bước 05, hệ thống sẽ hỗ trợ Stop Sell theo
                từng ngày trong Rate Calendar.

              </div>

            </div>

          )
        }

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


function ActionButton({
  title,
  children,
  onClick,
}) {
  return (
    <button
      className="table-action"
      title={
        title
      }
      onClick={
        onClick
      }
    >
      {children}
    </button>
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


function RatePlanForm({
  form,
  setForm,
  properties,
  roomTypes,
  editing,
  onPropertyChange,
  onRoomTypeChange,
}) {
  const availableRoomTypes =
    roomTypes.filter(
      (roomType) =>
        roomType.propertyId ===
        form.propertyId
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
        1. Khách sạn & Room Type
      </div>


      <div className="form-grid">

        <Field
          label="Khách sạn (Property) *"
          help="Rate Plan thuộc về một Property."
        >

          <select
            value={
              form.propertyId
            }

            disabled={
              editing
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
                    {" "}
                    (
                    {
                      property.code
                    }
                    )
                  </option>

                )
              )
            }

          </select>

        </Field>


        <Field
          label="Loại phòng (Room Type) *"
          help="Rate Plan được áp dụng cho Room Type này."
        >

          <select
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
                    {" "}
                    (
                    {
                      roomType.code
                    }
                    )
                  </option>

                )
              )
            }

          </select>

        </Field>

      </div>


      <div className="form-section-title">
        2. Thông tin Rate Plan
      </div>


      <div className="form-grid">

        <Field
          label="Tên Rate Plan *"
          help="Ví dụ: BAR, Room Only, Breakfast Included."
        >

          <input
            value={
              form.name
            }

            onChange={
              (event) =>
                patch(
                  "name",
                  event.target.value
                )
            }

            placeholder="Ví dụ: BAR"
          />

        </Field>


        <Field
          label="Mã Rate Plan *"
          help="Mã nội bộ dùng để vận hành và mapping."
        >

          <input
            value={
              form.code
            }

            disabled={
              editing
            }

            onChange={
              (event) =>
                patch(
                  "code",
                  event.target.value
                    .toUpperCase()
                )
            }

            placeholder="Ví dụ: BAR"
          />

        </Field>

      </div>


      <div className="form-section-title">
        3. Giá & điều kiện bán
      </div>


      <div className="form-grid">

        <Field
          label="Base Rate"
          help="Giá cơ sở của Rate Plan."
        >

          <div className="input-suffix">

            <input
              type="number"

              min="0"

              value={
                form.baseRate
              }

              onChange={
                (event) =>
                  patch(
                    "baseRate",
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
          help="Số đêm tối thiểu khách phải đặt."
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
            Stop Sell
          </strong>

          <p>
            Bật tùy chọn này nếu muốn ngừng bán
            toàn bộ Rate Plan.
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
          Bước tiếp theo
        </strong>

        <p>
          Base Rate và Minimum Stay ở đây là cấu hình
          mặc định. Bước 05 — Rate Calendar sẽ cho phép
          thay đổi giá, Minimum Stay và Stop Sell
          theo từng ngày.
        </p>

      </div>

    </>
  );
}


function RatePlanDetail({
  ratePlan,
  property,
  roomType,
  onEdit,
  onMapping,
}) {
  return (
    <>
      <div className="badge-row">

        <StopSellBadge
          stopSell={
            ratePlan.stopSell
          }
        />

        <MappingBadge
          mapped={
            ratePlan.mapped
          }
        />

      </div>


      <div className="detail-section-title">
        Thông tin Rate Plan
      </div>


      <div className="detail-grid">

        <Detail
          label="Khách sạn"
          value={
            property?.name ||
            "—"
          }
        />

        <Detail
          label="Room Type"
          value={
            roomType?.name ||
            "—"
          }
        />

        <Detail
          label="Tên Rate Plan"
          value={
            ratePlan.name
          }
        />

        <Detail
          label="Mã Rate Plan"
          value={
            ratePlan.code
          }
          mono
        />

        <Detail
          label="Base Rate"
          value={
            money(
              ratePlan.baseRate
            )
          }
        />

        <Detail
          label="Minimum Stay"
          value={
            `${ratePlan.minimumStay} đêm`
          }
        />

      </div>


      <div className="detail-section-title">
        Trạng thái bán
      </div>


      <div className="detail-box">

        <div>

          <div className="detail-label">
            Stop Sell
          </div>

          <StopSellBadge
            stopSell={
              ratePlan.stopSell
            }
          />

        </div>

      </div>


      <div className="detail-section-title">
        Channex Mapping
      </div>


      <div className="detail-box">

        <Detail
          label="PMS Rate Plan ID"
          value={
            `PMS-${
              property?.code ||
              "PROPERTY"
            }-${
              roomType?.code ||
              "ROOM"
            }-${
              ratePlan.code
            }`
          }
          mono
        />

        <Detail
          label="Channex Rate Plan ID"
          value={
            ratePlan.channexRatePlanId ||
            "Chưa mapping"
          }
          mono
        />

        <Detail
          label="Lần kiểm tra gần nhất"
          value={
            ratePlan.lastSync ||
            "—"
          }
        />

      </div>


      <div className="detail-section-title">
        Lịch sử thao tác
      </div>


      <div className="timeline">

        {
          (
            ratePlan.logs ||
            []
          ).map(
            (
              log,
              index
            ) => (

              <div
                className="timeline-item"
                key={
                  `${log}-${index}`
                }
              >
                {log}
              </div>

            )
          )
        }

      </div>


      <div className="drawer-actions">

        <button
          className="button button-dark"
          onClick={
            onEdit
          }
        >
          <Pencil size={16} />

          Chỉnh sửa Rate Plan
        </button>


        <button
          className="button button-light"
          onClick={
            onMapping
          }
        >
          <Link2 size={16} />

          Quản lý Channex Mapping
        </button>

      </div>

    </>
  );
}


function RatePlanMapping({
  ratePlan,
  property,
  roomType,
  mappingValue,
  setMappingValue,
}) {
  return (
    <>
      <div className="info-note">

        <strong>
          Rate Plan Mapping là gì?
        </strong>

        <p>
          Liên kết Rate Plan trong CITYHOUSE PMS
          với đúng Rate Plan tương ứng trên Channex
          để chuẩn bị đồng bộ giá và restriction.
        </p>

      </div>


      <div className="form-grid single">

        <Field
          label="PMS Rate Plan ID"
        >

          <input
            value={
              `PMS-${
                property?.code ||
                "PROPERTY"
              }-${
                roomType?.code ||
                "ROOM"
              }-${
                ratePlan.code
              }`
            }
            readOnly
          />

        </Field>


        <Field
          label="Channex Rate Plan ID"
          help="Nhập ID Rate Plan tương ứng từ Channex."
        >

          <input
            value={
              mappingValue
            }

            onChange={
              (event) =>
                setMappingValue(
                  event.target.value
                )
            }

            placeholder="Nhập Channex Rate Plan ID"
          />

        </Field>

      </div>


      <div className="connection-grid">

        <div>

          <span>
            Trạng thái mapping
          </span>

          <MappingBadge
            mapped={
              ratePlan.mapped
            }
          />

        </div>


        <div>

          <span>
            Lần kiểm tra gần nhất
          </span>

          <strong>
            {
              ratePlan.lastSync ||
              "—"
            }
          </strong>

        </div>

      </div>

    </>
  );
}


function Detail({
  label,
  value,
  mono = false,
}) {
  return (
    <div>

      <div className="detail-label">
        {label}
      </div>

      <div
        className={`detail-value ${
          mono
            ? "code"
            : ""
        }`}
      >
        {value}
      </div>

    </div>
  );
}