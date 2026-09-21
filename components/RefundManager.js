"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  ArrowDownLeft,
  CircleDollarSign,
  Eye,
  ReceiptText,
  RotateCcw,
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


function grossPaidTotal(
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


function refundTotal(
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


function netPaidTotal(
  reservationId,
  payments,
  refunds
) {
  return Math.max(
    grossPaidTotal(
      reservationId,
      payments
    ) -
      refundTotal(
        reservationId,
        refunds
      ),
    0
  );
}


function refundableAmount(
  reservationId,
  payments,
  refunds
) {
  return Math.max(
    grossPaidTotal(
      reservationId,
      payments
    ) -
      refundTotal(
        reservationId,
        refunds
      ),
    0
  );
}


function outstandingBalance(
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
      netPaidTotal(
        folio.reservationId,
        payments,
        refunds
      ),
    0
  );
}


function paymentStatus(
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


  const grossPaid =
    grossPaidTotal(
      folio.reservationId,
      payments
    );


  const refunded =
    refundTotal(
      folio.reservationId,
      refunds
    );


  const netPaid =
    Math.max(
      grossPaid -
        refunded,
      0
    );


  if (
    grossPaid >
      0 &&
    refunded >=
      grossPaid
  ) {
    return "Refunded";
  }


  if (
    grossPaid <=
      0
  ) {
    return "Unpaid";
  }


  if (
    charges >
      0 &&
    netPaid >=
      charges
  ) {
    return "Paid";
  }


  return "Partial";
}


/* =====================================================
   BADGES
===================================================== */

function RefundTypeBadge({
  type,
}) {
  return (
    <span
      className={`status-badge ${
        type ===
        "Full Refund"
          ? "status-danger"
          : "status-warning"
      }`}
    >
      {type}
    </span>
  );
}


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


/* =====================================================
   MAIN
===================================================== */

export default function RefundManager() {
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

  const folios =
    data.folios || [];

  const payments =
    data.payments || [];

  const refunds =
    data.refunds || [];


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    propertyFilter,
    setPropertyFilter,
  ] = useState("");


  const [
    refundReservationId,
    setRefundReservationId,
  ] = useState(null);


  const [
    refundAmount,
    setRefundAmount,
  ] = useState("");


  const [
    refundReference,
    setRefundReference,
  ] = useState("");


  const [
    refundReason,
    setRefundReason,
  ] = useState("");


  const [
    detailReservationId,
    setDetailReservationId,
  ] = useState(null);


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


  function getRefunds(
    reservationId
  ) {
    return refunds
      .filter(
        (refund) =>
          refund.reservationId ===
          reservationId
      )
      .sort(
        (
          a,
          b
        ) =>
          String(
            b.refundedAt ||
            ""
          ).localeCompare(
            String(
              a.refundedAt ||
              ""
            )
          )
      );
  }


  /* ===================================================
     ROWS
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


              const grossPaid =
                grossPaidTotal(
                  reservation.id,
                  payments
                );


              const refunded =
                refundTotal(
                  reservation.id,
                  refunds
                );


              const netPaid =
                netPaidTotal(
                  reservation.id,
                  payments,
                  refunds
                );


              const availableRefund =
                refundableAmount(
                  reservation.id,
                  payments,
                  refunds
                );


              const status =
                paymentStatus(
                  folio,
                  payments,
                  refunds
                );


              const text = `
                ${reservation.reservationCode || ""}
                ${guest?.fullName || ""}
                ${guest?.phone || ""}
                ${property?.name || ""}
                ${status}
              `.toLowerCase();


              const matches =
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
                );


              return {
                folio,

                reservation,

                guest,

                property,

                grossPaid,

                refunded,

                netPaid,

                availableRefund,

                status,

                matches,
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
        const gross =
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


        const refunded =
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


        return {
          grossPaid:
            gross,

          refunded,

          netPaid:
            Math.max(
              gross -
                refunded,
              0
            ),

          refundCount:
            refunds.filter(
              (refund) =>
                ![
                  "Voided",
                  "Cancelled",
                ].includes(
                  refund.status
                )
            ).length,
        };
      },
      [
        payments,
        refunds,
      ]
    );


  /* ===================================================
     OPEN REFUND
  =================================================== */

  function openRefund(
    reservationId
  ) {
    const available =
      refundableAmount(
        reservationId,
        payments,
        refunds
      );


    if (
      available <=
      0
    ) {
      alert(
        "Reservation này không còn số tiền có thể hoàn."
      );

      return;
    }


    setRefundReservationId(
      reservationId
    );


    /*
     * Mặc định Full Refund số tiền
     * còn có thể hoàn.
     *
     * User có thể nhập số nhỏ hơn
     * để thực hiện Partial Refund.
     */
    setRefundAmount(
      String(
        available
      )
    );


    setRefundReference(
      ""
    );


    setRefundReason(
      ""
    );
  }


  /* ===================================================
     RECORD REFUND
  =================================================== */

  function recordRefund() {
    const reservation =
      getReservation(
        refundReservationId
      );


    const folio =
      getFolio(
        refundReservationId
      );


    if (
      !reservation ||
      !folio
    ) {
      return;
    }


    const numericAmount =
      Number(
        refundAmount
      );


    const available =
      refundableAmount(
        reservation.id,
        payments,
        refunds
      );


    if (
      !Number.isFinite(
        numericAmount
      ) ||
      numericAmount <=
        0
    ) {
      alert(
        "Số tiền hoàn phải lớn hơn 0."
      );

      return;
    }


    if (
      numericAmount >
      available
    ) {
      alert(
        `Không thể hoàn nhiều hơn ${money(
          available
        )}.`
      );

      return;
    }


    if (
      !refundReference.trim()
    ) {
      alert(
        "Vui lòng nhập Refund Reference."
      );

      return;
    }


    if (
      !refundReason.trim()
    ) {
      alert(
        "Vui lòng nhập Refund Reason."
      );

      return;
    }


    /*
     * Không cho trùng Refund Reference.
     */
    const duplicateReference =
      refunds.some(
        (refund) =>
          ![
            "Voided",
            "Cancelled",
          ].includes(
            refund.status
          ) &&
          String(
            refund.refundReference ||
            ""
          )
            .trim()
            .toLowerCase() ===
            refundReference
              .trim()
              .toLowerCase()
      );


    if (
      duplicateReference
    ) {
      alert(
        "Refund Reference này đã tồn tại."
      );

      return;
    }


    const actionTime =
      nowText();


    const type =
      numericAmount ===
      available
        ? "Full Refund"
        : "Partial Refund";


    const newRefund = {
      id:
        makeId(
          "refund"
        ),

      reservationId:
        reservation.id,

      folioId:
        folio.id,

      propertyId:
        reservation.propertyId,

      guestId:
        reservation.guestId,

      type,

      amount:
        numericAmount,

      currency:
        "VND",

      refundReference:
        refundReference.trim(),

      reason:
        refundReason.trim(),

      status:
        "Posted",

      refundedAt:
        actionTime,

      createdAt:
        actionTime,

      updatedAt:
        actionTime,
    };


    setData(
      (current) => {
        const nextRefunds = [
          newRefund,

          ...(
            current.refunds ||
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
          outstandingBalance(
            currentFolio,
            current.payments ||
            [],
            nextRefunds
          );


        const nextPaymentStatus =
          paymentStatus(
            currentFolio,
            current.payments ||
            [],
            nextRefunds
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
                        0 &&
                      nextPaymentStatus ===
                        "Paid"
                        ? "Settled"
                        : "Open",

                    paymentStatus:
                      nextPaymentStatus,

                    updatedAt:
                      actionTime,

                    logs: [
                      `${actionTime} — ${type} ${money(
                        numericAmount
                      )}. Ref: ${refundReference.trim()}`,

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
                      nextPaymentStatus,

                    updatedAt:
                      actionTime,

                    logs: [
                      `${actionTime} — ${type} ${money(
                        numericAmount
                      )}. Lý do: ${refundReason.trim()}`,

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

          refunds:
            nextRefunds,

          folios:
            nextFolios,

          reservations:
            nextReservations,
        };
      }
    );


    setRefundReservationId(
      null
    );


    setRefundAmount(
      ""
    );


    setRefundReference(
      ""
    );


    setRefundReason(
      ""
    );
  }


  /* ===================================================
     CURRENT VALUES
  =================================================== */

  const refundReservation =
    getReservation(
      refundReservationId
    );


  const refundFolio =
    refundReservation
      ? getFolio(
          refundReservation.id
        )
      : null;


  const maxRefund =
    refundReservation
      ? refundableAmount(
          refundReservation.id,
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
            BƯỚC 15 — REFUND
          </div>


          <h1>
            Hoàn tiền{" "}
            <span className="heading-en">
              (Refund)
            </span>
          </h1>


          <p>
            Thực hiện Partial Refund hoặc Full Refund,
            lưu mã giao dịch hoàn tiền, lý do và toàn bộ
            Refund History.
          </p>

        </div>

      </div>


      {/* =================================================
          EXPLAIN
      ================================================= */}

      <section className="explain-card">

        <div className="explain-icon">

          <RotateCcw
            size={21}
          />

        </div>


        <div>

          <strong>
            Refund được tính trên số tiền khách đã thanh toán
          </strong>


          <p>
            PMS không cho hoàn nhiều hơn số tiền thực tế còn
            có thể hoàn. Sau mỗi Refund, Net Paid và
            Outstanding Balance được tính lại tự động.
          </p>


          <div className="refund-flow">

            <span>
              Gross Paid
            </span>

            <b>−</b>

            <span>
              Refund
            </span>

            <b>=</b>

            <span>
              Net Paid
            </span>

            <b>→</b>

            <span>
              Balance
            </span>

          </div>

        </div>

      </section>


      {/* =================================================
          METRICS
      ================================================= */}

      <div className="metric-grid">

        <Metric
          label="Gross Paid"
          value={
            money(
              metrics.grossPaid
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
          label="Net Paid"
          value={
            money(
              metrics.netPaid
            )
          }
        />


        <Metric
          label="Refund Transactions"
          value={
            metrics.refundCount
          }
        />

      </div>


      {/* =================================================
          LIST
      ================================================= */}

      <section className="panel">

        <div className="panel-toolbar">

          <div className="refund-filter-grid">

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

          <table className="data-table refund-table">

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
                  Gross Paid
                </th>

                <th>
                  Refunded
                </th>

                <th>
                  Net Paid
                </th>

                <th>
                  Refundable
                </th>

                <th>
                  Payment Status
                </th>

                <th>
                  Refunds
                </th>

                <th className="text-right">
                  Thao tác
                </th>

              </tr>

            </thead>


            <tbody>

              {
                rows.map(
                  (row) => (

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
                              row.grossPaid
                            )
                          }
                        </strong>
                      </td>


                      <td className="refund-value">
                        {
                          money(
                            row.refunded
                          )
                        }
                      </td>


                      <td>
                        <strong>
                          {
                            money(
                              row.netPaid
                            )
                          }
                        </strong>
                      </td>


                      <td>
                        {
                          money(
                            row.availableRefund
                          )
                        }
                      </td>


                      <td>

                        <PaymentStatusBadge
                          status={
                            row.status
                          }
                        />

                      </td>


                      <td>
                        {
                          getRefunds(
                            row.reservation.id
                          ).length
                        }{" "}
                        transaction(s)
                      </td>


                      <td>

                        <div className="action-row">

                          <button
                            className="table-action"

                            title="Refund History"

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
                              row.availableRefund <=
                              0
                            }

                            onClick={
                              () =>
                                openRefund(
                                  row.reservation.id
                                )
                            }
                          >
                            <ArrowDownLeft
                              size={14}
                            />

                            Refund
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )
              }

            </tbody>

          </table>


          {
            rows.length ===
              0 && (

              <div className="empty-state">

                <RotateCcw
                  size={38}
                />


                <strong>
                  Không có Folio
                </strong>


                <span>
                  Chưa có dữ liệu phù hợp để thực hiện Refund.
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
          Refund hoạt động như thế nào?
        </h2>


        <div className="business-grid">

          <BusinessItem
            number="01"

            icon={
              <ArrowDownLeft
                size={18}
              />
            }

            title="Partial Refund"

            text="Hoàn một phần số tiền khách đã thanh toán và giữ phần còn lại trong Net Paid."
          />


          <BusinessItem
            number="02"

            icon={
              <RotateCcw
                size={18}
              />
            }

            title="Full Refund"

            text="Hoàn toàn bộ số tiền hiện còn có thể hoàn của Reservation."
          />


          <BusinessItem
            number="03"

            icon={
              <ReceiptText
                size={18}
              />
            }

            title="Refund Reference"

            text="Mỗi giao dịch hoàn tiền lưu mã tham chiếu để đối soát ngân hàng hoặc payment gateway."
          />


          <BusinessItem
            number="04"

            icon={
              <CircleDollarSign
                size={18}
              />
            }

            title="Net Paid"

            text="PMS tự tính Gross Paid trừ tổng Refund để xác định số tiền thực thu còn lại."
          />

        </div>

      </section>


      {/* =================================================
          REFUND MODAL
      ================================================= */}

      <Modal
        open={
          Boolean(
            refundReservation
          )
        }

        title="Record Refund"

        subtitle="REFUND TRANSACTION"

        onClose={
          () => {
            setRefundReservationId(
              null
            );

            setRefundAmount(
              ""
            );

            setRefundReference(
              ""
            );

            setRefundReason(
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
                  setRefundReservationId(
                    null
                  )
              }
            >
              Hủy
            </button>


            <button
              className="button button-dark"

              onClick={
                recordRefund
              }
            >
              <RotateCcw
                size={16}
              />

              Record Refund
            </button>

          </>
        }
      >

        {
          refundReservation &&
          refundFolio && (

            <>
              <RefundReservationCard
                reservation={
                  refundReservation
                }

                guest={
                  getGuest(
                    refundReservation.guestId
                  )
                }

                property={
                  getProperty(
                    refundReservation.propertyId
                  )
                }

                refundable={
                  maxRefund
                }
              />


              <div className="form-grid">

                <Field
                  label="Refund Amount (VND) *"
                >

                  <input
                    type="number"

                    min="1"

                    max={
                      maxRefund
                    }

                    step="1000"

                    value={
                      refundAmount
                    }

                    onChange={
                      (event) =>
                        setRefundAmount(
                          event.target.value
                        )
                    }
                  />


                  <small className="form-help">
                    Tối đa có thể hoàn:{" "}
                    {
                      money(
                        maxRefund
                      )
                    }
                  </small>

                </Field>


                <Field
                  label="Refund Reference *"
                >

                  <input
                    value={
                      refundReference
                    }

                    onChange={
                      (event) =>
                        setRefundReference(
                          event.target.value
                        )
                    }

                    placeholder="Ví dụ: VNPAY-RF-20260921-001"
                  />

                </Field>


                <Field
                  label="Refund Reason *"
                >

                  <textarea
                    rows="4"

                    value={
                      refundReason
                    }

                    onChange={
                      (event) =>
                        setRefundReason(
                          event.target.value
                        )
                    }

                    placeholder="Ví dụ: Khách thay đổi lịch lưu trú..."
                  />

                </Field>

              </div>


              {
                Number(
                  refundAmount ||
                  0
                ) >
                  0 && (

                  <div className="refund-preview">

                    <CircleDollarSign
                      size={18}
                    />


                    <div>

                      <strong>
                        {
                          Number(
                            refundAmount
                          ) ===
                          maxRefund
                            ? "Full Refund"
                            : "Partial Refund"
                        }
                      </strong>


                      <p>
                        Net Paid sau Refund:{" "}
                        {
                          money(
                            Math.max(
                              maxRefund -
                              Number(
                                refundAmount ||
                                0
                              ),
                              0
                            )
                          )
                        }
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

        subtitle="REFUND HISTORY"

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

            <RefundDetail
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
                payments
              }

              refunds={
                getRefunds(
                  detailReservation.id
                )
              }

              allRefunds={
                refunds
              }

              onRefund={
                () => {
                  setDetailReservationId(
                    null
                  );

                  openRefund(
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
   REFUND RESERVATION CARD
===================================================== */

function RefundReservationCard({
  reservation,
  guest,
  property,
  refundable,
}) {
  return (
    <div className="refund-reservation-card">

      <div className="refund-reservation-icon">

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


      <div className="refund-reservation-amount">

        <span>
          REFUNDABLE
        </span>


        <strong>
          {
            money(
              refundable
            )
          }
        </strong>

      </div>

    </div>
  );
}


/* =====================================================
   REFUND DETAIL
===================================================== */

function RefundDetail({
  reservation,
  guest,
  property,
  folio,
  payments,
  refunds,
  allRefunds,
  onRefund,
}) {
  const gross =
    grossPaidTotal(
      reservation.id,
      payments
    );


  const refunded =
    refundTotal(
      reservation.id,
      allRefunds
    );


  const netPaid =
    netPaidTotal(
      reservation.id,
      payments,
      allRefunds
    );


  const available =
    refundableAmount(
      reservation.id,
      payments,
      allRefunds
    );


  return (
    <>
      <div className="refund-detail-hero">

        <div>

          <span>
            REFUND ACCOUNT
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
            paymentStatus(
              folio,
              payments,
              allRefunds
            )
          }
        />

      </div>


      <div className="detail-section-title">
        Refund Summary
      </div>


      <div className="refund-summary-grid">

        <Summary
          label="Gross Paid"
          value={
            money(
              gross
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
          label="Net Paid"
          value={
            money(
              netPaid
            )
          }
        />


        <Summary
          label="Refundable"
          value={
            money(
              available
            )
          }
        />

      </div>


      <div className="detail-section-title">
        Refund History
      </div>


      {
        refunds.length >
          0
          ? (
            <div className="refund-history-list">

              {
                refunds.map(
                  (refund) => (

                    <div
                      className="refund-history-item"

                      key={
                        refund.id
                      }
                    >

                      <div className="refund-history-main">

                        <div className="refund-history-icon">

                          <ArrowDownLeft
                            size={16}
                          />

                        </div>


                        <div>

                          <div className="refund-history-title">

                            <strong>
                              {
                                money(
                                  refund.amount
                                )
                              }
                            </strong>


                            <RefundTypeBadge
                              type={
                                refund.type
                              }
                            />

                          </div>


                          <p>
                            {
                              refund.reason
                            }
                          </p>


                          <small>
                            Ref:{" "}
                            {
                              refund.refundReference ||
                              "—"
                            }
                          </small>


                          <small>
                            {
                              refund.refundedAt ||
                              "—"
                            }
                          </small>

                        </div>

                      </div>

                    </div>

                  )
                )
              }

            </div>
          )
          : (
            <div className="empty-detail-state">

              <WalletCards
                size={27}
              />


              <strong>
                Chưa có Refund
              </strong>


              <span>
                Reservation này chưa phát sinh giao dịch hoàn tiền.
              </span>

            </div>
          )
      }


      <div className="drawer-actions">

        <button
          className="button button-dark"

          disabled={
            available <=
            0
          }

          onClick={
            onRefund
          }
        >
          <RotateCcw
            size={16}
          />

          Record Refund
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
}) {
  return (
    <div className="refund-summary-card">

      <span>
        {label}
      </span>


      <strong>
        {value}
      </strong>

    </div>
  );
}