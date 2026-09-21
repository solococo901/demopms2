"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  BedDouble,
  Box,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Minus,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
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
  date: "",
  totalRooms: 0,
  bookedRooms: 0,
  blockedRooms: 0,
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


function nowText() {
  return new Date().toLocaleString(
    "vi-VN"
  );
}


function makeId() {
  return `inventory_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}


function calculateAvailable(
  totalRooms,
  bookedRooms,
  blockedRooms
) {
  return Math.max(
    Number(
      totalRooms || 0
    ) -
      Number(
        bookedRooms || 0
      ) -
      Number(
        blockedRooms || 0
      ),
    0
  );
}


function InventoryStatusBadge({
  available,
}) {
  if (
    available <= 0
  ) {
    return (
      <span className="status-badge status-danger">
        Sold Out
      </span>
    );
  }


  if (
    available <= 2
  ) {
    return (
      <span className="status-badge status-warning">
        Sắp hết phòng
      </span>
    );
  }


  return (
    <span className="status-badge status-success">
      Còn phòng
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
        : "Chờ đồng bộ"}
    </span>
  );
}


export default function InventoryManager() {
  const {
    data,
    setData,
    ready,
  } = usePms();


  const properties =
    data.properties || [];

  const roomTypes =
    data.roomTypes || [];

  const inventory =
    data.inventory || [];


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
    syncFilter,
    setSyncFilter,
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


  const filtered =
    useMemo(
      () => {
        const q =
          search
            .trim()
            .toLowerCase();


        return inventory
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


              const text = `
                ${property?.name || ""}
                ${property?.code || ""}
                ${roomType?.name || ""}
                ${roomType?.code || ""}
                ${entry.date}
              `.toLowerCase();


              const syncStatus =
                entry.synced
                  ? "Synced"
                  : "Pending";


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
                  !dateFilter ||
                  entry.date ===
                    dateFilter
                ) &&
                (
                  !syncFilter ||
                  syncStatus ===
                    syncFilter
                )
              );
            }
          )
          .sort(
            (
              a,
              b
            ) => {
              const propertyA =
                getProperty(
                  a.propertyId
                )?.name || "";


              const propertyB =
                getProperty(
                  b.propertyId
                )?.name || "";


              if (
                propertyA !==
                propertyB
              ) {
                return propertyA.localeCompare(
                  propertyB
                );
              }


              const roomA =
                getRoomType(
                  a.roomTypeId
                )?.name || "";


              const roomB =
                getRoomType(
                  b.roomTypeId
                )?.name || "";


              return roomA.localeCompare(
                roomB
              );
            }
          );
      },
      [
        inventory,
        properties,
        roomTypes,
        search,
        propertyFilter,
        roomTypeFilter,
        dateFilter,
        syncFilter,
      ]
    );


  const stats =
    useMemo(
      () => {
        const entries =
          inventory.filter(
            (entry) =>
              entry.date ===
              dateFilter
          );


        return {
          total:
            entries.reduce(
              (
                sum,
                entry
              ) =>
                sum +
                Number(
                  entry.totalRooms ||
                    0
                ),
              0
            ),

          booked:
            entries.reduce(
              (
                sum,
                entry
              ) =>
                sum +
                Number(
                  entry.bookedRooms ||
                    0
                ),
              0
            ),

          blocked:
            entries.reduce(
              (
                sum,
                entry
              ) =>
                sum +
                Number(
                  entry.blockedRooms ||
                    0
                ),
              0
            ),

          available:
            entries.reduce(
              (
                sum,
                entry
              ) =>
                sum +
                calculateAvailable(
                  entry.totalRooms,
                  entry.bookedRooms,
                  entry.blockedRooms
                ),
              0
            ),

          unsynced:
            entries.filter(
              (entry) =>
                !entry.synced
            ).length,
        };
      },
      [
        inventory,
        dateFilter,
      ]
    );


  function updateInventory(
    nextInventory
  ) {
    setData(
      (current) => ({
        ...current,

        inventory:
          nextInventory,
      })
    );
  }


  function patchEntry(
    id,
    callback
  ) {
    setData(
      (current) => ({
        ...current,

        inventory:
          (
            current.inventory ||
            []
          ).map(
            (entry) =>
              entry.id ===
              id
                ? callback(
                    entry
                  )
                : entry
          ),
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


    const property =
      getInitialProperty();


    const propertyRoomTypes =
      getPropertyRoomTypes(
        property.id
      );


    const roomType =
      propertyRoomTypes.find(
        (item) =>
          item.status ===
          "Active"
      ) ||
      propertyRoomTypes[0];


    if (
      !roomType
    ) {
      alert(
        "Property này chưa có Room Type."
      );

      return;
    }


    setEditingId(
      null
    );


    setForm({
      propertyId:
        property.id,

      roomTypeId:
        roomType.id,

      date:
        dateFilter ||
        todayString(),

      totalRooms:
        Number(
          roomType.totalRooms ||
            0
        ),

      bookedRooms:
        0,

      blockedRooms:
        0,
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

      date:
        entry.date,

      totalRooms:
        Number(
          entry.totalRooms ||
            0
        ),

      bookedRooms:
        Number(
          entry.bookedRooms ||
            0
        ),

      blockedRooms:
        Number(
          entry.blockedRooms ||
            0
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
      ).find(
        (item) =>
          item.status ===
          "Active"
      ) ||
      getPropertyRoomTypes(
        propertyId
      )[0];


    setForm(
      (current) => ({
        ...current,

        propertyId,

        roomTypeId:
          roomType?.id ||
          "",

        totalRooms:
          Number(
            roomType?.totalRooms ||
              0
          ),

        bookedRooms:
          0,

        blockedRooms:
          0,
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

        totalRooms:
          Number(
            roomType?.totalRooms ||
              0
          ),

        bookedRooms:
          0,

        blockedRooms:
          0,
      })
    );
  }


  function saveInventory() {
    const property =
      getProperty(
        form.propertyId
      );


    const roomType =
      getRoomType(
        form.roomTypeId
      );


    const totalRooms =
      Number(
        form.totalRooms ||
          0
      );


    const bookedRooms =
      Number(
        form.bookedRooms ||
          0
      );


    const blockedRooms =
      Number(
        form.blockedRooms ||
          0
      );


    if (
      !property ||
      !roomType
    ) {
      alert(
        "Property hoặc Room Type không hợp lệ."
      );

      return;
    }


    if (
      roomType.propertyId !==
      property.id
    ) {
      alert(
        "Room Type không thuộc Property đã chọn."
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
      totalRooms < 1
    ) {
      alert(
        "Room Type chưa có Total Rooms hợp lệ."
      );

      return;
    }


    if (
      bookedRooms < 0 ||
      blockedRooms < 0
    ) {
      alert(
        "Số phòng không được nhỏ hơn 0."
      );

      return;
    }


    if (
      bookedRooms +
        blockedRooms >
      totalRooms
    ) {
      alert(
        "Booked Rooms + Blocked Rooms không được lớn hơn Total Rooms."
      );

      return;
    }


    const duplicate =
      inventory.some(
        (entry) =>
          entry.roomTypeId ===
            form.roomTypeId &&
          entry.date ===
            form.date &&
          entry.id !==
            editingId
      );


    if (
      duplicate
    ) {
      alert(
        "Room Type này đã có Inventory cho ngày đã chọn."
      );

      return;
    }


    const availableRooms =
      calculateAvailable(
        totalRooms,
        bookedRooms,
        blockedRooms
      );


    if (
      editingId
    ) {
      updateInventory(
        inventory.map(
          (entry) =>
            entry.id ===
            editingId
              ? {
                  ...entry,

                  totalRooms,

                  bookedRooms,

                  blockedRooms,

                  availableRooms,

                  synced:
                    false,

                  updatedAt:
                    nowText(),

                  logs: [
                    `${nowText()} — Đã điều chỉnh Inventory`,

                    ...(
                      entry.logs ||
                      []
                    ),
                  ],
                }
              : entry
        )
      );
    }

    else {
      updateInventory([
        {
          id:
            makeId(),

          propertyId:
            form.propertyId,

          roomTypeId:
            form.roomTypeId,

          date:
            form.date,

          totalRooms,

          bookedRooms,

          blockedRooms,

          availableRooms,

          synced:
            false,

          lastSync:
            "",

          createdAt:
            nowText(),

          updatedAt:
            nowText(),

          logs: [
            `${nowText()} — Đã tạo Daily Availability`,
          ],
        },

        ...inventory,
      ]);
    }


    setFormOpen(
      false
    );
  }


  function initializeSelectedDate() {
    if (
      !dateFilter
    ) {
      alert(
        "Vui lòng chọn ngày."
      );

      return;
    }


    const activePropertyIds =
      new Set(
        properties
          .filter(
            (property) =>
              property.status ===
              "Active"
          )
          .map(
            (property) =>
              property.id
          )
      );


    const activeRoomTypes =
      roomTypes.filter(
        (roomType) =>
          activePropertyIds.has(
            roomType.propertyId
          ) &&
          roomType.status ===
            "Active"
      );


    if (
      activeRoomTypes.length ===
      0
    ) {
      alert(
        "Không có Room Type đang hoạt động."
      );

      return;
    }


    setData(
      (current) => {
        const currentInventory =
          current.inventory ||
          [];


        const existingKeys =
          new Set(
            currentInventory.map(
              (entry) =>
                `${entry.roomTypeId}_${entry.date}`
            )
          );


        const newEntries =
          activeRoomTypes
            .filter(
              (roomType) =>
                !existingKeys.has(
                  `${roomType.id}_${dateFilter}`
                )
            )
            .map(
              (roomType) => {
                const totalRooms =
                  Number(
                    roomType.totalRooms ||
                      0
                  );


                return {
                  id:
                    makeId(),

                  propertyId:
                    roomType.propertyId,

                  roomTypeId:
                    roomType.id,

                  date:
                    dateFilter,

                  totalRooms,

                  bookedRooms:
                    0,

                  blockedRooms:
                    0,

                  availableRooms:
                    totalRooms,

                  synced:
                    false,

                  lastSync:
                    "",

                  createdAt:
                    nowText(),

                  updatedAt:
                    nowText(),

                  logs: [
                    `${nowText()} — Khởi tạo Daily Availability`,
                  ],
                };
              }
            );


        if (
          newEntries.length ===
          0
        ) {
          alert(
            "Inventory của tất cả Room Type trong ngày này đã được khởi tạo."
          );

          return current;
        }


        return {
          ...current,

          inventory: [
            ...newEntries,

            ...currentInventory,
          ],
        };
      }
    );
  }


  function bookingDeduction(
    entry
  ) {
    const available =
      calculateAvailable(
        entry.totalRooms,
        entry.bookedRooms,
        entry.blockedRooms
      );


    if (
      available <= 0
    ) {
      alert(
        "Inventory đã hết. Không thể giảm thêm."
      );

      return;
    }


    patchEntry(
      entry.id,
      (current) => {
        const bookedRooms =
          Number(
            current.bookedRooms ||
              0
          ) + 1;


        return {
          ...current,

          bookedRooms,

          availableRooms:
            calculateAvailable(
              current.totalRooms,
              bookedRooms,
              current.blockedRooms
            ),

          synced:
            false,

          updatedAt:
            nowText(),

          logs: [
            `${nowText()} — Booking Deduction: -1 phòng có thể bán`,

            ...(
              current.logs ||
              []
            ),
          ],
        };
      }
    );
  }


  function cancellationRelease(
    entry
  ) {
    if (
      Number(
        entry.bookedRooms ||
          0
      ) <= 0
    ) {
      alert(
        "Không có phòng đã booking để release."
      );

      return;
    }


    patchEntry(
      entry.id,
      (current) => {
        const bookedRooms =
          Math.max(
            Number(
              current.bookedRooms ||
                0
            ) - 1,
            0
          );


        return {
          ...current,

          bookedRooms,

          availableRooms:
            calculateAvailable(
              current.totalRooms,
              bookedRooms,
              current.blockedRooms
            ),

          synced:
            false,

          updatedAt:
            nowText(),

          logs: [
            `${nowText()} — Cancellation Release: +1 phòng có thể bán`,

            ...(
              current.logs ||
              []
            ),
          ],
        };
      }
    );
  }


  function syncEntry(
    entry
  ) {
    setSyncId(
      entry.id
    );


    patchEntry(
      entry.id,
      (current) => ({
        ...current,

        synced:
          true,

        lastSync:
          nowText(),

        logs: [
          `${nowText()} — Đồng bộ Availability sang Channex thành công`,

          ...(
            current.logs ||
            []
          ),
        ],
      })
    );


    setSyncId(
      null
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
      new Set(
        filtered.map(
          (entry) =>
            entry.id
        )
      );


    const syncTime =
      nowText();


    setData(
      (current) => ({
        ...current,

        inventory:
          (
            current.inventory ||
            []
          ).map(
            (entry) =>
              ids.has(
                entry.id
              )
                ? {
                    ...entry,

                    synced:
                      true,

                    lastSync:
                      syncTime,

                    logs: [
                      `${syncTime} — Đồng bộ Availability sang Channex thành công`,

                      ...(
                        entry.logs ||
                        []
                      ),
                    ],
                  }
                : entry
          ),
      })
    );
  }


  function changeDate(
    days
  ) {
    setDateFilter(
      addDays(
        dateFilter ||
          todayString(),
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
            BƯỚC 06 — INVENTORY
          </div>

          <h1>
            Quản lý số lượng phòng có thể bán{" "}
            <span className="heading-en">
              (Inventory)
            </span>
          </h1>

          <p>
            Quản lý Daily Availability theo từng Room Type,
            tự giảm phòng khi có Booking, trả phòng lại khi
            Cancellation và đồng bộ Availability sang Channex.
          </p>

        </div>


        <div className="page-header-actions">

          <button
            className="button button-light button-lg"
            onClick={
              initializeSelectedDate
            }
          >
            <CalendarDays
              size={17}
            />

            Khởi tạo ngày
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

            Thêm Inventory
          </button>

        </div>

      </div>


      <section className="explain-card">

        <div className="explain-icon">
          <Box
            size={21}
          />
        </div>


        <div>

          <strong>
            Inventory là số phòng thực tế còn có thể bán
          </strong>

          <p>
            PMS lấy tổng số phòng của Room Type, trừ phòng
            đã được đặt và phòng đang khóa bán để tính
            Availability gửi sang Channex.
          </p>


          <div className="inventory-flow">

            <span>
              Total Rooms
            </span>

            <b>−</b>

            <span>
              Booked
            </span>

            <b>−</b>

            <span>
              Blocked
            </span>

            <b>=</b>

            <span>
              Available
            </span>

            <b>→</b>

            <span>
              Channex
            </span>

          </div>

        </div>

      </section>


      <div className="metric-grid">

        <Metric
          label="Tổng phòng"
          value={
            stats.total
          }
        />

        <Metric
          label="Đã được đặt"
          value={
            stats.booked
          }
        />

        <Metric
          label="Đang khóa bán"
          value={
            stats.blocked
          }
        />

        <Metric
          label="Còn có thể bán"
          value={
            stats.available
          }
        />

      </div>


      <section className="panel inventory-date-panel">

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
            INVENTORY DATE
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


        <div className="inventory-sync-count">
          <span>
            Chờ đồng bộ
          </span>

          <strong>
            {
              stats.unsynced
            }
          </strong>
        </div>

      </section>


      <section className="panel">

        <div className="panel-toolbar">

          <div className="inventory-toolbar">

            <div className="inventory-filter-grid">

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

                  placeholder="Tìm khách sạn hoặc Room Type..."
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
                  syncFilter
                }

                onChange={
                  (event) =>
                    setSyncFilter(
                      event.target.value
                    )
                }
              >

                <option value="">
                  Tất cả sync
                </option>

                <option value="Synced">
                  Đã đồng bộ
                </option>

                <option value="Pending">
                  Chờ đồng bộ
                </option>

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

          <table className="data-table inventory-table">

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
                  Total
                </th>

                <th>
                  Booked
                </th>

                <th>
                  Blocked
                </th>

                <th>
                  Available
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


                    const available =
                      calculateAvailable(
                        entry.totalRooms,
                        entry.bookedRooms,
                        entry.blockedRooms
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

                          <span className="inventory-number">
                            {
                              entry.totalRooms
                            }
                          </span>

                        </td>


                        <td>

                          <span className="inventory-number booked">
                            {
                              entry.bookedRooms ||
                              0
                            }
                          </span>

                        </td>


                        <td>

                          <span className="inventory-number blocked">
                            {
                              entry.blockedRooms ||
                              0
                            }
                          </span>

                        </td>


                        <td>

                          <div className="inventory-available-cell">

                            <strong>
                              {
                                available
                              }
                            </strong>

                            <InventoryStatusBadge
                              available={
                                available
                              }
                            />

                          </div>

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

                              title="Booking Deduction — giảm 1 phòng"

                              onClick={
                                () =>
                                  bookingDeduction(
                                    entry
                                  )
                              }
                            >
                              <Minus
                                size={15}
                              />
                            </button>


                            <button
                              className="table-action"

                              title="Cancellation Release — trả lại 1 phòng"

                              onClick={
                                () =>
                                  cancellationRelease(
                                    entry
                                  )
                              }
                            >
                              <RotateCcw
                                size={15}
                              />
                            </button>


                            <button
                              className="table-action"

                              title="Điều chỉnh Inventory"

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

                <Box
                  size={38}
                />

                <strong>
                  Chưa có Inventory cho ngày này
                </strong>

                <span>
                  Nhấn “Khởi tạo ngày” để tạo Availability
                  cho các Room Type đang hoạt động.
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
          Inventory thay đổi khi nào?
        </h2>


        <div className="business-grid">

          <BusinessItem
            number="01"
            icon={
              <BedDouble
                size={18}
              />
            }
            title="Daily Availability"
            text="Mỗi Room Type có số lượng phòng còn bán riêng cho từng ngày."
          />


          <BusinessItem
            number="02"
            icon={
              <Minus
                size={18}
              />
            }
            title="Booking Deduction"
            text="Khi Reservation được tạo và giữ phòng, Inventory tự giảm số phòng còn bán."
          />


          <BusinessItem
            number="03"
            icon={
              <RotateCcw
                size={18}
              />
            }
            title="Cancellation Release"
            text="Khi booking bị hủy hoặc được release, PMS trả phòng về Inventory."
          />


          <BusinessItem
            number="04"
            icon={
              <Wifi
                size={18}
              />
            }
            title="Channex Availability Sync"
            text="Availability mới được đồng bộ sang Channex để cập nhật các OTA."
          />

        </div>

      </section>


      <Modal
        open={
          formOpen
        }

        title={
          editingId
            ? "Điều chỉnh Inventory"
            : "Thêm Inventory"
        }

        subtitle="DAILY AVAILABILITY"

        onClose={
          () =>
            setFormOpen(
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
                saveInventory
              }
            >
              Lưu Inventory
            </button>

          </>
        }
      >

        <InventoryForm
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


function InventoryForm({
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


  const availableRooms =
    calculateAvailable(
      form.totalRooms,
      form.bookedRooms,
      form.blockedRooms
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
        1. Room Type
      </div>


      <div className="form-grid">

        <Field
          label="Property *"
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
            value={
              form.roomTypeId
            }

            disabled={
              editing
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

      </div>


      <div className="form-section-title">
        2. Ngày Inventory
      </div>


      <div className="form-grid">

        <Field
          label="Ngày *"
        >

          <input
            type="date"

            value={
              form.date
            }

            disabled={
              editing
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
        3. Availability
      </div>


      <div className="form-grid three">

        <Field
          label="Total Rooms"
          help="Lấy từ cấu hình Room Type."
        >

          <input
            type="number"

            value={
              form.totalRooms
            }

            readOnly
          />

        </Field>


        <Field
          label="Booked Rooms"
          help="Sau này Reservation sẽ tự cập nhật."
        >

          <input
            type="number"

            value={
              form.bookedRooms
            }

            readOnly
          />

        </Field>


        <Field
          label="Blocked Rooms"
          help="Số phòng tạm thời không muốn bán."
        >

          <input
            type="number"

            min="0"

            max={
              Math.max(
                Number(
                  form.totalRooms ||
                    0
                ) -
                  Number(
                    form.bookedRooms ||
                      0
                  ),
                0
              )
            }

            value={
              form.blockedRooms
            }

            onChange={
              (event) =>
                patch(
                  "blockedRooms",
                  event.target.value
                )
            }
          />

        </Field>

      </div>


      <div className="inventory-preview">

        <div>

          <span>
            TOTAL
          </span>

          <strong>
            {
              form.totalRooms ||
              0
            }
          </strong>

        </div>


        <b>
          −
        </b>


        <div>

          <span>
            BOOKED
          </span>

          <strong>
            {
              form.bookedRooms ||
              0
            }
          </strong>

        </div>


        <b>
          −
        </b>


        <div>

          <span>
            BLOCKED
          </span>

          <strong>
            {
              form.blockedRooms ||
              0
            }
          </strong>

        </div>


        <b>
          =
        </b>


        <div className="inventory-preview-result">

          <span>
            AVAILABLE
          </span>

          <strong>
            {
              availableRooms
            }
          </strong>

        </div>

      </div>


      <div className="info-note roomtype-note">

        <strong>
          Công thức Availability
        </strong>

        <p>
          Available Rooms = Total Rooms − Booked Rooms − Blocked Rooms.
          Khi dữ liệu thay đổi, Inventory sẽ chuyển về trạng thái
          chờ đồng bộ Channex.
        </p>

      </div>

    </>
  );
}