"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  Ban,
  Banknote,
  CircleDollarSign,
  CreditCard,
  Eye,
  Landmark,
  Plus,
  ReceiptText,
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
   CONSTANTS
===================================================== */

const PAYMENT_METHODS = [
  "Cash",
  "Bank Transfer",
  "Card",
  "Payment Gateway",
  "OTA Collect",
  "Other",
];


const METHODS_REQUIRE_REFERENCE = [
  "Bank Transfer",
  "Card",
  "Payment Gateway",
  "OTA Collect",
];


/* =====================================================
   HELPERS
===================================================== */

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


function money(
  value
) {
  return `${Number(
    value || 0
  ).toLocaleString(
    "vi-VN"
  )} ₫`;
}


function activeChargeTotal(
  folio
) {
  return (
    folio?.charges ||
    []
  )
    .filter(
      (charge) =>
        charge.status !==
        "Voided"
    )
    .reduce(
      (
        total,
        charge
      ) =>
        total +
        Number(
          charge.amount ||
          0
        ),
      0
    );
}


function activePaymentTotal(
  reservationId,
  payments
) {
  return (
    payments ||
    []
  )
    .filter(
      (payment) =>
        payment.reservationId ===
          reservationId &&
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
}


function activeRefundTotal(
  reservationId,
  refunds
) {
  return (
    refunds ||
    []
  )
    .filter(
      (refund) =>
        refund.reservationId ===
          reservationId &&
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
}


function netPaymentTotal(
  reservationId,
  payments,
  refunds
) {
  return Math.max(
    activePaymentTotal(
      reservationId,
      payments
    ) -
      activeRefundTotal(
        reservationId,
        refunds
      ),
    0
  );
}


function calculateOutstanding(
  folio,
  payments,
  refunds
) {
  if (
    !folio
  ) {
    return 0;
  }


  return Math.max(
    activeChargeTotal(
      folio
    ) -
      netPaymentTotal(
        folio.reservationId,
        payments,
        refunds
      ),
    0
  );
}


function calculatePaymentStatus(
  folio,
  payments,
  refunds
) {
  if (
    !folio
  ) {
    return "Unpaid";
  }


  const charges =
    activeChargeTotal(
      folio
    );


  const paid =
    activePaymentTotal(
      folio.reservationId,
      payments
    );


  const refunded =
    activeRefundTotal(
      folio.reservationId,
      refunds
    );


  const netPaid =
    Math.max(
      paid -
        refunded,
      0
    );


  /*
   * Step 15 Refund sẽ sử dụng
   * trạng thái này rõ hơn.
   */
  if (
    refunded >
      0 &&
    paid >
      0 &&
    refunded >=
      paid
  ) {
    return "Refunded";
  }


  if (
    paid <=
      0
  ) {
    return "Unpaid";
  }


  if (
    netPaid >=
      charges &&
    charges >
      0
  ) {
    return "Paid";
  }


  return "Partial";
}


/* =====================================================
   BADGES
===================================================== */

function PaymentStatusBadge({
  status,
}) {
  const classMap = {
    Unpaid:
      "status-danger",

    Partial:
      "status-warning",

    Paid:
      "status-success",

    Refunded:
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
      {status}
    </span>
  );
}


function TransactionStatusBadge({
  status,
}) {
  return (
    <span
      className={`status-badge ${
        status ===
        "Voided"
          ? "status-danger"
          : "status-success"
      }`}
    >
      {
        status ||
        "Posted"
      }
    </span>
  );
}


/* =====================================================
   MAIN
===================================================== */

export default function PaymentManager() {
  const {
    data,
    setData,
    ready,
  } = usePms();


  const folios =
    data.folios || [];

  const payments =
    data.payments || [];

  const refunds =
    data.refunds || [];

  const reservations =
    data.reservations || [];

  const guests =
    data.guests || [];

  const properties =
    data.properties || [];


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    propertyFilter,
    setPropertyFilter,
  ] = useState("");


  const [
    paymentReservationId,
    setPaymentReservationId,
  ] = useState(null);


  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState(
    "Cash"
  );


  const [
    provider,
    setProvider,
  ] = useState("");


  const [
    transactionReference,
    setTransactionReference,
  ] = useState("");


  const [
    amount,
    setAmount,
  ] = useState("");


  const [
    note,
    setNote,
  ] = useState("");


  const [
    detailReservationId,
    setDetailReservationId,
  ] = useState(null);


  const [
    voidPaymentState,
    setVoidPaymentState,
  ] = useState(null);


  const [
    voidReason,
    setVoidReason,
  ] = useState("");


  /* ===================================================
     LOOKUPS
  =================================================== */

  function getReservation(
    reservationId
  ) {
    return reservations.find(
      (reservation) =>
        reservation.id ===
        reservationId
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


  function getProperty(
    propertyId
  ) {
    return properties.find(
      (property) =>
        property.id ===
        propertyId
    );
  }


  function getFolio(
    reservationId
  ) {
    return folios.find(
      (folio) =>
        folio.reservationId ===
        reservationId
    );
  }


  function getPayments(
    reservationId
  ) {
    return payments
      .filter(
        (payment) =>
          payment.reservationId ===
          reservationId
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
  }


  /* ===================================================
     FOLIO ROWS
  =================================================== */

  const rows =
    useMemo(
      () => {
        const q =
          search
            .trim()
            .toLowerCase();


        return folios
          .map(
            (folio) => {
              const reservation =
                getReservation(
                  folio.reservationId
                );


              if (
                !reservation
              ) {
                return null;
              }


              const guest =
                getGuest(
                  reservation.guestId
                );


              const property =
                getProperty(
                  reservation.propertyId
                );


              const charges =
                activeChargeTotal(
                  folio
                );


              const paid =
                activePaymentTotal(
                  reservation.id,
                  payments
                );


              const refunded =
                activeRefundTotal(
                  reservation.id,
                  refunds
                );


              const balance =
                calculateOutstanding(
                  folio,
                  payments,
                  refunds
                );


              const paymentStatus =
                calculatePaymentStatus(
                  folio,
                  payments,
                  refunds
                );


              const text = `
                ${reservation.reservationCode || ""}
                ${guest?.fullName || ""}
                ${guest?.phone || ""}
                ${guest?.email || ""}
                ${property?.name || ""}
                ${paymentStatus}
              `.toLowerCase();


              return {
                folio,

                reservation,

                guest,

                property,

                charges,

                paid,

                refunded,

                balance,

                paymentStatus,

                matches:
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
                  ),
              };
            }
          )
          .filter(
            (row) =>
              row &&
              row.matches
          );
      },
      [
        folios,
        reservations,
        guests,
        properties,
        payments,
        refunds,
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
        const totalPayments =
          payments
            .filter(
              (payment) =>
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


        const totalRefunds =
          refunds
            .filter(
              (refund) =>
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


        const totalOutstanding =
          folios.reduce(
            (
              total,
              folio
            ) =>
              total +
              calculateOutstanding(
                folio,
                payments,
                refunds
              ),
            0
          );


        const paidFolios =
          folios.filter(
            (folio) =>
              calculatePaymentStatus(
                folio,
                payments,
                refunds
              ) ===
              "Paid"
          ).length;


        return {
          collected:
            totalPayments,

          refunded:
            totalRefunds,

          outstanding:
            totalOutstanding,

          paidFolios,
        };
      },
      [
        folios,
        payments,
        refunds,
      ]
    );


  /* ===================================================
     OPEN PAYMENT
  =================================================== */

  function openPayment(
    reservationId
  ) {
    const folio =
      getFolio(
        reservationId
      );


    if (
      !folio
    ) {
      alert(
        "Reservation chưa có Folio."
      );

      return;
    }


    const balance =
      calculateOutstanding(
        folio,
        payments,
        refunds
      );


    if (
      balance <=
      0
    ) {
      alert(
        "Folio hiện không còn Outstanding Balance."
      );

      return;
    }


    setPaymentReservationId(
      reservationId
    );


    setPaymentMethod(
      "Cash"
    );


    setProvider(
      ""
    );


    setTransactionReference(
      ""
    );


    /*
     * Mặc định điền toàn bộ balance.
     * User có thể giảm xuống để Partial Payment.
     */
    setAmount(
      String(
        balance
      )
    );


    setNote(
      ""
    );
  }


  /* ===================================================
     RECORD PAYMENT
  =================================================== */

  function recordPayment() {
    const reservation =
      getReservation(
        paymentReservationId
      );


    const folio =
      getFolio(
        paymentReservationId
      );


    if (
      !reservation ||
      !folio
    ) {
      return;
    }


    const numericAmount =
      Number(
        amount
      );


    const currentBalance =
      calculateOutstanding(
        folio,
        payments,
        refunds
      );


    if (
      !PAYMENT_METHODS.includes(
        paymentMethod
      )
    ) {
      alert(
        "Payment Method không hợp lệ."
      );

      return;
    }


    if (
      !Number.isFinite(
        numericAmount
      ) ||
      numericAmount <=
        0
    ) {
      alert(
        "Số tiền thanh toán phải lớn hơn 0."
      );

      return;
    }


    if (
      numericAmount >
      currentBalance
    ) {
      alert(
        `Số tiền thanh toán không được lớn hơn Outstanding Balance ${money(
          currentBalance
        )}.`
      );

      return;
    }


    if (
      METHODS_REQUIRE_REFERENCE.includes(
        paymentMethod
      ) &&
      !provider.trim()
    ) {
      alert(
        "Vui lòng nhập Payment Provider."
      );

      return;
    }


    if (
      METHODS_REQUIRE_REFERENCE.includes(
        paymentMethod
      ) &&
      !transactionReference.trim()
    ) {
      alert(
        "Vui lòng nhập Transaction Reference."
      );

      return;
    }


    /*
     * Không cho sử dụng lại cùng
     * transaction reference đang active.
     */
    if (
      transactionReference.trim()
    ) {
      const duplicate =
        payments.some(
          (payment) =>
            payment.status !==
              "Voided" &&
            String(
              payment.transactionReference ||
              ""
            )
              .trim()
              .toLowerCase() ===
              transactionReference
                .trim()
                .toLowerCase()
        );


      if (
        duplicate
      ) {
        alert(
          "Transaction Reference này đã tồn tại."
        );

        return;
      }
    }


    const actionTime =
      nowText();


    const newPayment = {
      id:
        makeId(
          "payment"
        ),

      reservationId:
        reservation.id,

      folioId:
        folio.id,

      propertyId:
        reservation.propertyId,

      guestId:
        reservation.guestId,

      method:
        paymentMethod,

      provider:
        provider.trim(),

      transactionReference:
        transactionReference.trim(),

      amount:
        numericAmount,

      currency:
        "VND",

      status:
        "Posted",

      paidAt:
        actionTime,

      note:
        note.trim(),

      createdAt:
        actionTime,

      updatedAt:
        actionTime,
    };


    setData(
      (current) => {
        const nextPayments = [
          newPayment,

          ...(
            current.payments ||
            []
          ),
        ];


        const currentFolio =
          (
            current.folios ||
            []
          ).find(
            (item) =>
              item.id ===
              folio.id
          );


        const nextBalance =
          calculateOutstanding(
            currentFolio,
            nextPayments,
            current.refunds ||
            []
          );


        const nextStatus =
          calculatePaymentStatus(
            currentFolio,
            nextPayments,
            current.refunds ||
            []
          );


        const nextFolios =
          (
            current.folios ||
            []
          ).map(
            (item) =>
              item.id ===
              folio.id
                ? {
                    ...item,

                    status:
                      nextBalance <=
                      0
                        ? "Settled"
                        : "Open",

                    updatedAt:
                      actionTime,

                    logs: [
                      `${actionTime} — Payment ${money(
                        numericAmount
                      )} via ${paymentMethod}${
                        provider.trim()
                          ? ` — ${provider.trim()}`
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

                    outstandingBalance:
                      nextBalance,

                    paymentStatus:
                      nextStatus,

                    updatedAt:
                      actionTime,

                    logs: [
                      `${actionTime} — Recorded Payment ${money(
                        numericAmount
                      )} via ${paymentMethod}`,

                      ...(
                        item.logs ||
                        []
                      ),
                    ],
                  }
                : item
          );


        return {
          ...current,

          payments:
            nextPayments,

          folios:
            nextFolios,

          reservations:
            nextReservations,
        };
      }
    );


    setPaymentReservationId(
      null
    );


    setPaymentMethod(
      "Cash"
    );


    setProvider(
      ""
    );


    setTransactionReference(
      ""
    );


    setAmount(
      ""
    );


    setNote(
      ""
    );
  }


  /* ===================================================
     VOID PAYMENT
  =================================================== */

  function confirmVoidPayment() {
    if (
      !voidPaymentState
    ) {
      return;
    }


    if (
      !voidReason.trim()
    ) {
      alert(
        "Vui lòng nhập lý do Void Payment."
      );

      return;
    }


    const {
      paymentId,
      reservationId,
      folioId,
    } =
      voidPaymentState;


    const actionTime =
      nowText();


    setData(
      (current) => {
        const payment =
          (
            current.payments ||
            []
          ).find(
            (item) =>
              item.id ===
              paymentId
          );


        if (
          !payment
        ) {
          return current;
        }


        const nextPayments =
          (
            current.payments ||
            []
          ).map(
            (item) =>
              item.id ===
              paymentId
                ? {
                    ...item,

                    status:
                      "Voided",

                    voidedAt:
                      actionTime,

                    voidReason:
                      voidReason.trim(),

                    updatedAt:
                      actionTime,
                  }
                : item
          );


        const currentFolio =
          (
            current.folios ||
            []
          ).find(
            (item) =>
              item.id ===
              folioId
          );


        const balance =
          calculateOutstanding(
            currentFolio,
            nextPayments,
            current.refunds ||
            []
          );


        const paymentStatus =
          calculatePaymentStatus(
            currentFolio,
            nextPayments,
            current.refunds ||
            []
          );


        const nextFolios =
          (
            current.folios ||
            []
          ).map(
            (folio) =>
              folio.id ===
              folioId
                ? {
                    ...folio,

                    status:
                      balance <=
                      0
                        ? "Settled"
                        : "Open",

                    updatedAt:
                      actionTime,

                    logs: [
                      `${actionTime} — Voided Payment ${money(
                        payment.amount
                      )}. Lý do: ${voidReason.trim()}`,

                      ...(
                        folio.logs ||
                        []
                      ),
                    ],
                  }
                : folio
          );


        const nextReservations =
          (
            current.reservations ||
            []
          ).map(
            (reservation) =>
              reservation.id ===
              reservationId
                ? {
                    ...reservation,

                    outstandingBalance:
                      balance,

                    paymentStatus,

                    updatedAt:
                      actionTime,

                    logs: [
                      `${actionTime} — Payment ${money(
                        payment.amount
                      )} đã Voided`,

                      ...(
                        reservation.logs ||
                        []
                      ),
                    ],
                  }
                : reservation
          );


        return {
          ...current,

          payments:
            nextPayments,

          folios:
            nextFolios,

          reservations:
            nextReservations,
        };
      }
    );


    setVoidPaymentState(
      null
    );


    setVoidReason(
      ""
    );
  }


  /* ===================================================
     CURRENT VALUES
  =================================================== */

  const paymentReservation =
    getReservation(
      paymentReservationId
    );


  const paymentFolio =
    paymentReservation
      ? getFolio(
          paymentReservation.id
        )
      : null;


  const paymentBalance =
    paymentFolio
      ? calculateOutstanding(
          paymentFolio,
          payments,
          refunds
        )
      : 0;


  const detailReservation =
    getReservation(
      detailReservationId
    );


  const detailFolio =
    detailReservation
      ? getFolio(
          detailReservation.id
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
            BƯỚC 14 — PAYMENT
          </div>


          <h1>
            Thanh toán{" "}
            <span className="heading-en">
              (Payment)
            </span>
          </h1>


          <p>
            Ghi nhận các khoản tiền khách đã thanh toán,
            hỗ trợ thanh toán một phần, nhiều phương thức,
            transaction reference và Void Payment.
          </p>

        </div>

      </div>


      {/* =================================================
          EXPLAIN
      ================================================= */}

      <section className="explain-card">

        <div className="explain-icon">

          <WalletCards
            size={21}
          />

        </div>


        <div>

          <strong>
            Payment làm giảm Outstanding Balance của Folio
          </strong>


          <p>
            Mỗi lần khách thanh toán PMS tạo một Payment
            Transaction riêng. Một Reservation có thể có
            nhiều Payment để hỗ trợ Partial Payment.
          </p>


          <div className="payment-flow">

            <span>
              Folio Charges
            </span>

            <b>→</b>

            <span>
              Record Payment
            </span>

            <b>→</b>

            <span>
              Partial / Paid
            </span>

            <b>→</b>

            <span>
              Outstanding
            </span>

            <b>→</b>

            <span>
              Check-out
            </span>

          </div>

        </div>

      </section>


      {/* =================================================
          METRICS
      ================================================= */}

      <div className="metric-grid">

        <Metric
          label="Collected"
          value={
            money(
              metrics.collected
            )
          }
        />


        <Metric
          label="Refunded"
          value={
            money(
              metrics.refunded
            )
          }
        />


        <Metric
          label="Outstanding"
          value={
            money(
              metrics.outstanding
            )
          }
        />


        <Metric
          label="Paid Folios"
          value={
            metrics.paidFolios
          }
        />

      </div>


      {/* =================================================
          LIST
      ================================================= */}

      <section className="panel">

        <div className="panel-toolbar">

          <div className="payment-filter-grid">

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

                placeholder="Tìm Reservation, Guest, Property..."
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

          <table className="data-table payment-table">

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
                  Charges
                </th>

                <th>
                  Paid
                </th>

                <th>
                  Refunded
                </th>

                <th>
                  Outstanding
                </th>

                <th>
                  Payment Status
                </th>

                <th>
                  Transactions
                </th>

                <th className="text-right">
                  Thao tác
                </th>

              </tr>

            </thead>


            <tbody>

              {
                rows.map(
                  (row) => {

                    const transactionCount =
                      getPayments(
                        row.reservation.id
                      ).length;


                    return (
                      <tr
                        key={
                          row.folio.id
                        }
                      >

                        <td>

                          <strong className="code">
                            {
                              row.reservation.reservationCode
                            }
                          </strong>


                          <div className="small-copy muted">
                            {
                              row.reservation.status
                            }
                          </div>

                        </td>


                        <td>

                          <strong>
                            {
                              row.guest?.fullName ||
                              "—"
                            }
                          </strong>


                          <div className="small-copy muted">
                            {
                              row.guest?.phone ||
                              row.guest?.email ||
                              "—"
                            }
                          </div>

                        </td>


                        <td>
                          {
                            row.property?.name ||
                            "—"
                          }
                        </td>


                        <td>
                          <strong>
                            {
                              money(
                                row.charges
                              )
                            }
                          </strong>
                        </td>


                        <td className="payment-paid-value">
                          {
                            money(
                              row.paid
                            )
                          }
                        </td>


                        <td>
                          {
                            money(
                              row.refunded
                            )
                          }
                        </td>


                        <td>

                          <strong
                            className={
                              row.balance >
                              0
                                ? "payment-balance due"
                                : "payment-balance paid"
                            }
                          >
                            {
                              money(
                                row.balance
                              )
                            }
                          </strong>

                        </td>


                        <td>

                          <PaymentStatusBadge
                            status={
                              row.paymentStatus
                            }
                          />

                        </td>


                        <td>
                          {
                            transactionCount
                          }{" "}
                          transaction(s)
                        </td>


                        <td>

                          <div className="action-row">

                            <button
                              className="table-action"

                              title="Payment History"

                              onClick={
                                () =>
                                  setDetailReservationId(
                                    row.reservation.id
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
                                row.balance <=
                                0
                              }

                              onClick={
                                () =>
                                  openPayment(
                                    row.reservation.id
                                  )
                              }
                            >
                              <Plus
                                size={14}
                              />

                              Record Payment
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
            rows.length ===
              0 && (

              <div className="empty-state">

                <WalletCards
                  size={38}
                />


                <strong>
                  Không có Folio phù hợp
                </strong>


                <span>
                  Hãy tạo Folio ở Step 13 trước khi ghi nhận Payment.
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
          Payment xử lý những gì?
        </h2>


        <div className="business-grid">

          <BusinessItem
            number="01"

            icon={
              <Banknote
                size={18}
              />
            }

            title="Record Payment"

            text="Ghi nhận số tiền khách đã thanh toán và tự động giảm Outstanding Balance."
          />


          <BusinessItem
            number="02"

            icon={
              <CreditCard
                size={18}
              />
            }

            title="Payment Method"

            text="Hỗ trợ Cash, Bank Transfer, Card, Payment Gateway, OTA Collect và Other."
          />


          <BusinessItem
            number="03"

            icon={
              <CircleDollarSign
                size={18}
              />
            }

            title="Partial Payment"

            text="Một Reservation có thể thanh toán nhiều lần cho đến khi toàn bộ Folio được thanh toán."
          />


          <BusinessItem
            number="04"

            icon={
              <Ban
                size={18}
              />
            }

            title="Void Payment"

            text="Giao dịch nhập sai được chuyển thành Voided thay vì bị xóa, giúp giữ đầy đủ lịch sử audit."
          />

        </div>

      </section>


      {/* =================================================
          RECORD PAYMENT MODAL
      ================================================= */}

      <Modal
        open={
          Boolean(
            paymentReservation
          )
        }

        title="Record Payment"

        subtitle="PAYMENT TRANSACTION"

        onClose={
          () => {
            setPaymentReservationId(
              null
            );

            setAmount(
              ""
            );

            setProvider(
              ""
            );

            setTransactionReference(
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
                  setPaymentReservationId(
                    null
                  )
              }
            >
              Hủy
            </button>


            <button
              className="button button-dark"

              onClick={
                recordPayment
              }
            >
              <WalletCards
                size={16}
              />

              Record Payment
            </button>

          </>
        }
      >

        {
          paymentReservation && (

            <>
              <PaymentReservationCard
                reservation={
                  paymentReservation
                }

                guest={
                  getGuest(
                    paymentReservation.guestId
                  )
                }

                property={
                  getProperty(
                    paymentReservation.propertyId
                  )
                }

                balance={
                  paymentBalance
                }
              />


              <div className="form-grid">

                <Field
                  label="Payment Method *"
                >

                  <select
                    value={
                      paymentMethod
                    }

                    onChange={
                      (event) =>
                        setPaymentMethod(
                          event.target.value
                        )
                    }
                  >

                    {
                      PAYMENT_METHODS.map(
                        (method) => (

                          <option
                            key={
                              method
                            }

                            value={
                              method
                            }
                          >
                            {method}
                          </option>

                        )
                      )
                    }

                  </select>

                </Field>


                <Field
                  label="Amount (VND) *"
                >

                  <input
                    type="number"

                    min="1"

                    max={
                      paymentBalance
                    }

                    step="1000"

                    value={
                      amount
                    }

                    onChange={
                      (event) =>
                        setAmount(
                          event.target.value
                        )
                    }

                    placeholder="Số tiền thanh toán"
                  />

                  <small className="form-help">
                    Tối đa:{" "}
                    {
                      money(
                        paymentBalance
                      )
                    }
                  </small>

                </Field>


                <Field
                  label="Payment Provider"
                >

                  <input
                    value={
                      provider
                    }

                    onChange={
                      (event) =>
                        setProvider(
                          event.target.value
                        )
                    }

                    placeholder={
                      paymentMethod ===
                      "Cash"
                        ? "Không bắt buộc"
                        : "Ví dụ: Vietcombank, VNPay, MoMo..."
                    }
                  />

                </Field>


                <Field
                  label="Transaction Reference"
                >

                  <input
                    value={
                      transactionReference
                    }

                    onChange={
                      (event) =>
                        setTransactionReference(
                          event.target.value
                        )
                    }

                    placeholder="Ví dụ: VNPAY-20260921-001"
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

                    placeholder="Ghi chú thanh toán..."
                  />

                </Field>

              </div>


              {
                Number(
                  amount ||
                  0
                ) >
                  0 &&
                Number(
                  amount ||
                  0
                ) <
                  paymentBalance && (

                  <div className="payment-partial-note">

                    <CircleDollarSign
                      size={17}
                    />


                    <div>

                      <strong>
                        Partial Payment
                      </strong>


                      <p>
                        Sau giao dịch này khách vẫn còn{" "}
                        {
                          money(
                            paymentBalance -
                            Number(
                              amount ||
                              0
                            )
                          )
                        }{" "}
                        chưa thanh toán.
                      </p>

                    </div>

                  </div>

                )
              }

            </>

          )
        }

      </Modal>


      {/* =================================================
          VOID PAYMENT MODAL
      ================================================= */}

      <Modal
        open={
          Boolean(
            voidPaymentState
          )
        }

        title="Void Payment"

        subtitle="PAYMENT — AUDIT CONTROL"

        onClose={
          () => {
            setVoidPaymentState(
              null
            );

            setVoidReason(
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
                  setVoidPaymentState(
                    null
                  )
              }
            >
              Hủy
            </button>


            <button
              className="button button-danger"

              onClick={
                confirmVoidPayment
              }
            >
              <Ban
                size={16}
              />

              Xác nhận Void
            </button>

          </>
        }
      >

        <div className="payment-void-warning">

          <Ban
            size={20}
          />


          <div>

            <strong>
              Payment không bị xóa
            </strong>


            <p>
              Giao dịch sẽ chuyển sang trạng thái Voided.
              Outstanding Balance sẽ được tính lại ngay sau
              khi Void.
            </p>

          </div>

        </div>


        <Field
          label="Lý do Void *"
        >

          <textarea
            rows="4"

            value={
              voidReason
            }

            onChange={
              (event) =>
                setVoidReason(
                  event.target.value
                )
            }

            placeholder="Ví dụ: Nhập sai số tiền / sai phương thức thanh toán..."
          />

        </Field>

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

        subtitle="PAYMENT HISTORY"

        onClose={
          () =>
            setDetailReservationId(
              null
            )
        }
      >

        {
          detailReservation &&
          detailFolio && (

            <PaymentDetail
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

              folio={
                detailFolio
              }

              payments={
                getPayments(
                  detailReservation.id
                )
              }

              allPayments={
                payments
              }

              refunds={
                refunds
              }

              onRecordPayment={
                () => {
                  setDetailReservationId(
                    null
                  );

                  openPayment(
                    detailReservation.id
                  );
                }
              }

              onVoidPayment={
                (
                  payment
                ) =>
                  setVoidPaymentState({
                    paymentId:
                      payment.id,

                    reservationId:
                      detailReservation.id,

                    folioId:
                      detailFolio.id,
                  })
              }
            />

          )
        }

      </Drawer>

    </>
  );
}


/* =====================================================
   RESERVATION CARD
===================================================== */

function PaymentReservationCard({
  reservation,
  guest,
  property,
  balance,
}) {
  return (
    <div className="payment-reservation-card">

      <div className="payment-reservation-icon">

        <UserRound
          size={21}
        />

      </div>


      <div>

        <span>
          RESERVATION
        </span>


        <strong>
          {
            reservation.reservationCode
          }
        </strong>


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

      </div>


      <div className="payment-reservation-balance">

        <span>
          OUTSTANDING
        </span>

        <strong>
          {
            money(
              balance
            )
          }
        </strong>

      </div>

    </div>
  );
}


/* =====================================================
   PAYMENT DETAIL
===================================================== */

function PaymentDetail({
  reservation,
  guest,
  property,
  folio,
  payments,
  allPayments,
  refunds,
  onRecordPayment,
  onVoidPayment,
}) {
  const charges =
    activeChargeTotal(
      folio
    );


  const paid =
    activePaymentTotal(
      reservation.id,
      allPayments
    );


  const refunded =
    activeRefundTotal(
      reservation.id,
      refunds
    );


  const balance =
    calculateOutstanding(
      folio,
      allPayments,
      refunds
    );


  const status =
    calculatePaymentStatus(
      folio,
      allPayments,
      refunds
    );


  return (
    <>
      <div className="payment-detail-hero">

        <div>

          <span>
            PAYMENT ACCOUNT
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
            {" · "}
            {
              property?.name ||
              "—"
            }
          </p>

        </div>


        <PaymentStatusBadge
          status={
            status
          }
        />

      </div>


      <div className="detail-section-title">
        Payment Summary
      </div>


      <div className="payment-summary-grid">

        <Summary
          label="Charges"
          value={
            money(
              charges
            )
          }
        />


        <Summary
          label="Paid"
          value={
            money(
              paid
            )
          }
        />


        <Summary
          label="Refunded"
          value={
            money(
              refunded
            )
          }
        />


        <Summary
          label="Outstanding"
          value={
            money(
              balance
            )
          }

          emphasis={
            balance >
            0
          }
        />

      </div>


      <div className="detail-section-title">
        Payment History
      </div>


      {
        payments.length >
          0
          ? (
            <div className="payment-history-list">

              {
                payments.map(
                  (payment) => (

                    <div
                      className={`payment-history-item ${
                        payment.status ===
                        "Voided"
                          ? "voided"
                          : ""
                      }`}

                      key={
                        payment.id
                      }
                    >

                      <div className="payment-history-main">

                        <div className="payment-method-icon">

                          {
                            payment.method ===
                            "Cash"
                              ? (
                                <Banknote
                                  size={17}
                                />
                              )
                              : payment.method ===
                                "Bank Transfer"
                                ? (
                                  <Landmark
                                    size={17}
                                  />
                                )
                                : (
                                  <CreditCard
                                    size={17}
                                  />
                                )
                          }

                        </div>


                        <div>

                          <div className="payment-history-title">

                            <strong>
                              {
                                payment.method
                              }
                            </strong>


                            <TransactionStatusBadge
                              status={
                                payment.status
                              }
                            />

                          </div>


                          <p>
                            {
                              payment.provider ||
                              "No provider"
                            }
                          </p>


                          {
                            payment.transactionReference && (

                              <small>
                                Ref:{" "}
                                {
                                  payment.transactionReference
                                }
                              </small>

                            )
                          }


                          <small>
                            {
                              payment.paidAt ||
                              "—"
                            }
                          </small>

                        </div>

                      </div>


                      <div className="payment-history-right">

                        <strong>
                          {
                            money(
                              payment.amount
                            )
                          }
                        </strong>


                        {
                          payment.status !==
                            "Voided" && (

                            <button
                              className="button button-danger-outline button-sm"

                              onClick={
                                () =>
                                  onVoidPayment(
                                    payment
                                  )
                              }
                            >
                              <Ban
                                size={13}
                              />

                              Void
                            </button>

                          )
                        }

                      </div>


                      {
                        payment.note && (

                          <div className="payment-history-note">
                            {
                              payment.note
                            }
                          </div>

                        )
                      }


                      {
                        payment.status ===
                          "Voided" && (

                          <div className="payment-void-info">

                            <strong>
                              Void reason:
                            </strong>

                            {" "}

                            {
                              payment.voidReason ||
                              "—"
                            }

                          </div>

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

              <ReceiptText
                size={27}
              />


              <strong>
                Chưa có Payment
              </strong>


              <span>
                Folio này chưa ghi nhận giao dịch thanh toán.
              </span>

            </div>
          )
      }


      <div className="drawer-actions">

        <button
          className="button button-dark"

          disabled={
            balance <=
            0
          }

          onClick={
            onRecordPayment
          }
        >
          <Plus
            size={16}
          />

          Record Payment
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


function Summary({
  label,
  value,
  emphasis = false,
}) {
  return (
    <div
      className={`payment-summary-card ${
        emphasis
          ? "emphasis"
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