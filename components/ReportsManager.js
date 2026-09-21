"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  BarChart3,
  BedDouble,
  CalendarDays,
  CircleDollarSign,
  CreditCard,
  FileText,
  Hotel,
  RefreshCw,
  RotateCcw,
  Search,
  TrendingUp,
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


function firstDayOfMonth() {
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

  return `${year}-${month}-01`;
}


function formatDate(
  value
) {
  if (
    !value
  ) {
    return "—";
  }

  const parts =
    String(
      value
    ).split("-");

  if (
    parts.length !==
    3
  ) {
    return value;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
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


function inDateRange(
  value,
  from,
  to
) {
  if (
    !value
  ) {
    return false;
  }

  if (
    from &&
    value <
      from
  ) {
    return false;
  }

  if (
    to &&
    value >
      to
  ) {
    return false;
  }

  return true;
}


function getTotalRooms(
  item
) {
  return Number(
    item?.totalRooms ??
      item?.total ??
      0
  );
}


function getBookedRooms(
  item
) {
  return Number(
    item?.bookedRooms ??
      item?.booked ??
      0
  );
}


function getAvailableRooms(
  item
) {
  if (
    item?.availableRooms !==
    undefined
  ) {
    return Number(
      item.availableRooms ||
      0
    );
  }

  if (
    item?.available !==
    undefined
  ) {
    return Number(
      item.available ||
      0
    );
  }

  return Math.max(
    getTotalRooms(
      item
    ) -
      getBookedRooms(
        item
      ) -
      Number(
        item?.blockedRooms ??
          item?.blocked ??
          0
      ),
    0
  );
}


/* =====================================================
   MAIN
===================================================== */

export default function ReportsManager() {
  const {
    data,
    ready,
  } = usePms();


  const properties =
    data.properties || [];

  const roomTypes =
    data.roomTypes || [];

  const guests =
    data.guests || [];

  const reservations =
    data.reservations || [];

  const payments =
    data.payments || [];

  const refunds =
    data.refunds || [];

  const folios =
    data.folios || [];

  const inventory =
    data.inventory || [];


  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "reservation"
  );


  const [
    propertyFilter,
    setPropertyFilter,
  ] = useState("");


  const [
    fromDate,
    setFromDate,
  ] = useState(
    firstDayOfMonth()
  );


  const [
    toDate,
    setToDate,
  ] = useState(
    todayIso()
  );


  const [
    search,
    setSearch,
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


  /* ===================================================
     RESERVATION REPORT
  =================================================== */

  const reservationRows =
    useMemo(
      () => {
        const q =
          search
            .trim()
            .toLowerCase();


        return reservations
          .filter(
            (reservation) => {
              const guest =
                guests.find(
                  (item) =>
                    item.id ===
                    reservation.guestId
                );


              const propertyMatch =
                !propertyFilter ||
                reservation.propertyId ===
                  propertyFilter;


              const dateMatch =
                inDateRange(
                  reservation.checkin,
                  fromDate,
                  toDate
                );


              const searchMatch =
                !q ||
                `${reservation.reservationCode || ""} ${guest?.fullName || ""} ${reservation.source || ""} ${reservation.status || ""}`
                  .toLowerCase()
                  .includes(
                    q
                  );


              return (
                propertyMatch &&
                dateMatch &&
                searchMatch
              );
            }
          )
          .sort(
            (
              a,
              b
            ) =>
              String(
                b.checkin ||
                ""
              ).localeCompare(
                String(
                  a.checkin ||
                  ""
                )
              )
          );
      },
      [
        reservations,
        guests,
        propertyFilter,
        fromDate,
        toDate,
        search,
      ]
    );


  const reservationSummary =
    useMemo(
      () => {
        const active =
          reservationRows.filter(
            (reservation) =>
              ![
                "cancelled",
                "no-show",
              ].includes(
                normalizeStatus(
                  reservation.status
                )
              )
          );


        const confirmed =
          reservationRows.filter(
            (reservation) =>
              normalizeStatus(
                reservation.status
              ) ===
              "confirmed"
          ).length;


        const checkedIn =
          reservationRows.filter(
            (reservation) =>
              normalizeStatus(
                reservation.status
              ) ===
              "checked in"
          ).length;


        const cancelled =
          reservationRows.filter(
            (reservation) =>
              normalizeStatus(
                reservation.status
              ) ===
              "cancelled"
          ).length;


        const totalAmount =
          active.reduce(
            (
              total,
              reservation
            ) =>
              total +
              Number(
                reservation.totalAmount ||
                0
              ),
            0
          );


        return {
          total:
            reservationRows.length,

          confirmed,

          checkedIn,

          cancelled,

          totalAmount,
        };
      },
      [
        reservationRows,
      ]
    );


  /* ===================================================
     PAYMENT REPORT
  =================================================== */

  const paymentRows =
    useMemo(
      () => {
        return payments
          .filter(
            (payment) => {
              const reservation =
                reservations.find(
                  (item) =>
                    item.id ===
                    payment.reservationId
                );


              if (
                !reservation
              ) {
                return false;
              }


              const propertyMatch =
                !propertyFilter ||
                payment.propertyId ===
                  propertyFilter;


              /*
               * paidAt đang là chuỗi DD/MM/YYYY HH:mm.
               * Report demo dùng Reservation Check-in
               * làm period để tránh parse locale string.
               */

              const dateMatch =
                inDateRange(
                  reservation.checkin,
                  fromDate,
                  toDate
                );


              return (
                propertyMatch &&
                dateMatch
              );
            }
          )
          .sort(
            (
              a,
              b
            ) =>
              String(
                b.paidAt ||
                ""
              ).localeCompare(
                String(
                  a.paidAt ||
                  ""
                )
              )
          );
      },
      [
        payments,
        reservations,
        propertyFilter,
        fromDate,
        toDate,
      ]
    );


  const paymentSummary =
    useMemo(
      () => {
        const posted =
          paymentRows.filter(
            (payment) =>
              payment.status !==
              "Voided"
          );


        const voided =
          paymentRows.filter(
            (payment) =>
              payment.status ===
              "Voided"
          );


        const amount =
          posted.reduce(
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


        return {
          count:
            posted.length,

          voided:
            voided.length,

          amount,
        };
      },
      [
        paymentRows,
      ]
    );


  /* ===================================================
     REFUND REPORT
  =================================================== */

  const refundRows =
    useMemo(
      () => {
        return refunds
          .filter(
            (refund) => {
              const reservation =
                reservations.find(
                  (item) =>
                    item.id ===
                    refund.reservationId
                );


              if (
                !reservation
              ) {
                return false;
              }


              return (
                (
                  !propertyFilter ||
                  refund.propertyId ===
                    propertyFilter
                ) &&
                inDateRange(
                  reservation.checkin,
                  fromDate,
                  toDate
                )
              );
            }
          );
      },
      [
        refunds,
        reservations,
        propertyFilter,
        fromDate,
        toDate,
      ]
    );


  const refundSummary =
    useMemo(
      () => {
        const active =
          refundRows.filter(
            (refund) =>
              ![
                "Voided",
                "Cancelled",
              ].includes(
                refund.status
              )
          );


        const total =
          active.reduce(
            (
              sum,
              refund
            ) =>
              sum +
              Number(
                refund.amount ||
                0
              ),
            0
          );


        const full =
          active.filter(
            (refund) =>
              refund.type ===
              "Full Refund"
          ).length;


        const partial =
          active.filter(
            (refund) =>
              refund.type ===
              "Partial Refund"
          ).length;


        return {
          count:
            active.length,

          total,

          full,

          partial,
        };
      },
      [
        refundRows,
      ]
    );


  /* ===================================================
     REVENUE SUMMARY
  =================================================== */

  const revenueSummary =
    useMemo(
      () => {
        const reservationIds =
          new Set(
            reservationRows.map(
              (reservation) =>
                reservation.id
            )
          );


        const scopedFolios =
          folios.filter(
            (folio) =>
              reservationIds.has(
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
                reservationIds.has(
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
                reservationIds.has(
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


        const outstanding =
          reservationRows
            .filter(
              (reservation) =>
                ![
                  "cancelled",
                  "no-show",
                ].includes(
                  normalizeStatus(
                    reservation.status
                  )
                )
            )
            .reduce(
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

          outstanding,
        };
      },
      [
        reservationRows,
        folios,
        payments,
        refunds,
      ]
    );


  /* ===================================================
     OCCUPANCY SUMMARY
  =================================================== */

  const occupancyRows =
    useMemo(
      () =>
        inventory
          .filter(
            (item) =>
              (
                !propertyFilter ||
                item.propertyId ===
                  propertyFilter
              ) &&
              inDateRange(
                item.date,
                fromDate,
                toDate
              )
          )
          .sort(
            (
              a,
              b
            ) =>
              String(
                a.date ||
                ""
              ).localeCompare(
                String(
                  b.date ||
                  ""
                )
              )
          ),
      [
        inventory,
        propertyFilter,
        fromDate,
        toDate,
      ]
    );


  const occupancySummary =
    useMemo(
      () => {
        const totals =
          occupancyRows.reduce(
            (
              result,
              item
            ) => {
              result.totalRooms +=
                getTotalRooms(
                  item
                );


              result.bookedRooms +=
                getBookedRooms(
                  item
                );


              result.availableRooms +=
                getAvailableRooms(
                  item
                );


              return result;
            },
            {
              totalRooms:
                0,

              bookedRooms:
                0,

              availableRooms:
                0,
            }
          );


        const occupancyRate =
          totals.totalRooms >
          0
            ? Math.round(
                (
                  totals.bookedRooms /
                  totals.totalRooms
                ) *
                  100
              )
            : 0;


        return {
          ...totals,

          occupancyRate,
        };
      },
      [
        occupancyRows,
      ]
    );


  /* ===================================================
     SOURCE SUMMARY
  =================================================== */

  const sourceSummary =
    useMemo(
      () => {
        const map =
          new Map();


        reservationRows.forEach(
          (reservation) => {
            const source =
              reservation.source ||
              "Unknown";


            const current =
              map.get(
                source
              ) || {
                source,

                bookings:
                  0,

                revenue:
                  0,
              };


            current.bookings +=
              1;


            if (
              ![
                "cancelled",
                "no-show",
              ].includes(
                normalizeStatus(
                  reservation.status
                )
              )
            ) {
              current.revenue +=
                Number(
                  reservation.totalAmount ||
                    0
                );
            }


            map.set(
              source,
              current
            );
          }
        );


        return Array.from(
          map.values()
        ).sort(
          (
            a,
            b
          ) =>
            b.bookings -
            a.bookings
        );
      },
      [
        reservationRows,
      ]
    );


  /* ===================================================
     RESET FILTER
  =================================================== */

  function resetFilters() {
    setPropertyFilter(
      ""
    );

    setFromDate(
      firstDayOfMonth()
    );

    setToDate(
      todayIso()
    );

    setSearch(
      ""
    );
  }


  /* ===================================================
     LOADING
  =================================================== */

  if (
    !ready
  ) {
    return (
      <div className="panel loading-panel">
        Đang tải báo cáo...
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
            BƯỚC 19 — BASIC REPORTS
          </div>


          <h1>
            Reports{" "}
            <span className="heading-en">
              / Báo cáo cơ bản
            </span>
          </h1>


          <p>
            Tổng hợp Reservation, Payment, Refund,
            Revenue và Occupancy từ dữ liệu vận hành PMS.
          </p>

        </div>

      </div>


      {/* =================================================
          EXPLAIN
      ================================================= */}

      <section className="explain-card">

        <div className="explain-icon">

          <BarChart3
            size={21}
          />

        </div>


        <div>

          <strong>
            Báo cáo được tính trực tiếp từ dữ liệu PMS
          </strong>


          <p>
            Các số liệu bên dưới không phải dữ liệu nhập
            riêng cho Dashboard. Khi Reservation, Payment,
            Refund, Folio hoặc Inventory thay đổi, báo cáo
            sẽ thay đổi theo.
          </p>

        </div>

      </section>


      {/* =================================================
          FILTER
      ================================================= */}

      <section className="panel reports-filter-panel">

        <div className="reports-filter-grid">

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

              placeholder="Tìm Reservation, Guest, Source..."
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


          <input
            type="date"

            value={
              fromDate
            }

            onChange={
              (event) =>
                setFromDate(
                  event.target.value
                )
            }
          />


          <input
            type="date"

            value={
              toDate
            }

            onChange={
              (event) =>
                setToDate(
                  event.target.value
                )
            }
          />


          <button
            className="button button-light"

            onClick={
              resetFilters
            }
          >
            <RotateCcw
              size={14}
            />

            Reset
          </button>

        </div>

      </section>


      {/* =================================================
          TABS
      ================================================= */}

      <div className="module-tabs reports-tabs">

        <ReportTab
          active={
            activeTab ===
            "reservation"
          }

          onClick={
            () =>
              setActiveTab(
                "reservation"
              )
          }

          icon={
            <FileText
              size={15}
            />
          }

          label="Reservation"
        />


        <ReportTab
          active={
            activeTab ===
            "payment"
          }

          onClick={
            () =>
              setActiveTab(
                "payment"
              )
          }

          icon={
            <CreditCard
              size={15}
            />
          }

          label="Payment"
        />


        <ReportTab
          active={
            activeTab ===
            "refund"
          }

          onClick={
            () =>
              setActiveTab(
                "refund"
              )
          }

          icon={
            <RefreshCw
              size={15}
            />
          }

          label="Refund"
        />


        <ReportTab
          active={
            activeTab ===
            "revenue"
          }

          onClick={
            () =>
              setActiveTab(
                "revenue"
              )
          }

          icon={
            <TrendingUp
              size={15}
            />
          }

          label="Revenue"
        />


        <ReportTab
          active={
            activeTab ===
            "occupancy"
          }

          onClick={
            () =>
              setActiveTab(
                "occupancy"
              )
          }

          icon={
            <BedDouble
              size={15}
            />
          }

          label="Occupancy"
        />

      </div>


      {/* =================================================
          RESERVATION REPORT
      ================================================= */}

      {
        activeTab ===
          "reservation" && (

          <>
            <div className="metric-grid">

              <Metric
                label="Reservations"

                value={
                  reservationSummary.total
                }
              />


              <Metric
                label="Confirmed"

                value={
                  reservationSummary.confirmed
                }
              />


              <Metric
                label="In House"

                value={
                  reservationSummary.checkedIn
                }
              />


              <Metric
                label="Booking Value"

                value={
                  money(
                    reservationSummary.totalAmount
                  )
                }
              />

            </div>


            <section className="panel">

              <ReportHeader
                title="Reservation Report"

                count={
                  reservationRows.length
                }
              />


              <div className="table-wrap">

                <table className="data-table reports-table">

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
                        Source
                      </th>

                      <th>
                        Status
                      </th>

                      <th className="text-right">
                        Amount
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {
                      reservationRows.map(
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
                                {
                                  guest?.fullName ||
                                  "—"
                                }
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
                                  →{" "}
                                  {
                                    formatDate(
                                      reservation.checkout
                                    )
                                  }
                                </div>

                              </td>


                              <td>
                                {
                                  reservation.source ||
                                  "—"
                                }
                              </td>


                              <td>

                                <ReservationStatus
                                  status={
                                    reservation.status
                                  }
                                />

                              </td>


                              <td className="text-right">
                                <strong>
                                  {
                                    money(
                                      reservation.totalAmount
                                    )
                                  }
                                </strong>
                              </td>

                            </tr>
                          );
                        }
                      )
                    }

                  </tbody>

                </table>

              </div>

            </section>


            <section className="panel reports-source-panel">

              <ReportHeader
                title="Reservation by Source"

                count={
                  sourceSummary.length
                }
              />


              <div className="reports-source-grid">

                {
                  sourceSummary.map(
                    (item) => (

                      <article
                        className="reports-source-card"

                        key={
                          item.source
                        }
                      >

                        <span>
                          {
                            item.source
                          }
                        </span>


                        <strong>
                          {
                            item.bookings
                          }{" "}
                          booking(s)
                        </strong>


                        <p>
                          {
                            money(
                              item.revenue
                            )
                          }
                        </p>

                      </article>

                    )
                  )
                }

              </div>

            </section>
          </>

        )
      }


      {/* =================================================
          PAYMENT
      ================================================= */}

      {
        activeTab ===
          "payment" && (

          <>
            <div className="metric-grid">

              <Metric
                label="Payments"

                value={
                  paymentSummary.count
                }
              />


              <Metric
                label="Gross Paid"

                value={
                  money(
                    paymentSummary.amount
                  )
                }
              />


              <Metric
                label="Voided"

                value={
                  paymentSummary.voided
                }
              />


              <Metric
                label="Average Payment"

                value={
                  money(
                    paymentSummary.count >
                      0
                      ? paymentSummary.amount /
                          paymentSummary.count
                      : 0
                  )
                }
              />

            </div>


            <section className="panel">

              <ReportHeader
                title="Payment Report"

                count={
                  paymentRows.length
                }
              />


              <div className="table-wrap">

                <table className="data-table reports-table">

                  <thead>

                    <tr>

                      <th>
                        Reservation
                      </th>

                      <th>
                        Guest
                      </th>

                      <th>
                        Method
                      </th>

                      <th>
                        Provider
                      </th>

                      <th>
                        Transaction Ref
                      </th>

                      <th>
                        Paid At
                      </th>

                      <th>
                        Status
                      </th>

                      <th className="text-right">
                        Amount
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {
                      paymentRows.map(
                        (payment) => {

                          const reservation =
                            reservations.find(
                              (item) =>
                                item.id ===
                                payment.reservationId
                            );


                          const guest =
                            getGuest(
                              payment.guestId
                            );


                          return (
                            <tr
                              key={
                                payment.id
                              }
                            >

                              <td className="code">
                                {
                                  reservation?.reservationCode ||
                                  "—"
                                }
                              </td>


                              <td>
                                {
                                  guest?.fullName ||
                                  "—"
                                }
                              </td>


                              <td>
                                {
                                  payment.method ||
                                  "—"
                                }
                              </td>


                              <td>
                                {
                                  payment.provider ||
                                  "—"
                                }
                              </td>


                              <td className="code">
                                {
                                  payment.transactionReference ||
                                  "—"
                                }
                              </td>


                              <td>
                                {
                                  payment.paidAt ||
                                  "—"
                                }
                              </td>


                              <td>

                                <SimpleStatus
                                  status={
                                    payment.status
                                  }
                                />

                              </td>


                              <td className="text-right">
                                <strong>
                                  {
                                    money(
                                      payment.amount
                                    )
                                  }
                                </strong>
                              </td>

                            </tr>
                          );
                        }
                      )
                    }

                  </tbody>

                </table>

              </div>

            </section>
          </>

        )
      }


      {/* =================================================
          REFUND
      ================================================= */}

      {
        activeTab ===
          "refund" && (

          <>
            <div className="metric-grid">

              <Metric
                label="Refunds"

                value={
                  refundSummary.count
                }
              />


              <Metric
                label="Refunded"

                value={
                  money(
                    refundSummary.total
                  )
                }
              />


              <Metric
                label="Full Refund"

                value={
                  refundSummary.full
                }
              />


              <Metric
                label="Partial Refund"

                value={
                  refundSummary.partial
                }
              />

            </div>


            <section className="panel">

              <ReportHeader
                title="Refund Report"

                count={
                  refundRows.length
                }
              />


              <div className="table-wrap">

                <table className="data-table reports-table">

                  <thead>

                    <tr>

                      <th>
                        Reservation
                      </th>

                      <th>
                        Guest
                      </th>

                      <th>
                        Refund Type
                      </th>

                      <th>
                        Reference
                      </th>

                      <th>
                        Reason
                      </th>

                      <th>
                        Refunded At
                      </th>

                      <th>
                        Status
                      </th>

                      <th className="text-right">
                        Amount
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {
                      refundRows.map(
                        (refund) => {

                          const reservation =
                            reservations.find(
                              (item) =>
                                item.id ===
                                refund.reservationId
                            );


                          const guest =
                            getGuest(
                              refund.guestId
                            );


                          return (
                            <tr
                              key={
                                refund.id
                              }
                            >

                              <td className="code">
                                {
                                  reservation?.reservationCode ||
                                  "—"
                                }
                              </td>


                              <td>
                                {
                                  guest?.fullName ||
                                  "—"
                                }
                              </td>


                              <td>
                                {
                                  refund.type ||
                                  "—"
                                }
                              </td>


                              <td className="code">
                                {
                                  refund.refundReference ||
                                  "—"
                                }
                              </td>


                              <td>
                                <div className="reports-reason">
                                  {
                                    refund.reason ||
                                    "—"
                                  }
                                </div>
                              </td>


                              <td>
                                {
                                  refund.refundedAt ||
                                  "—"
                                }
                              </td>


                              <td>

                                <SimpleStatus
                                  status={
                                    refund.status
                                  }
                                />

                              </td>


                              <td className="text-right">
                                <strong>
                                  {
                                    money(
                                      refund.amount
                                    )
                                  }
                                </strong>
                              </td>

                            </tr>
                          );
                        }
                      )
                    }

                  </tbody>

                </table>

              </div>

            </section>
          </>

        )
      }


      {/* =================================================
          REVENUE
      ================================================= */}

      {
        activeTab ===
          "revenue" && (

          <>
            <div className="reports-revenue-grid">

              <RevenueCard
                icon={
                  <FileText
                    size={20}
                  />
                }

                label="Folio Charges"

                value={
                  money(
                    revenueSummary.totalCharges
                  )
                }

                description="Tổng charge hợp lệ trong Folio"
              />


              <RevenueCard
                icon={
                  <CreditCard
                    size={20}
                  />
                }

                label="Gross Paid"

                value={
                  money(
                    revenueSummary.grossPaid
                  )
                }

                description="Tổng Payment trước Refund"
              />


              <RevenueCard
                icon={
                  <RefreshCw
                    size={20}
                  />
                }

                label="Refunded"

                value={
                  money(
                    revenueSummary.refunded
                  )
                }

                description="Tổng tiền đã hoàn khách"
              />


              <RevenueCard
                icon={
                  <CircleDollarSign
                    size={20}
                  />
                }

                label="Net Paid"

                value={
                  money(
                    revenueSummary.netPaid
                  )
                }

                description="Gross Paid - Refund"
              />


              <RevenueCard
                icon={
                  <WalletCards
                    size={20}
                  />
                }

                label="Outstanding"

                value={
                  money(
                    revenueSummary.outstanding
                  )
                }

                description="Công nợ Reservation hiện còn"
              />

            </div>


            <section className="panel reports-revenue-explain">

              <div className="reports-formula">

                <span>
                  Gross Paid
                </span>

                <b>
                  −
                </b>

                <span>
                  Refund
                </span>

                <b>
                  =
                </b>

                <strong>
                  Net Paid
                </strong>

              </div>


              <p>
                Net Paid là dòng tiền thực thu sau hoàn tiền.
                Folio Charges phản ánh tổng giá trị charge,
                còn Outstanding phản ánh khoản khách vẫn chưa
                thanh toán.
              </p>

            </section>
          </>

        )
      }


      {/* =================================================
          OCCUPANCY
      ================================================= */}

      {
        activeTab ===
          "occupancy" && (

          <>
            <div className="metric-grid">

              <Metric
                label="Room Nights"

                value={
                  occupancySummary.totalRooms
                }
              />


              <Metric
                label="Sold Rooms"

                value={
                  occupancySummary.bookedRooms
                }
              />


              <Metric
                label="Available"

                value={
                  occupancySummary.availableRooms
                }
              />


              <Metric
                label="Occupancy"

                value={`${occupancySummary.occupancyRate}%`}
              />

            </div>


            <section className="panel">

              <ReportHeader
                title="Occupancy Summary"

                count={
                  occupancyRows.length
                }
              />


              <div className="table-wrap">

                <table className="data-table reports-table">

                  <thead>

                    <tr>

                      <th>
                        Date
                      </th>

                      <th>
                        Property
                      </th>

                      <th>
                        Room Type
                      </th>

                      <th className="text-right">
                        Total
                      </th>

                      <th className="text-right">
                        Sold
                      </th>

                      <th className="text-right">
                        Available
                      </th>

                      <th className="text-right">
                        Occupancy
                      </th>

                      <th>
                        Channex
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {
                      occupancyRows.map(
                        (item) => {

                          const total =
                            getTotalRooms(
                              item
                            );


                          const booked =
                            getBookedRooms(
                              item
                            );


                          const available =
                            getAvailableRooms(
                              item
                            );


                          const rate =
                            total >
                            0
                              ? Math.round(
                                  (
                                    booked /
                                    total
                                  ) *
                                    100
                                )
                              : 0;


                          return (
                            <tr
                              key={
                                item.id
                              }
                            >

                              <td>
                                <strong>
                                  {
                                    formatDate(
                                      item.date
                                    )
                                  }
                                </strong>
                              </td>


                              <td>
                                {
                                  getProperty(
                                    item.propertyId
                                  )?.name ||
                                  "—"
                                }
                              </td>


                              <td>
                                {
                                  getRoomType(
                                    item.roomTypeId
                                  )?.name ||
                                  "—"
                                }
                              </td>


                              <td className="text-right">
                                {
                                  total
                                }
                              </td>


                              <td className="text-right">
                                <strong>
                                  {
                                    booked
                                  }
                                </strong>
                              </td>


                              <td className="text-right">
                                {
                                  available
                                }
                              </td>


                              <td className="text-right">

                                <strong>
                                  {
                                    rate
                                  }%
                                </strong>

                              </td>


                              <td>

                                <span
                                  className={`status-badge ${
                                    item.synced
                                      ? "status-success"
                                      : "status-warning"
                                  }`}
                                >
                                  {
                                    item.synced
                                      ? "Synced"
                                      : "Pending"
                                  }
                                </span>

                              </td>

                            </tr>
                          );
                        }
                      )
                    }

                  </tbody>

                </table>

              </div>

            </section>
          </>

        )
      }

    </>
  );
}


/* =====================================================
   REPORT TAB
===================================================== */

function ReportTab({
  active,
  onClick,
  icon,
  label,
}) {
  return (
    <button
      className={
        active
          ? "active"
          : ""
      }

      onClick={
        onClick
      }
    >
      {icon}

      {label}
    </button>
  );
}


/* =====================================================
   REPORT HEADER
===================================================== */

function ReportHeader({
  title,
  count,
}) {
  return (
    <div className="panel-header-row reports-panel-header">

      <div>

        <div className="eyebrow">
          REPORT DATA
        </div>


        <h2>
          {title}
        </h2>

      </div>


      <span className="status-badge status-neutral">
        {count} records
      </span>

    </div>
  );
}


/* =====================================================
   METRIC
===================================================== */

function Metric({
  label,
  value,
}) {
  return (
    <article className="metric-card">

      <div className="metric-label">
        {label}
      </div>


      <div className="metric-value">
        {value}
      </div>

    </article>
  );
}


/* =====================================================
   REVENUE CARD
===================================================== */

function RevenueCard({
  icon,
  label,
  value,
  description,
}) {
  return (
    <article className="reports-revenue-card">

      <div className="reports-revenue-icon">
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
   RESERVATION STATUS
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
      {
        status ||
        "Unknown"
      }
    </span>
  );
}


/* =====================================================
   SIMPLE STATUS
===================================================== */

function SimpleStatus({
  status,
}) {
  const normalized =
    normalizeStatus(
      status
    );


  const className =
    [
      "voided",
      "cancelled",
      "failed",
    ].includes(
      normalized
    )
      ? "status-danger"
      : "status-success";


  return (
    <span
      className={`status-badge ${className}`}
    >
      {
        status ||
        "Unknown"
      }
    </span>
  );
}