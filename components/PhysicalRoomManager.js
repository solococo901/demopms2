"use client";

import { useMemo, useState } from "react";
import {
  BedDouble,
  Building2,
  DoorClosed,
  Eye,
  Layers3,
  Pencil,
  Plus,
  Power,
  Search,
  Sparkles,
} from "lucide-react";

import { usePms } from "@/context/PmsContext";
import Modal from "@/components/Modal";
import Drawer from "@/components/Drawer";


const blankForm = {
  propertyId: "",
  roomTypeId: "",
  roomNumber: "",
  floor: "",
  status: "Active",
  housekeepingStatus: "Clean",
  note: "",
};


function nowText() {
  return new Date().toLocaleString("vi-VN");
}


function makeId() {
  return `room_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}


function OperationalBadge({ status }) {
  const map = {
    Active: {
      label: "Đang hoạt động",
      className: "status-success",
    },

    OutOfOrder: {
      label: "Out of Order",
      className: "status-danger",
    },

    OutOfService: {
      label: "Out of Service",
      className: "status-warning",
    },
  };

  const item =
    map[status] ||
    map.Active;

  return (
    <span
      className={`status-badge ${item.className}`}
    >
      {item.label}
    </span>
  );
}


function HousekeepingBadge({
  status,
}) {
  const map = {
    Clean: {
      label: "Clean",
      className: "status-success",
    },

    Dirty: {
      label: "Dirty",
      className: "status-danger",
    },

    Cleaning: {
      label: "Cleaning",
      className: "status-warning",
    },

    Inspected: {
      label: "Inspected",
      className: "status-info",
    },
  };

  const item =
    map[status] ||
    map.Clean;

  return (
    <span
      className={`status-badge ${item.className}`}
    >
      {item.label}
    </span>
  );
}


export default function PhysicalRoomManager() {
  const {
    data,
    setData,
    ready,
  } = usePms();


  const properties =
    data.properties || [];

  const roomTypes =
    data.roomTypes || [];

  const physicalRooms =
    data.physicalRooms || [];


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
    statusFilter,
    setStatusFilter,
  ] = useState("");


  const [
    housekeepingFilter,
    setHousekeepingFilter,
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
    statusId,
    setStatusId,
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


  const filteredRoomTypes =
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


      return physicalRooms.filter(
        (room) => {
          const property =
            getProperty(
              room.propertyId
            );

          const roomType =
            getRoomType(
              room.roomTypeId
            );


          const text = `
            ${room.roomNumber}
            ${room.floor}
            ${property?.name || ""}
            ${property?.code || ""}
            ${roomType?.name || ""}
            ${roomType?.code || ""}
          `.toLowerCase();


          return (
            (
              !q ||
              text.includes(q)
            ) &&
            (
              !propertyFilter ||
              room.propertyId ===
                propertyFilter
            ) &&
            (
              !roomTypeFilter ||
              room.roomTypeId ===
                roomTypeFilter
            ) &&
            (
              !statusFilter ||
              room.status ===
                statusFilter
            ) &&
            (
              !housekeepingFilter ||
              room.housekeepingStatus ===
                housekeepingFilter
            )
          );
        }
      );
    }, [
      physicalRooms,
      properties,
      roomTypes,
      search,
      propertyFilter,
      roomTypeFilter,
      statusFilter,
      housekeepingFilter,
    ]);


  const stats =
    useMemo(
      () => ({
        total:
          physicalRooms.length,

        active:
          physicalRooms.filter(
            (room) =>
              room.status ===
              "Active"
          ).length,

        clean:
          physicalRooms.filter(
            (room) =>
              room.housekeepingStatus ===
              "Clean" ||
              room.housekeepingStatus ===
              "Inspected"
          ).length,

        unavailable:
          physicalRooms.filter(
            (room) =>
              room.status ===
                "OutOfOrder" ||
              room.status ===
                "OutOfService"
          ).length,
      }),
      [physicalRooms]
    );


  function updateRooms(
    nextRooms
  ) {
    setData(
      (current) => ({
        ...current,

        physicalRooms:
          nextRooms,
      })
    );
  }


  function openCreate() {
    if (
      properties.length === 0
    ) {
      alert(
        "Chưa có Property. Vui lòng hoàn thành Bước 01 trước."
      );

      return;
    }


    if (
      roomTypes.length === 0
    ) {
      alert(
        "Chưa có Room Type. Vui lòng hoàn thành Bước 02 trước."
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


    const propertyRoomTypes =
      getPropertyRoomTypes(
        property.id
      );


    if (
      propertyRoomTypes.length ===
      0
    ) {
      alert(
        "Khách sạn này chưa có Room Type."
      );

      return;
    }


    setEditingId(null);


    setForm({
      ...blankForm,

      propertyId:
        property.id,

      roomTypeId:
        propertyRoomTypes[0].id,
    });


    setFormOpen(true);
  }


  function openEdit(
    room
  ) {
    setEditingId(
      room.id
    );


    setForm({
      propertyId:
        room.propertyId,

      roomTypeId:
        room.roomTypeId,

      roomNumber:
        room.roomNumber,

      floor:
        room.floor || "",

      status:
        room.status ||
        "Active",

      housekeepingStatus:
        room.housekeepingStatus ||
        "Clean",

      note:
        room.note || "",
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


    setForm(
      (current) => ({
        ...current,

        propertyId,

        roomTypeId:
          availableRoomTypes[0]
            ?.id || "",
      })
    );
  }


  function saveRoom() {
    const propertyId =
      form.propertyId;

    const roomTypeId =
      form.roomTypeId;

    const roomNumber =
      form.roomNumber
        .trim();

    const floor =
      form.floor
        .trim();


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
      !roomNumber
    ) {
      alert(
        "Vui lòng nhập số phòng."
      );

      return;
    }


    const duplicate =
      physicalRooms.some(
        (room) =>
          room.propertyId ===
            propertyId &&
          room.roomNumber
            .toLowerCase() ===
            roomNumber
              .toLowerCase() &&
          room.id !==
            editingId
      );


    if (
      duplicate
    ) {
      alert(
        "Số phòng này đã tồn tại trong khách sạn."
      );

      return;
    }


    if (
      editingId
    ) {
      updateRooms(
        physicalRooms.map(
          (room) =>
            room.id ===
            editingId
              ? {
                  ...room,

                  ...form,

                  propertyId,

                  roomTypeId,

                  roomNumber,

                  floor,

                  logs: [
                    `${nowText()} — Đã cập nhật thông tin phòng`,

                    ...(
                      room.logs ||
                      []
                    ),
                  ],
                }
              : room
        )
      );
    } else {
      updateRooms([
        {
          id:
            makeId(),

          ...form,

          propertyId,

          roomTypeId,

          roomNumber,

          floor,

          occupancyStatus:
            "Vacant",

          currentReservationId:
            null,

          logs: [
            `${nowText()} — Đã tạo phòng vật lý`,
          ],
        },

        ...physicalRooms,
      ]);
    }


    setFormOpen(false);
  }


  function toggleOperationalStatus() {
    const room =
      physicalRooms.find(
        (item) =>
          item.id ===
          statusId
      );


    if (
      !room
    ) {
      return;
    }


    const nextStatus =
      room.status ===
      "Active"
        ? "OutOfOrder"
        : "Active";


    updateRooms(
      physicalRooms.map(
        (item) =>
          item.id ===
          room.id
            ? {
                ...item,

                status:
                  nextStatus,

                logs: [
                  `${nowText()} — Trạng thái phòng chuyển thành ${
                    nextStatus ===
                    "Active"
                      ? "Đang hoạt động"
                      : "Out of Order"
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


    setStatusId(null);
  }


  function setHousekeepingStatus(
    roomId,
    nextStatus
  ) {
    updateRooms(
      physicalRooms.map(
        (room) =>
          room.id ===
          roomId
            ? {
                ...room,

                housekeepingStatus:
                  nextStatus,

                logs: [
                  `${nowText()} — Housekeeping chuyển thành ${nextStatus}`,

                  ...(
                    room.logs ||
                    []
                  ),
                ],
              }
            : room
      )
    );
  }


  const detailRoom =
    physicalRooms.find(
      (room) =>
        room.id ===
        detailId
    );


  const statusRoom =
    physicalRooms.find(
      (room) =>
        room.id ===
        statusId
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
            BƯỚC 03 — PHÒNG VẬT LÝ
          </div>

          <h1>
            Quản lý phòng{" "}
            <span className="heading-en">
              (Physical Room)
            </span>
          </h1>

          <p>
            Quản lý từng phòng thực tế trong khách sạn như
            201, 202, 305; mỗi phòng phải thuộc đúng Property
            và Room Type, đồng thời có trạng thái vận hành và
            trạng thái vệ sinh riêng.
          </p>

        </div>


        <button
          className="button button-dark button-lg"
          onClick={
            openCreate
          }
        >
          <Plus size={17} />

          Thêm phòng
        </button>

      </div>


      <section className="explain-card">

        <div className="explain-icon">
          <DoorClosed size={21} />
        </div>


        <div>

          <strong>
            Physical Room là phòng thực tế khách sẽ ở
          </strong>

          <p>
            Ví dụ “Deluxe” là Room Type, còn “Phòng 305”
            là Physical Room. Một Room Type có thể chứa nhiều
            phòng vật lý khác nhau.
          </p>


          <div className="roomtype-flow">

            <span>
              City Oasis
            </span>

            <b>→</b>

            <span>
              Deluxe
            </span>

            <b>→</b>

            <span>
              Phòng 305
            </span>

          </div>

        </div>

      </section>


      <div className="metric-grid">

        <Metric
          label="Tổng số phòng vật lý"
          value={
            stats.total
          }
        />

        <Metric
          label="Đang hoạt động"
          value={
            stats.active
          }
        />

        <Metric
          label="Phòng sạch / Inspected"
          value={
            stats.clean
          }
        />

        <Metric
          label="Không thể bán"
          value={
            stats.unavailable
          }
        />

      </div>


      <section className="panel">

        <div className="panel-toolbar">

          <div className="physical-filter-grid">

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
                placeholder="Tìm số phòng, tầng, loại phòng..."
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
                Tất cả loại phòng
              </option>


              {
                filteredRoomTypes.map(
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
                Trạng thái vận hành
              </option>

              <option value="Active">
                Đang hoạt động
              </option>

              <option value="OutOfOrder">
                Out of Order
              </option>

              <option value="OutOfService">
                Out of Service
              </option>

            </select>


            <select
              value={
                housekeepingFilter
              }
              onChange={
                (event) =>
                  setHousekeepingFilter(
                    event.target.value
                  )
              }
            >

              <option value="">
                Housekeeping
              </option>

              <option value="Clean">
                Clean
              </option>

              <option value="Dirty">
                Dirty
              </option>

              <option value="Cleaning">
                Cleaning
              </option>

              <option value="Inspected">
                Inspected
              </option>

            </select>

          </div>

        </div>


        <div className="table-wrap">

          <table className="data-table physical-room-table">

            <thead>

              <tr>

                <th>
                  Phòng
                </th>

                <th>
                  Khách sạn
                </th>

                <th>
                  Loại phòng
                </th>

                <th>
                  Tầng
                </th>

                <th>
                  Vận hành
                </th>

                <th>
                  Housekeeping
                </th>

                <th className="text-right">
                  Thao tác
                </th>

              </tr>

            </thead>


            <tbody>

              {
                filtered.map(
                  (room) => {

                    const property =
                      getProperty(
                        room.propertyId
                      );


                    const roomType =
                      getRoomType(
                        room.roomTypeId
                      );


                    return (

                      <tr
                        key={
                          room.id
                        }
                      >

                        <td>

                          <div className="room-number">

                            <DoorClosed
                              size={16}
                            />

                            <strong>
                              {
                                room.roomNumber
                              }
                            </strong>

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
                            room.floor ||
                            "—"
                          }
                        </td>


                        <td>

                          <OperationalBadge
                            status={
                              room.status
                            }
                          />

                        </td>


                        <td>

                          <HousekeepingBadge
                            status={
                              room.housekeepingStatus
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
                                    room.id
                                  )
                              }
                            >
                              <Eye size={15} />
                            </ActionButton>


                            <ActionButton
                              title="Chỉnh sửa"
                              onClick={
                                () =>
                                  openEdit(
                                    room
                                  )
                              }
                            >
                              <Pencil size={15} />
                            </ActionButton>


                            <ActionButton
                              title="Đổi trạng thái vận hành"
                              onClick={
                                () =>
                                  setStatusId(
                                    room.id
                                  )
                              }
                            >
                              <Power size={15} />
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

                <DoorClosed
                  size={38}
                />

                <strong>
                  Chưa có phòng phù hợp
                </strong>

                <span>
                  Hãy thêm Physical Room hoặc thay đổi bộ lọc.
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
          Physical Room được sử dụng như thế nào?
        </h2>


        <div className="business-grid">

          <BusinessItem
            number="01"
            icon={
              <Building2
                size={18}
              />
            }
            title="Chọn khách sạn"
            text="Mỗi phòng vật lý phải thuộc một Property cụ thể."
          />


          <BusinessItem
            number="02"
            icon={
              <BedDouble
                size={18}
              />
            }
            title="Gắn Room Type"
            text="Phòng 305 có thể thuộc Deluxe, phòng 201 có thể thuộc Studio."
          />


          <BusinessItem
            number="03"
            icon={
              <Power
                size={18}
              />
            }
            title="Trạng thái vận hành"
            text="Out of Order và Out of Service giúp loại phòng lỗi khỏi khả năng sử dụng."
          />


          <BusinessItem
            number="04"
            icon={
              <Sparkles
                size={18}
              />
            }
            title="Housekeeping"
            text="Clean, Dirty, Cleaning và Inspected cho biết phòng đã sẵn sàng giao khách hay chưa."
          />

        </div>

      </section>


      <Modal
        open={
          formOpen
        }

        title={
          editingId
            ? "Chỉnh sửa phòng"
            : "Thêm phòng vật lý"
        }

        subtitle={
          editingId
            ? "CHỈNH SỬA PHYSICAL ROOM"
            : "TẠO PHYSICAL ROOM"
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
                saveRoom
              }
            >
              Lưu phòng
            </button>

          </>
        }
      >

        <PhysicalRoomForm
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
        />

      </Modal>


      <Drawer
        open={
          Boolean(
            detailRoom
          )
        }

        title={
          detailRoom
            ? `Phòng ${detailRoom.roomNumber}`
            : ""
        }

        subtitle="CHI TIẾT PHÒNG VẬT LÝ"

        onClose={
          () =>
            setDetailId(null)
        }
      >

        {
          detailRoom && (

            <PhysicalRoomDetail
              room={
                detailRoom
              }

              property={
                getProperty(
                  detailRoom.propertyId
                )
              }

              roomType={
                getRoomType(
                  detailRoom.roomTypeId
                )
              }

              onEdit={
                () => {

                  setDetailId(
                    null
                  );

                  openEdit(
                    detailRoom
                  );

                }
              }

              onHousekeeping={
                (
                  nextStatus
                ) =>
                  setHousekeepingStatus(
                    detailRoom.id,
                    nextStatus
                  )
              }
            />

          )
        }

      </Drawer>


      <Modal
        open={
          Boolean(
            statusRoom
          )
        }

        title="Thay đổi trạng thái phòng"

        onClose={
          () =>
            setStatusId(null)
        }

        footer={
          <>

            <button
              className="button button-light"
              onClick={
                () =>
                  setStatusId(null)
              }
            >
              Hủy
            </button>


            <button
              className="button button-dark"
              onClick={
                toggleOperationalStatus
              }
            >
              Xác nhận
            </button>

          </>
        }
      >

        {
          statusRoom && (

            <div className="confirm-copy">

              Phòng{" "}

              <strong>
                {
                  statusRoom.roomNumber
                }
              </strong>

              {" "}
              sẽ chuyển sang{" "}

              <strong>

                {
                  statusRoom.status ===
                  "Active"
                    ? "Out of Order"
                    : "Đang hoạt động"
                }

              </strong>

              .


              <div className="info-note status-note">

                Out of Order nghĩa là phòng đang có vấn đề
                và tạm thời không nên đưa vào bán hoặc gán cho khách.

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


function PhysicalRoomForm({
  form,
  setForm,
  properties,
  roomTypes,
  editing,
  onPropertyChange,
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
        1. Khách sạn & loại phòng
      </div>


      <div className="form-grid">

        <Field
          label="Khách sạn (Property) *"
          help="Phòng vật lý phải thuộc một Property."
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
          help="Ví dụ: Studio, Deluxe hoặc Suite."
        >

          <select
            value={
              form.roomTypeId
            }

            onChange={
              (event) =>
                patch(
                  "roomTypeId",
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
        2. Nhận diện phòng
      </div>


      <div className="form-grid">

        <Field
          label="Số phòng (Room Number) *"
          help="Ví dụ: 201, 305, A101."
        >

          <input
            value={
              form.roomNumber
            }

            disabled={
              editing
            }

            onChange={
              (event) =>
                patch(
                  "roomNumber",
                  event.target.value
                )
            }

            placeholder="Ví dụ: 305"
          />

        </Field>


        <Field
          label="Tầng (Floor)"
          help="Có thể nhập 1, 2, 3 hoặc Ground Floor."
        >

          <input
            value={
              form.floor
            }

            onChange={
              (event) =>
                patch(
                  "floor",
                  event.target.value
                )
            }

            placeholder="Ví dụ: 3"
          />

        </Field>

      </div>


      <div className="form-section-title">
        3. Trạng thái phòng
      </div>


      <div className="form-grid">

        <Field
          label="Trạng thái vận hành"
          help="Out of Order / Out of Service không nên được sử dụng để bán phòng."
        >

          <select
            value={
              form.status
            }

            onChange={
              (event) =>
                patch(
                  "status",
                  event.target.value
                )
            }
          >

            <option value="Active">
              Đang hoạt động
            </option>

            <option value="OutOfOrder">
              Out of Order
            </option>

            <option value="OutOfService">
              Out of Service
            </option>

          </select>

        </Field>


        <Field
          label="Housekeeping Status"
          help="Trạng thái vệ sinh hiện tại của phòng."
        >

          <select
            value={
              form.housekeepingStatus
            }

            onChange={
              (event) =>
                patch(
                  "housekeepingStatus",
                  event.target.value
                )
            }
          >

            <option value="Clean">
              Clean
            </option>

            <option value="Dirty">
              Dirty
            </option>

            <option value="Cleaning">
              Cleaning
            </option>

            <option value="Inspected">
              Inspected
            </option>

          </select>

        </Field>

      </div>


      <div className="form-section-title">
        4. Ghi chú
      </div>


      <Field
        label="Ghi chú nội bộ"
        help="Ví dụ: phòng gần thang máy, đang kiểm tra máy lạnh..."
      >

        <textarea
          rows="4"

          value={
            form.note
          }

          onChange={
            (event) =>
              patch(
                "note",
                event.target.value
              )
          }

          placeholder="Nhập ghi chú..."
        />

      </Field>

    </>
  );
}


function PhysicalRoomDetail({
  room,
  property,
  roomType,
  onEdit,
  onHousekeeping,
}) {
  return (
    <>
      <div className="badge-row">

        <OperationalBadge
          status={
            room.status
          }
        />

        <HousekeepingBadge
          status={
            room.housekeepingStatus
          }
        />

      </div>


      <div className="detail-section-title">
        Thông tin phòng
      </div>


      <div className="detail-grid">

        <Detail
          label="Số phòng"
          value={
            room.roomNumber
          }
          mono
        />

        <Detail
          label="Tầng"
          value={
            room.floor ||
            "—"
          }
        />

        <Detail
          label="Khách sạn"
          value={
            property?.name ||
            "—"
          }
        />

        <Detail
          label="Mã Property"
          value={
            property?.code ||
            "—"
          }
          mono
        />

        <Detail
          label="Loại phòng"
          value={
            roomType?.name ||
            "—"
          }
        />

        <Detail
          label="Mã Room Type"
          value={
            roomType?.code ||
            "—"
          }
          mono
        />

      </div>


      <div className="detail-section-title">
        Trạng thái
      </div>


      <div className="detail-box">

        <div>

          <div className="detail-label">
            Trạng thái vận hành
          </div>

          <OperationalBadge
            status={
              room.status
            }
          />

        </div>


        <div>

          <div className="detail-label">
            Housekeeping
          </div>

          <HousekeepingBadge
            status={
              room.housekeepingStatus
            }
          />

        </div>


        <Detail
          label="Occupancy Status"
          value={
            room.occupancyStatus ||
            "Vacant"
          }
        />

      </div>


      <div className="detail-section-title">
        Cập nhật Housekeeping
      </div>


      <div className="housekeeping-actions">

        <button
          className="button button-light"
          onClick={
            () =>
              onHousekeeping(
                "Dirty"
              )
          }
        >
          Dirty
        </button>


        <button
          className="button button-light"
          onClick={
            () =>
              onHousekeeping(
                "Cleaning"
              )
          }
        >
          Cleaning
        </button>


        <button
          className="button button-light"
          onClick={
            () =>
              onHousekeeping(
                "Clean"
              )
          }
        >
          Clean
        </button>


        <button
          className="button button-light"
          onClick={
            () =>
              onHousekeeping(
                "Inspected"
              )
          }
        >
          Inspected
        </button>

      </div>


      {
        room.note && (
          <>
            <div className="detail-section-title">
              Ghi chú
            </div>

            <div className="detail-box">
              {
                room.note
              }
            </div>
          </>
        )
      }


      <div className="detail-section-title">
        Lịch sử thao tác
      </div>


      <div className="timeline">

        {
          (
            room.logs ||
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

          Chỉnh sửa phòng
        </button>

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