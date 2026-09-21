"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  BedDouble,
  CalendarX2,
  CheckCircle2,
  Clock3,
  Hotel,
  RefreshCw,
  Search,
  Send,
  UserRound,
} from "lucide-react";

import {
  usePms,
} from "@/context/PmsContext";

import Modal from "@/components/Modal";


/* =====================================================
   HELPERS
===================================================== */

function todayIso() {
  const now =
    new Date();


  const year =
    now.getFullYear();


  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      now.getDate()
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


function makeId(
  prefix
) {
  return `${prefix}_${Date.now()}_${Math.random()
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


/* =====================================================
   DATE RANGE

   Checkout date không giữ Inventory.
   Ví dụ:
   21 → 23
   sẽ release ngày 21 và 22.
===================================================== */

function dateRange(
  start,
  end
) {
  if (
    !start ||
    !end
  ) {
    return [];
  }


  const dates = [];


  const cursor =
    new Date(
      `${start}T00:00:00`
    );


  const endDate =
    new Date(
      `${end}T00:00:00`
    );


  while (
    cursor <
    endDate
  ) {
    const year =
      cursor.getFullYear();


    const month =
      String(
        cursor.getMonth() + 1
      ).padStart(
        2,
        "0"
      );


    const day =
      String(
        cursor.getDate()
      ).padStart(
        2,
        "0"
      );


    dates.push(
      `${year}-${month}-${day}`
    );


    cursor.setDate(
      cursor.getDate() + 1
    );
  }


  return dates;
}


/* =====================================================
   MAIN
===================================================== */

export default function NoShowManager() {
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

  const noShows =
    data.noShows || [];


  const today =
    todayIso();


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    propertyFilter,
    setPropertyFilter,
  ] = useState("");


  const [
    confirmReservationId,
    setConfirmReservationId,
  ] = useState(null);


  const [
    reason,
    setReason,
  ] = useState(
    "Guest did not arrive"
  );


  const [
    note,
    setNote,
  ] = useState("");


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


  function getAssignment(
    reservationId
  ) {
    return roomAssignments.find(
      (assignment) =>
        assignment.reservationId ===
        reservationId
    );
  }


  function getRoom(
    roomId
  ) {
    return physicalRooms.find(
      (room) =>
        room.id ===
        roomId
    );
  }


  /* ===================================================
     ELIGIBLE RESERVATIONS

     Chỉ Pending / Confirmed.

     Không cho mark No-show trước
     ngày Check-in.
  =================================================== */

  const eligibleReservations =
    useMemo(
      () =>
        reservations.filter(
          (reservation) =>
            [
              "Pending",
              "Confirmed",
            ].includes(
              reservation.status
            ) &&
            reservation.checkin <=
              today
        ),
      [
        reservations,
        today,
      ]
    );


  /* ===================================================
     FILTER
  =================================================== */

  const filteredReservations =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();


        return eligibleReservations.filter(
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
              getAssignment(
                reservation.id
              );


            const room =
              assignment
                ? getRoom(
                    assignment.physicalRoomId
                  )
                : null;


            const text = `
              ${reservation.reservationCode || ""}
              ${guest?.fullName || ""}
              ${guest?.phone || ""}
              ${guest?.email || ""}
              ${property?.name || ""}
              ${roomType?.name || ""}
              ${room?.roomNumber || ""}
            `.toLowerCase();


            return (
              (
                !query ||
                text.includes(
                  query
                )
              ) &&
              (
                !propertyFilter ||
                reservation.propertyId ===
                  propertyFilter
              )
            );
          }
        );
      },
      [
        eligibleReservations,
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
     METRICS
  =================================================== */

  const metrics =
    useMemo(
      () => {
        const todayNoShows =
          noShows.filter(
            (item) =>
              item.date ===
              today
          ).length;


        const overdue =
          eligibleReservations.filter(
            (reservation) =>
              reservation.checkin <
              today
          ).length;


        const assigned =
          eligibleReservations.filter(
            (reservation) =>
              Boolean(
                getAssignment(
                  reservation.id
                )
              )
          ).length;


        return {
          eligible:
            eligibleReservations.length,

          overdue,

          assigned,

          todayNoShows,
        };
      },
      [
        eligibleReservations,
        noShows,
        roomAssignments,
        today,
      ]
    );


  /* ===================================================
     OPEN CONFIRM
  =================================================== */

  function openNoShow(
    reservation
  ) {
    if (
      !reservation
    ) {
      return;
    }


    if (
      ![
        "Pending",
        "Confirmed",
      ].includes(
        reservation.status
      )
    ) {
      alert(
        "Chỉ Reservation Pending hoặc Confirmed mới có thể Mark No-show."
      );

      return;
    }


    if (
      reservation.checkin >
      today
    ) {
      alert(
        "Không thể Mark No-show trước ngày Check-in."
      );

      return;
    }


    setConfirmReservationId(
      reservation.id
    );


    setReason(
      "Guest did not arrive"
    );


    setNote(
      ""
    );
  }


  /* ===================================================
     CONFIRM NO-SHOW
  =================================================== */

  function confirmNoShow() {
    const reservation =
      reservations.find(
        (item) =>
          item.id ===
          confirmReservationId
      );


    if (
      !reservation
    ) {
      return;
    }


    if (
      !reason.trim()
    ) {
      alert(
        "Vui lòng nhập lý do No-show."
      );

      return;
    }


    if (
      ![
        "Pending",
        "Confirmed",
      ].includes(
        reservation.status
      )
    ) {
      alert(
        "Reservation này không còn đủ điều kiện Mark No-show."
      );

      return;
    }


    if (
      reservation.checkin >
      today
    ) {
      alert(
        "Chưa đến ngày Check-in."
      );

      return;
    }


    const actionTime =
      nowText();


    const stayDates =
      dateRange(
        reservation.checkin,
        reservation.checkout
      );


    const assignment =
      getAssignment(
        reservation.id
      );


    const releasedRoomId =
      assignment
        ?.physicalRoomId ||
      null;


    const releasedRoom =
      releasedRoomId
        ? getRoom(
            releasedRoomId
          )
        : null;


    const noShowRecord = {
      id:
        makeId(
          "noshow"
        ),

      reservationId:
        reservation.id,

      reservationCode:
        reservation.reservationCode,

      propertyId:
        reservation.propertyId,

      roomTypeId:
        reservation.roomTypeId,

      guestId:
        reservation.guestId,

      releasedPhysicalRoomId:
        releasedRoomId,

      stayDates,

      reason:
        reason.trim(),

      note:
        note.trim(),

      date:
        today,

      markedAt:
        actionTime,

      inventoryReleased:
        true,

      physicalRoomReleased:
        Boolean(
          releasedRoomId
        ),

      channelSyncStatus:
        "Queued",

      createdAt:
        actionTime,
    };


    const channelSyncLog = {
      id:
        makeId(
          "channel_sync"
        ),

      propertyId:
        reservation.propertyId,

      roomTypeId:
        reservation.roomTypeId,

      reservationId:
        reservation.id,

      action:
        "Availability Sync",

      source:
        "No-show",

      dates:
        stayDates,

      status:
        "Queued",

      message:
        `Inventory released after No-show ${reservation.reservationCode}`,

      createdAt:
        actionTime,
    };


    setData(
      (current) => {
        /* =============================================
           1. RESERVATION → NO-SHOW
        ============================================= */

        const nextReservations =
          (
            current.reservations ||
            []
          ).map(
            (item) =>
              item.id ===
              reservation.id
                ? {
                    ...item,

                    status:
                      "No-show",

                    noShowAt:
                      actionTime,

                    noShowReason:
                      reason.trim(),

                    noShowNote:
                      note.trim(),

                    noShowReleasedRoomId:
                      releasedRoomId,

                    updatedAt:
                      actionTime,

                    logs: [
                      `${actionTime} — Marked No-show. Reason: ${reason.trim()}`,

                      `${actionTime} — Inventory released for ${stayDates.length} night(s).`,

                      ...(
                        releasedRoom
                          ? [
                              `${actionTime} — Physical Room ${releasedRoom.roomNumber} released.`,
                            ]
                          : []
                      ),

                      `${actionTime} — Availability Sync queued for Channex.`,

                      ...(
                        item.logs ||
                        []
                      ),
                    ],
                  }
                : item
          );


        /* =============================================
           2. RELEASE INVENTORY
        ============================================= */

        const nextInventory =
          (
            current.inventory ||
            []
          ).map(
            (inventoryItem) => {
              const matches =
                inventoryItem.propertyId ===
                  reservation.propertyId &&
                inventoryItem.roomTypeId ===
                  reservation.roomTypeId &&
                stayDates.includes(
                  inventoryItem.date
                );


              if (
                !matches
              ) {
                return inventoryItem;
              }


              const nextBooked =
                Math.max(
                  Number(
                    inventoryItem.booked ||
                    0
                  ) -
                    1,
                  0
                );


              const total =
                Number(
                  inventoryItem.total ||
                  0
                );


              const blocked =
                Number(
                  inventoryItem.blocked ||
                  0
                );


              const nextAvailable =
                Math.max(
                  total -
                    nextBooked -
                    blocked,
                  0
                );


              return {
                ...inventoryItem,

                booked:
                  nextBooked,

                available:
                  nextAvailable,

                syncStatus:
                  "Pending",

                updatedAt:
                  actionTime,

                logs: [
                  `${actionTime} — Released 1 inventory after No-show ${reservation.reservationCode}`,

                  ...(
                    inventoryItem.logs ||
                    []
                  ),
                ],
              };
            }
          );


        /* =============================================
           3. RELEASE PHYSICAL ROOM
        ============================================= */

        const nextPhysicalRooms =
          (
            current.physicalRooms ||
            []
          ).map(
            (room) => {
              if (
                !releasedRoomId ||
                room.id !==
                  releasedRoomId
              ) {
                return room;
              }


              /*
               * No-show xảy ra trước khi khách
               * Check-in nên không đổi
               * Housekeeping Status.
               *
               * Chỉ trả trạng thái Occupancy
               * về Vacant.
               */
              return {
                ...room,

                occupancyStatus:
                  "Vacant",

                currentReservationId:
                  null,

                logs: [
                  `${actionTime} — Room released from ${reservation.reservationCode} due to No-show.`,

                  ...(
                    room.logs ||
                    []
                  ),
                ],
              };
            }
          );


        /* =============================================
           4. RELEASE ROOM ASSIGNMENT
        ============================================= */

        /*
         * Xóa Assignment đang active để
         * phòng có thể được Assign cho
         * Reservation khác.
         *
         * Room cũ vẫn được lưu trong:
         * reservation.noShowReleasedRoomId
         * và noShows[] để giữ audit.
         */

        const nextRoomAssignments =
          (
            current.roomAssignments ||
            []
          ).filter(
            (item) =>
              item.reservationId !==
              reservation.id
          );


        /* =============================================
           5. NO-SHOW HISTORY
        ============================================= */

        const nextNoShows = [
          noShowRecord,

          ...(
            current.noShows ||
            []
          ),
        ];


        /* =============================================
           6. CHANNEL SYNC QUEUE
        ============================================= */

        const nextChannelSyncLogs = [
          channelSyncLog,

          ...(
            current.channelSyncLogs ||
            []
          ),
        ];


        return {
          ...current,

          reservations:
            nextReservations,

          inventory:
            nextInventory,

          physicalRooms:
            nextPhysicalRooms,

          roomAssignments:
            nextRoomAssignments,

          noShows:
            nextNoShows,

          channelSyncLogs:
            nextChannelSyncLogs,
        };
      }
    );


    setConfirmReservationId(
      null
    );


    setReason(
      "Guest did not arrive"
    );


    setNote(
      ""
    );
  }


  /* ===================================================
     CURRENT CONFIRM RESERVATION
  =================================================== */

  const confirmReservation =
    reservations.find(
      (reservation) =>
        reservation.id ===
        confirmReservationId
    );


  const confirmGuest =
    confirmReservation
      ? getGuest(
          confirmReservation.guestId
        )
      : null;


  const confirmProperty =
    confirmReservation
      ? getProperty(
          confirmReservation.propertyId
        )
      : null;


  const confirmRoomType =
    confirmReservation
      ? getRoomType(
          confirmReservation.roomTypeId
        )
      : null;


  const confirmAssignment =
    confirmReservation
      ? getAssignment(
          confirmReservation.id
        )
      : null;


  const confirmRoom =
    confirmAssignment
      ? getRoom(
          confirmAssignment.physicalRoomId
        )
      : null;


  /* ===================================================
     LOADING
  =================================================== */

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
            BƯỚC 16 — NO-SHOW
          </div>


          <h1>
            Khách không đến{" "}
            <span className="heading-en">
              (No-show)
            </span>
          </h1>


          <p>
            Đánh dấu Reservation khi khách không đến nhận
            phòng, giải phóng Inventory và Physical Room,
            sau đó đưa Availability mới vào hàng đợi đồng
            bộ Channel.
          </p>

        </div>

      </div>


      {/* =================================================
          FLOW
      ================================================= */}

      <section className="explain-card">

        <div className="explain-icon">

          <CalendarX2
            size={21}
          />

        </div>


        <div>

          <strong>
            Một thao tác No-show phải giải phóng toàn bộ tài nguyên giữ phòng
          </strong>


          <p>
            PMS không chỉ đổi Reservation thành No-show.
            Inventory của từng đêm phải được trả lại,
            Physical Room phải được giải phóng và
            Availability mới cần được đưa sang Channel Sync.
          </p>


          <div className="no-show-flow">

            <span>
              Mark No-show
            </span>

            <b>→</b>

            <span>
              Release Inventory
            </span>

            <b>→</b>

            <span>
              Release Room
            </span>

            <b>→</b>

            <span>
              Queue Channel Sync
            </span>

          </div>

        </div>

      </section>


      {/* =================================================
          METRICS
      ================================================= */}

      <div className="metric-grid">

        <Metric
          label="Eligible"
          value={
            metrics.eligible
          }
        />


        <Metric
          label="Overdue Arrival"
          value={
            metrics.overdue
          }
        />


        <Metric
          label="Assigned Rooms"
          value={
            metrics.assigned
          }
        />


        <Metric
          label="No-show Today"
          value={
            metrics.todayNoShows
          }
        />

      </div>


      {/* =================================================
          RESERVATIONS
      ================================================= */}

      <section className="panel">

        <div className="panel-toolbar">

          <div className="no-show-filter-grid">

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

                placeholder="Tìm Reservation, Guest, Property, Room..."
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

          <table className="data-table no-show-table">

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
                  Room Type
                </th>

                <th>
                  Stay
                </th>

                <th>
                  Physical Room
                </th>

                <th>
                  Arrival
                </th>

                <th>
                  Status
                </th>

                <th className="text-right">
                  Thao tác
                </th>

              </tr>

            </thead>


            <tbody>

              {
                filteredReservations.map(
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
                      getAssignment(
                        reservation.id
                      );


                    const room =
                      assignment
                        ? getRoom(
                            assignment.physicalRoomId
                          )
                        : null;


                    const overdue =
                      reservation.checkin <
                      today;


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
                          {
                            roomType?.name ||
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
                            room
                              ? (
                                <div className="no-show-room">

                                  <BedDouble
                                    size={14}
                                  />


                                  <strong>
                                    Room{" "}
                                    {
                                      room.roomNumber
                                    }
                                  </strong>

                                </div>
                              )
                              : (
                                <span className="muted">
                                  Chưa gán phòng
                                </span>
                              )
                          }

                        </td>


                        <td>

                          {
                            overdue
                              ? (
                                <span className="status-badge status-danger">
                                  Overdue
                                </span>
                              )
                              : (
                                <span className="status-badge status-warning">
                                  Today
                                </span>
                              )
                          }

                        </td>


                        <td>

                          <span className="status-badge status-info">
                            {
                              reservation.status
                            }
                          </span>

                        </td>


                        <td>

                          <div className="action-row">

                            <button
                              className="button button-danger button-sm"

                              onClick={
                                () =>
                                  openNoShow(
                                    reservation
                                  )
                              }
                            >
                              <CalendarX2
                                size={14}
                              />

                              Mark No-show
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
            filteredReservations.length ===
              0 && (

              <div className="empty-state">

                <CheckCircle2
                  size={38}
                />


                <strong>
                  Không có Reservation cần xử lý
                </strong>


                <span>
                  Không có Pending hoặc Confirmed Reservation đến hạn No-show.
                </span>

              </div>

            )
          }

        </div>

      </section>


      {/* =================================================
          HISTORY
      ================================================= */}

      <section className="panel">

        <div className="panel-header-row">

          <div>

            <div className="eyebrow">
              AUDIT HISTORY
            </div>


            <h2>
              No-show History
            </h2>

          </div>


          <span className="status-badge status-neutral">
            {
              noShows.length
            }{" "}
            records
          </span>

        </div>


        {
          noShows.length >
            0
            ? (
              <div className="no-show-history-list">

                {
                  noShows.map(
                    (item) => {
                      const reservation =
                        reservations.find(
                          (reservation) =>
                            reservation.id ===
                            item.reservationId
                        );


                      const guest =
                        getGuest(
                          item.guestId
                        );


                      const property =
                        getProperty(
                          item.propertyId
                        );


                      const room =
                        item.releasedPhysicalRoomId
                          ? getRoom(
                              item.releasedPhysicalRoomId
                            )
                          : null;


                      return (
                        <article
                          className="no-show-history-item"

                          key={
                            item.id
                          }
                        >

                          <div className="no-show-history-icon">

                            <CalendarX2
                              size={17}
                            />

                          </div>


                          <div className="no-show-history-content">

                            <div className="no-show-history-title">

                              <strong>
                                {
                                  reservation?.reservationCode ||
                                  item.reservationCode ||
                                  "Reservation"
                                }
                              </strong>


                              <span className="status-badge status-danger">
                                No-show
                              </span>

                            </div>


                            <p>
                              {
                                guest?.fullName ||
                                "—"
                              }
                              {" · "}
                              {
                                property?.name ||
                                "—"
                              }
                            </p>


                            <div className="no-show-history-meta">

                              <span>
                                <Clock3
                                  size={12}
                                />

                                {
                                  item.markedAt ||
                                  "—"
                                }
                              </span>


                              {
                                room && (

                                  <span>
                                    <BedDouble
                                      size={12}
                                    />

                                    Released Room{" "}
                                    {
                                      room.roomNumber
                                    }
                                  </span>

                                )
                              }


                              <span>
                                <RefreshCw
                                  size={12}
                                />

                                {
                                  item.stayDates?.length ||
                                  0
                                }{" "}
                                inventory night(s)
                              </span>


                              <span>
                                <Send
                                  size={12}
                                />

                                Channel{" "}
                                {
                                  item.channelSyncStatus ||
                                  "Queued"
                                }
                              </span>

                            </div>


                            <div className="no-show-history-reason">

                              <strong>
                                Reason:
                              </strong>

                              {" "}

                              {
                                item.reason ||
                                "—"
                              }

                            </div>


                            {
                              item.note && (

                                <div className="no-show-history-note">
                                  {
                                    item.note
                                  }
                                </div>

                              )
                            }

                          </div>

                        </article>
                      );
                    }
                  )
                }

              </div>
            )
            : (
              <div className="empty-state">

                <CalendarX2
                  size={34}
                />


                <strong>
                  Chưa có No-show History
                </strong>

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
          Khi Mark No-show PMS làm gì?
        </h2>


        <div className="business-grid">

          <BusinessItem
            number="01"

            icon={
              <CalendarX2
                size={18}
              />
            }

            title="Reservation"

            text="Reservation chuyển sang No-show và lưu thời gian, lý do, ghi chú để audit."
          />


          <BusinessItem
            number="02"

            icon={
              <RefreshCw
                size={18}
              />
            }

            title="Release Inventory"

            text="Mỗi đêm booking đang giữ được trừ khỏi Booked và cộng trở lại Available."
          />


          <BusinessItem
            number="03"

            icon={
              <BedDouble
                size={18}
              />
            }

            title="Release Physical Room"

            text="Room Assignment được giải phóng để phòng vật lý có thể được gán cho booking khác."
          />


          <BusinessItem
            number="04"

            icon={
              <Send
                size={18}
              />
            }

            title="Channel Sync"

            text="Availability mới được đưa vào hàng đợi Channel Sync để Step 17 gửi sang Channex."
          />

        </div>

      </section>


      {/* =================================================
          CONFIRM MODAL
      ================================================= */}

      <Modal
        open={
          Boolean(
            confirmReservation
          )
        }

        title="Mark No-show"

        subtitle="FRONT DESK — NO-SHOW"

        onClose={
          () => {
            setConfirmReservationId(
              null
            );

            setReason(
              "Guest did not arrive"
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
                  setConfirmReservationId(
                    null
                  )
              }
            >
              Hủy
            </button>


            <button
              className="button button-danger"

              onClick={
                confirmNoShow
              }
            >
              <CalendarX2
                size={16}
              />

              Mark No-show
            </button>

          </>
        }
      >

        {
          confirmReservation && (

            <>
              <div className="no-show-warning">

                <AlertTriangle
                  size={21}
                />


                <div>

                  <strong>
                    Thao tác này sẽ giải phóng booking
                  </strong>


                  <p>
                    Reservation sẽ chuyển sang No-show,
                    Inventory được release, Room Assignment
                    bị bỏ và Availability mới được đưa vào
                    Channel Sync Queue.
                  </p>

                </div>

              </div>


              <div className="no-show-reservation-card">

                <div className="no-show-reservation-icon">

                  <UserRound
                    size={20}
                  />

                </div>


                <div>

                  <span>
                    RESERVATION
                  </span>


                  <strong>
                    {
                      confirmReservation.reservationCode
                    }
                  </strong>


                  <p>
                    {
                      confirmGuest?.fullName ||
                      "—"
                    }
                    {" · "}
                    {
                      confirmProperty?.name ||
                      "—"
                    }
                  </p>

                </div>

              </div>


              <div className="no-show-release-preview">

                <PreviewItem
                  icon={
                    <Hotel
                      size={16}
                    />
                  }

                  label="Room Type"

                  value={
                    confirmRoomType?.name ||
                    "—"
                  }
                />


                <PreviewItem
                  icon={
                    <BedDouble
                      size={16}
                    />
                  }

                  label="Physical Room"

                  value={
                    confirmRoom
                      ? `Room ${confirmRoom.roomNumber}`
                      : "Không có"
                  }
                />


                <PreviewItem
                  icon={
                    <RefreshCw
                      size={16}
                    />
                  }

                  label="Inventory"

                  value={`${dateRange(
                    confirmReservation.checkin,
                    confirmReservation.checkout
                  ).length} night(s)`}
                />


                <PreviewItem
                  icon={
                    <Send
                      size={16}
                    />
                  }

                  label="Channel Sync"

                  value="Queued"
                />

              </div>


              <div className="form-grid">

                <Field
                  label="No-show Reason *"
                >

                  <input
                    value={
                      reason
                    }

                    onChange={
                      (event) =>
                        setReason(
                          event.target.value
                        )
                    }

                    placeholder="Guest did not arrive"
                  />

                </Field>


                <Field
                  label="Internal Note"
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

                    placeholder="Ghi chú thêm..."
                  />

                </Field>

              </div>

            </>

          )
        }

      </Modal>

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


function PreviewItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="no-show-preview-item">

      <div className="no-show-preview-icon">
        {icon}
      </div>


      <div>

        <span>
          {label}
        </span>


        <strong>
          {value}
        </strong>

      </div>

    </div>
  );
}