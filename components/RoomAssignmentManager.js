"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  ArrowRightLeft,
  Ban,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  Eye,
  Hotel,
  KeyRound,
  Link2,
  Search,
  Unlink,
  UserRound,
} from "lucide-react";

import {
  usePms,
} from "@/context/PmsContext";

import Modal from "@/components/Modal";
import Drawer from "@/components/Drawer";


/* =====================================================
   HELPERS
===================================================== */

function nowText() {
  return new Date().toLocaleString(
    "vi-VN"
  );
}


function makeId() {
  return `assignment_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
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


/*
 * Hai Reservation bị overlap khi:
 *
 * A.checkin < B.checkout
 * &&
 * A.checkout > B.checkin
 */
function datesOverlap(
  checkinA,
  checkoutA,
  checkinB,
  checkoutB
) {
  if (
    !checkinA ||
    !checkoutA ||
    !checkinB ||
    !checkoutB
  ) {
    return false;
  }


  return (
    checkinA <
      checkoutB &&
    checkoutA >
      checkinB
  );
}


/*
 * Sau khi Checked In thì việc
 * đổi phòng sẽ thuộc Step 11 — Room Move.
 *
 * Step 09 chỉ cho phép thay đổi
 * trước Check-in.
 */
function assignmentLocked(
  reservation
) {
  return [
    "Checked In",
    "Checked Out",
    "Cancelled",
    "No-show",
  ].includes(
    reservation?.status
  );
}


function reservationCanReceiveRoom(
  reservation
) {
  return ![
    "Cancelled",
    "No-show",
    "Checked Out",
  ].includes(
    reservation?.status
  );
}


/* =====================================================
   BADGES
===================================================== */

function AssignmentBadge({
  assigned,
}) {
  return assigned
    ? (
      <span className="status-badge status-success">
        Đã gán phòng
      </span>
    )
    : (
      <span className="status-badge status-warning">
        Chưa gán
      </span>
    );
}


function ReservationStatusBadge({
  status,
}) {
  const classMap = {
    Pending:
      "status-warning",

    Confirmed:
      "status-info",

    "Checked In":
      "status-success",

    "Checked Out":
      "status-neutral",

    Cancelled:
      "status-danger",

    "No-show":
      "status-danger",
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
      {status}
    </span>
  );
}


function HousekeepingBadge({
  status,
}) {
  const classMap = {
    Clean:
      "status-success",

    Inspected:
      "status-info",

    Cleaning:
      "status-warning",

    Dirty:
      "status-danger",
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

export default function RoomAssignmentManager() {
  const {
    data,
    setData,
    ready,
  } = usePms();


  const reservations =
    data.reservations || [];

  const guests =
    data.guests || [];

  const properties =
    data.properties || [];

  const roomTypes =
    data.roomTypes || [];

  const physicalRooms =
    data.physicalRooms || [];

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
    assignmentFilter,
    setAssignmentFilter,
  ] = useState("");


  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");


  const [
    assignReservationId,
    setAssignReservationId,
  ] = useState(null);


  const [
    selectedRoomId,
    setSelectedRoomId,
  ] = useState("");


  const [
    detailReservationId,
    setDetailReservationId,
  ] = useState(null);


  const [
    unassignReservationId,
    setUnassignReservationId,
  ] = useState(null);


  /* ===================================================
     LOOKUPS
  =================================================== */

  function getGuest(
    guestId
  ) {
    return guests.find(
      (guest) =>
        guest.id ===
        guestId
    );
  }


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


  function getPhysicalRoom(
    physicalRoomId
  ) {
    return physicalRooms.find(
      (room) =>
        room.id ===
        physicalRoomId
    );
  }


  function getAssignmentByReservation(
    reservationId
  ) {
    return roomAssignments.find(
      (assignment) =>
        assignment.reservationId ===
        reservationId
    );
  }


  function getReservation(
    reservationId
  ) {
    return reservations.find(
      (reservation) =>
        reservation.id ===
        reservationId
    );
  }


  /* ===================================================
     CONFLICT CHECK
  =================================================== */

  function getRoomConflict(
    physicalRoomId,
    reservation,
    ignoreReservationId = null
  ) {
    const assignmentsForRoom =
      roomAssignments.filter(
        (assignment) =>
          assignment.physicalRoomId ===
            physicalRoomId &&
          assignment.reservationId !==
            ignoreReservationId
      );


    for (
      const assignment of assignmentsForRoom
    ) {
      const otherReservation =
        getReservation(
          assignment.reservationId
        );


      if (
        !otherReservation
      ) {
        continue;
      }


      /*
       * Booking đã Cancelled / No-show
       * không còn chiếm Physical Room.
       */
      if (
        [
          "Cancelled",
          "No-show",
        ].includes(
          otherReservation.status
        )
      ) {
        continue;
      }


      if (
        datesOverlap(
          reservation.checkin,
          reservation.checkout,
          otherReservation.checkin,
          otherReservation.checkout
        )
      ) {
        return {
          assignment,
          reservation:
            otherReservation,
        };
      }
    }


    return null;
  }


  /* ===================================================
     ELIGIBLE ROOMS
  =================================================== */

  function getEligibleRooms(
    reservation
  ) {
    if (
      !reservation
    ) {
      return [];
    }


    return physicalRooms
      .filter(
        (room) =>
          room.propertyId ===
            reservation.propertyId &&
          room.roomTypeId ===
            reservation.roomTypeId &&
          room.status ===
            "Active"
      )
      .map(
        (room) => {
          const conflict =
            getRoomConflict(
              room.id,
              reservation,
              reservation.id
            );


          return {
            ...room,

            conflict,
          };
        }
      )
      .sort(
        (
          a,
          b
        ) =>
          String(
            a.roomNumber
          ).localeCompare(
            String(
              b.roomNumber
            ),
            undefined,
            {
              numeric: true,
            }
          )
      );
  }


  /* ===================================================
     FILTERED RESERVATIONS
  =================================================== */

  const filtered =
    useMemo(
      () => {
        const q =
          search
            .trim()
            .toLowerCase();


        return reservations
          .filter(
            reservationCanReceiveRoom
          )
          .filter(
            (reservation) => {
              const guest =
                getGuest(
                  reservation.guestId
                );


              const property =
                getProperty(
                  reservation.propertyId
                );


              const roomType =
                getRoomType(
                  reservation.roomTypeId
                );


              const assignment =
                getAssignmentByReservation(
                  reservation.id
                );


              const room =
                assignment
                  ? getPhysicalRoom(
                      assignment.physicalRoomId
                    )
                  : null;


              const text = `
                ${reservation.reservationCode || ""}
                ${guest?.fullName || ""}
                ${guest?.phone || ""}
                ${property?.name || ""}
                ${roomType?.name || ""}
                ${room?.roomNumber || ""}
                ${reservation.status || ""}
              `.toLowerCase();


              const matchesAssignment =
                !assignmentFilter ||
                (
                  assignmentFilter ===
                    "assigned" &&
                  Boolean(
                    assignment
                  )
                ) ||
                (
                  assignmentFilter ===
                    "unassigned" &&
                  !assignment
                );


              return (
                (
                  !q ||
                  text.includes(
                    q
                  )
                ) &&
                (
                  !propertyFilter ||
                  reservation.propertyId ===
                    propertyFilter
                ) &&
                (
                  !statusFilter ||
                  reservation.status ===
                    statusFilter
                ) &&
                matchesAssignment
              );
            }
          )
          .sort(
            (
              a,
              b
            ) => {
              const dateCompare =
                String(
                  a.checkin ||
                  ""
                ).localeCompare(
                  String(
                    b.checkin ||
                    ""
                  )
                );


              if (
                dateCompare !==
                0
              ) {
                return dateCompare;
              }


              return String(
                a.reservationCode ||
                ""
              ).localeCompare(
                String(
                  b.reservationCode ||
                  ""
                )
              );
            }
          );
      },
      [
        reservations,
        guests,
        properties,
        roomTypes,
        physicalRooms,
        roomAssignments,
        search,
        propertyFilter,
        assignmentFilter,
        statusFilter,
      ]
    );


  /* ===================================================
     METRICS
  =================================================== */

  const assignableReservations =
    reservations.filter(
      reservationCanReceiveRoom
    );


  const stats =
    useMemo(
      () => {
        const assigned =
          assignableReservations.filter(
            (reservation) =>
              Boolean(
                getAssignmentByReservation(
                  reservation.id
                )
              )
          ).length;


        const unassigned =
          assignableReservations.length -
          assigned;


        const arrivalsToday =
          assignableReservations.filter(
            (reservation) => {
              const today =
                new Date()
                  .toISOString()
                  .slice(
                    0,
                    10
                  );


              return (
                reservation.checkin ===
                today
              );
            }
          );


        const arrivalsWithoutRoom =
          arrivalsToday.filter(
            (reservation) =>
              !getAssignmentByReservation(
                reservation.id
              )
          ).length;


        return {
          total:
            assignableReservations.length,

          assigned,

          unassigned,

          arrivalsWithoutRoom,
        };
      },
      [
        reservations,
        roomAssignments,
      ]
    );


  /* ===================================================
     OPEN ASSIGN
  =================================================== */

  function openAssignment(
    reservation
  ) {
    if (
      assignmentLocked(
        reservation
      )
    ) {
      alert(
        reservation.status ===
          "Checked In"
          ? "Khách đã Checked In. Sau Check-in phải dùng chức năng Room Move ở Step 11."
          : "Reservation này không còn cho phép thay đổi Physical Room."
      );

      return;
    }


    const currentAssignment =
      getAssignmentByReservation(
        reservation.id
      );


    const eligibleRooms =
      getEligibleRooms(
        reservation
      );


    const firstAvailableRoom =
      eligibleRooms.find(
        (room) =>
          !room.conflict
      );


    setAssignReservationId(
      reservation.id
    );


    setSelectedRoomId(
      currentAssignment
        ?.physicalRoomId ||
      firstAvailableRoom
        ?.id ||
      ""
    );
  }


  /* ===================================================
     SAVE ASSIGNMENT
  =================================================== */

  function saveAssignment() {
    const reservation =
      getReservation(
        assignReservationId
      );


    if (
      !reservation
    ) {
      return;
    }


    if (
      assignmentLocked(
        reservation
      )
    ) {
      alert(
        "Reservation không còn cho phép thay đổi phòng."
      );

      return;
    }


    const room =
      getPhysicalRoom(
        selectedRoomId
      );


    if (
      !room
    ) {
      alert(
        "Vui lòng chọn Physical Room."
      );

      return;
    }


    if (
      room.status !==
      "Active"
    ) {
      alert(
        `Room ${room.roomNumber} hiện không Active.`
      );

      return;
    }


    if (
      room.propertyId !==
      reservation.propertyId
    ) {
      alert(
        "Physical Room không thuộc đúng Property của Reservation."
      );

      return;
    }


    if (
      room.roomTypeId !==
      reservation.roomTypeId
    ) {
      alert(
        "Physical Room không đúng Room Type mà khách đã đặt."
      );

      return;
    }


    const conflict =
      getRoomConflict(
        room.id,
        reservation,
        reservation.id
      );


    if (
      conflict
    ) {
      const conflictingReservation =
        conflict.reservation;


      alert(
        `Không thể gán Room ${room.roomNumber}.\n\nPhòng đang được gán cho ${conflictingReservation.reservationCode} từ ${formatDate(
          conflictingReservation.checkin
        )} đến ${formatDate(
          conflictingReservation.checkout
        )}.`
      );

      return;
    }


    const currentAssignment =
      getAssignmentByReservation(
        reservation.id
      );


    const actionTime =
      nowText();


    let nextAssignments;


    if (
      currentAssignment
    ) {
      const oldRoom =
        getPhysicalRoom(
          currentAssignment.physicalRoomId
        );


      /*
       * Nếu chọn lại chính phòng hiện tại
       * thì không cần cập nhật.
       */
      if (
        currentAssignment.physicalRoomId ===
        room.id
      ) {
        setAssignReservationId(
          null
        );

        return;
      }


      nextAssignments =
        roomAssignments.map(
          (assignment) =>
            assignment.id ===
            currentAssignment.id
              ? {
                  ...assignment,

                  physicalRoomId:
                    room.id,

                  updatedAt:
                    actionTime,

                  logs: [
                    `${actionTime} — Đổi phòng từ ${
                      oldRoom?.roomNumber ||
                      "—"
                    } sang ${room.roomNumber}`,

                    ...(
                      assignment.logs ||
                      []
                    ),
                  ],
                }
              : assignment
        );
    }

    else {
      nextAssignments = [
        {
          id:
            makeId(),

          reservationId:
            reservation.id,

          propertyId:
            reservation.propertyId,

          roomTypeId:
            reservation.roomTypeId,

          physicalRoomId:
            room.id,

          assignedAt:
            actionTime,

          updatedAt:
            actionTime,

          logs: [
            `${actionTime} — Gán Room ${room.roomNumber} cho ${reservation.reservationCode}`,
          ],
        },

        ...roomAssignments,
      ];
    }


    setData(
      (current) => ({
        ...current,

        roomAssignments:
          nextAssignments,
      })
    );


    setAssignReservationId(
      null
    );


    setSelectedRoomId(
      ""
    );
  }


  /* ===================================================
     UNASSIGN
  =================================================== */

  function unassignRoom() {
    const reservation =
      getReservation(
        unassignReservationId
      );


    if (
      !reservation
    ) {
      return;
    }


    if (
      assignmentLocked(
        reservation
      )
    ) {
      alert(
        "Không thể bỏ gán phòng sau khi khách đã Check-in."
      );

      setUnassignReservationId(
        null
      );

      return;
    }


    const assignment =
      getAssignmentByReservation(
        reservation.id
      );


    if (
      !assignment
    ) {
      setUnassignReservationId(
        null
      );

      return;
    }


    /*
     * Demo này xóa assignment hiện tại.
     *
     * Lịch sử nghiệp vụ chi tiết hơn
     * có thể chuyển sang Audit Log
     * ở phase sau.
     */
    const nextAssignments =
      roomAssignments.filter(
        (item) =>
          item.id !==
          assignment.id
      );


    setData(
      (current) => ({
        ...current,

        roomAssignments:
          nextAssignments,
      })
    );


    setUnassignReservationId(
      null
    );
  }


  /* ===================================================
     DETAIL
  =================================================== */

  const assignReservation =
    getReservation(
      assignReservationId
    );


  const eligibleRooms =
    getEligibleRooms(
      assignReservation
    );


  const detailReservation =
    getReservation(
      detailReservationId
    );


  const detailAssignment =
    detailReservation
      ? getAssignmentByReservation(
          detailReservation.id
        )
      : null;


  const detailRoom =
    detailAssignment
      ? getPhysicalRoom(
          detailAssignment.physicalRoomId
        )
      : null;


  const unassignReservation =
    getReservation(
      unassignReservationId
    );


  const unassignAssignment =
    unassignReservation
      ? getAssignmentByReservation(
          unassignReservation.id
        )
      : null;


  const unassignRoomTarget =
    unassignAssignment
      ? getPhysicalRoom(
          unassignAssignment.physicalRoomId
        )
      : null;


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
            BƯỚC 09 — ROOM ASSIGNMENT
          </div>


          <h1>
            Gán phòng thực tế{" "}
            <span className="heading-en">
              (Room Assignment)
            </span>
          </h1>


          <p>
            Gán Physical Room cụ thể cho Reservation,
            kiểm tra xung đột ngày ở và cho phép đổi
            hoặc bỏ gán phòng trước Check-in.
          </p>

        </div>

      </div>


      {/* =================================================
          EXPLAIN
      ================================================= */}

      <section className="explain-card">

        <div className="explain-icon">

          <KeyRound
            size={21}
          />

        </div>


        <div>

          <strong>
            Room Type khác với Physical Room
          </strong>


          <p>
            Khách có thể đặt loại phòng Deluxe từ trước,
            nhưng gần ngày đến khách sạn mới quyết định
            phòng thực tế, ví dụ Room 305.
          </p>


          <div className="room-assignment-flow">

            <span>
              Reservation
            </span>

            <b>→</b>

            <span>
              Deluxe
            </span>

            <b>→</b>

            <span>
              Conflict Check
            </span>

            <b>→</b>

            <span>
              Room 305
            </span>

          </div>

        </div>

      </section>


      {/* =================================================
          METRICS
      ================================================= */}

      <div className="metric-grid">

        <Metric
          label="Reservation cần phòng"
          value={
            stats.total
          }
        />


        <Metric
          label="Đã gán Physical Room"
          value={
            stats.assigned
          }
        />


        <Metric
          label="Chưa gán phòng"
          value={
            stats.unassigned
          }
        />


        <Metric
          label="Arrival hôm nay chưa có phòng"
          value={
            stats.arrivalsWithoutRoom
          }
        />

      </div>


      {/* =================================================
          TABLE
      ================================================= */}

      <section className="panel">

        <div className="panel-toolbar">

          <div className="room-assignment-filter-grid">

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

                placeholder="Tìm Reservation, Guest, Room..."
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
                assignmentFilter
              }

              onChange={
                (event) =>
                  setAssignmentFilter(
                    event.target.value
                  )
              }
            >

              <option value="">
                Tất cả Assignment
              </option>

              <option value="assigned">
                Đã gán phòng
              </option>

              <option value="unassigned">
                Chưa gán phòng
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

              <option value="Pending">
                Pending
              </option>

              <option value="Confirmed">
                Confirmed
              </option>

              <option value="Checked In">
                Checked In
              </option>

            </select>

          </div>

        </div>


        <div className="table-wrap">

          <table className="data-table room-assignment-table">

            <thead>

              <tr>

                <th>
                  Reservation
                </th>

                <th>
                  Guest
                </th>

                <th>
                  Property
                </th>

                <th>
                  Stay
                </th>

                <th>
                  Room Type
                </th>

                <th>
                  Physical Room
                </th>

                <th>
                  Housekeeping
                </th>

                <th>
                  Assignment
                </th>

                <th className="text-right">
                  Thao tác
                </th>

              </tr>

            </thead>


            <tbody>

              {
                filtered.map(
                  (reservation) => {
                    const guest =
                      getGuest(
                        reservation.guestId
                      );


                    const property =
                      getProperty(
                        reservation.propertyId
                      );


                    const roomType =
                      getRoomType(
                        reservation.roomTypeId
                      );


                    const assignment =
                      getAssignmentByReservation(
                        reservation.id
                      );


                    const physicalRoom =
                      assignment
                        ? getPhysicalRoom(
                            assignment.physicalRoomId
                          )
                        : null;


                    const locked =
                      assignmentLocked(
                        reservation
                      );


                    return (
                      <tr
                        key={
                          reservation.id
                        }
                      >

                        <td>

                          <strong className="code">
                            {
                              reservation.reservationCode
                            }
                          </strong>


                          <div className="small-copy muted">
                            <ReservationStatusBadge
                              status={
                                reservation.status
                              }
                            />
                          </div>

                        </td>


                        <td>

                          <strong>
                            {
                              guest?.fullName ||
                              "—"
                            }
                          </strong>


                          <div className="small-copy muted">
                            {
                              guest?.phone ||
                              guest?.email ||
                              "—"
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

                        </td>


                        <td>

                          <strong>
                            {
                              formatDate(
                                reservation.checkin
                              )
                            }
                          </strong>


                          <div className="small-copy muted">
                            →
                            {" "}
                            {
                              formatDate(
                                reservation.checkout
                              )
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

                        </td>


                        <td>

                          {
                            physicalRoom
                              ? (
                                <div className="assigned-room-cell">

                                  <span className="assigned-room-number">
                                    {
                                      physicalRoom.roomNumber
                                    }
                                  </span>


                                  <div>

                                    <strong>
                                      Room{" "}
                                      {
                                        physicalRoom.roomNumber
                                      }
                                    </strong>


                                    <span>
                                      Tầng{" "}
                                      {
                                        physicalRoom.floor ||
                                        "—"
                                      }
                                    </span>

                                  </div>

                                </div>
                              )
                              : (
                                <span className="muted">
                                  Chưa gán
                                </span>
                              )
                          }

                        </td>


                        <td>

                          {
                            physicalRoom
                              ? (
                                <HousekeepingBadge
                                  status={
                                    physicalRoom.housekeepingStatus
                                  }
                                />
                              )
                              : "—"
                          }

                        </td>


                        <td>

                          <AssignmentBadge
                            assigned={
                              Boolean(
                                assignment
                              )
                            }
                          />

                        </td>


                        <td>

                          <div className="action-row">

                            <button
                              className="table-action"

                              title="Xem chi tiết"

                              onClick={
                                () =>
                                  setDetailReservationId(
                                    reservation.id
                                  )
                              }
                            >
                              <Eye
                                size={15}
                              />
                            </button>


                            {
                              !locked && (

                                <button
                                  className="table-action"

                                  title={
                                    assignment
                                      ? "Đổi phòng"
                                      : "Gán phòng"
                                  }

                                  onClick={
                                    () =>
                                      openAssignment(
                                        reservation
                                      )
                                  }
                                >

                                  {
                                    assignment
                                      ? (
                                        <ArrowRightLeft
                                          size={15}
                                        />
                                      )
                                      : (
                                        <Link2
                                          size={15}
                                        />
                                      )
                                  }

                                </button>

                              )
                            }


                            {
                              assignment &&
                              !locked && (

                                <button
                                  className="table-action"

                                  title="Bỏ gán phòng"

                                  onClick={
                                    () =>
                                      setUnassignReservationId(
                                        reservation.id
                                      )
                                  }
                                >
                                  <Unlink
                                    size={15}
                                  />
                                </button>

                              )
                            }

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

                <BedDouble
                  size={38}
                />


                <strong>
                  Không có Reservation phù hợp
                </strong>


                <span>
                  Thử thay đổi bộ lọc hoặc tạo Reservation mới.
                </span>

              </div>

            )
          }

        </div>

      </section>


      {/* =================================================
          BUSINESS
      ================================================= */}

      <section className="panel business-panel">

        <div className="eyebrow">
          MÔ TẢ NGHIỆP VỤ
        </div>


        <h2>
          Room Assignment hoạt động thế nào?
        </h2>


        <div className="business-grid">

          <BusinessItem
            number="01"

            icon={
              <BedDouble
                size={18}
              />
            }

            title="Assign Room"

            text="Reservation đặt Room Type trước, sau đó khách sạn gán một Physical Room cụ thể."
          />


          <BusinessItem
            number="02"

            icon={
              <Ban
                size={18}
              />
            }

            title="Conflict Check"

            text="PMS không cho một Physical Room được gán cho hai Reservation có thời gian lưu trú chồng lên nhau."
          />


          <BusinessItem
            number="03"

            icon={
              <ArrowRightLeft
                size={18}
              />
            }

            title="Change Before Check-in"

            text="Trước khi khách nhận phòng, nhân viên có thể đổi sang Physical Room khác cùng Room Type."
          />


          <BusinessItem
            number="04"

            icon={
              <Unlink
                size={18}
              />
            }

            title="Unassign Room"

            text="Trước Check-in có thể bỏ gán phòng. Sau Check-in, việc đổi phòng sẽ chuyển sang Room Move."
          />

        </div>

      </section>


      {/* =================================================
          ASSIGN MODAL
      ================================================= */}

      <Modal
        open={
          Boolean(
            assignReservation
          )
        }

        title={
          getAssignmentByReservation(
            assignReservation?.id
          )
            ? "Đổi Physical Room"
            : "Gán Physical Room"
        }

        subtitle="ROOM ASSIGNMENT"

        onClose={
          () => {
            setAssignReservationId(
              null
            );


            setSelectedRoomId(
              ""
            );
          }
        }

        size="lg"

        footer={
          <>

            <button
              className="button button-light"

              onClick={
                () => {
                  setAssignReservationId(
                    null
                  );


                  setSelectedRoomId(
                    ""
                  );
                }
              }
            >
              Hủy
            </button>


            <button
              className="button button-dark"

              disabled={
                !selectedRoomId
              }

              onClick={
                saveAssignment
              }
            >
              <KeyRound
                size={16}
              />

              Xác nhận phòng
            </button>

          </>
        }
      >

        {
          assignReservation && (

            <AssignmentForm
              reservation={
                assignReservation
              }

              guest={
                getGuest(
                  assignReservation.guestId
                )
              }

              property={
                getProperty(
                  assignReservation.propertyId
                )
              }

              roomType={
                getRoomType(
                  assignReservation.roomTypeId
                )
              }

              rooms={
                eligibleRooms
              }

              selectedRoomId={
                selectedRoomId
              }

              setSelectedRoomId={
                setSelectedRoomId
              }
            />

          )
        }

      </Modal>


      {/* =================================================
          DETAIL DRAWER
      ================================================= */}

      <Drawer
        open={
          Boolean(
            detailReservation
          )
        }

        title={
          detailReservation
            ?.reservationCode ||
          ""
        }

        subtitle="ROOM ASSIGNMENT"

        onClose={
          () =>
            setDetailReservationId(
              null
            )
        }
      >

        {
          detailReservation && (

            <AssignmentDetail
              reservation={
                detailReservation
              }

              guest={
                getGuest(
                  detailReservation.guestId
                )
              }

              property={
                getProperty(
                  detailReservation.propertyId
                )
              }

              roomType={
                getRoomType(
                  detailReservation.roomTypeId
                )
              }

              assignment={
                detailAssignment
              }

              physicalRoom={
                detailRoom
              }

              onAssign={
                () => {
                  setDetailReservationId(
                    null
                  );


                  openAssignment(
                    detailReservation
                  );
                }
              }

              onUnassign={
                () => {
                  setDetailReservationId(
                    null
                  );


                  setUnassignReservationId(
                    detailReservation.id
                  );
                }
              }
            />

          )
        }

      </Drawer>


      {/* =================================================
          UNASSIGN MODAL
      ================================================= */}

      <Modal
        open={
          Boolean(
            unassignReservation
          )
        }

        title="Bỏ gán Physical Room"

        subtitle="UNASSIGN ROOM"

        onClose={
          () =>
            setUnassignReservationId(
              null
            )
        }

        footer={
          <>

            <button
              className="button button-light"

              onClick={
                () =>
                  setUnassignReservationId(
                    null
                  )
              }
            >
              Giữ phòng
            </button>


            <button
              className="button button-danger"

              onClick={
                unassignRoom
              }
            >
              Bỏ gán phòng
            </button>

          </>
        }
      >

        {
          unassignReservation && (

            <div className="confirm-copy">

              Bỏ gán{" "}

              <strong>
                Room{" "}
                {
                  unassignRoomTarget
                    ?.roomNumber ||
                  "—"
                }
              </strong>

              {" "}
              khỏi Reservation{" "}

              <strong>
                {
                  unassignReservation.reservationCode
                }
              </strong>

              ?


              <div className="info-note status-note">

                Reservation vẫn tồn tại và Inventory
                không thay đổi. Đây chỉ là thao tác
                bỏ Physical Room đã được gán.

              </div>

            </div>

          )
        }

      </Modal>

    </>
  );
}


/* =====================================================
   ASSIGNMENT FORM
===================================================== */

function AssignmentForm({
  reservation,
  guest,
  property,
  roomType,
  rooms,
  selectedRoomId,
  setSelectedRoomId,
}) {
  const availableCount =
    rooms.filter(
      (room) =>
        !room.conflict
    ).length;


  return (
    <>
      <div className="assignment-reservation-card">

        <div>

          <span>
            RESERVATION
          </span>

          <strong className="code">
            {
              reservation.reservationCode
            }
          </strong>

        </div>


        <div>

          <span>
            GUEST
          </span>

          <strong>
            {
              guest?.fullName ||
              "—"
            }
          </strong>

        </div>


        <div>

          <span>
            STAY
          </span>

          <strong>
            {
              formatDate(
                reservation.checkin
              )
            }

            {" → "}

            {
              formatDate(
                reservation.checkout
              )
            }
          </strong>

        </div>

      </div>


      <div className="assignment-context">

        <div>

          <Hotel
            size={17}
          />


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

          <BedDouble
            size={17}
          />


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

          <CheckCircle2
            size={17}
          />


          <span>
            Có thể gán
          </span>


          <strong>
            {
              availableCount
            }{" "}
            phòng
          </strong>

        </div>

      </div>


      <div className="form-section-title">
        Chọn Physical Room
      </div>


      <div className="assignment-room-grid">

        {
          rooms.map(
            (room) => {
              const conflictReservation =
                room.conflict
                  ?.reservation;


              const disabled =
                Boolean(
                  room.conflict
                );


              return (
                <button
                  type="button"

                  key={
                    room.id
                  }

                  disabled={
                    disabled
                  }

                  className={[
                    "assignment-room-option",

                    selectedRoomId ===
                    room.id
                      ? "selected"
                      : "",

                    disabled
                      ? "conflict"
                      : "",
                  ]
                    .filter(
                      Boolean
                    )
                    .join(
                      " "
                    )}

                  onClick={
                    () =>
                      setSelectedRoomId(
                        room.id
                      )
                  }
                >

                  <div className="assignment-room-option-top">

                    <span className="assignment-room-number">
                      {
                        room.roomNumber
                      }
                    </span>


                    <HousekeepingBadge
                      status={
                        room.housekeepingStatus
                      }
                    />

                  </div>


                  <strong>
                    Room{" "}
                    {
                      room.roomNumber
                    }
                  </strong>


                  <span>
                    Tầng{" "}
                    {
                      room.floor ||
                      "—"
                    }
                  </span>


                  {
                    disabled
                      ? (
                        <div className="assignment-conflict-copy">

                          Conflict với{" "}

                          <strong>
                            {
                              conflictReservation
                                ?.reservationCode ||
                              "Reservation khác"
                            }
                          </strong>


                          <span>
                            {
                              formatDate(
                                conflictReservation
                                  ?.checkin
                              )
                            }

                            {" → "}

                            {
                              formatDate(
                                conflictReservation
                                  ?.checkout
                              )
                            }
                          </span>

                        </div>
                      )
                      : (
                        <div className="assignment-available-copy">
                          Có thể gán
                        </div>
                      )
                  }

                </button>
              );
            }
          )
        }

      </div>


      {
        rooms.length ===
          0 && (

          <div className="empty-detail-state">

            <BedDouble
              size={28}
            />


            <strong>
              Không có Physical Room phù hợp
            </strong>


            <span>
              Hãy kiểm tra lại Physical Room của Property
              và Room Type này ở Step 03.
            </span>

          </div>

        )
      }


      <div className="info-note roomtype-note">

        <strong>
          Conflict Check
        </strong>


        <p>
          PMS chỉ hiển thị Physical Room cùng Property
          và Room Type. Nếu phòng đã được gán cho một
          booking có ngày ở chồng nhau, phòng đó sẽ bị khóa.
        </p>

      </div>

    </>
  );
}


/* =====================================================
   ASSIGNMENT DETAIL
===================================================== */

function AssignmentDetail({
  reservation,
  guest,
  property,
  roomType,
  assignment,
  physicalRoom,
  onAssign,
  onUnassign,
}) {
  const locked =
    assignmentLocked(
      reservation
    );


  return (
    <>
      <div className="assignment-detail-hero">

        <div>

          <span>
            RESERVATION
          </span>


          <strong className="code">
            {
              reservation.reservationCode
            }
          </strong>

        </div>


        <AssignmentBadge
          assigned={
            Boolean(
              assignment
            )
          }
        />

      </div>


      <div className="detail-section-title">
        Reservation
      </div>


      <div className="detail-grid">

        <Detail
          label="Guest"
          value={
            guest?.fullName ||
            "—"
          }
        />


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
          label="Check-in"
          value={
            formatDate(
              reservation.checkin
            )
          }
        />


        <Detail
          label="Check-out"
          value={
            formatDate(
              reservation.checkout
            )
          }
        />


        <Detail
          label="Status"
          value={
            reservation.status
          }
        />

      </div>


      <div className="detail-section-title">
        Physical Room
      </div>


      {
        physicalRoom
          ? (
            <div className="assigned-room-detail">

              <div className="assigned-room-detail-number">
                {
                  physicalRoom.roomNumber
                }
              </div>


              <div>

                <span>
                  PHYSICAL ROOM
                </span>


                <strong>
                  Room{" "}
                  {
                    physicalRoom.roomNumber
                  }
                </strong>


                <p>
                  Tầng{" "}
                  {
                    physicalRoom.floor ||
                    "—"
                  }

                  {" · "}

                  {
                    roomType?.name ||
                    "—"
                  }
                </p>

              </div>


              <HousekeepingBadge
                status={
                  physicalRoom.housekeepingStatus
                }
              />

            </div>
          )
          : (
            <div className="empty-detail-state">

              <KeyRound
                size={26}
              />


              <strong>
                Chưa gán Physical Room
              </strong>


              <span>
                Reservation mới chỉ giữ Room Type.
              </span>

            </div>
          )
      }


      {
        assignment && (

          <>
            <div className="detail-section-title">
              Lịch sử Assignment
            </div>


            <div className="timeline">

              {
                (
                  assignment.logs ||
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
          </>

        )
      }


      {
        locked &&
        reservation.status ===
          "Checked In" && (

          <div className="info-note status-note">

            <strong>
              Guest đã Checked In
            </strong>


            <p>
              Physical Room hiện tại đã khóa tại
              Room Assignment. Nếu cần đổi phòng,
              sử dụng Step 11 — Room Move.
            </p>

          </div>

        )
      }


      <div className="drawer-actions">

        {
          !locked && (

            <button
              className="button button-dark"

              onClick={
                onAssign
              }
            >

              {
                assignment
                  ? (
                    <ArrowRightLeft
                      size={16}
                    />
                  )
                  : (
                    <KeyRound
                      size={16}
                    />
                  )
              }


              {
                assignment
                  ? "Đổi phòng"
                  : "Gán phòng"
              }

            </button>

          )
        }


        {
          assignment &&
          !locked && (

            <button
              className="button button-danger-outline"

              onClick={
                onUnassign
              }
            >
              <Unlink
                size={16}
              />

              Bỏ gán
            </button>

          )
        }

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