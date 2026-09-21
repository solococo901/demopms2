"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  BedDouble,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DoorOpen,
  Eye,
  Hotel,
  KeyRound,
  LogIn,
  LogOut,
  Search,
  UserRound,
  WalletCards,
} from "lucide-react";

import {
  usePms,
} from "@/context/PmsContext";

import Modal from "@/components/Modal";
import Drawer from "@/components/Drawer";


/* =====================================================
   HELPERS
===================================================== */

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


function money(
  value
) {
  return `${Number(
    value || 0
  ).toLocaleString(
    "vi-VN"
  )} ₫`;
}


function isRoomClean(
  room
) {
  return [
    "Clean",
    "Inspected",
  ].includes(
    room?.housekeepingStatus
  );
}


/* =====================================================
   BADGES
===================================================== */

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

export default function FrontDeskManager() {
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


  const today =
    todayString();


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    propertyFilter,
    setPropertyFilter,
  ] = useState("");


  const [
    activeView,
    setActiveView,
  ] = useState("arrivals");


  const [
    detailId,
    setDetailId,
  ] = useState(null);


  const [
    checkinId,
    setCheckinId,
  ] = useState(null);


  const [
    checkoutId,
    setCheckoutId,
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


  function getAssignment(
    reservationId
  ) {
    return roomAssignments.find(
      (assignment) =>
        assignment.reservationId ===
        reservationId
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


  function getAssignedRoom(
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


  /*
   * Khi dữ liệu demo cũ chưa cập nhật
   * occupancyStatus, Checked In reservation
   * vẫn được xem là Occupied.
   */
  function getEffectiveOccupancy(
    room
  ) {
    if (
      !room
    ) {
      return "Vacant";
    }


    const checkedInAssignment =
      roomAssignments.find(
        (assignment) =>
          assignment.physicalRoomId ===
            room.id &&
          reservations.some(
            (reservation) =>
              reservation.id ===
                assignment.reservationId &&
              reservation.status ===
                "Checked In"
          )
      );


    if (
      checkedInAssignment
    ) {
      return "Occupied";
    }


    return (
      room.occupancyStatus ||
      "Vacant"
    );
  }


  /* ===================================================
     OUTSTANDING BALANCE
  =================================================== */

  function getOutstandingBalance(
    reservation
  ) {
    /*
     * Step 13 Folio + Step 14 Payment
     * sẽ tính giá trị này đầy đủ hơn.
     *
     * Hiện tại Front Desk đọc field
     * outstandingBalance nếu có.
     */
    return Math.max(
      Number(
        reservation
          ?.outstandingBalance ||
          0
      ),
      0
    );
  }


  /* ===================================================
     FRONT DESK GROUPS
  =================================================== */

  const todaysArrivals =
    useMemo(
      () =>
        reservations.filter(
          (reservation) =>
            reservation.checkin ===
              today &&
            [
              "Pending",
              "Confirmed",
            ].includes(
              reservation.status
            )
        ),
      [
        reservations,
        today,
      ]
    );


  const inHouse =
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


  const todaysDepartures =
    useMemo(
      () =>
        reservations.filter(
          (reservation) =>
            reservation.checkout ===
              today &&
            ![
              "Cancelled",
              "No-show",
            ].includes(
              reservation.status
            )
        ),
      [
        reservations,
        today,
      ]
    );


  /* ===================================================
     FILTER
  =================================================== */

  function filterReservations(
    list
  ) {
    const q =
      search
        .trim()
        .toLowerCase();


    return list.filter(
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


        const room =
          getAssignedRoom(
            reservation.id
          );


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
    );
  }


  const visibleReservations =
    useMemo(
      () => {
        if (
          activeView ===
          "in-house"
        ) {
          return filterReservations(
            inHouse
          );
        }


        if (
          activeView ===
          "departures"
        ) {
          return filterReservations(
            todaysDepartures
          );
        }


        return filterReservations(
          todaysArrivals
        );
      },
      [
        activeView,
        todaysArrivals,
        inHouse,
        todaysDepartures,
        search,
        propertyFilter,
        guests,
        properties,
        roomTypes,
        physicalRooms,
        roomAssignments,
      ]
    );


  /* ===================================================
     CHECK-IN VALIDATION
  =================================================== */

  function validateCheckin(
    reservation
  ) {
    if (
      !reservation
    ) {
      return {
        ok: false,

        message:
          "Không tìm thấy Reservation.",
      };
    }


    if (
      ![
        "Pending",
        "Confirmed",
      ].includes(
        reservation.status
      )
    ) {
      return {
        ok: false,

        message:
          `Reservation đang ở trạng thái ${reservation.status}.`,
      };
    }


    const assignment =
      getAssignment(
        reservation.id
      );


    if (
      !assignment
    ) {
      return {
        ok: false,

        message:
          "Reservation chưa được gán Physical Room. Vui lòng thực hiện Room Assignment trước.",
      };
    }


    const room =
      getPhysicalRoom(
        assignment.physicalRoomId
      );


    if (
      !room
    ) {
      return {
        ok: false,

        message:
          "Không tìm thấy Physical Room đã được gán.",
      };
    }


    if (
      room.status !==
      "Active"
    ) {
      return {
        ok: false,

        message:
          `Room ${room.roomNumber} hiện đang ${room.status}. Không thể Check-in.`,
      };
    }


    if (
      !isRoomClean(
        room
      )
    ) {
      return {
        ok: false,

        message:
          `Room ${room.roomNumber} chưa sẵn sàng. Housekeeping hiện tại: ${room.housekeepingStatus}.`,
      };
    }


    /*
     * Kiểm tra có Reservation khác
     * đang Checked In tại cùng phòng.
     */
    const occupiedByAnotherGuest =
      roomAssignments.find(
        (item) =>
          item.physicalRoomId ===
            room.id &&
          item.reservationId !==
            reservation.id &&
          reservations.some(
            (otherReservation) =>
              otherReservation.id ===
                item.reservationId &&
              otherReservation.status ===
                "Checked In"
          )
      );


    if (
      occupiedByAnotherGuest
    ) {
      const otherReservation =
        reservations.find(
          (item) =>
            item.id ===
            occupiedByAnotherGuest
              .reservationId
        );


      return {
        ok: false,

        message:
          `Room ${room.roomNumber} đang có khách khác lưu trú${
            otherReservation
              ? ` (${otherReservation.reservationCode})`
              : ""
          }.`,
      };
    }


    const effectiveOccupancy =
      getEffectiveOccupancy(
        room
      );


    if (
      effectiveOccupancy ===
        "Occupied"
    ) {
      const currentAssignment =
        getAssignment(
          reservation.id
        );


      if (
        !currentAssignment
      ) {
        return {
          ok: false,

          message:
            `Room ${room.roomNumber} đang Occupied.`,
        };
      }
    }


    return {
      ok: true,

      room,
      assignment,
    };
  }


  /* ===================================================
     CHECK-IN
  =================================================== */

  function confirmCheckin() {
    const reservation =
      reservations.find(
        (item) =>
          item.id ===
          checkinId
      );


    const validation =
      validateCheckin(
        reservation
      );


    if (
      !validation.ok
    ) {
      alert(
        validation.message
      );

      return;
    }


    const {
      room,
    } =
      validation;


    const actionTime =
      nowText();


    const nextReservations =
      reservations.map(
        (item) =>
          item.id ===
          reservation.id
            ? {
                ...item,

                status:
                  "Checked In",

                checkedInAt:
                  actionTime,

                updatedAt:
                  actionTime,

                logs: [
                  `${actionTime} — Guest Checked In tại Room ${room.roomNumber}`,

                  ...(
                    item.logs ||
                    []
                  ),
                ],
              }
            : item
      );


    const nextPhysicalRooms =
      physicalRooms.map(
        (item) =>
          item.id ===
          room.id
            ? {
                ...item,

                occupancyStatus:
                  "Occupied",

                updatedAt:
                  actionTime,

                logs: [
                  `${actionTime} — Room chuyển sang Occupied sau Check-in`,

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

        reservations:
          nextReservations,

        physicalRooms:
          nextPhysicalRooms,
      })
    );


    setCheckinId(
      null
    );
  }


  /* ===================================================
     CHECK-OUT VALIDATION
  =================================================== */

  function validateCheckout(
    reservation
  ) {
    if (
      !reservation
    ) {
      return {
        ok: false,

        message:
          "Không tìm thấy Reservation.",
      };
    }


    if (
      reservation.status !==
      "Checked In"
    ) {
      return {
        ok: false,

        message:
          "Chỉ Reservation đang Checked In mới được Check-out.",
      };
    }


    const outstanding =
      getOutstandingBalance(
        reservation
      );


    if (
      outstanding >
      0
    ) {
      return {
        ok: false,

        message:
          `Khách còn công nợ ${money(
            outstanding
          )}. Vui lòng thanh toán trước khi Check-out.`,
      };
    }


    const assignment =
      getAssignment(
        reservation.id
      );


    const room =
      assignment
        ? getPhysicalRoom(
            assignment.physicalRoomId
          )
        : null;


    return {
      ok: true,

      assignment,

      room,
    };
  }


  /* ===================================================
     CHECK-OUT
  =================================================== */

  function confirmCheckout() {
    const reservation =
      reservations.find(
        (item) =>
          item.id ===
          checkoutId
      );


    const validation =
      validateCheckout(
        reservation
      );


    if (
      !validation.ok
    ) {
      alert(
        validation.message
      );

      return;
    }


    const {
      room,
    } =
      validation;


    const actionTime =
      nowText();


    const nextReservations =
      reservations.map(
        (item) =>
          item.id ===
          reservation.id
            ? {
                ...item,

                status:
                  "Checked Out",

                checkedOutAt:
                  actionTime,

                updatedAt:
                  actionTime,

                logs: [
                  `${actionTime} — Guest Checked Out${
                    room
                      ? ` khỏi Room ${room.roomNumber}`
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


    /*
     * Sau Check-out:
     *
     * Room → Vacant / Available
     * Housekeeping → Dirty
     */
    const nextPhysicalRooms =
      room
        ? physicalRooms.map(
            (item) =>
              item.id ===
              room.id
                ? {
                    ...item,

                    occupancyStatus:
                      "Vacant",

                    housekeepingStatus:
                      "Dirty",

                    updatedAt:
                      actionTime,

                    logs: [
                      `${actionTime} — Check-out: Room chuyển Vacant + Dirty`,

                      ...(
                        item.logs ||
                        []
                      ),
                    ],
                  }
                : item
          )
        : physicalRooms;


    setData(
      (current) => ({
        ...current,

        reservations:
          nextReservations,

        physicalRooms:
          nextPhysicalRooms,
      })
    );


    setCheckoutId(
      null
    );
  }


  /* ===================================================
     DETAILS
  =================================================== */

  const detailReservation =
    reservations.find(
      (reservation) =>
        reservation.id ===
        detailId
    );


  const checkinReservation =
    reservations.find(
      (reservation) =>
        reservation.id ===
        checkinId
    );


  const checkoutReservation =
    reservations.find(
      (reservation) =>
        reservation.id ===
        checkoutId
    );


  const checkinValidation =
    checkinReservation
      ? validateCheckin(
          checkinReservation
        )
      : null;


  const checkoutValidation =
    checkoutReservation
      ? validateCheckout(
          checkoutReservation
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
            BƯỚC 10 — FRONT DESK
          </div>


          <h1>
            Lễ tân{" "}
            <span className="heading-en">
              (Front Desk)
            </span>
          </h1>


          <p>
            Quản lý khách đến, khách đang lưu trú,
            khách trả phòng và thực hiện Check-in /
            Check-out theo trạng thái vận hành thực tế.
          </p>

        </div>


        <div className="front-desk-date">

          <CalendarDays
            size={17}
          />


          <div>

            <span>
              BUSINESS DATE
            </span>

            <strong>
              {
                formatDate(
                  today
                )
              }
            </strong>

          </div>

        </div>

      </div>


      {/* =================================================
          EXPLAIN
      ================================================= */}

      <section className="explain-card">

        <div className="explain-icon">

          <Hotel
            size={21}
          />

        </div>


        <div>

          <strong>
            Front Desk là màn hình vận hành hằng ngày của lễ tân
          </strong>


          <p>
            Tại đây nhân viên biết khách nào đến hôm nay,
            khách nào đang ở và khách nào phải trả phòng,
            đồng thời kiểm tra điều kiện trước Check-in và
            Check-out.
          </p>


          <div className="front-desk-flow">

            <span>
              Arrival
            </span>

            <b>→</b>

            <span>
              Check-in
            </span>

            <b>→</b>

            <span>
              In House
            </span>

            <b>→</b>

            <span>
              Check-out
            </span>

            <b>→</b>

            <span>
              Room Dirty
            </span>

          </div>

        </div>

      </section>


      {/* =================================================
          METRICS
      ================================================= */}

      <div className="metric-grid">

        <Metric
          label="Today's Arrivals"
          value={
            todaysArrivals.length
          }
        />


        <Metric
          label="In House"
          value={
            inHouse.length
          }
        />


        <Metric
          label="Today's Departures"
          value={
            todaysDepartures.length
          }
        />


        <Metric
          label="Outstanding Balance"
          value={
            inHouse.filter(
              (reservation) =>
                getOutstandingBalance(
                  reservation
                ) > 0
            ).length
          }
        />

      </div>


      {/* =================================================
          TABS
      ================================================= */}

      <section className="panel">

        <div className="front-desk-tabs">

          <button
            type="button"

            className={
              activeView ===
              "arrivals"
                ? "active"
                : ""
            }

            onClick={
              () =>
                setActiveView(
                  "arrivals"
                )
            }
          >
            <LogIn
              size={16}
            />

            Today's Arrivals

            <span>
              {
                todaysArrivals.length
              }
            </span>
          </button>


          <button
            type="button"

            className={
              activeView ===
              "in-house"
                ? "active"
                : ""
            }

            onClick={
              () =>
                setActiveView(
                  "in-house"
                )
            }
          >
            <KeyRound
              size={16}
            />

            In House

            <span>
              {
                inHouse.length
              }
            </span>
          </button>


          <button
            type="button"

            className={
              activeView ===
              "departures"
                ? "active"
                : ""
            }

            onClick={
              () =>
                setActiveView(
                  "departures"
                )
            }
          >
            <LogOut
              size={16}
            />

            Today's Departures

            <span>
              {
                todaysDepartures.length
              }
            </span>
          </button>

        </div>


        {/* =================================================
            FILTER
        ================================================= */}

        <div className="front-desk-toolbar">

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


        {/* =================================================
            TABLE
        ================================================= */}

        <div className="table-wrap">

          <table className="data-table front-desk-table">

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
                  Room Status
                </th>

                <th>
                  Balance
                </th>

                <th className="text-right">
                  Thao tác
                </th>

              </tr>

            </thead>


            <tbody>

              {
                visibleReservations.map(
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


                    const room =
                      getAssignedRoom(
                        reservation.id
                      );


                    const occupancy =
                      getEffectiveOccupancy(
                        room
                      );


                    const outstanding =
                      getOutstandingBalance(
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
                            room
                              ? (
                                <div className="front-desk-room-cell">

                                  <span>
                                    {
                                      room.roomNumber
                                    }
                                  </span>


                                  <div>

                                    <strong>
                                      Room{" "}
                                      {
                                        room.roomNumber
                                      }
                                    </strong>


                                    <small>
                                      Tầng{" "}
                                      {
                                        room.floor ||
                                        "—"
                                      }
                                    </small>

                                  </div>

                                </div>
                              )
                              : (
                                <span className="status-badge status-warning">
                                  Chưa gán
                                </span>
                              )
                          }

                        </td>


                        <td>

                          {
                            room
                              ? (
                                <div className="front-desk-room-status">

                                  <HousekeepingBadge
                                    status={
                                      room.housekeepingStatus
                                    }
                                  />


                                  <OccupancyBadge
                                    status={
                                      occupancy
                                    }
                                  />

                                </div>
                              )
                              : "—"
                          }

                        </td>


                        <td>

                          <span
                            className={
                              outstanding >
                              0
                                ? "front-desk-balance due"
                                : "front-desk-balance paid"
                            }
                          >
                            {
                              money(
                                outstanding
                              )
                            }
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


                            {
                              [
                                "Pending",
                                "Confirmed",
                              ].includes(
                                reservation.status
                              ) && (

                                <button
                                  className="button button-dark button-sm"

                                  onClick={
                                    () =>
                                      setCheckinId(
                                        reservation.id
                                      )
                                  }
                                >
                                  <LogIn
                                    size={14}
                                  />

                                  Check-in
                                </button>

                              )
                            }


                            {
                              reservation.status ===
                                "Checked In" && (

                                <button
                                  className="button button-light button-sm"

                                  onClick={
                                    () =>
                                      setCheckoutId(
                                        reservation.id
                                      )
                                  }
                                >
                                  <LogOut
                                    size={14}
                                  />

                                  Check-out
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
            visibleReservations.length ===
              0 && (

              <div className="empty-state">

                <CalendarCheck2
                  size={38}
                />


                <strong>
                  Không có dữ liệu
                </strong>


                <span>
                  Không có Reservation phù hợp cho màn hình này.
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
          Front Desk kiểm tra gì?
        </h2>


        <div className="business-grid">

          <BusinessItem
            number="01"

            icon={
              <LogIn
                size={18}
              />
            }

            title="Check-in"

            text="Reservation phải được gán Physical Room, phòng Active, sạch và không có khách khác đang ở."
          />


          <BusinessItem
            number="02"

            icon={
              <KeyRound
                size={18}
              />
            }

            title="In House"

            text="Sau Check-in, Reservation chuyển Checked In và Physical Room chuyển Occupied."
          />


          <BusinessItem
            number="03"

            icon={
              <WalletCards
                size={18}
              />
            }

            title="Outstanding Balance"

            text="PMS không cho Check-out nếu Reservation còn công nợ chưa thanh toán."
          />


          <BusinessItem
            number="04"

            icon={
              <DoorOpen
                size={18}
              />
            }

            title="Check-out"

            text="Sau Check-out, Reservation chuyển Checked Out, Room về Vacant và Housekeeping chuyển Dirty."
          />

        </div>

      </section>


      {/* =================================================
          CHECK-IN MODAL
      ================================================= */}

      <Modal
        open={
          Boolean(
            checkinReservation
          )
        }

        title="Check-in khách"

        subtitle="FRONT DESK — CHECK-IN"

        onClose={
          () =>
            setCheckinId(
              null
            )
        }

        footer={
          <>

            <button
              className="button button-light"

              onClick={
                () =>
                  setCheckinId(
                    null
                  )
              }
            >
              Đóng
            </button>


            <button
              className="button button-dark"

              disabled={
                !checkinValidation
                  ?.ok
              }

              onClick={
                confirmCheckin
              }
            >
              <LogIn
                size={16}
              />

              Xác nhận Check-in
            </button>

          </>
        }
      >

        {
          checkinReservation && (

            <CheckinPanel
              reservation={
                checkinReservation
              }

              guest={
                getGuest(
                  checkinReservation.guestId
                )
              }

              property={
                getProperty(
                  checkinReservation.propertyId
                )
              }

              roomType={
                getRoomType(
                  checkinReservation.roomTypeId
                )
              }

              room={
                getAssignedRoom(
                  checkinReservation.id
                )
              }

              validation={
                checkinValidation
              }

              occupancy={
                getEffectiveOccupancy(
                  getAssignedRoom(
                    checkinReservation.id
                  )
                )
              }
            />

          )
        }

      </Modal>


      {/* =================================================
          CHECK-OUT MODAL
      ================================================= */}

      <Modal
        open={
          Boolean(
            checkoutReservation
          )
        }

        title="Check-out khách"

        subtitle="FRONT DESK — CHECK-OUT"

        onClose={
          () =>
            setCheckoutId(
              null
            )
        }

        footer={
          <>

            <button
              className="button button-light"

              onClick={
                () =>
                  setCheckoutId(
                    null
                  )
              }
            >
              Đóng
            </button>


            <button
              className="button button-dark"

              disabled={
                !checkoutValidation
                  ?.ok
              }

              onClick={
                confirmCheckout
              }
            >
              <LogOut
                size={16}
              />

              Xác nhận Check-out
            </button>

          </>
        }
      >

        {
          checkoutReservation && (

            <CheckoutPanel
              reservation={
                checkoutReservation
              }

              guest={
                getGuest(
                  checkoutReservation.guestId
                )
              }

              room={
                getAssignedRoom(
                  checkoutReservation.id
                )
              }

              outstanding={
                getOutstandingBalance(
                  checkoutReservation
                )
              }

              validation={
                checkoutValidation
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

        subtitle="FRONT DESK DETAIL"

        onClose={
          () =>
            setDetailId(
              null
            )
        }
      >

        {
          detailReservation && (

            <FrontDeskDetail
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

              room={
                getAssignedRoom(
                  detailReservation.id
                )
              }

              occupancy={
                getEffectiveOccupancy(
                  getAssignedRoom(
                    detailReservation.id
                  )
                )
              }

              outstanding={
                getOutstandingBalance(
                  detailReservation
                )
              }

              onCheckin={
                () => {
                  setDetailId(
                    null
                  );


                  setCheckinId(
                    detailReservation.id
                  );
                }
              }

              onCheckout={
                () => {
                  setDetailId(
                    null
                  );


                  setCheckoutId(
                    detailReservation.id
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
   CHECK-IN PANEL
===================================================== */

function CheckinPanel({
  reservation,
  guest,
  property,
  roomType,
  room,
  validation,
  occupancy,
}) {
  const checks = [
    {
      label:
        "Room Assignment",

      ok:
        Boolean(
          room
        ),

      text:
        room
          ? `Room ${room.roomNumber}`
          : "Chưa gán Physical Room",
    },

    {
      label:
        "Room Operational Status",

      ok:
        room?.status ===
        "Active",

      text:
        room?.status ||
        "Không có phòng",
    },

    {
      label:
        "Housekeeping",

      ok:
        isRoomClean(
          room
        ),

      text:
        room?.housekeepingStatus ||
        "Không có phòng",
    },

    {
      label:
        "Occupancy",

      ok:
        occupancy !==
        "Occupied",

      text:
        occupancy ||
        "Vacant",
    },
  ];


  return (
    <>
      <div className="front-desk-guest-card">

        <div className="front-desk-guest-icon">

          <UserRound
            size={22}
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


      <div className="front-desk-check-summary">

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


      <div className="form-section-title">
        Pre Check-in Validation
      </div>


      <div className="front-desk-validation-list">

        {
          checks.map(
            (check) => (

              <div
                key={
                  check.label
                }

                className={
                  check.ok
                    ? "valid"
                    : "invalid"
                }
              >

                <span className="front-desk-validation-icon">

                  {
                    check.ok
                      ? (
                        <CheckCircle2
                          size={16}
                        />
                      )
                      : (
                        <Clock3
                          size={16}
                        />
                      )
                  }

                </span>


                <div>

                  <strong>
                    {
                      check.label
                    }
                  </strong>


                  <span>
                    {
                      check.text
                    }
                  </span>

                </div>

              </div>

            )
          )
        }

      </div>


      <div
        className={`front-desk-result ${
          validation?.ok
            ? "success"
            : "danger"
        }`}
      >

        <strong>
          {
            validation?.ok
              ? "Sẵn sàng Check-in"
              : "Chưa thể Check-in"
          }
        </strong>


        <p>
          {
            validation?.ok
              ? "Các điều kiện Front Desk đã đạt. Khi xác nhận, Reservation sẽ chuyển Checked In và Room chuyển Occupied."
              : validation?.message
          }
        </p>

      </div>

    </>
  );
}


/* =====================================================
   CHECK-OUT PANEL
===================================================== */

function CheckoutPanel({
  reservation,
  guest,
  room,
  outstanding,
  validation,
}) {
  return (
    <>
      <div className="front-desk-guest-card">

        <div className="front-desk-guest-icon">

          <LogOut
            size={22}
          />

        </div>


        <div>

          <span>
            CHECK-OUT
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


      <div className="front-desk-check-summary">

        <Detail
          label="Physical Room"
          value={
            room
              ? `Room ${room.roomNumber}`
              : "—"
          }
        />


        <Detail
          label="Departure"
          value={
            formatDate(
              reservation.checkout
            )
          }
        />


        <Detail
          label="Outstanding Balance"
          value={
            money(
              outstanding
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


      <div
        className={`front-desk-result ${
          validation?.ok
            ? "success"
            : "danger"
        }`}
      >

        <strong>
          {
            validation?.ok
              ? "Sẵn sàng Check-out"
              : "Không thể Check-out"
          }
        </strong>


        <p>
          {
            validation?.ok
              ? "Sau Check-out, Reservation chuyển Checked Out. Physical Room trở về Vacant và Housekeeping chuyển Dirty."
              : validation?.message
          }
        </p>

      </div>


      <div className="info-note roomtype-note">

        <strong>
          Outstanding Balance Check
        </strong>


        <p>
          Hiện Front Desk đã có logic chặn Check-out khi
          outstandingBalance lớn hơn 0. Step 13 Folio và
          Step 14 Payment sẽ kết nối công nợ thực tế vào
          kiểm tra này.
        </p>

      </div>

    </>
  );
}


/* =====================================================
   DETAIL
===================================================== */

function FrontDeskDetail({
  reservation,
  guest,
  property,
  roomType,
  room,
  occupancy,
  outstanding,
  onCheckin,
  onCheckout,
}) {
  return (
    <>
      <div className="front-desk-detail-hero">

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


        <ReservationStatusBadge
          status={
            reservation.status
          }
        />

      </div>


      <div className="detail-section-title">
        Guest
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
          label="Phone"
          value={
            guest?.phone ||
            "—"
          }
        />


        <Detail
          label="Email"
          value={
            guest?.email ||
            "—"
          }
        />

      </div>


      <div className="detail-section-title">
        Stay
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
        Physical Room
      </div>


      {
        room
          ? (
            <div className="front-desk-room-detail">

              <div className="front-desk-room-number">
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
                  Tầng{" "}
                  {
                    room.floor ||
                    "—"
                  }
                </p>

              </div>


              <div className="front-desk-room-detail-status">

                <HousekeepingBadge
                  status={
                    room.housekeepingStatus
                  }
                />


                <OccupancyBadge
                  status={
                    occupancy
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
                Chưa gán Physical Room
              </strong>


              <span>
                Hãy thực hiện Room Assignment trước Check-in.
              </span>

            </div>
          )
      }


      <div className="detail-section-title">
        Balance
      </div>


      <div className="front-desk-balance-card">

        <div>

          <WalletCards
            size={19}
          />


          <span>
            Outstanding Balance
          </span>

        </div>


        <strong
          className={
            outstanding >
            0
              ? "due"
              : "paid"
          }
        >
          {
            money(
              outstanding
            )
          }
        </strong>

      </div>


      <div className="detail-section-title">
        Front Desk History
      </div>


      <div className="timeline">

        {
          (
            reservation.logs ||
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

        {
          [
            "Pending",
            "Confirmed",
          ].includes(
            reservation.status
          ) && (

            <button
              className="button button-dark"

              onClick={
                onCheckin
              }
            >
              <LogIn
                size={16}
              />

              Check-in
            </button>

          )
        }


        {
          reservation.status ===
            "Checked In" && (

            <button
              className="button button-dark"

              onClick={
                onCheckout
              }
            >
              <LogOut
                size={16}
              />

              Check-out
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