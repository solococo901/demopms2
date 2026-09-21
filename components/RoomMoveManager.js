"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  ArrowRightLeft,
  BedDouble,
  CheckCircle2,
  Clock3,
  Eye,
  History,
  Hotel,
  Search,
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
  return `roommove_${Date.now()}_${Math.random()
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


function roomReady(
  room
) {
  return (
    room?.status ===
      "Active" &&
    [
      "Clean",
      "Inspected",
    ].includes(
      room?.housekeepingStatus
    ) &&
    (
      !room?.occupancyStatus ||
      room.occupancyStatus ===
        "Vacant"
    )
  );
}


/* =====================================================
   BADGES
===================================================== */

function HousekeepingBadge({
  status,
}) {
  const classes = {
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
        classes[
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


/* =====================================================
   MAIN
===================================================== */

export default function RoomMoveManager() {
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

  const roomMoves =
    data.roomMoves || [];


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    propertyFilter,
    setPropertyFilter,
  ] = useState("");


  const [
    moveReservationId,
    setMoveReservationId,
  ] = useState(null);


  const [
    selectedRoomId,
    setSelectedRoomId,
  ] = useState("");


  const [
    reason,
    setReason,
  ] = useState("");


  const [
    note,
    setNote,
  ] = useState("");


  const [
    detailId,
    setDetailId,
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
    roomId
  ) {
    return physicalRooms.find(
      (room) =>
        room.id ===
        roomId
    );
  }


  function getAssignment(
    reservationId
  ) {
    return roomAssignments.find(
      (assignment) =>
        assignment.reservationId ===
        reservationId
    );
  }


  function getCurrentRoom(
    reservationId
  ) {
    const assignment =
      getAssignment(
        reservationId
      );


    if (
      !assignment
    ) {
      return null;
    }


    return getPhysicalRoom(
      assignment.physicalRoomId
    );
  }


  function getMoveHistory(
    reservationId
  ) {
    return roomMoves
      .filter(
        (move) =>
          move.reservationId ===
          reservationId
      )
      .sort(
        (
          a,
          b
        ) =>
          String(
            b.movedAt ||
            ""
          ).localeCompare(
            String(
              a.movedAt ||
              ""
            )
          )
      );
  }


  /* ===================================================
     CONFLICT CHECK
  =================================================== */

  function hasReservationConflict(
    room,
    currentReservation
  ) {
    if (
      !room ||
      !currentReservation
    ) {
      return null;
    }


    const assignments =
      roomAssignments.filter(
        (assignment) =>
          assignment.physicalRoomId ===
            room.id &&
          assignment.reservationId !==
            currentReservation.id
      );


    for (
      const assignment of assignments
    ) {
      const otherReservation =
        reservations.find(
          (reservation) =>
            reservation.id ===
            assignment.reservationId
        );


      if (
        !otherReservation ||
        [
          "Cancelled",
          "No-show",
          "Checked Out",
        ].includes(
          otherReservation.status
        )
      ) {
        continue;
      }


      if (
        datesOverlap(
          currentReservation.checkin,
          currentReservation.checkout,
          otherReservation.checkin,
          otherReservation.checkout
        )
      ) {
        return otherReservation;
      }
    }


    return null;
  }


  /* ===================================================
     MOVE CANDIDATES
  =================================================== */

  function getCandidateRooms(
    reservation
  ) {
    if (
      !reservation
    ) {
      return [];
    }


    const currentRoom =
      getCurrentRoom(
        reservation.id
      );


    return physicalRooms
      .filter(
        (room) =>
          room.propertyId ===
            reservation.propertyId &&
          room.roomTypeId ===
            reservation.roomTypeId &&
          room.id !==
            currentRoom?.id
      )
      .map(
        (room) => {
          const conflict =
            hasReservationConflict(
              room,
              reservation
            );


          const ready =
            roomReady(
              room
            ) &&
            !conflict;


          return {
            ...room,

            conflict,

            ready,
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
     IN HOUSE RESERVATIONS
  =================================================== */

  const inHouseReservations =
    useMemo(
      () =>
        reservations.filter(
          (reservation) =>
            reservation.status ===
            "Checked In"
        ),
      [
        reservations,
      ]
    );


  const filtered =
    useMemo(
      () => {
        const q =
          search
            .trim()
            .toLowerCase();


        return inHouseReservations
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


              const currentRoom =
                getCurrentRoom(
                  reservation.id
                );


              const text = `
                ${reservation.reservationCode || ""}
                ${guest?.fullName || ""}
                ${guest?.phone || ""}
                ${property?.name || ""}
                ${roomType?.name || ""}
                ${currentRoom?.roomNumber || ""}
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
                  reservation.propertyId ===
                    propertyFilter
                )
              );
            }
          )
          .sort(
            (
              a,
              b
            ) =>
              String(
                a.reservationCode ||
                ""
              ).localeCompare(
                String(
                  b.reservationCode ||
                  ""
                )
              )
          );
      },
      [
        inHouseReservations,
        guests,
        properties,
        roomTypes,
        physicalRooms,
        roomAssignments,
        search,
        propertyFilter,
      ]
    );


  /* ===================================================
     STATS
  =================================================== */

  const stats =
    useMemo(
      () => {
        const readyAlternativeRooms =
          inHouseReservations.reduce(
            (
              total,
              reservation
            ) =>
              total +
              getCandidateRooms(
                reservation
              ).filter(
                (room) =>
                  room.ready
              ).length,
            0
          );


        return {
          inHouse:
            inHouseReservations.length,

          moved:
            roomMoves.length,

          withHistory:
            inHouseReservations.filter(
              (reservation) =>
                getMoveHistory(
                  reservation.id
                ).length >
                0
            ).length,

          readyRooms:
            readyAlternativeRooms,
        };
      },
      [
        inHouseReservations,
        roomMoves,
        physicalRooms,
        roomAssignments,
        reservations,
      ]
    );


  /* ===================================================
     OPEN MOVE
  =================================================== */

  function openMove(
    reservation
  ) {
    const assignment =
      getAssignment(
        reservation.id
      );


    if (
      !assignment
    ) {
      alert(
        "Reservation chưa có Physical Room."
      );

      return;
    }


    const currentRoom =
      getPhysicalRoom(
        assignment.physicalRoomId
      );


    if (
      !currentRoom
    ) {
      alert(
        "Không tìm thấy Physical Room hiện tại."
      );

      return;
    }


    const candidates =
      getCandidateRooms(
        reservation
      );


    const firstReady =
      candidates.find(
        (room) =>
          room.ready
      );


    setMoveReservationId(
      reservation.id
    );


    setSelectedRoomId(
      firstReady?.id ||
      ""
    );


    setReason(
      ""
    );


    setNote(
      ""
    );
  }


  /* ===================================================
     CONFIRM MOVE
  =================================================== */

  function confirmMove() {
    const reservation =
      reservations.find(
        (item) =>
          item.id ===
          moveReservationId
      );


    if (
      !reservation
    ) {
      return;
    }


    if (
      reservation.status !==
      "Checked In"
    ) {
      alert(
        "Room Move chỉ áp dụng cho khách đang Checked In."
      );

      return;
    }


    const assignment =
      getAssignment(
        reservation.id
      );


    if (
      !assignment
    ) {
      alert(
        "Reservation chưa có Room Assignment."
      );

      return;
    }


    const oldRoom =
      getPhysicalRoom(
        assignment.physicalRoomId
      );


    const newRoom =
      getPhysicalRoom(
        selectedRoomId
      );


    if (
      !oldRoom ||
      !newRoom
    ) {
      alert(
        "Không tìm thấy Physical Room."
      );

      return;
    }


    if (
      oldRoom.id ===
      newRoom.id
    ) {
      alert(
        "Phòng mới phải khác phòng hiện tại."
      );

      return;
    }


    if (
      newRoom.propertyId !==
      reservation.propertyId
    ) {
      alert(
        "Phòng mới phải thuộc cùng Property."
      );

      return;
    }


    if (
      newRoom.roomTypeId !==
      reservation.roomTypeId
    ) {
      alert(
        "Ở Phase 1, Room Move chỉ cho phép chuyển sang Physical Room cùng Room Type."
      );

      return;
    }


    if (
      !roomReady(
        newRoom
      )
    ) {
      alert(
        `Room ${newRoom.roomNumber} chưa sẵn sàng. Phòng mới phải Active, Vacant và Clean / Inspected.`
      );

      return;
    }


    const conflict =
      hasReservationConflict(
        newRoom,
        reservation
      );


    if (
      conflict
    ) {
      alert(
        `Room ${newRoom.roomNumber} đang conflict với ${conflict.reservationCode}.`
      );

      return;
    }


    if (
      !reason.trim()
    ) {
      alert(
        "Vui lòng nhập lý do đổi phòng."
      );

      return;
    }


    const actionTime =
      nowText();


    /* ===============================================
       UPDATE PHYSICAL ROOMS
    =============================================== */

    const nextPhysicalRooms =
      physicalRooms.map(
        (room) => {
          /*
           * Phòng cũ:
           * Vacant + Dirty
           */
          if (
            room.id ===
            oldRoom.id
          ) {
            return {
              ...room,

              occupancyStatus:
                "Vacant",

              housekeepingStatus:
                "Dirty",

              currentReservationId:
                null,

              updatedAt:
                actionTime,

              logs: [
                `${actionTime} — Room Move: khách chuyển khỏi phòng. Room → Vacant + Dirty`,

                ...(
                  room.logs ||
                  []
                ),
              ],
            };
          }


          /*
           * Phòng mới:
           * Occupied
           */
          if (
            room.id ===
            newRoom.id
          ) {
            return {
              ...room,

              occupancyStatus:
                "Occupied",

              currentReservationId:
                reservation.id,

              updatedAt:
                actionTime,

              logs: [
                `${actionTime} — Room Move: ${reservation.reservationCode} chuyển vào Room ${newRoom.roomNumber}`,

                ...(
                  room.logs ||
                  []
                ),
              ],
            };
          }


          return room;
        }
      );


    /* ===============================================
       UPDATE ROOM ASSIGNMENT
    =============================================== */

    const nextAssignments =
      roomAssignments.map(
        (item) =>
          item.id ===
          assignment.id
            ? {
                ...item,

                physicalRoomId:
                  newRoom.id,

                updatedAt:
                  actionTime,

                logs: [
                  `${actionTime} — Room Move ${oldRoom.roomNumber} → ${newRoom.roomNumber}`,

                  ...(
                    item.logs ||
                    []
                  ),
                ],
              }
            : item
      );


    /* ===============================================
       ROOM MOVE HISTORY
    =============================================== */

    const moveRecord = {
      id:
        makeId(),

      reservationId:
        reservation.id,

      propertyId:
        reservation.propertyId,

      roomTypeId:
        reservation.roomTypeId,

      fromPhysicalRoomId:
        oldRoom.id,

      toPhysicalRoomId:
        newRoom.id,

      movedAt:
        actionTime,

      reason:
        reason.trim(),

      note:
        note.trim(),

      createdAt:
        actionTime,
    };


    /* ===============================================
       RESERVATION HISTORY
    =============================================== */

    const nextReservations =
      reservations.map(
        (item) =>
          item.id ===
          reservation.id
            ? {
                ...item,

                updatedAt:
                  actionTime,

                logs: [
                  `${actionTime} — Room Move: Room ${oldRoom.roomNumber} → Room ${newRoom.roomNumber}. Lý do: ${reason.trim()}`,

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

        roomAssignments:
          nextAssignments,

        reservations:
          nextReservations,

        roomMoves: [
          moveRecord,

          ...roomMoves,
        ],
      })
    );


    setMoveReservationId(
      null
    );


    setSelectedRoomId(
      ""
    );


    setReason(
      ""
    );


    setNote(
      ""
    );
  }


  /* ===================================================
     CURRENT MOVE
  =================================================== */

  const moveReservation =
    reservations.find(
      (reservation) =>
        reservation.id ===
        moveReservationId
    );


  const moveCurrentRoom =
    moveReservation
      ? getCurrentRoom(
          moveReservation.id
        )
      : null;


  const candidateRooms =
    moveReservation
      ? getCandidateRooms(
          moveReservation
        )
      : [];


  /* ===================================================
     DETAIL
  =================================================== */

  const detailReservation =
    reservations.find(
      (reservation) =>
        reservation.id ===
        detailId
    );


  const detailRoom =
    detailReservation
      ? getCurrentRoom(
          detailReservation.id
        )
      : null;


  const detailHistory =
    detailReservation
      ? getMoveHistory(
          detailReservation.id
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
            BƯỚC 11 — ROOM MOVE
          </div>


          <h1>
            Đổi phòng khi đang lưu trú{" "}
            <span className="heading-en">
              (Room Move)
            </span>
          </h1>


          <p>
            Chuyển Guest đang In House từ Physical Room
            hiện tại sang phòng khác mà không tạo
            Reservation mới.
          </p>

        </div>

      </div>


      {/* =================================================
          EXPLAIN
      ================================================= */}

      <section className="explain-card">

        <div className="explain-icon">

          <ArrowRightLeft
            size={21}
          />

        </div>


        <div>

          <strong>
            Room Move khác với Room Assignment
          </strong>


          <p>
            Room Assignment dùng trước Check-in. Khi khách
            đã Checked In và cần đổi phòng, PMS phải dùng
            Room Move để xử lý trạng thái cả phòng cũ và
            phòng mới.
          </p>


          <div className="room-move-flow">

            <span>
              Room 305
            </span>

            <b>→</b>

            <span>
              Validate New Room
            </span>

            <b>→</b>

            <span>
              Move Guest
            </span>

            <b>→</b>

            <span>
              Room 307
            </span>

          </div>

        </div>

      </section>


      {/* =================================================
          METRICS
      ================================================= */}

      <div className="metric-grid">

        <Metric
          label="Guest In House"
          value={
            stats.inHouse
          }
        />


        <Metric
          label="Room Move đã thực hiện"
          value={
            stats.moved
          }
        />


        <Metric
          label="Guest có Move History"
          value={
            stats.withHistory
          }
        />


        <Metric
          label="Phòng thay thế sẵn sàng"
          value={
            stats.readyRooms
          }
        />

      </div>


      {/* =================================================
          TABLE
      ================================================= */}

      <section className="panel">

        <div className="panel-toolbar">

          <div className="room-move-filter-grid">

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

          </div>

        </div>


        <div className="table-wrap">

          <table className="data-table room-move-table">

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
                  Current Room
                </th>

                <th>
                  Housekeeping
                </th>

                <th>
                  Move History
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


                    const currentRoom =
                      getCurrentRoom(
                        reservation.id
                      );


                    const history =
                      getMoveHistory(
                        reservation.id
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
                            Checked In
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
                          {
                            property?.name ||
                            "—"
                          }
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
                          {
                            roomType?.name ||
                            "—"
                          }
                        </td>


                        <td>

                          {
                            currentRoom
                              ? (
                                <div className="room-move-current-room">

                                  <span>
                                    {
                                      currentRoom.roomNumber
                                    }
                                  </span>


                                  <div>

                                    <strong>
                                      Room{" "}
                                      {
                                        currentRoom.roomNumber
                                      }
                                    </strong>


                                    <small>
                                      Tầng{" "}
                                      {
                                        currentRoom.floor ||
                                        "—"
                                      }
                                    </small>

                                  </div>

                                </div>
                              )
                              : (
                                <span className="status-badge status-danger">
                                  Không có phòng
                                </span>
                              )
                          }

                        </td>


                        <td>

                          {
                            currentRoom
                              ? (
                                <HousekeepingBadge
                                  status={
                                    currentRoom.housekeepingStatus
                                  }
                                />
                              )
                              : "—"
                          }

                        </td>


                        <td>

                          <span className="room-move-history-count">

                            <History
                              size={13}
                            />

                            {
                              history.length
                            }{" "}
                            lần

                          </span>

                        </td>


                        <td>

                          <div className="action-row">

                            <button
                              className="table-action"

                              title="Xem chi tiết"

                              onClick={
                                () =>
                                  setDetailId(
                                    reservation.id
                                  )
                              }
                            >
                              <Eye
                                size={15}
                              />
                            </button>


                            <button
                              className="button button-dark button-sm"

                              disabled={
                                !currentRoom
                              }

                              onClick={
                                () =>
                                  openMove(
                                    reservation
                                  )
                              }
                            >
                              <ArrowRightLeft
                                size={14}
                              />

                              Move Room
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

                <BedDouble
                  size={38}
                />


                <strong>
                  Không có Guest đang In House
                </strong>


                <span>
                  Room Move chỉ áp dụng cho Reservation có trạng thái Checked In.
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
          Room Move xử lý những gì?
        </h2>


        <div className="business-grid">

          <BusinessItem
            number="01"

            icon={
              <ArrowRightLeft
                size={18}
              />
            }

            title="Move Room"

            text="Chuyển Guest sang Physical Room khác mà vẫn giữ nguyên Reservation hiện tại."
          />


          <BusinessItem
            number="02"

            icon={
              <CheckCircle2
                size={18}
              />
            }

            title="Room Readiness"

            text="Phòng mới phải Active, Vacant và có Housekeeping Clean hoặc Inspected."
          />


          <BusinessItem
            number="03"

            icon={
              <BedDouble
                size={18}
              />
            }

            title="Old / New Room"

            text="Phòng cũ chuyển Vacant + Dirty; phòng mới chuyển Occupied."
          />


          <BusinessItem
            number="04"

            icon={
              <History
                size={18}
              />
            }

            title="Move History"

            text="PMS lưu phòng cũ, phòng mới, thời gian, lý do và ghi chú của mỗi lần chuyển phòng."
          />

        </div>

      </section>


      {/* =================================================
          MOVE MODAL
      ================================================= */}

      <Modal
        open={
          Boolean(
            moveReservation
          )
        }

        title="Move Room"

        subtitle="ROOM MOVE"

        size="lg"

        onClose={
          () => {
            setMoveReservationId(
              null
            );

            setSelectedRoomId(
              ""
            );

            setReason(
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
                () => {
                  setMoveReservationId(
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
                confirmMove
              }
            >
              <ArrowRightLeft
                size={16}
              />

              Xác nhận Room Move
            </button>

          </>
        }
      >

        {
          moveReservation && (

            <RoomMoveForm
              reservation={
                moveReservation
              }

              guest={
                getGuest(
                  moveReservation.guestId
                )
              }

              property={
                getProperty(
                  moveReservation.propertyId
                )
              }

              roomType={
                getRoomType(
                  moveReservation.roomTypeId
                )
              }

              currentRoom={
                moveCurrentRoom
              }

              candidateRooms={
                candidateRooms
              }

              selectedRoomId={
                selectedRoomId
              }

              setSelectedRoomId={
                setSelectedRoomId
              }

              reason={
                reason
              }

              setReason={
                setReason
              }

              note={
                note
              }

              setNote={
                setNote
              }
            />

          )
        }

      </Modal>


      {/* =================================================
          DETAIL
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

        subtitle="ROOM MOVE"

        onClose={
          () =>
            setDetailId(
              null
            )
        }
      >

        {
          detailReservation && (

            <RoomMoveDetail
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

              currentRoom={
                detailRoom
              }

              history={
                detailHistory
              }

              physicalRooms={
                physicalRooms
              }

              onMove={
                () => {
                  setDetailId(
                    null
                  );

                  openMove(
                    detailReservation
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
   MOVE FORM
===================================================== */

function RoomMoveForm({
  reservation,
  guest,
  property,
  roomType,
  currentRoom,
  candidateRooms,
  selectedRoomId,
  setSelectedRoomId,
  reason,
  setReason,
  note,
  setNote,
}) {
  const readyRooms =
    candidateRooms.filter(
      (room) =>
        room.ready
    );


  return (
    <>
      <div className="room-move-guest-card">

        <div className="room-move-guest-icon">

          <UserRound
            size={21}
          />

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

          <p>
            {
              reservation.reservationCode
            }
          </p>

        </div>

      </div>


      <div className="room-move-route">

        <div>

          <span>
            CURRENT ROOM
          </span>

          <strong>
            Room{" "}
            {
              currentRoom?.roomNumber ||
              "—"
            }
          </strong>

          <small>
            {
              roomType?.name ||
              "—"
            }
          </small>

        </div>


        <ArrowRight
          size={20}
        />


        <div>

          <span>
            NEW ROOM
          </span>

          <strong>
            {
              selectedRoomId
                ? `Room ${
                    candidateRooms.find(
                      (room) =>
                        room.id ===
                        selectedRoomId
                    )?.roomNumber ||
                    "—"
                  }`
                : "Chưa chọn"
            }
          </strong>

          <small>
            {
              property?.name ||
              "—"
            }
          </small>

        </div>

      </div>


      <div className="form-section-title">
        Chọn phòng mới
      </div>


      <div className="room-move-room-grid">

        {
          candidateRooms.map(
            (room) => (

              <button
                type="button"

                key={
                  room.id
                }

                disabled={
                  !room.ready
                }

                className={[
                  "room-move-room-option",

                  selectedRoomId ===
                  room.id
                    ? "selected"
                    : "",

                  !room.ready
                    ? "unavailable"
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

                <div className="room-move-room-top">

                  <span className="room-move-number">
                    {
                      room.roomNumber
                    }
                  </span>


                  {
                    room.ready
                      ? (
                        <span className="status-badge status-success">
                          Ready
                        </span>
                      )
                      : (
                        <span className="status-badge status-danger">
                          Not Ready
                        </span>
                      )
                  }

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


                <div className="room-move-room-badges">

                  <HousekeepingBadge
                    status={
                      room.housekeepingStatus
                    }
                  />


                  <OccupancyBadge
                    status={
                      room.occupancyStatus
                    }
                  />

                </div>


                {
                  room.conflict && (

                    <div className="room-move-conflict">
                      Conflict:{" "}
                      {
                        room.conflict.reservationCode
                      }
                    </div>

                  )
                }

              </button>

            )
          )
        }

      </div>


      {
        candidateRooms.length ===
          0 && (

          <div className="empty-detail-state">

            <BedDouble
              size={26}
            />


            <strong>
              Không có phòng thay thế
            </strong>


            <span>
              Hiện chưa có Physical Room khác cùng Room Type.
            </span>

          </div>

        )
      }


      {
        candidateRooms.length >
          0 &&
        readyRooms.length ===
          0 && (

          <div className="front-desk-result danger">

            <strong>
              Chưa có phòng Ready
            </strong>


            <p>
              Phòng mới phải Active, Vacant và Clean /
              Inspected, đồng thời không conflict với
              Reservation khác.
            </p>

          </div>

        )
      }


      <div className="form-section-title">
        Lý do & ghi chú
      </div>


      <div className="form-grid">

        <Field
          label="Lý do đổi phòng *"
        >

          <select
            value={
              reason
            }

            onChange={
              (event) =>
                setReason(
                  event.target.value
                )
            }
          >

            <option value="">
              Chọn lý do
            </option>

            <option value="Guest Request">
              Guest Request
            </option>

            <option value="Room Issue">
              Room Issue
            </option>

            <option value="Maintenance">
              Maintenance
            </option>

            <option value="Noise Complaint">
              Noise Complaint
            </option>

            <option value="Upgrade">
              Upgrade
            </option>

            <option value="Operational">
              Operational
            </option>

            <option value="Other">
              Other
            </option>

          </select>

        </Field>


        <Field
          label="Ghi chú"
        >

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

            placeholder="Ví dụ: điều hòa phòng cũ có vấn đề, khách yêu cầu đổi phòng..."
          />

        </Field>

      </div>


      <div className="info-note roomtype-note">

        <strong>
          Sau khi Room Move
        </strong>


        <p>
          Room{" "}
          {
            currentRoom?.roomNumber ||
            "cũ"
          }{" "}
          sẽ chuyển Vacant + Dirty. Phòng mới chuyển
          Occupied và Room Assignment của Reservation
          được cập nhật sang phòng mới.
        </p>

      </div>

    </>
  );
}


/* =====================================================
   DETAIL
===================================================== */

function RoomMoveDetail({
  reservation,
  guest,
  property,
  roomType,
  currentRoom,
  history,
  physicalRooms,
  onMove,
}) {
  function roomName(
    roomId
  ) {
    const room =
      physicalRooms.find(
        (item) =>
          item.id ===
          roomId
      );


    return room
      ? `Room ${room.roomNumber}`
      : "Unknown Room";
  }


  return (
    <>
      <div className="room-move-detail-hero">

        <div>

          <span>
            CURRENT ROOM
          </span>

          <strong>
            {
              currentRoom
                ? `Room ${currentRoom.roomNumber}`
                : "—"
            }
          </strong>

        </div>


        <span className="status-badge status-success">
          In House
        </span>

      </div>


      <div className="detail-section-title">
        Reservation
      </div>


      <div className="detail-grid">

        <Detail
          label="Reservation"
          value={
            reservation.reservationCode
          }
        />


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

      </div>


      <div className="detail-section-title">
        Current Physical Room
      </div>


      {
        currentRoom
          ? (
            <div className="room-move-current-detail">

              <div className="room-move-current-number">
                {
                  currentRoom.roomNumber
                }
              </div>


              <div>

                <span>
                  PHYSICAL ROOM
                </span>

                <strong>
                  Room{" "}
                  {
                    currentRoom.roomNumber
                  }
                </strong>

                <p>
                  Tầng{" "}
                  {
                    currentRoom.floor ||
                    "—"
                  }
                </p>

              </div>


              <div className="room-move-current-status">

                <HousekeepingBadge
                  status={
                    currentRoom.housekeepingStatus
                  }
                />

                <OccupancyBadge
                  status={
                    currentRoom.occupancyStatus
                  }
                />

              </div>

            </div>
          )
          : (
            <div className="empty-detail-state">

              <BedDouble
                size={26}
              />

              <strong>
                Không có Physical Room
              </strong>

            </div>
          )
      }


      <div className="detail-section-title">
        Room Move History
      </div>


      {
        history.length >
          0
          ? (
            <div className="room-move-history-list">

              {
                history.map(
                  (move) => (

                    <div
                      className="room-move-history-item"

                      key={
                        move.id
                      }
                    >

                      <div className="room-move-history-route">

                        <strong>
                          {
                            roomName(
                              move.fromPhysicalRoomId
                            )
                          }
                        </strong>


                        <ArrowRight
                          size={14}
                        />


                        <strong>
                          {
                            roomName(
                              move.toPhysicalRoomId
                            )
                          }
                        </strong>

                      </div>


                      <div className="room-move-history-meta">

                        <span>
                          <Clock3
                            size={12}
                          />

                          {
                            move.movedAt ||
                            "—"
                          }
                        </span>


                        <span>
                          {
                            move.reason ||
                            "—"
                          }
                        </span>

                      </div>


                      {
                        move.note && (

                          <p>
                            {
                              move.note
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

              <History
                size={26}
              />


              <strong>
                Chưa có Room Move
              </strong>


              <span>
                Reservation này chưa từng đổi phòng.
              </span>

            </div>
          )
      }


      <div className="drawer-actions">

        <button
          className="button button-dark"

          disabled={
            !currentRoom
          }

          onClick={
            onMove
          }
        >
          <ArrowRightLeft
            size={16}
          />

          Move Room
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


function Field({
  label,
  children,
}) {
  return (
    <label className="form-field">

      <span className="form-label">
        {label}
      </span>

      {children}

    </label>
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