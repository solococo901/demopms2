"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowRight,
  BedDouble,
  CalendarCheck2,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Clock3,
  DoorOpen,
  Hotel,
  Sparkles,
  UserCheck,
  Users,
  WalletCards,
} from "lucide-react";

import {
  usePms,
} from "@/context/PmsContext";


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


function normalizeStatus(
  value
) {
  return String(
    value ||
    ""
  )
    .trim()
    .toLowerCase();
}


/* =====================================================
   MAIN
===================================================== */

export default function DashboardManager() {
  const {
    data,
    ready,
  } = usePms();


  const properties =
    data.properties || [];

  const reservations =
    data.reservations || [];

  const guests =
    data.guests || [];

  const roomTypes =
    data.roomTypes || [];

  const physicalRooms =
    data.physicalRooms || [];

  const roomAssignments =
    data.roomAssignments || [];

  const folios =
    data.folios || [];

  const payments =
    data.payments || [];

  const refunds =
    data.refunds || [];


  const today =
    todayIso();


  const [
    propertyFilter,
    setPropertyFilter,
  ] = useState("");


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


  function getGuest(
    guestId
  ) {
    return guests.find(
      (guest) =>
        guest.id ===
        guestId
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


  /* ===================================================
     PROPERTY SCOPE
  =================================================== */

  const scopedReservations =
    useMemo(
      () =>
        reservations.filter(
          (reservation) =>
            !propertyFilter ||
            reservation.propertyId ===
              propertyFilter
        ),
      [
        reservations,
        propertyFilter,
      ]
    );


  const scopedRooms =
    useMemo(
      () =>
        physicalRooms.filter(
          (room) =>
            !propertyFilter ||
            room.propertyId ===
              propertyFilter
        ),
      [
        physicalRooms,
        propertyFilter,
      ]
    );


  /* ===================================================
     ARRIVALS

     Confirmed / Pending
     check-in = hôm nay
  =================================================== */

  const arrivals =
    useMemo(
      () =>
        scopedReservations.filter(
          (reservation) => {
            const status =
              normalizeStatus(
                reservation.status
              );


            return (
              reservation.checkin ===
                today &&
              [
                "confirmed",
                "pending",
              ].includes(
                status
              )
            );
          }
        ),
      [
        scopedReservations,
        today,
      ]
    );


  /* ===================================================
     DEPARTURES

     Checked In
     checkout = hôm nay
  =================================================== */

  const departures =
    useMemo(
      () =>
        scopedReservations.filter(
          (reservation) =>
            reservation.checkout ===
              today &&
            normalizeStatus(
              reservation.status
            ) ===
              "checked in"
        ),
      [
        scopedReservations,
        today,
      ]
    );


  /* ===================================================
     IN HOUSE
  =================================================== */

  const inHouse =
    useMemo(
      () =>
        scopedReservations.filter(
          (reservation) =>
            normalizeStatus(
              reservation.status
            ) ===
            "checked in"
        ),
      [
        scopedReservations,
      ]
    );


  /* ===================================================
     OCCUPIED ROOMS
  =================================================== */

  const occupiedRooms =
    useMemo(
      () =>
        scopedRooms.filter(
          (room) =>
            normalizeStatus(
              room.occupancyStatus
            ) ===
            "occupied"
        ),
      [
        scopedRooms,
      ]
    );


  /* ===================================================
     DIRTY ROOMS
  =================================================== */

  const dirtyRooms =
    useMemo(
      () =>
        scopedRooms.filter(
          (room) =>
            normalizeStatus(
              room.housekeepingStatus
            ) ===
            "dirty"
        ),
      [
        scopedRooms,
      ]
    );


  /* ===================================================
     CLEANING ROOMS
  =================================================== */

  const cleaningRooms =
    useMemo(
      () =>
        scopedRooms.filter(
          (room) =>
            normalizeStatus(
              room.housekeepingStatus
            ) ===
            "cleaning"
        ),
      [
        scopedRooms,
      ]
    );


  /* ===================================================
     READY ROOMS
  =================================================== */

  const readyRooms =
    useMemo(
      () =>
        scopedRooms.filter(
          (room) =>
            [
              "clean",
              "inspected",
            ].includes(
              normalizeStatus(
                room.housekeepingStatus
              )
            ) &&
            normalizeStatus(
              room.occupancyStatus
            ) ===
              "vacant" &&
            normalizeStatus(
              room.status
            ) ===
              "active"
        ),
      [
        scopedRooms,
      ]
    );


  /* ===================================================
     OUTSTANDING RESERVATIONS
  =================================================== */

  const outstandingReservations =
    useMemo(
      () =>
        scopedReservations
          .filter(
            (reservation) =>
              ![
                "cancelled",
                "no-show",
              ].includes(
                normalizeStatus(
                  reservation.status
                )
              ) &&
              Number(
                reservation.outstandingBalance ||
                0
              ) >
                0
          )
          .sort(
            (
              a,
              b
            ) =>
              Number(
                b.outstandingBalance ||
                0
              ) -
              Number(
                a.outstandingBalance ||
                0
              )
          ),
      [
        scopedReservations,
      ]
    );


  const outstandingTotal =
    useMemo(
      () =>
        outstandingReservations.reduce(
          (
            total,
            reservation
          ) =>
            total +
            Number(
              reservation.outstandingBalance ||
              0
            ),
          0
        ),
      [
        outstandingReservations,
      ]
    );


  /* ===================================================
     ACTIVE ROOM COUNT
  =================================================== */

  const activeRooms =
    useMemo(
      () =>
        scopedRooms.filter(
          (room) =>
            normalizeStatus(
              room.status
            ) ===
            "active"
        ),
      [
        scopedRooms,
      ]
    );


  /* ===================================================
     OCCUPANCY %
  =================================================== */

  const occupancyRate =
    activeRooms.length >
    0
      ? Math.round(
          (
            occupiedRooms.length /
            activeRooms.length
          ) *
            100
        )
      : 0;


  /* ===================================================
     TODAY RESERVATION FLOW
  =================================================== */

  const checkedOutToday =
    useMemo(
      () =>
        scopedReservations.filter(
          (reservation) =>
            reservation.checkout ===
              today &&
            normalizeStatus(
              reservation.status
            ) ===
              "checked out"
        ),
      [
        scopedReservations,
        today,
      ]
    );


  const noShowsToday =
    useMemo(
      () =>
        scopedReservations.filter(
          (reservation) =>
            normalizeStatus(
              reservation.status
            ) ===
              "no-show" &&
            (
              reservation.noShowAt
                ? String(
                    reservation.noShowAt
                  ).includes(
                    formatDate(
                      today
                    )
                  )
                : reservation.checkin ===
                  today
            )
        ),
      [
        scopedReservations,
        today,
      ]
    );


  /* ===================================================
     FINANCIAL SUMMARY
  =================================================== */

  const financialSummary =
    useMemo(
      () => {
        const scopedReservationIds =
          new Set(
            scopedReservations.map(
              (reservation) =>
                reservation.id
            )
          );


        const scopedFolios =
          folios.filter(
            (folio) =>
              scopedReservationIds.has(
                folio.reservationId
              )
          );


        const totalCharges =
          scopedFolios.reduce(
            (
              total,
              folio
            ) =>
              total +
              (
                folio.charges ||
                []
              )
                .filter(
                  (charge) =>
                    charge.status !==
                    "Voided"
                )
                .reduce(
                  (
                    sum,
                    charge
                  ) =>
                    sum +
                    Number(
                      charge.amount ||
                      0
                    ),
                  0
                ),
            0
          );


        const grossPaid =
          payments
            .filter(
              (payment) =>
                scopedReservationIds.has(
                  payment.reservationId
                ) &&
                payment.status !==
                  "Voided"
            )
            .reduce(
              (
                total,
                payment
              ) =>
                total +
                Number(
                  payment.amount ||
                  0
                ),
              0
            );


        const refunded =
          refunds
            .filter(
              (refund) =>
                scopedReservationIds.has(
                  refund.reservationId
                ) &&
                ![
                  "Voided",
                  "Cancelled",
                ].includes(
                  refund.status
                )
            )
            .reduce(
              (
                total,
                refund
              ) =>
                total +
                Number(
                  refund.amount ||
                  0
                ),
              0
            );


        return {
          totalCharges,

          grossPaid,

          refunded,

          netPaid:
            Math.max(
              grossPaid -
                refunded,
              0
            ),
        };
      },
      [
        scopedReservations,
        folios,
        payments,
        refunds,
      ]
    );


  /* ===================================================
     NEXT ARRIVALS
  =================================================== */

  const upcomingReservations =
    useMemo(
      () =>
        scopedReservations
          .filter(
            (reservation) =>
              reservation.checkin >
                today &&
              [
                "confirmed",
                "pending",
              ].includes(
                normalizeStatus(
                  reservation.status
                )
              )
          )
          .sort(
            (
              a,
              b
            ) =>
              a.checkin.localeCompare(
                b.checkin
              )
          )
          .slice(
            0,
            5
          ),
      [
        scopedReservations,
        today,
      ]
    );


  /* ===================================================
     LOADING
  =================================================== */

  if (
    !ready
  ) {
    return (
      <div className="panel loading-panel">
        Đang tải Dashboard...
      </div>
    );
  }


  return (
    <>
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="page-header dashboard-page-header">

        <div>

          <div className="eyebrow">
            BƯỚC 18 — OPERATIONS DASHBOARD
          </div>


          <h1>
            Dashboard{" "}
            <span className="heading-en">
              / Tổng quan vận hành
            </span>
          </h1>


          <p>
            Theo dõi nhanh tình trạng khách đến, khách đi,
            phòng đang sử dụng, Housekeeping và công nợ.
          </p>

        </div>


        <div className="dashboard-date-box">

          <CalendarDays
            size={18}
          />


          <div>

            <span>
              Hôm nay
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
          PROPERTY FILTER
      ================================================= */}

      <section className="dashboard-filter-bar">

        <div>

          <span>
            Property
          </span>


          <strong>
            {
              propertyFilter
                ? getProperty(
                    propertyFilter
                  )?.name
                : "Tất cả khách sạn"
            }
          </strong>

        </div>


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

      </section>


      {/* =================================================
          MAIN METRICS
      ================================================= */}

      <div className="dashboard-metric-grid">

        <DashboardMetric
          icon={
            <CalendarCheck2
              size={20}
            />
          }

          label="Today's Arrivals"

          value={
            arrivals.length
          }

          description="Khách dự kiến nhận phòng hôm nay"

          type="arrival"
        />


        <DashboardMetric
          icon={
            <DoorOpen
              size={20}
            />
          }

          label="Today's Departures"

          value={
            departures.length
          }

          description="Khách cần trả phòng hôm nay"

          type="departure"
        />


        <DashboardMetric
          icon={
            <UserCheck
              size={20}
            />
          }

          label="In House"

          value={
            inHouse.length
          }

          description="Booking đang lưu trú"

          type="inhouse"
        />


        <DashboardMetric
          icon={
            <BedDouble
              size={20}
            />
          }

          label="Occupied Rooms"

          value={
            occupiedRooms.length
          }

          description={`${occupancyRate}% phòng Active đang có khách`}

          type="occupied"
        />


        <DashboardMetric
          icon={
            <Sparkles
              size={20}
            />
          }

          label="Dirty Rooms"

          value={
            dirtyRooms.length
          }

          description="Phòng đang chờ Housekeeping"

          type="dirty"
        />


        <DashboardMetric
          icon={
            <WalletCards
              size={20}
            />
          }

          label="Outstanding Balance"

          value={
            money(
              outstandingTotal
            )
          }

          description={`${outstandingReservations.length} booking còn công nợ`}

          type="outstanding"
        />

      </div>


      {/* =================================================
          TODAY OPERATIONS
      ================================================= */}

      <div className="dashboard-two-column">

        {/* ===============================================
            ARRIVALS
        =============================================== */}

        <section className="panel dashboard-panel">

          <div className="panel-header-row">

            <div>

              <div className="eyebrow">
                FRONT DESK
              </div>


              <h2>
                Today's Arrivals
              </h2>

            </div>


            <span className="dashboard-count-badge">
              {
                arrivals.length
              }
            </span>

          </div>


          {
            arrivals.length >
              0
              ? (
                <div className="dashboard-list">

                  {
                    arrivals.map(
                      (reservation) => {

                        const guest =
                          getGuest(
                            reservation.guestId
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
                            ? getPhysicalRoom(
                                assignment.physicalRoomId
                              )
                            : null;


                        return (
                          <DashboardReservationRow
                            key={
                              reservation.id
                            }

                            icon={
                              <Users
                                size={16}
                              />
                            }

                            reservation={
                              reservation
                            }

                            guest={
                              guest
                            }

                            roomType={
                              roomType
                            }

                            room={
                              room
                            }

                            right={
                              <ReservationStatus
                                status={
                                  reservation.status
                                }
                              />
                            }
                          />
                        );
                      }
                    )
                  }

                </div>
              )
              : (
                <DashboardEmpty
                  icon={
                    <CheckCircle2
                      size={28}
                    />
                  }

                  title="Không có khách đến hôm nay"

                  text="Không có Reservation Pending hoặc Confirmed có ngày Check-in hôm nay."
                />
              )
          }

        </section>


        {/* ===============================================
            DEPARTURES
        =============================================== */}

        <section className="panel dashboard-panel">

          <div className="panel-header-row">

            <div>

              <div className="eyebrow">
                FRONT DESK
              </div>


              <h2>
                Today's Departures
              </h2>

            </div>


            <span className="dashboard-count-badge">
              {
                departures.length
              }
            </span>

          </div>


          {
            departures.length >
              0
              ? (
                <div className="dashboard-list">

                  {
                    departures.map(
                      (reservation) => {

                        const guest =
                          getGuest(
                            reservation.guestId
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
                            ? getPhysicalRoom(
                                assignment.physicalRoomId
                              )
                            : null;


                        const balance =
                          Number(
                            reservation.outstandingBalance ||
                            0
                          );


                        return (
                          <DashboardReservationRow
                            key={
                              reservation.id
                            }

                            icon={
                              <DoorOpen
                                size={16}
                              />
                            }

                            reservation={
                              reservation
                            }

                            guest={
                              guest
                            }

                            roomType={
                              roomType
                            }

                            room={
                              room
                            }

                            right={
                              balance >
                                0
                                ? (
                                  <span className="status-badge status-danger">
                                    Còn{" "}
                                    {
                                      money(
                                        balance
                                      )
                                    }
                                  </span>
                                )
                                : (
                                  <span className="status-badge status-success">
                                    Ready Checkout
                                  </span>
                                )
                            }
                          />
                        );
                      }
                    )
                  }

                </div>
              )
              : (
                <DashboardEmpty
                  icon={
                    <CheckCircle2
                      size={28}
                    />
                  }

                  title="Không có khách trả phòng"

                  text="Không có booking Checked In có ngày Check-out hôm nay."
                />
              )
          }

        </section>

      </div>


      {/* =================================================
          ROOM STATUS
      ================================================= */}

      <section className="panel">

        <div className="panel-header-row">

          <div>

            <div className="eyebrow">
              ROOM OPERATIONS
            </div>


            <h2>
              Trạng thái phòng
            </h2>

          </div>


          <span className="status-badge status-neutral">
            {
              activeRooms.length
            }{" "}
            Active Rooms
          </span>

        </div>


        <div className="dashboard-room-grid">

          <RoomMetric
            icon={
              <BedDouble
                size={18}
              />
            }

            label="Occupied"

            value={
              occupiedRooms.length
            }

            description="Phòng đang có khách"
          />


          <RoomMetric
            icon={
              <Sparkles
                size={18}
              />
            }

            label="Ready"

            value={
              readyRooms.length
            }

            description="Vacant + Clean / Inspected"
          />


          <RoomMetric
            icon={
              <AlertCircle
                size={18}
              />
            }

            label="Dirty"

            value={
              dirtyRooms.length
            }

            description="Cần vệ sinh"
          />


          <RoomMetric
            icon={
              <Clock3
                size={18}
              />
            }

            label="Cleaning"

            value={
              cleaningRooms.length
            }

            description="Housekeeping đang xử lý"
          />

        </div>

      </section>


      {/* =================================================
          FINANCIAL + OUTSTANDING
      ================================================= */}

      <div className="dashboard-two-column">

        <section className="panel">

          <div className="panel-header-row">

            <div>

              <div className="eyebrow">
                FINANCIAL
              </div>


              <h2>
                Financial Snapshot
              </h2>

            </div>

          </div>


          <div className="dashboard-financial-list">

            <FinancialRow
              label="Folio Charges"

              value={
                money(
                  financialSummary.totalCharges
                )
              }
            />


            <FinancialRow
              label="Gross Paid"

              value={
                money(
                  financialSummary.grossPaid
                )
              }
            />


            <FinancialRow
              label="Refunded"

              value={
                money(
                  financialSummary.refunded
                )
              }
            />


            <FinancialRow
              label="Net Paid"

              value={
                money(
                  financialSummary.netPaid
                )
              }

              strong
            />


            <FinancialRow
              label="Outstanding"

              value={
                money(
                  outstandingTotal
                )
              }

              warning={
                outstandingTotal >
                0
              }
            />

          </div>

        </section>


        <section className="panel">

          <div className="panel-header-row">

            <div>

              <div className="eyebrow">
                CREDIT CONTROL
              </div>


              <h2>
                Outstanding Balance
              </h2>

            </div>


            <span className="dashboard-count-badge">
              {
                outstandingReservations.length
              }
            </span>

          </div>


          {
            outstandingReservations.length >
              0
              ? (
                <div className="dashboard-list">

                  {
                    outstandingReservations
                      .slice(
                        0,
                        5
                      )
                      .map(
                        (reservation) => {

                          const guest =
                            getGuest(
                              reservation.guestId
                            );


                          return (
                            <article
                              className="dashboard-outstanding-row"

                              key={
                                reservation.id
                              }
                            >

                              <div className="dashboard-outstanding-icon">

                                <WalletCards
                                  size={15}
                                />

                              </div>


                              <div className="dashboard-outstanding-content">

                                <strong>
                                  {
                                    guest?.fullName ||
                                    "Guest"
                                  }
                                </strong>


                                <span>
                                  {
                                    reservation.reservationCode
                                  }
                                  {" · "}
                                  {
                                    getProperty(
                                      reservation.propertyId
                                    )?.name ||
                                    "—"
                                  }
                                </span>

                              </div>


                              <strong className="dashboard-outstanding-value">
                                {
                                  money(
                                    reservation.outstandingBalance
                                  )
                                }
                              </strong>

                            </article>
                          );
                        }
                      )
                  }

                </div>
              )
              : (
                <DashboardEmpty
                  icon={
                    <CheckCircle2
                      size={28}
                    />
                  }

                  title="Không có công nợ"

                  text="Tất cả Reservation trong phạm vi đang chọn đều không còn Outstanding Balance."
                />
              )
          }

        </section>

      </div>


      {/* =================================================
          NEXT ARRIVALS
      ================================================= */}

      <section className="panel">

        <div className="panel-header-row">

          <div>

            <div className="eyebrow">
              UPCOMING
            </div>


            <h2>
              Upcoming Arrivals
            </h2>

          </div>


          <span className="status-badge status-neutral">
            Next 5
          </span>

        </div>


        {
          upcomingReservations.length >
            0
            ? (
              <div className="dashboard-upcoming-list">

                {
                  upcomingReservations.map(
                    (
                      reservation,
                      index
                    ) => {

                      const guest =
                        getGuest(
                          reservation.guestId
                        );


                      const roomType =
                        getRoomType(
                          reservation.roomTypeId
                        );


                      const property =
                        getProperty(
                          reservation.propertyId
                        );


                      return (
                        <article
                          className="dashboard-upcoming-row"

                          key={
                            reservation.id
                          }
                        >

                          <div className="dashboard-upcoming-order">
                            {
                              String(
                                index +
                                1
                              ).padStart(
                                2,
                                "0"
                              )
                            }
                          </div>


                          <div className="dashboard-upcoming-date">

                            <CalendarRange
                              size={15}
                            />


                            <div>

                              <span>
                                Check-in
                              </span>


                              <strong>
                                {
                                  formatDate(
                                    reservation.checkin
                                  )
                                }
                              </strong>

                            </div>

                          </div>


                          <div className="dashboard-upcoming-guest">

                            <strong>
                              {
                                guest?.fullName ||
                                "Guest"
                              }
                            </strong>


                            <span>
                              {
                                reservation.reservationCode
                              }
                            </span>

                          </div>


                          <div className="dashboard-upcoming-property">

                            <Hotel
                              size={14}
                            />


                            <span>
                              {
                                property?.name ||
                                "—"
                              }
                            </span>

                          </div>


                          <div className="dashboard-upcoming-room">
                            {
                              roomType?.name ||
                              "—"
                            }
                          </div>


                          <ReservationStatus
                            status={
                              reservation.status
                            }
                          />


                          <ArrowRight
                            size={15}
                            className="dashboard-upcoming-arrow"
                          />

                        </article>
                      );
                    }
                  )
                }

              </div>
            )
            : (
              <DashboardEmpty
                icon={
                  <CalendarCheck2
                    size={28}
                  />
                }

                title="Chưa có Upcoming Arrival"

                text="Không có Reservation Confirmed hoặc Pending sau ngày hôm nay."
              />
            )
        }

      </section>


      {/* =================================================
          TODAY SUMMARY
      ================================================= */}

      <section className="dashboard-today-summary">

        <div>

          <span>
            Arrivals
          </span>


          <strong>
            {
              arrivals.length
            }
          </strong>

        </div>


        <div>

          <span>
            Departures Pending
          </span>


          <strong>
            {
              departures.length
            }
          </strong>

        </div>


        <div>

          <span>
            Checked Out Today
          </span>


          <strong>
            {
              checkedOutToday.length
            }
          </strong>

        </div>


        <div>

          <span>
            No-show Today
          </span>


          <strong>
            {
              noShowsToday.length
            }
          </strong>

        </div>

      </section>

    </>
  );
}


/* =====================================================
   DASHBOARD METRIC
===================================================== */

function DashboardMetric({
  icon,
  label,
  value,
  description,
  type,
}) {
  return (
    <article
      className={`dashboard-metric-card dashboard-metric-${type}`}
    >

      <div className="dashboard-metric-top">

        <div className="dashboard-metric-icon">
          {icon}
        </div>


        <span>
          {label}
        </span>

      </div>


      <strong className="dashboard-metric-value">
        {value}
      </strong>


      <p>
        {description}
      </p>

    </article>
  );
}


/* =====================================================
   RESERVATION ROW
===================================================== */

function DashboardReservationRow({
  icon,
  reservation,
  guest,
  roomType,
  room,
  right,
}) {
  return (
    <article className="dashboard-reservation-row">

      <div className="dashboard-reservation-icon">
        {icon}
      </div>


      <div className="dashboard-reservation-main">

        <strong>
          {
            guest?.fullName ||
            "Guest"
          }
        </strong>


        <span>
          {
            reservation.reservationCode
          }
          {" · "}
          {
            roomType?.name ||
            "—"
          }
        </span>

      </div>


      <div className="dashboard-reservation-room">

        <span>
          Room
        </span>


        <strong>
          {
            room?.roomNumber ||
            "Chưa gán"
          }
        </strong>

      </div>


      <div className="dashboard-reservation-right">
        {right}
      </div>

    </article>
  );
}


/* =====================================================
   STATUS
===================================================== */

function ReservationStatus({
  status,
}) {
  const normalized =
    normalizeStatus(
      status
    );


  let className =
    "status-neutral";


  if (
    normalized ===
    "confirmed"
  ) {
    className =
      "status-success";
  }


  if (
    normalized ===
    "pending"
  ) {
    className =
      "status-warning";
  }


  if (
    normalized ===
    "checked in"
  ) {
    className =
      "status-info";
  }


  if (
    normalized ===
    "checked out"
  ) {
    className =
      "status-neutral";
  }


  if (
    [
      "cancelled",
      "no-show",
    ].includes(
      normalized
    )
  ) {
    className =
      "status-danger";
  }


  return (
    <span
      className={`status-badge ${className}`}
    >
      {status}
    </span>
  );
}


/* =====================================================
   ROOM METRIC
===================================================== */

function RoomMetric({
  icon,
  label,
  value,
  description,
}) {
  return (
    <article className="dashboard-room-card">

      <div className="dashboard-room-card-icon">
        {icon}
      </div>


      <div>

        <span>
          {label}
        </span>


        <strong>
          {value}
        </strong>


        <p>
          {description}
        </p>

      </div>

    </article>
  );
}


/* =====================================================
   FINANCIAL ROW
===================================================== */

function FinancialRow({
  label,
  value,
  strong = false,
  warning = false,
}) {
  return (
    <div
      className={`dashboard-financial-row ${
        strong
          ? "strong"
          : ""
      } ${
        warning
          ? "warning"
          : ""
      }`}
    >

      <span>
        {label}
      </span>


      <strong>
        {value}
      </strong>

    </div>
  );
}


/* =====================================================
   EMPTY
===================================================== */

function DashboardEmpty({
  icon,
  title,
  text,
}) {
  return (
    <div className="dashboard-empty">

      <div className="dashboard-empty-icon">
        {icon}
      </div>


      <strong>
        {title}
      </strong>


      <p>
        {text}
      </p>

    </div>
  );
}