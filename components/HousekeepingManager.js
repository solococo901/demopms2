"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  BedDouble,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Eye,
  Hotel,
  Search,
  Sparkles,
  SprayCan,
} from "lucide-react";

import {
  usePms,
} from "@/context/PmsContext";

import Modal from "@/components/Modal";
import Drawer from "@/components/Drawer";


/* =====================================================
   CONSTANTS
===================================================== */

const HOUSEKEEPING_STATUSES = [
  "Dirty",
  "Cleaning",
  "Clean",
  "Inspected",
];


/* =====================================================
   HELPERS
===================================================== */

function nowText() {
  return new Date().toLocaleString(
    "vi-VN"
  );
}


function makeId() {
  return `housekeeping_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}


function getNextStatus(
  currentStatus
) {
  if (
    currentStatus ===
    "Dirty"
  ) {
    return "Cleaning";
  }


  if (
    currentStatus ===
    "Cleaning"
  ) {
    return "Clean";
  }


  if (
    currentStatus ===
    "Clean"
  ) {
    return "Inspected";
  }


  return null;
}


function getNextActionLabel(
  status
) {
  if (
    status ===
    "Dirty"
  ) {
    return "Start Cleaning";
  }


  if (
    status ===
    "Cleaning"
  ) {
    return "Mark Clean";
  }


  if (
    status ===
    "Clean"
  ) {
    return "Mark Inspected";
  }


  return "Completed";
}


/* =====================================================
   BADGES
===================================================== */

function HousekeepingBadge({
  status,
}) {
  const classMap = {
    Dirty:
      "status-danger",

    Cleaning:
      "status-warning",

    Clean:
      "status-success",

    Inspected:
      "status-info",
  };


  return (
    <span
      className={`status-badge ${
        classMap[
          status
        ] ||
        "status-neutral"
      }`}
    >
      {
        status ||
        "—"
      }
    </span>
  );
}


function OccupancyBadge({
  status,
}) {
  return (
    <span
      className={`status-badge ${
        status ===
        "Occupied"
          ? "status-danger"
          : "status-success"
      }`}
    >
      {
        status ||
        "Vacant"
      }
    </span>
  );
}


function OperationalBadge({
  status,
}) {
  const classMap = {
    Active:
      "status-success",

    OutOfOrder:
      "status-danger",

    OutOfService:
      "status-warning",
  };


  return (
    <span
      className={`status-badge ${
        classMap[
          status
        ] ||
        "status-neutral"
      }`}
    >
      {
        status ||
        "—"
      }
    </span>
  );
}


/* =====================================================
   MAIN
===================================================== */

export default function HousekeepingManager() {
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

  const housekeeping =
    data.housekeeping || [];

  const reservations =
    data.reservations || [];

  const roomAssignments =
    data.roomAssignments || [];


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
    occupancyFilter,
    setOccupancyFilter,
  ] = useState("");


  const [
    updateRoomId,
    setUpdateRoomId,
  ] = useState(null);


  const [
    targetStatus,
    setTargetStatus,
  ] = useState("");


  const [
    note,
    setNote,
  ] = useState("");


  const [
    detailRoomId,
    setDetailRoomId,
  ] = useState(null);


  /* ===================================================
     LOOKUPS
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


  function getCurrentReservation(
    roomId
  ) {
    const assignment =
      roomAssignments.find(
        (item) =>
          item.physicalRoomId ===
            roomId &&
          reservations.some(
            (reservation) =>
              reservation.id ===
                item.reservationId &&
              reservation.status ===
                "Checked In"
          )
      );


    if (
      !assignment
    ) {
      return null;
    }


    return reservations.find(
      (reservation) =>
        reservation.id ===
        assignment.reservationId
    );
  }


  function getEffectiveOccupancy(
    room
  ) {
    if (
      getCurrentReservation(
        room.id
      )
    ) {
      return "Occupied";
    }


    return (
      room.occupancyStatus ||
      "Vacant"
    );
  }


  function getHistory(
    roomId
  ) {
    return housekeeping
      .filter(
        (record) =>
          record.physicalRoomId ===
          roomId
      )
      .sort(
        (
          a,
          b
        ) =>
          String(
            b.changedAt ||
            ""
          ).localeCompare(
            String(
              a.changedAt ||
              ""
            )
          )
      );
  }


  /* ===================================================
     FILTER
  =================================================== */

  const filteredRooms =
    useMemo(
      () => {
        const q =
          search
            .trim()
            .toLowerCase();


        return physicalRooms
          .filter(
            (room) => {
              const property =
                getProperty(
                  room.propertyId
                );


              const roomType =
                getRoomType(
                  room.roomTypeId
                );


              const occupancy =
                getEffectiveOccupancy(
                  room
                );


              const text = `
                ${room.roomNumber || ""}
                ${room.floor || ""}
                ${property?.name || ""}
                ${roomType?.name || ""}
                ${room.housekeepingStatus || ""}
                ${occupancy || ""}
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
                  room.propertyId ===
                    propertyFilter
                ) &&
                (
                  !statusFilter ||
                  room.housekeepingStatus ===
                    statusFilter
                ) &&
                (
                  !occupancyFilter ||
                  occupancy ===
                    occupancyFilter
                )
              );
            }
          )
          .sort(
            (
              a,
              b
            ) => {
              const propertyCompare =
                String(
                  getProperty(
                    a.propertyId
                  )?.name ||
                  ""
                ).localeCompare(
                  String(
                    getProperty(
                      b.propertyId
                    )?.name ||
                    ""
                  )
                );


              if (
                propertyCompare !==
                0
              ) {
                return propertyCompare;
              }


              return String(
                a.roomNumber ||
                ""
              ).localeCompare(
                String(
                  b.roomNumber ||
                  ""
                ),
                undefined,
                {
                  numeric: true,
                }
              );
            }
          );
      },
      [
        physicalRooms,
        properties,
        roomTypes,
        reservations,
        roomAssignments,
        search,
        propertyFilter,
        statusFilter,
        occupancyFilter,
      ]
    );


  /* ===================================================
     METRICS
  =================================================== */

  const metrics =
    useMemo(
      () => ({
        dirty:
          physicalRooms.filter(
            (room) =>
              room.housekeepingStatus ===
              "Dirty"
          ).length,

        cleaning:
          physicalRooms.filter(
            (room) =>
              room.housekeepingStatus ===
              "Cleaning"
          ).length,

        clean:
          physicalRooms.filter(
            (room) =>
              room.housekeepingStatus ===
              "Clean"
          ).length,

        inspected:
          physicalRooms.filter(
            (room) =>
              room.housekeepingStatus ===
              "Inspected"
          ).length,
      }),
      [
        physicalRooms,
      ]
    );


  /* ===================================================
     OPEN UPDATE
  =================================================== */

  function openUpdate(
    room
  ) {
    setUpdateRoomId(
      room.id
    );


    setTargetStatus(
      getNextStatus(
        room.housekeepingStatus
      ) ||
      room.housekeepingStatus
    );


    setNote(
      ""
    );
  }


  /* ===================================================
     UPDATE STATUS
  =================================================== */

  function confirmUpdate() {
    const room =
      physicalRooms.find(
        (item) =>
          item.id ===
          updateRoomId
      );


    if (
      !room
    ) {
      return;
    }


    if (
      !HOUSEKEEPING_STATUSES.includes(
        targetStatus
      )
    ) {
      alert(
        "Housekeeping Status không hợp lệ."
      );

      return;
    }


    if (
      room.housekeepingStatus ===
      targetStatus
    ) {
      alert(
        "Trạng thái mới giống trạng thái hiện tại."
      );

      return;
    }


    const previousStatus =
      room.housekeepingStatus;


    const actionTime =
      nowText();


    const historyRecord = {
      id:
        makeId(),

      propertyId:
        room.propertyId,

      roomTypeId:
        room.roomTypeId,

      physicalRoomId:
        room.id,

      fromStatus:
        previousStatus,

      toStatus:
        targetStatus,

      changedAt:
        actionTime,

      note:
        note.trim(),

      source:
        "Housekeeping",

      createdAt:
        actionTime,
    };


    const nextPhysicalRooms =
      physicalRooms.map(
        (item) =>
          item.id ===
          room.id
            ? {
                ...item,

                housekeepingStatus:
                  targetStatus,

                updatedAt:
                  actionTime,

                logs: [
                  `${actionTime} — Housekeeping: ${previousStatus} → ${targetStatus}${
                    note.trim()
                      ? ` — ${note.trim()}`
                      : ""
                  }`,

                  ...(
                    item.logs ||
                    []
                  ),
                ],
              }
            : item
      );


    setData(
      (current) => ({
        ...current,

        physicalRooms:
          nextPhysicalRooms,

        housekeeping: [
          historyRecord,

          ...(
            current.housekeeping ||
            []
          ),
        ],
      })
    );


    setUpdateRoomId(
      null
    );


    setTargetStatus(
      ""
    );


    setNote(
      ""
    );
  }


  /* ===================================================
     QUICK NEXT STATUS
  =================================================== */

  function quickAdvance(
    room
  ) {
    const nextStatus =
      getNextStatus(
        room.housekeepingStatus
      );


    if (
      !nextStatus
    ) {
      return;
    }


    setUpdateRoomId(
      room.id
    );


    setTargetStatus(
      nextStatus
    );


    setNote(
      ""
    );
  }


  /* ===================================================
     CURRENT RECORDS
  =================================================== */

  const updateRoom =
    physicalRooms.find(
      (room) =>
        room.id ===
        updateRoomId
    );


  const detailRoom =
    physicalRooms.find(
      (room) =>
        room.id ===
        detailRoomId
    );


  const detailHistory =
    detailRoom
      ? getHistory(
          detailRoom.id
        )
      : [];


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
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-header">

        <div>

          <div className="eyebrow">
            BƯỚC 12 — HOUSEKEEPING
          </div>


          <h1>
            Quản lý vệ sinh phòng{" "}
            <span className="heading-en">
              (Housekeeping)
            </span>
          </h1>


          <p>
            Theo dõi tình trạng vệ sinh của từng Physical
            Room và cập nhật quy trình Dirty → Cleaning →
            Clean → Inspected.
          </p>

        </div>

      </div>


      {/* =================================================
          EXPLAIN
      ================================================= */}

      <section className="explain-card">

        <div className="explain-icon">

          <Sparkles
            size={21}
          />

        </div>


        <div>

          <strong>
            Housekeeping Status ảnh hưởng trực tiếp đến Front Desk
          </strong>


          <p>
            Phòng Dirty hoặc Cleaning chưa sẵn sàng nhận
            khách. Front Desk chỉ cho Check-in khi phòng
            đã Clean hoặc Inspected.
          </p>


          <div className="housekeeping-flow">

            <span>
              Dirty
            </span>

            <b>→</b>

            <span>
              Cleaning
            </span>

            <b>→</b>

            <span>
              Clean
            </span>

            <b>→</b>

            <span>
              Inspected
            </span>

          </div>

        </div>

      </section>


      {/* =================================================
          METRICS
      ================================================= */}

      <div className="metric-grid">

        <Metric
          label="Dirty"
          value={
            metrics.dirty
          }
        />


        <Metric
          label="Cleaning"
          value={
            metrics.cleaning
          }
        />


        <Metric
          label="Clean"
          value={
            metrics.clean
          }
        />


        <Metric
          label="Inspected"
          value={
            metrics.inspected
          }
        />

      </div>


      {/* =================================================
          FILTER
      ================================================= */}

      <section className="panel">

        <div className="panel-toolbar">

          <div className="housekeeping-filter-grid">

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

                placeholder="Tìm Room, Room Type, Property..."
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
                Tất cả HK Status
              </option>

              {
                HOUSEKEEPING_STATUSES.map(
                  (status) => (

                    <option
                      key={
                        status
                      }
                      value={
                        status
                      }
                    >
                      {status}
                    </option>

                  )
                )
              }

            </select>


            <select
              value={
                occupancyFilter
              }

              onChange={
                (event) =>
                  setOccupancyFilter(
                    event.target.value
                  )
              }
            >

              <option value="">
                Tất cả Occupancy
              </option>

              <option value="Vacant">
                Vacant
              </option>

              <option value="Occupied">
                Occupied
              </option>

            </select>

          </div>

        </div>


        {/* =================================================
            HOUSEKEEPING BOARD
        ================================================= */}

        <div className="housekeeping-board">

          {
            filteredRooms.map(
              (room) => {
                const property =
                  getProperty(
                    room.propertyId
                  );


                const roomType =
                  getRoomType(
                    room.roomTypeId
                  );


                const occupancy =
                  getEffectiveOccupancy(
                    room
                  );


                const currentReservation =
                  getCurrentReservation(
                    room.id
                  );


                const nextStatus =
                  getNextStatus(
                    room.housekeepingStatus
                  );


                return (
                  <article
                    className={`housekeeping-room-card hk-${
                      String(
                        room.housekeepingStatus
                      ).toLowerCase()
                    }`}

                    key={
                      room.id
                    }
                  >

                    <div className="housekeeping-room-card-top">

                      <div>

                        <span>
                          ROOM
                        </span>

                        <strong>
                          {
                            room.roomNumber
                          }
                        </strong>

                      </div>


                      <HousekeepingBadge
                        status={
                          room.housekeepingStatus
                        }
                      />

                    </div>


                    <div className="housekeeping-room-info">

                      <div>

                        <span>
                          Property
                        </span>

                        <strong>
                          {
                            property?.name ||
                            "—"
                          }
                        </strong>

                      </div>


                      <div>

                        <span>
                          Room Type
                        </span>

                        <strong>
                          {
                            roomType?.name ||
                            "—"
                          }
                        </strong>

                      </div>


                      <div>

                        <span>
                          Floor
                        </span>

                        <strong>
                          {
                            room.floor ||
                            "—"
                          }
                        </strong>

                      </div>

                    </div>


                    <div className="housekeeping-room-badges">

                      <OccupancyBadge
                        status={
                          occupancy
                        }
                      />


                      <OperationalBadge
                        status={
                          room.status
                        }
                      />

                    </div>


                    {
                      currentReservation && (

                        <div className="housekeeping-current-guest">

                          <BedDouble
                            size={14}
                          />


                          <span>
                            {
                              currentReservation.reservationCode
                            }
                          </span>

                        </div>

                      )
                    }


                    <div className="housekeeping-room-actions">

                      <button
                        type="button"

                        className="table-action"

                        title="Xem lịch sử"

                        onClick={
                          () =>
                            setDetailRoomId(
                              room.id
                            )
                        }
                      >
                        <Eye
                          size={15}
                        />
                      </button>


                      {
                        nextStatus
                          ? (
                            <button
                              type="button"

                              className="button button-dark button-sm"

                              onClick={
                                () =>
                                  quickAdvance(
                                    room
                                  )
                              }
                            >
                              {
                                room.housekeepingStatus ===
                                "Dirty"
                                  ? (
                                    <SprayCan
                                      size={14}
                                    />
                                  )
                                  : room.housekeepingStatus ===
                                    "Cleaning"
                                    ? (
                                      <CheckCircle2
                                        size={14}
                                      />
                                    )
                                    : (
                                      <ClipboardCheck
                                        size={14}
                                      />
                                    )
                              }

                              {
                                getNextActionLabel(
                                  room.housekeepingStatus
                                )
                              }
                            </button>
                          )
                          : (
                            <button
                              type="button"

                              className="button button-light button-sm"

                              onClick={
                                () =>
                                  openUpdate(
                                    room
                                  )
                              }
                            >
                              <ClipboardCheck
                                size={14}
                              />

                              Update
                            </button>
                          )
                      }

                    </div>

                  </article>
                );
              }
            )
          }

        </div>


        {
          filteredRooms.length ===
            0 && (

            <div className="empty-state">

              <Sparkles
                size={38}
              />


              <strong>
                Không có phòng phù hợp
              </strong>


              <span>
                Thử thay đổi bộ lọc Housekeeping.
              </span>

            </div>

          )
        }

      </section>


      {/* =================================================
          BUSINESS
      ================================================= */}

      <section className="panel business-panel">

        <div className="eyebrow">
          MÔ TẢ NGHIỆP VỤ
        </div>


        <h2>
          Housekeeping Workflow
        </h2>


        <div className="business-grid">

          <BusinessItem
            number="01"

            icon={
              <BedDouble
                size={18}
              />
            }

            title="Dirty"

            text="Phòng cần được vệ sinh. Front Desk chưa được Check-in khách mới."
          />


          <BusinessItem
            number="02"

            icon={
              <SprayCan
                size={18}
              />
            }

            title="Cleaning"

            text="Housekeeping đang xử lý phòng. Phòng vẫn chưa sẵn sàng giao khách."
          />


          <BusinessItem
            number="03"

            icon={
              <CheckCircle2
                size={18}
              />
            }

            title="Clean"

            text="Phòng đã vệ sinh xong và có thể được Front Desk xem là sẵn sàng."
          />


          <BusinessItem
            number="04"

            icon={
              <ClipboardCheck
                size={18}
              />
            }

            title="Inspected"

            text="Phòng đã được kiểm tra chất lượng và ở trạng thái sẵn sàng cao nhất để giao khách."
          />

        </div>

      </section>


      {/* =================================================
          UPDATE MODAL
      ================================================= */}

      <Modal
        open={
          Boolean(
            updateRoom
          )
        }

        title={
          updateRoom
            ? `Housekeeping — Room ${updateRoom.roomNumber}`
            : "Housekeeping"
        }

        subtitle="UPDATE ROOM STATUS"

        onClose={
          () => {
            setUpdateRoomId(
              null
            );

            setTargetStatus(
              ""
            );

            setNote(
              ""
            );
          }
        }

        footer={
          <>

            <button
              className="button button-light"

              onClick={
                () =>
                  setUpdateRoomId(
                    null
                  )
              }
            >
              Hủy
            </button>


            <button
              className="button button-dark"

              onClick={
                confirmUpdate
              }
            >
              <Sparkles
                size={16}
              />

              Cập nhật trạng thái
            </button>

          </>
        }
      >

        {
          updateRoom && (

            <>
              <div className="housekeeping-update-room">

                <div className="housekeeping-update-number">
                  {
                    updateRoom.roomNumber
                  }
                </div>


                <div>

                  <span>
                    CURRENT STATUS
                  </span>


                  <HousekeepingBadge
                    status={
                      updateRoom.housekeepingStatus
                    }
                  />

                </div>


                <div>

                  <span>
                    OCCUPANCY
                  </span>


                  <OccupancyBadge
                    status={
                      getEffectiveOccupancy(
                        updateRoom
                      )
                    }
                  />

                </div>

              </div>


              <div className="form-section-title">
                Housekeeping Status
              </div>


              <div className="housekeeping-status-options">

                {
                  HOUSEKEEPING_STATUSES.map(
                    (status) => (

                      <button
                        type="button"

                        key={
                          status
                        }

                        className={
                          targetStatus ===
                          status
                            ? "selected"
                            : ""
                        }

                        onClick={
                          () =>
                            setTargetStatus(
                              status
                            )
                        }
                      >

                        <HousekeepingBadge
                          status={
                            status
                          }
                        />


                        <span>
                          {
                            status ===
                            "Dirty"
                              ? "Phòng cần dọn"
                              : status ===
                                "Cleaning"
                                ? "Đang vệ sinh"
                                : status ===
                                  "Clean"
                                  ? "Đã dọn xong"
                                  : "Đã kiểm tra"
                          }
                        </span>

                      </button>

                    )
                  )
                }

              </div>


              <div className="form-section-title">
                Ghi chú
              </div>


              <label className="form-field">

                <span className="form-label">
                  Housekeeping Note
                </span>


                <textarea
                  rows="4"

                  value={
                    note
                  }

                  onChange={
                    (event) =>
                      setNote(
                        event.target.value
                      )
                  }

                  placeholder="Ví dụ: đã thay ga giường, bổ sung minibar, kiểm tra bathroom..."
                />

              </label>


              {
                [
                  "Dirty",
                  "Cleaning",
                ].includes(
                  targetStatus
                ) && (

                  <div className="front-desk-result danger">

                    <strong>
                      Front Desk chưa thể Check-in
                    </strong>


                    <p>
                      Room đang ở trạng thái {targetStatus}.
                      Front Desk chỉ cho Check-in khi phòng
                      Clean hoặc Inspected.
                    </p>

                  </div>

                )
              }


              {
                [
                  "Clean",
                  "Inspected",
                ].includes(
                  targetStatus
                ) && (

                  <div className="front-desk-result success">

                    <strong>
                      Room Ready
                    </strong>


                    <p>
                      Sau khi cập nhật, trạng thái
                      Housekeeping này đạt điều kiện
                      Room Readiness của Front Desk.
                    </p>

                  </div>

                )
              }

            </>

          )
        }

      </Modal>


      {/* =================================================
          DETAIL DRAWER
      ================================================= */}

      <Drawer
        open={
          Boolean(
            detailRoom
          )
        }

        title={
          detailRoom
            ? `Room ${detailRoom.roomNumber}`
            : ""
        }

        subtitle="HOUSEKEEPING DETAIL"

        onClose={
          () =>
            setDetailRoomId(
              null
            )
        }
      >

        {
          detailRoom && (

            <HousekeepingDetail
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

              occupancy={
                getEffectiveOccupancy(
                  detailRoom
                )
              }

              currentReservation={
                getCurrentReservation(
                  detailRoom.id
                )
              }

              history={
                detailHistory
              }

              onUpdate={
                () => {
                  setDetailRoomId(
                    null
                  );

                  openUpdate(
                    detailRoom
                  );
                }
              }
            />

          )
        }

      </Drawer>

    </>
  );
}


