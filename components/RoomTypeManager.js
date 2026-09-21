"use client";

import { useMemo, useState } from "react";
import {
  BedDouble,
  Eye,
  Link2,
  Pencil,
  Plus,
  Power,
  Search,
  Users,
  WalletCards,
  Wifi,
} from "lucide-react";
import { usePms } from "@/context/PmsContext";
import Modal from "@/components/Modal";
import Drawer from "@/components/Drawer";

const blankForm = {
  propertyId: "",
  name: "",
  code: "",
  status: "Active",
  maxAdults: 2,
  maxChildren: 1,
  maxOccupancy: 3,
  baseRate: 1500000,
  totalRooms: 0,
};

function nowText() {
  return new Date().toLocaleString("vi-VN");
}

function makeId() {
  return `roomtype_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function money(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")} ₫`;
}

function StatusBadge({ active }) {
  return (
    <span
      className={`status-badge ${
        active
          ? "status-success"
          : "status-danger"
      }`}
    >
      {active
        ? "Đang kinh doanh"
        : "Ngưng kinh doanh"}
    </span>
  );
}

function MappingBadge({ mapped }) {
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

export default function RoomTypeManager() {
  const {
    data,
    setData,
    ready,
  } = usePms();

  const properties =
    data.properties || [];

  const roomTypes =
    data.roomTypes || [];

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    propertyFilter,
    setPropertyFilter,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
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
  ] = useState(blankForm);

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
    statusId,
    setStatusId,
  ] = useState(null);

  function getProperty(
    propertyId
  ) {
    return properties.find(
      (property) =>
        property.id === propertyId
    );
  }

  const filtered =
    useMemo(() => {
      const q =
        search
          .trim()
          .toLowerCase();

      return roomTypes.filter(
        (roomType) => {
          const property =
            properties.find(
              (item) =>
                item.id ===
                roomType.propertyId
            );

          const text = `
            ${roomType.name}
            ${roomType.code}
            ${property?.name || ""}
            ${property?.code || ""}
          `.toLowerCase();

          const mapping =
            roomType.mapped
              ? "Mapped"
              : "Not Mapped";

          return (
            (
              !q ||
              text.includes(q)
            ) &&
            (
              !propertyFilter ||
              roomType.propertyId ===
                propertyFilter
            ) &&
            (
              !statusFilter ||
              roomType.status ===
                statusFilter
            ) &&
            (
              !mappingFilter ||
              mapping ===
                mappingFilter
            )
          );
        }
      );
    }, [
      roomTypes,
      properties,
      search,
      propertyFilter,
      statusFilter,
      mappingFilter,
    ]);

  const stats =
    useMemo(
      () => ({
        total:
          roomTypes.length,

        active:
          roomTypes.filter(
            (item) =>
              item.status ===
              "Active"
          ).length,

        totalRooms:
          roomTypes.reduce(
            (sum, item) =>
              sum +
              Number(
                item.totalRooms ||
                  0
              ),
            0
          ),

        mapped:
          roomTypes.filter(
            (item) =>
              item.mapped
          ).length,
      }),
      [roomTypes]
    );

  function updateRoomTypes(
    nextRoomTypes
  ) {
    setData(
      (current) => ({
        ...current,
        roomTypes:
          nextRoomTypes,
      })
    );
  }

  function openCreate() {
    if (
      properties.length === 0
    ) {
      alert(
        "Chưa có khách sạn. Vui lòng tạo Property ở Bước 01 trước."
      );

      return;
    }

    const firstActiveProperty =
      properties.find(
        (property) =>
          property.status ===
          "Active"
      ) ||
      properties[0];

    setEditingId(null);

    setForm({
      ...blankForm,

      propertyId:
        firstActiveProperty?.id ||
        "",
    });

    setFormOpen(true);
  }

  function openEdit(
    roomType
  ) {
    setEditingId(
      roomType.id
    );

    setForm({
      propertyId:
        roomType.propertyId,

      name:
        roomType.name,

      code:
        roomType.code,

      status:
        roomType.status,

      maxAdults:
        Number(
          roomType.maxAdults ||
            0
        ),

      maxChildren:
        Number(
          roomType.maxChildren ||
            0
        ),

      maxOccupancy:
        Number(
          roomType.maxOccupancy ||
            0
        ),

      baseRate:
        Number(
          roomType.baseRate ||
            0
        ),

      totalRooms:
        Number(
          roomType.totalRooms ||
            0
        ),
    });

    setFormOpen(true);
  }

  function saveRoomType() {
    const propertyId =
      form.propertyId;

    const name =
      form.name
        .trim();

    const code =
      form.code
        .trim()
        .toUpperCase();

    const maxAdults =
      Number(
        form.maxAdults ||
          0
      );

    const maxChildren =
      Number(
        form.maxChildren ||
          0
      );

    const maxOccupancy =
      Number(
        form.maxOccupancy ||
          0
      );

    const baseRate =
      Number(
        form.baseRate ||
          0
      );

    const totalRooms =
      Number(
        form.totalRooms ||
          0
      );

    if (
      !propertyId ||
      !getProperty(
        propertyId
      )
    ) {
      alert(
        "Vui lòng chọn khách sạn hợp lệ."
      );

      return;
    }

    if (
      !name ||
      !code
    ) {
      alert(
        "Vui lòng nhập Tên loại phòng và Mã loại phòng."
      );

      return;
    }

    if (
      maxAdults < 1
    ) {
      alert(
        "Số người lớn tối đa phải lớn hơn 0."
      );

      return;
    }

    if (
      maxChildren < 0 ||
      maxOccupancy < 1 ||
      baseRate < 0 ||
      totalRooms < 0
    ) {
      alert(
        "Vui lòng kiểm tra lại sức chứa, Base Rate và Total Rooms."
      );

      return;
    }

    if (
      maxOccupancy <
      maxAdults
    ) {
      alert(
        "Tổng số khách tối đa không thể nhỏ hơn số người lớn tối đa."
      );

      return;
    }

    if (
      !editingId &&
      roomTypes.some(
        (item) =>
          item.propertyId ===
            propertyId &&
          item.code
            .toUpperCase() ===
            code
      )
    ) {
      alert(
        "Mã loại phòng đã tồn tại trong khách sạn này."
      );

      return;
    }

    if (
      editingId
    ) {
      updateRoomTypes(
        roomTypes.map(
          (roomType) =>
            roomType.id ===
            editingId
              ? {
                  ...roomType,

                  ...form,

                  propertyId,

                  name,

                  code,

                  maxAdults,

                  maxChildren,

                  maxOccupancy,

                  baseRate,

                  totalRooms,

                  logs: [
                    `${nowText()} — Đã cập nhật loại phòng`,

                    ...(
                      roomType.logs ||
                      []
                    ),
                  ],
                }
              : roomType
        )
      );
    } else {
      updateRoomTypes([
        {
          id:
            makeId(),

          ...form,

          propertyId,

          name,

          code,

          maxAdults,

          maxChildren,

          maxOccupancy,

          baseRate,

          totalRooms,

          channexRoomTypeId:
            "",

          mapped:
            false,

          lastSync:
            "",

          logs: [
            `${nowText()} — Đã tạo loại phòng`,
          ],
        },

        ...roomTypes,
      ]);
    }

    setFormOpen(false);
  }

  function openMapping(
    roomType
  ) {
    setMappingId(
      roomType.id
    );

    setMappingValue(
      roomType.channexRoomTypeId ||
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
        "Kiểm tra thất bại: Channex Room Type ID chưa hợp lệ."
      );

      return;
    }

    updateRoomTypes(
      roomTypes.map(
        (roomType) =>
          roomType.id ===
          mappingId
            ? {
                ...roomType,

                lastSync:
                  nowText(),

                logs: [
                  `${nowText()} — Kiểm tra Channex Room Type Mapping thành công`,

                  ...(
                    roomType.logs ||
                    []
                  ),
                ],
              }
            : roomType
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
        "Vui lòng nhập Channex Room Type ID hợp lệ."
      );

      return;
    }

    updateRoomTypes(
      roomTypes.map(
        (roomType) =>
          roomType.id ===
          mappingId
            ? {
                ...roomType,

                channexRoomTypeId:
                  mappingValue
                    .trim(),

                mapped:
                  true,

                lastSync:
                  nowText(),

                logs: [
                  `${nowText()} — Đã mapping loại phòng với Channex`,

                  ...(
                    roomType.logs ||
                    []
                  ),
                ],
              }
            : roomType
      )
    );
  }

  function removeMapping() {
    updateRoomTypes(
      roomTypes.map(
        (roomType) =>
          roomType.id ===
          mappingId
            ? {
                ...roomType,

                channexRoomTypeId:
                  "",

                mapped:
                  false,

                lastSync:
                  nowText(),

                logs: [
                  `${nowText()} — Đã gỡ Channex Room Type Mapping`,

                  ...(
                    roomType.logs ||
                    []
                  ),
                ],
              }
            : roomType
      )
    );

    setMappingValue("");
  }

  function toggleStatus() {
    const roomType =
      roomTypes.find(
        (item) =>
          item.id ===
          statusId
      );

    if (!roomType)
      return;

    const nextStatus =
      roomType.status ===
      "Active"
        ? "Inactive"
        : "Active";

    updateRoomTypes(
      roomTypes.map(
        (item) =>
          item.id ===
          statusId
            ? {
                ...item,

                status:
                  nextStatus,

                logs: [
                  `${nowText()} — Đã chuyển trạng thái thành ${
                    nextStatus ===
                    "Active"
                      ? "Đang kinh doanh"
                      : "Ngưng kinh doanh"
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

  const detailRoomType =
    roomTypes.find(
      (item) =>
        item.id ===
        detailId
    );

  const mappingRoomType =
    roomTypes.find(
      (item) =>
        item.id ===
        mappingId
    );

  const statusRoomType =
    roomTypes.find(
      (item) =>
        item.id ===
        statusId
    );

  if (!ready) {
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
            BƯỚC 02 — LOẠI PHÒNG
          </div>

          <h1>
            Quản lý loại phòng{" "}
            <span className="heading-en">
              (Room Type)
            </span>
          </h1>

          <p>
            Khai báo sản phẩm phòng mà khách có thể đặt như Studio,
            Deluxe hoặc Suite; thiết lập sức chứa, Base Rate,
            Total Rooms và mapping với Channex.
          </p>

        </div>


        <button
          className="button button-dark button-lg"
          onClick={
            openCreate
          }
        >

          <Plus size={17} />

          Thêm loại phòng

        </button>

      </div>


      <section className="explain-card">

        <div className="explain-icon">

          <BedDouble size={21} />

        </div>


        <div>

          <strong>
            Loại phòng khác Phòng vật lý như thế nào?
          </strong>

          <p>
            Khách đặt một Room Type như “Deluxe”.
            Phòng vật lý cụ thể như 305 sẽ được gán sau.
            Vì vậy Room Type là lớp sản phẩm dùng cho giá,
            tồn phòng, booking và kết nối kênh phân phối.
          </p>


          <div className="roomtype-flow">

            <span>
              Khách đặt Deluxe
            </span>

            <b>→</b>

            <span>
              PMS giữ tồn Deluxe
            </span>

            <b>→</b>

            <span>
              Gán phòng vật lý khi cần
            </span>

          </div>

        </div>

      </section>


      <div className="metric-grid">

        <Metric
          label="Tổng số loại phòng"
          value={stats.total}
        />

        <Metric
          label="Đang kinh doanh"
          value={stats.active}
        />

        <Metric
          label="Tổng số phòng theo khai báo"
          value={
            stats.totalRooms
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

          <div className="roomtype-filter-grid">

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
                placeholder="Tìm tên hoặc mã loại phòng..."
              />

            </label>


            <select
              value={
                propertyFilter
              }
              onChange={
                (event) =>
                  setPropertyFilter(
                    event.target.value
                  )
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

              <option value="Active">
                Đang kinh doanh
              </option>

              <option value="Inactive">
                Ngưng kinh doanh
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

              <option value="Not Mapped">
                Chưa mapping
              </option>

            </select>

          </div>

        </div>


        <div className="table-wrap">

          <table className="data-table roomtype-table">

            <thead>

              <tr>

                <th>
                  Loại phòng
                </th>

                <th>
                  Khách sạn
                </th>

                <th>
                  Sức chứa
                </th>

                <th>
                  Base Rate
                </th>

                <th>
                  Total Rooms
                </th>

                <th>
                  Channex
                </th>

                <th>
                  Trạng thái
                </th>

                <th className="text-right">
                  Thao tác
                </th>

              </tr>

            </thead>


            <tbody>

              {
                filtered.map(
                  (roomType) => {

                    const property =
                      getProperty(
                        roomType.propertyId
                      );

                    return (

                      <tr
                        key={
                          roomType.id
                        }
                      >

                        <td>

                          <strong>
                            {
                              roomType.name
                            }
                          </strong>

                          <div className="code muted">
                            {
                              roomType.code
                            }
                          </div>

                        </td>


                        <td>

                          <strong className="table-secondary-title">

                            {
                              property?.name ||
                              "Property không tồn tại"
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

                          <div className="capacity-row">

                            <span>
                              {
                                roomType.maxAdults
                              }
                              {" "}
                              người lớn
                            </span>

                            <span>
                              {
                                roomType.maxChildren
                              }
                              {" "}
                              trẻ em
                            </span>

                          </div>

                          <div className="muted small-copy">

                            Tối đa{" "}
                            {
                              roomType.maxOccupancy
                            }
                            {" "}
                            khách

                          </div>

                        </td>


                        <td>

                          {
                            money(
                              roomType.baseRate
                            )
                          }

                        </td>


                        <td>

                          {
                            roomType.totalRooms
                          }

                        </td>


                        <td>

                          <MappingBadge
                            mapped={
                              roomType.mapped
                            }
                          />

                        </td>


                        <td>

                          <StatusBadge
                            active={
                              roomType.status ===
                              "Active"
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
                                    roomType.id
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
                                    roomType
                                  )
                              }
                            >

                              <Pencil size={15} />

                            </ActionButton>


                            <ActionButton
                              title="Mapping Channex"
                              onClick={
                                () =>
                                  openMapping(
                                    roomType
                                  )
                              }
                            >

                              <Link2 size={15} />

                            </ActionButton>


                            <ActionButton
                              title="Đổi trạng thái"
                              onClick={
                                () =>
                                  setStatusId(
                                    roomType.id
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
            filtered.length === 0 && (

              <div className="empty-state">

                <BedDouble size={38} />

                <strong>
                  Không tìm thấy loại phòng
                </strong>

                <span>
                  Hãy thay đổi bộ lọc hoặc tạo Room Type mới.
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
          Trong phần này nhân viên sẽ làm gì?
        </h2>


        <div className="business-grid">

          <BusinessItem
            number="01"
            icon={
              <BedDouble size={18} />
            }
            title="Tạo loại phòng"
            text="Tạo Studio, Deluxe, Suite... và gắn chính xác với Property đang kinh doanh loại phòng đó."
          />


          <BusinessItem
            number="02"
            icon={
              <Users size={18} />
            }
            title="Thiết lập sức chứa"
            text="Quy định Max Adults, Max Children và Max Occupancy để kiểm soát số khách trong booking."
          />


          <BusinessItem
            number="03"
            icon={
              <WalletCards size={18} />
            }
            title="Khai báo Base Rate"
            text="Nhập giá tham chiếu cơ bản. Giá bán theo ngày sẽ được xử lý ở Rate Plan và Rate Calendar."
          />


          <BusinessItem
            number="04"
            icon={
              <Wifi size={18} />
            }
            title="Mapping Channex"
            text="Liên kết PMS Room Type ID với Channex Room Type ID để đồng bộ đúng loại phòng."
          />

        </div>

      </section>


      <Modal
        open={
          formOpen
        }
        title={
          editingId
            ? "Chỉnh sửa loại phòng"
            : "Thêm loại phòng"
        }
        subtitle={
          editingId
            ? "CHỈNH SỬA ROOM TYPE"
            : "TẠO ROOM TYPE MỚI"
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
                saveRoomType
              }
            >
              Lưu loại phòng
            </button>

          </>
        }
      >

        <RoomTypeForm
          form={
            form
          }
          setForm={
            setForm
          }
          properties={
            properties
          }
          editing={
            Boolean(
              editingId
            )
          }
        />

      </Modal>


      <Drawer
        open={
          Boolean(
            detailRoomType
          )
        }
        title={
          detailRoomType?.name ||
          ""
        }
        subtitle="CHI TIẾT LOẠI PHÒNG"
        onClose={
          () =>
            setDetailId(null)
        }
      >

        {
          detailRoomType && (

            <RoomTypeDetail
              roomType={
                detailRoomType
              }
              property={
                getProperty(
                  detailRoomType.propertyId
                )
              }
              onEdit={
                () => {

                  setDetailId(null);

                  openEdit(
                    detailRoomType
                  );

                }
              }
              onMapping={
                () => {

                  setDetailId(null);

                  openMapping(
                    detailRoomType
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
            mappingRoomType
          )
        }
        title="Mapping loại phòng với Channex"
        subtitle="CHANNEX ROOM TYPE MAPPING"
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
          mappingRoomType && (

            <RoomTypeMapping
              roomType={
                mappingRoomType
              }
              property={
                getProperty(
                  mappingRoomType.propertyId
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
            statusRoomType
          )
        }
        title="Thay đổi trạng thái loại phòng"
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
                toggleStatus
              }
            >
              Xác nhận
            </button>

          </>
        }
      >

        {
          statusRoomType && (

            <div className="confirm-copy">

              Loại phòng{" "}

              <strong>
                {
                  statusRoomType.name
                }
              </strong>

              {" "}
              sẽ chuyển từ
              {" "}

              <strong>

                {
                  statusRoomType.status ===
                  "Active"
                    ? "Đang kinh doanh"
                    : "Ngưng kinh doanh"
                }

              </strong>

              {" "}
              sang
              {" "}

              <strong>

                {
                  statusRoomType.status ===
                  "Active"
                    ? "Ngưng kinh doanh"
                    : "Đang kinh doanh"
                }

              </strong>

              .


              <div className="info-note status-note">

                Khi Room Type ngưng kinh doanh,
                hệ thống thực tế cần kiểm tra booking tương lai
                và trạng thái bán trên Channex
                trước khi ngừng hoàn toàn.

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
      title={title}
      onClick={onClick}
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


function RoomTypeForm({
  form,
  setForm,
  properties,
  editing,
}) {

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
        1. Khách sạn & nhận diện loại phòng
      </div>


      <div className="form-grid">

        <Field
          label="Khách sạn (Property) *"
          help="Room Type luôn thuộc về một Property cụ thể."
        >

          <select
            value={
              form.propertyId
            }
            onChange={
              (event) =>
                patch(
                  "propertyId",
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

                    {
                      property.status ===
                      "Inactive"
                        ? " — Ngưng hoạt động"
                        : ""
                    }

                  </option>

                )
              )
            }

          </select>

        </Field>


        <Field
          label="Tên loại phòng (Room Type Name) *"
          help="Ví dụ: Studio, Deluxe, Suite."
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
            placeholder="Ví dụ: Deluxe"
          />

        </Field>


        <Field
          label="Mã loại phòng (Room Type Code) *"
          help={
            editing
              ? "Mã được khóa sau khi tạo để tránh ảnh hưởng mapping và dữ liệu liên quan."
              : "Mã ngắn dùng để nhận diện Room Type trong PMS."
          }
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
            placeholder="Ví dụ: DLX"
          />

        </Field>


        <Field
          label="Trạng thái kinh doanh"
          help="Inactive nghĩa là loại phòng tạm ngưng sử dụng cho nghiệp vụ bán phòng mới."
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
              Đang kinh doanh
            </option>

            <option value="Inactive">
              Ngưng kinh doanh
            </option>

          </select>

        </Field>

      </div>


      <div className="form-section-title">
        2. Sức chứa (Capacity)
      </div>


      <div className="form-grid three">

        <Field
          label="Max Adults"
          help="Số người lớn tối đa được phép ở."
        >

          <input
            type="number"
            min="1"
            value={
              form.maxAdults
            }
            onChange={
              (event) =>
                patch(
                  "maxAdults",
                  event.target.value
                )
            }
          />

        </Field>


        <Field
          label="Max Children"
          help="Số trẻ em tối đa theo chính sách loại phòng."
        >

          <input
            type="number"
            min="0"
            value={
              form.maxChildren
            }
            onChange={
              (event) =>
                patch(
                  "maxChildren",
                  event.target.value
                )
            }
          />

        </Field>


        <Field
          label="Max Occupancy"
          help="Tổng số khách tối đa được phép trong một phòng."
        >

          <input
            type="number"
            min="1"
            value={
              form.maxOccupancy
            }
            onChange={
              (event) =>
                patch(
                  "maxOccupancy",
                  event.target.value
                )
            }
          />

        </Field>

      </div>


      <div className="form-section-title">
        3. Giá cơ sở & số lượng phòng
      </div>


      <div className="form-grid">

        <Field
          label="Base Rate"
          help="Giá tham chiếu cơ bản; giá bán thực tế theo ngày sẽ nằm ở Rate Plan / Rate Calendar."
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
          label="Total Rooms"
          help="Tổng số phòng vật lý thuộc Room Type này."
        >

          <input
            type="number"
            min="0"
            value={
              form.totalRooms
            }
            onChange={
              (event) =>
                patch(
                  "totalRooms",
                  event.target.value
                )
            }
          />

        </Field>

      </div>


      <div className="info-note roomtype-note">

        <strong>
          Quan hệ dữ liệu
        </strong>

        <p>
          Room Type sẽ được dùng ở các bước sau
          để tạo Physical Room, áp Rate Plan,
          quản lý Inventory, tạo Reservation
          và mapping sang Channex.
        </p>

      </div>

    </>
  );
}


function RoomTypeDetail({
  roomType,
  property,
  onEdit,
  onMapping,
}) {
  return (
    <>

      <div className="badge-row">

        <StatusBadge
          active={
            roomType.status ===
            "Active"
          }
        />

        <MappingBadge
          mapped={
            roomType.mapped
          }
        />

      </div>


      <div className="detail-section-title">
        Thông tin loại phòng
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
          label="Mã Property"
          value={
            property?.code ||
            "—"
          }
          mono
        />

        <Detail
          label="Tên loại phòng"
          value={
            roomType.name
          }
        />

        <Detail
          label="Mã loại phòng"
          value={
            roomType.code
          }
          mono
        />

        <Detail
          label="Total Rooms"
          value={
            roomType.totalRooms
          }
        />

        <Detail
          label="Trạng thái"
          value={
            roomType.status ===
            "Active"
              ? "Đang kinh doanh"
              : "Ngưng kinh doanh"
          }
        />

      </div>


      <div className="detail-section-title">
        Sức chứa
      </div>


      <div className="detail-grid">

        <Detail
          label="Max Adults"
          value={
            roomType.maxAdults
          }
        />

        <Detail
          label="Max Children"
          value={
            roomType.maxChildren
          }
        />

        <Detail
          label="Max Occupancy"
          value={
            roomType.maxOccupancy
          }
        />

        <Detail
          label="Base Rate"
          value={
            money(
              roomType.baseRate
            )
          }
        />

      </div>


      <div className="detail-section-title">
        Channex Mapping
      </div>


      <div className="detail-box">

        <Detail
          label="PMS Room Type ID"
          value={
            `PMS-${
              property?.code ||
              "PROPERTY"
            }-${
              roomType.code
            }`
          }
          mono
        />

        <Detail
          label="Channex Room Type ID"
          value={
            roomType.channexRoomTypeId ||
            "Chưa mapping"
          }
          mono
        />

        <Detail
          label="Lần kiểm tra / đồng bộ gần nhất"
          value={
            roomType.lastSync ||
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
            roomType.logs ||
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

          Chỉnh sửa loại phòng

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


function RoomTypeMapping({
  roomType,
  property,
  mappingValue,
  setMappingValue,
}) {
  return (
    <>

      <div className="info-note">

        <strong>
          Room Type Mapping là gì?
        </strong>

        <p>
          PMS cần biết Room Type bên CITYHOUSE
          tương ứng với Room Type nào trên Channex.
          Mapping đúng giúp Rate, Inventory và Booking
          đi vào đúng sản phẩm phòng.
        </p>

      </div>


      <div className="form-grid single">

        <Field
          label="PMS Room Type ID"
        >

          <input
            value={
              `PMS-${
                property?.code ||
                "PROPERTY"
              }-${
                roomType.code
              }`
            }
            readOnly
          />

        </Field>


        <Field
          label="Channex Room Type ID"
          help="Bản demo yêu cầu ID từ 8 ký tự trở lên."
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
            placeholder="Nhập Channex Room Type ID"
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
              roomType.mapped
            }
          />

        </div>


        <div>

          <span>
            Lần kiểm tra gần nhất
          </span>

          <strong>
            {
              roomType.lastSync ||
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