/* =====================================================
   DETAIL
===================================================== */

function HousekeepingDetail({
  room,
  property,
  roomType,
  occupancy,
  currentReservation,
  history,
  onUpdate,
}) {
  return (
    <>
      <div className="housekeeping-detail-hero">

        <div className="housekeeping-detail-room-number">
          {
            room.roomNumber
          }
        </div>


        <div>

          <span>
            PHYSICAL ROOM
          </span>


          <strong>
            Room{" "}
            {
              room.roomNumber
            }
          </strong>


          <p>
            {
              property?.name ||
              "—"
            }
          </p>

        </div>


        <HousekeepingBadge
          status={
            room.housekeepingStatus
          }
        />

      </div>


      <div className="detail-section-title">
        Room Information
      </div>


      <div className="detail-grid">

        <Detail
          label="Property"
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
          label="Floor"
          value={
            room.floor ||
            "—"
          }
        />


        <Detail
          label="Operational"
          value={
            room.status ||
            "—"
          }
        />

      </div>


      <div className="detail-section-title">
        Current Status
      </div>


      <div className="housekeeping-detail-status">

        <div>

          <span>
            HOUSEKEEPING
          </span>

          <HousekeepingBadge
            status={
              room.housekeepingStatus
            }
          />

        </div>


        <div>

          <span>
            OCCUPANCY
          </span>

          <OccupancyBadge
            status={
              occupancy
            }
          />

        </div>


        <div>

          <span>
            OPERATIONAL
          </span>

          <OperationalBadge
            status={
              room.status
            }
          />

        </div>

      </div>


      {
        currentReservation && (

          <>
            <div className="detail-section-title">
              In House Guest
            </div>


            <div className="housekeeping-reservation-card">

              <BedDouble
                size={18}
              />


              <div>

                <span>
                  CURRENT RESERVATION
                </span>

                <strong>
                  {
                    currentReservation.reservationCode
                  }
                </strong>

              </div>

            </div>

          </>

        )
      }


      <div className="detail-section-title">
        Housekeeping History
      </div>


      {
        history.length >
          0
          ? (
            <div className="housekeeping-history-list">

              {
                history.map(
                  (record) => (

                    <div
                      className="housekeeping-history-item"

                      key={
                        record.id
                      }
                    >

                      <div className="housekeeping-history-route">

                        <HousekeepingBadge
                          status={
                            record.fromStatus
                          }
                        />


                        <span>
                          →
                        </span>


                        <HousekeepingBadge
                          status={
                            record.toStatus
                          }
                        />

                      </div>


                      <div className="housekeeping-history-time">

                        <Clock3
                          size={12}
                        />

                        {
                          record.changedAt ||
                          "—"
                        }

                      </div>


                      {
                        record.note && (

                          <p>
                            {
                              record.note
                            }
                          </p>

                        )
                      }

                    </div>

                  )
                )
              }

            </div>
          )
          : (
            <div className="empty-detail-state">

              <Clock3
                size={26}
              />


              <strong>
                Chưa có Housekeeping History
              </strong>


              <span>
                Các lần thay đổi trạng thái phòng sẽ được lưu tại đây.
              </span>

            </div>
          )
      }


      <div className="drawer-actions">

        <button
          className="button button-dark"

          onClick={
            onUpdate
          }
        >
          <Sparkles
            size={16}
          />

          Update Housekeeping
        </button>

      </div>

    </>
  );
}


/* =====================================================
   SMALL COMPONENTS
===================================================== */

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


function Detail({
  label,
  value,
}) {
  return (
    <div>

      <div className="detail-label">
        {label}
      </div>


      <div className="detail-value">
        {value}
      </div>

    </div>
  );
}