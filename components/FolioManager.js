"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  Ban,
  BedDouble,
  CircleDollarSign,
  Eye,
  FileText,
  Hotel,
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

const CHARGE_TYPES = [
  "Room Charge",
  "Tax",
  "Fee",
  "Minibar",
  "Laundry",
  "Airport Transfer",
  "Extra Bed",
  "Late Checkout",
  "Damage Fee",
  "Other",
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


function activeCharges(
  folio
) {
  return (
    folio?.charges ||
    []
  ).filter(
    (charge) =>
      charge.status !==
      "Voided"
  );
}


function folioTotal(
  folio
) {
  return activeCharges(
    folio
  ).reduce(
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


function paymentTotal(
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


function outstandingBalance(
  folio,
  payments
) {
  if (
    !folio
  ) {
    return 0;
  }


  return Math.max(
    folioTotal(
      folio
    ) -
      paymentTotal(
        folio.reservationId,
        payments
      ),
    0
  );
}


/* =====================================================
   BADGES
===================================================== */

function FolioStatusBadge({
  balance,
}) {
  if (
    balance <=
    0
  ) {
    return (
      <span className="status-badge status-success">
        Settled
      </span>
    );
  }


  return (
    <span className="status-badge status-warning">
      Outstanding
    </span>
  );
}


function ChargeStatusBadge({
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

export default function FolioManager() {
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

  const folios =
    data.folios || [];

  const payments =
    data.payments || [];


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    propertyFilter,
    setPropertyFilter,
  ] = useState("");


  const [
    detailReservationId,
    setDetailReservationId,
  ] = useState(null);


  const [
    chargeReservationId,
    setChargeReservationId,
  ] = useState(null);


  const [
    chargeType,
    setChargeType,
  ] = useState(
    "Minibar"
  );


  const [
    description,
    setDescription,
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
    voidChargeState,
    setVoidChargeState,
  ] = useState(null);


  const [
    voidReason,
    setVoidReason,
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


  function getFolio(
    reservationId
  ) {
    return folios.find(
      (folio) =>
        folio.reservationId ===
        reservationId
    );
  }


  /* ===================================================
     ELIGIBLE RESERVATIONS
  =================================================== */

  const folioReservations =
    useMemo(
      () =>
        reservations.filter(
          (reservation) =>
            ![
              "Cancelled",
              "No-show",
            ].includes(
              reservation.status
            )
        ),
      [
        reservations,
      ]
    );


  /* ===================================================
     FILTER
  =================================================== */

  const filteredReservations =
    useMemo(
      () => {
        const q =
          search
            .trim()
            .toLowerCase();


        return folioReservations.filter(
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


            const text = `
              ${reservation.reservationCode || ""}
              ${guest?.fullName || ""}
              ${guest?.phone || ""}
              ${guest?.email || ""}
              ${property?.name || ""}
              ${roomType?.name || ""}
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
      },
      [
        folioReservations,
        guests,
        properties,
        roomTypes,
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
        const totalCharges =
          folios.reduce(
            (
              total,
              folio
            ) =>
              total +
              folioTotal(
                folio
              ),
            0
          );


        const totalPaid =
          folios.reduce(
            (
              total,
              folio
            ) =>
              total +
              paymentTotal(
                folio.reservationId,
                payments
              ),
            0
          );


        return {
          folios:
            folios.length,

          charges:
            totalCharges,

          paid:
            totalPaid,

          outstanding:
            Math.max(
              totalCharges -
              totalPaid,
              0
            ),
        };
      },
      [
        folios,
        payments,
      ]
    );


  /* ===================================================
     CREATE FOLIO
  =================================================== */

  function createFolio(
    reservation
  ) {
    if (
      getFolio(
        reservation.id
      )
    ) {
      return;
    }


    const actionTime =
      nowText();


    const roomAmount =
      Number(
        reservation.totalAmount ||
        0
      );


    const newFolio = {
      id:
        makeId(
          "folio"
        ),

      reservationId:
        reservation.id,

      propertyId:
        reservation.propertyId,

      guestId:
        reservation.guestId,

      status:
        "Open",

      currency:
        "VND",

      charges:
        roomAmount >
        0
          ? [
              {
                id:
                  makeId(
                    "charge"
                  ),

                type:
                  "Room Charge",

                description:
                  `Room Charge ${formatDate(
                    reservation.checkin
                  )} → ${formatDate(
                    reservation.checkout
                  )}`,

                amount:
                  roomAmount,

                status:
                  "Posted",

                postedAt:
                  actionTime,

                note:
                  `${reservation.nights || 0} night(s) — ${reservation.reservationCode}`,
              },
            ]
          : [],

      createdAt:
        actionTime,

      updatedAt:
        actionTime,

      logs: [
        `${actionTime} — Folio được tạo cho ${reservation.reservationCode}`,

        ...(
          roomAmount >
          0
            ? [
                `${actionTime} — Posted Room Charge ${money(
                  roomAmount
                )}`,
              ]
            : []
        ),
      ],
    };


    setData(
      (current) => ({
        ...current,

        folios: [
          newFolio,

          ...(
            current.folios ||
            []
          ),
        ],

        reservations:
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
                      roomAmount,

                    updatedAt:
                      actionTime,
                  }
                : item
          ),
      })
    );
  }


  /* ===================================================
     ENSURE FOLIO
  =================================================== */

  function ensureFolio(
    reservation
  ) {
    const existing =
      getFolio(
        reservation.id
      );


    if (
      existing
    ) {
      return existing;
    }


    createFolio(
      reservation
    );


    return null;
  }


  /* ===================================================
     OPEN ADD CHARGE
  =================================================== */

  function openAddCharge(
    reservation
  ) {
    if (
      !getFolio(
        reservation.id
      )
    ) {
      createFolio(
        reservation
      );
    }


    setChargeReservationId(
      reservation.id
    );


    setChargeType(
      "Minibar"
    );


    setDescription(
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
     ADD CHARGE
  =================================================== */

  function addCharge() {
    const reservation =
      reservations.find(
        (item) =>
          item.id ===
          chargeReservationId
      );


    if (
      !reservation
    ) {
      return;
    }


    const numericAmount =
      Number(
        amount
      );


    if (
      !chargeType
    ) {
      alert(
        "Vui lòng chọn Charge Type."
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
        "Số tiền phải lớn hơn 0."
      );

      return;
    }


    const actionTime =
      nowText();


    const newCharge = {
      id:
        makeId(
          "charge"
        ),

      type:
        chargeType,

      description:
        description.trim() ||
        chargeType,

      amount:
        numericAmount,

      status:
        "Posted",

      postedAt:
        actionTime,

      note:
        note.trim(),
    };


    setData(
      (current) => {
        let existingFolio =
          (
            current.folios ||
            []
          ).find(
            (folio) =>
              folio.reservationId ===
              reservation.id
          );


        let nextFolios =
          current.folios ||
          [];


        /*
         * Trường hợp modal được mở ngay
         * sau khi tạo folio nhưng React
         * state chưa render lại.
         */
        if (
          !existingFolio
        ) {
          const roomAmount =
            Number(
              reservation.totalAmount ||
              0
            );


          existingFolio = {
            id:
              makeId(
                "folio"
              ),

            reservationId:
              reservation.id,

            propertyId:
              reservation.propertyId,

            guestId:
              reservation.guestId,

            status:
              "Open",

            currency:
              "VND",

            charges:
              roomAmount >
              0
                ? [
                    {
                      id:
                        makeId(
                          "charge"
                        ),

                      type:
                        "Room Charge",

                      description:
                        `Room Charge ${formatDate(
                          reservation.checkin
                        )} → ${formatDate(
                          reservation.checkout
                        )}`,

                      amount:
                        roomAmount,

                      status:
                        "Posted",

                      postedAt:
                        actionTime,

                      note:
                        `${reservation.nights || 0} night(s)`,
                    },
                  ]
                : [],

            createdAt:
              actionTime,

            updatedAt:
              actionTime,

            logs: [
              `${actionTime} — Folio được tạo cho ${reservation.reservationCode}`,
            ],
          };


          nextFolios = [
            existingFolio,

            ...nextFolios,
          ];
        }


        nextFolios =
          nextFolios.map(
            (folio) =>
              folio.id ===
              existingFolio.id
                ? {
                    ...folio,

                    charges: [
                      ...(
                        folio.charges ||
                        []
                      ),

                      newCharge,
                    ],

                    updatedAt:
                      actionTime,

                    logs: [
                      `${actionTime} — Posted ${chargeType}: ${money(
                        numericAmount
                      )}`,

                      ...(
                        folio.logs ||
                        []
                      ),
                    ],
                  }
                : folio
          );


        const updatedFolio =
          nextFolios.find(
            (folio) =>
              folio.id ===
              existingFolio.id
          );


        const balance =
          outstandingBalance(
            updatedFolio,
            current.payments ||
            []
          );


        return {
          ...current,

          folios:
            nextFolios,

          reservations:
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
                        balance,

                      updatedAt:
                        actionTime,
                    }
                  : item
            ),
        };
      }
    );


    setChargeReservationId(
      null
    );


    setDescription(
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
     VOID CHARGE
  =================================================== */

  function confirmVoidCharge() {
    if (
      !voidChargeState
    ) {
      return;
    }


    if (
      !voidReason.trim()
    ) {
      alert(
        "Vui lòng nhập lý do Void Charge."
      );

      return;
    }


    const {
      folioId,
      chargeId,
      reservationId,
    } =
      voidChargeState;


    const actionTime =
      nowText();


    setData(
      (current) => {
        const nextFolios =
          (
            current.folios ||
            []
          ).map(
            (folio) => {
              if (
                folio.id !==
                folioId
              ) {
                return folio;
              }


              const charge =
                (
                  folio.charges ||
                  []
                ).find(
                  (item) =>
                    item.id ===
                    chargeId
                );


              return {
                ...folio,

                charges:
                  (
                    folio.charges ||
                    []
                  ).map(
                    (item) =>
                      item.id ===
                      chargeId
                        ? {
                            ...item,

                            status:
                              "Voided",

                            voidedAt:
                              actionTime,

                            voidReason:
                              voidReason.trim(),
                          }
                        : item
                  ),

                updatedAt:
                  actionTime,

                logs: [
                  `${actionTime} — Voided ${
                    charge?.type ||
                    "Charge"
                  } ${
                    charge
                      ? money(
                          charge.amount
                        )
                      : ""
                  }. Lý do: ${voidReason.trim()}`,

                  ...(
                    folio.logs ||
                    []
                  ),
                ],
              };
            }
          );


        const updatedFolio =
          nextFolios.find(
            (folio) =>
              folio.id ===
              folioId
          );


        const balance =
          outstandingBalance(
            updatedFolio,
            current.payments ||
            []
          );


        return {
          ...current,

          folios:
            nextFolios,

          reservations:
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

                      updatedAt:
                        actionTime,
                    }
                  : reservation
            ),
        };
      }
    );


    setVoidChargeState(
      null
    );


    setVoidReason(
      ""
    );
  }


  /* ===================================================
     CURRENT VALUES
  =================================================== */

  const chargeReservation =
    reservations.find(
      (reservation) =>
        reservation.id ===
        chargeReservationId
    );


  const detailReservation =
    reservations.find(
      (reservation) =>
        reservation.id ===
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
            BƯỚC 13 — FOLIO
          </div>


          <h1>
            Chi tiết chi phí khách{" "}
            <span className="heading-en">
              (Guest Folio)
            </span>
          </h1>


          <p>
            Theo dõi Room Charge, thuế, phí và các khoản
            phát sinh của từng Reservation để tính
            Outstanding Balance.
          </p>

        </div>

      </div>


      {/* =================================================
          EXPLAIN
      ================================================= */}

      <section className="explain-card">

        <div className="explain-icon">

          <ReceiptText
            size={21}
          />

        </div>


        <div>

          <strong>
            Một Reservation có một Folio chính
          </strong>


          <p>
            Folio là sổ chi phí của khách. Mọi khoản tiền
            phòng, minibar, laundry và dịch vụ phát sinh
            được Post vào Folio. Payment ở Step 14 sẽ trừ
            trực tiếp vào Outstanding Balance.
          </p>


          <div className="folio-flow">

            <span>
              Reservation
            </span>

            <b>→</b>

            <span>
              Folio
            </span>

            <b>→</b>

            <span>
              Charges
            </span>

            <b>→</b>

            <span>
              Payments
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
          label="Folios"
          value={
            metrics.folios
          }
        />


        <Metric
          label="Total Charges"
          value={
            money(
              metrics.charges
            )
          }
        />


        <Metric
          label="Payments"
          value={
            money(
              metrics.paid
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

      </div>


      {/* =================================================
          LIST
      ================================================= */}

      <section className="panel">

        <div className="panel-toolbar">

          <div className="folio-filter-grid">

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

          <table className="data-table folio-table">

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
                  Charges
                </th>

                <th>
                  Payments
                </th>

                <th>
                  Balance
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


                    const folio =
                      getFolio(
                        reservation.id
                      );


                    const charges =
                      folio
                        ? folioTotal(
                            folio
                          )
                        : 0;


                    const paid =
                      paymentTotal(
                        reservation.id,
                        payments
                      );


                    const balance =
                      folio
                        ? outstandingBalance(
                            folio,
                            payments
                          )
                        : 0;


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
                            {
                              reservation.status
                            }
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

                          <strong>
                            {
                              money(
                                charges
                              )
                            }
                          </strong>


                          <div className="small-copy muted">
                            {
                              folio
                                ? activeCharges(
                                    folio
                                  ).length
                                : 0
                            }{" "}
                            active charge(s)
                          </div>

                        </td>


                        <td>
                          {
                            money(
                              paid
                            )
                          }
                        </td>


                        <td>

                          <strong
                            className={
                              balance >
                              0
                                ? "folio-balance due"
                                : "folio-balance paid"
                            }
                          >
                            {
                              money(
                                balance
                              )
                            }
                          </strong>

                        </td>


                        <td>

                          {
                            folio
                              ? (
                                <FolioStatusBadge
                                  balance={
                                    balance
                                  }
                                />
                              )
                              : (
                                <span className="status-badge status-neutral">
                                  No Folio
                                </span>
                              )
                          }

                        </td>


                        <td>

                          <div className="action-row">

                            {
                              !folio && (

                                <button
                                  className="button button-light button-sm"

                                  onClick={
                                    () =>
                                      createFolio(
                                        reservation
                                      )
                                  }
                                >
                                  <FileText
                                    size={14}
                                  />

                                  Create Folio
                                </button>

                              )
                            }


                            {
                              folio && (

                                <>
                                  <button
                                    className="table-action"

                                    title="Xem Folio"

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


                                  <button
                                    className="button button-dark button-sm"

                                    onClick={
                                      () =>
                                        openAddCharge(
                                          reservation
                                        )
                                    }
                                  >
                                    <Plus
                                      size={14}
                                    />

                                    Add Charge
                                  </button>
                                </>

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
            filteredReservations.length ===
              0 && (

              <div className="empty-state">

                <ReceiptText
                  size={38}
                />


                <strong>
                  Không có Reservation
                </strong>


                <span>
                  Không tìm thấy Reservation phù hợp với bộ lọc.
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
          Folio quản lý những gì?
        </h2>


        <div className="business-grid">

          <BusinessItem
            number="01"

            icon={
              <BedDouble
                size={18}
              />
            }

            title="Room Charge"

            text="Tiền phòng từ Reservation được đưa vào Folio để hình thành khoản phải thu của khách."
          />


          <BusinessItem
            number="02"

            icon={
              <Plus
                size={18}
              />
            }

            title="Extra Charges"

            text="Minibar, Laundry, Airport Transfer, Extra Bed, Late Checkout và các khoản phát sinh khác."
          />


          <BusinessItem
            number="03"

            icon={
              <Ban
                size={18}
              />
            }

            title="Void Charge"

            text="Khoản phí nhập sai không bị xóa khỏi lịch sử mà chuyển sang trạng thái Voided."
          />


          <BusinessItem
            number="04"

            icon={
              <WalletCards
                size={18}
              />
            }

            title="Outstanding Balance"

            text="Balance được tính từ Charge còn hiệu lực trừ Payment hợp lệ và được Front Desk dùng khi Check-out."
          />

        </div>

      </section>


      {/* =================================================
          ADD CHARGE MODAL
      ================================================= */}

      <Modal
        open={
          Boolean(
            chargeReservation
          )
        }

        title="Add Charge"

        subtitle="FOLIO — POST CHARGE"

        onClose={
          () => {
            setChargeReservationId(
              null
            );

            setDescription(
              ""
            );

            setAmount(
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
                  setChargeReservationId(
                    null
                  )
              }
            >
              Hủy
            </button>


            <button
              className="button button-dark"

              onClick={
                addCharge
              }
            >
              <Plus
                size={16}
              />

              Post Charge
            </button>

          </>
        }
      >

        {
          chargeReservation && (

            <>
              <FolioReservationCard
                reservation={
                  chargeReservation
                }

                guest={
                  getGuest(
                    chargeReservation.guestId
                  )
                }

                property={
                  getProperty(
                    chargeReservation.propertyId
                  )
                }
              />


              <div className="form-grid">

                <Field
                  label="Charge Type *"
                >

                  <select
                    value={
                      chargeType
                    }

                    onChange={
                      (event) =>
                        setChargeType(
                          event.target.value
                        )
                    }
                  >

                    {
                      CHARGE_TYPES.map(
                        (type) => (

                          <option
                            key={
                              type
                            }

                            value={
                              type
                            }
                          >
                            {type}
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

                    min="0"

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

                    placeholder="Ví dụ: 350000"
                  />

                </Field>


                <Field
                  label="Description"
                >

                  <input
                    value={
                      description
                    }

                    onChange={
                      (event) =>
                        setDescription(
                          event.target.value
                        )
                    }

                    placeholder="Ví dụ: Minibar — 2 bia + 1 nước suối"
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

                    placeholder="Ghi chú nội bộ..."
                  />

                </Field>

              </div>

            </>

          )
        }

      </Modal>


      {/* =================================================
          VOID CHARGE MODAL
      ================================================= */}

      <Modal
        open={
          Boolean(
            voidChargeState
          )
        }

        title="Void Charge"

        subtitle="FOLIO — AUDIT CONTROL"

        onClose={
          () => {
            setVoidChargeState(
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
                  setVoidChargeState(
                    null
                  )
              }
            >
              Hủy
            </button>


            <button
              className="button button-danger"

              onClick={
                confirmVoidCharge
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

        {
          voidChargeState && (

            <>
              <div className="folio-void-warning">

                <Ban
                  size={20}
                />


                <div>

                  <strong>
                    Charge sẽ không bị xóa
                  </strong>


                  <p>
                    Khoản phí sẽ chuyển sang trạng thái
                    Voided và vẫn được giữ trong lịch sử
                    Folio để phục vụ audit.
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

                  placeholder="Ví dụ: Nhân viên nhập nhầm số tiền..."
                />

              </Field>

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

        subtitle="GUEST FOLIO"

        onClose={
          () =>
            setDetailReservationId(
              null
            )
        }
      >

        {
          detailReservation && (

            <FolioDetail
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

              folio={
                detailFolio
              }

              payments={
                payments
              }

              onCreate={
                () =>
                  ensureFolio(
                    detailReservation
                  )
              }

              onAddCharge={
                () => {
                  setDetailReservationId(
                    null
                  );

                  openAddCharge(
                    detailReservation
                  );
                }
              }

              onVoidCharge={
                (
                  folioId,
                  chargeId
                ) =>
                  setVoidChargeState({
                    folioId,

                    chargeId,

                    reservationId:
                      detailReservation.id,
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

function FolioReservationCard({
  reservation,
  guest,
  property,
}) {
  return (
    <div className="folio-reservation-card">

      <div className="folio-reservation-icon">

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

    </div>
  );
}


/* =====================================================
   FOLIO DETAIL
===================================================== */

function FolioDetail({
  reservation,
  guest,
  property,
  roomType,
  folio,
  payments,
  onCreate,
  onAddCharge,
  onVoidCharge,
}) {
  const charges =
    folio?.charges ||
    [];


  const totalCharges =
    folio
      ? folioTotal(
          folio
        )
      : 0;


  const totalPayments =
    paymentTotal(
      reservation.id,
      payments
    );


  const balance =
    folio
      ? outstandingBalance(
          folio,
          payments
        )
      : 0;


  return (
    <>
      <div className="folio-detail-hero">

        <div>

          <span>
            GUEST FOLIO
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


        {
          folio
            ? (
              <FolioStatusBadge
                balance={
                  balance
                }
              />
            )
            : (
              <span className="status-badge status-neutral">
                No Folio
              </span>
            )
        }

      </div>


      <div className="detail-section-title">
        Reservation
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


      {
        !folio
          ? (
            <>
              <div className="empty-detail-state">

                <ReceiptText
                  size={28}
                />


                <strong>
                  Reservation chưa có Folio
                </strong>


                <span>
                  Tạo Folio để bắt đầu quản lý Room Charge và các khoản phát sinh.
                </span>

              </div>


              <div className="drawer-actions">

                <button
                  className="button button-dark"

                  onClick={
                    onCreate
                  }
                >
                  <FileText
                    size={16}
                  />

                  Create Folio
                </button>

              </div>
            </>
          )
          : (
            <>
              <div className="detail-section-title">
                Balance Summary
              </div>


              <div className="folio-summary-grid">

                <Summary
                  label="Charges"
                  value={
                    money(
                      totalCharges
                    )
                  }
                />


                <Summary
                  label="Payments"
                  value={
                    money(
                      totalPayments
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
                Charge History
              </div>


              {
                charges.length >
                  0
                  ? (
                    <div className="folio-charge-list">

                      {
                        charges.map(
                          (charge) => (

                            <div
                              className={`folio-charge-item ${
                                charge.status ===
                                "Voided"
                                  ? "voided"
                                  : ""
                              }`}

                              key={
                                charge.id
                              }
                            >

                              <div className="folio-charge-main">

                                <div className="folio-charge-icon">

                                  <CircleDollarSign
                                    size={16}
                                  />

                                </div>


                                <div>

                                  <div className="folio-charge-title">

                                    <strong>
                                      {
                                        charge.type
                                      }
                                    </strong>


                                    <ChargeStatusBadge
                                      status={
                                        charge.status
                                      }
                                    />

                                  </div>


                                  <p>
                                    {
                                      charge.description ||
                                      charge.type
                                    }
                                  </p>


                                  <small>
                                    {
                                      charge.postedAt ||
                                      "—"
                                    }
                                  </small>

                                </div>

                              </div>


                              <div className="folio-charge-right">

                                <strong>
                                  {
                                    money(
                                      charge.amount
                                    )
                                  }
                                </strong>


                                {
                                  charge.status !==
                                    "Voided" && (

                                    <button
                                      className="button button-danger-outline button-sm"

                                      onClick={
                                        () =>
                                          onVoidCharge(
                                            folio.id,
                                            charge.id
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
                                charge.status ===
                                  "Voided" && (

                                  <div className="folio-void-info">

                                    <strong>
                                      Void reason:
                                    </strong>

                                    {" "}

                                    {
                                      charge.voidReason ||
                                      "—"
                                    }

                                  </div>

                                )
                              }


                              {
                                charge.note && (

                                  <div className="folio-charge-note">
                                    {
                                      charge.note
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
                        size={26}
                      />

                      <strong>
                        Chưa có Charge
                      </strong>

                    </div>
                  )
              }


              <div className="detail-section-title">
                Folio Activity
              </div>


              <div className="timeline">

                {
                  (
                    folio.logs ||
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

                <button
                  className="button button-dark"

                  onClick={
                    onAddCharge
                  }
                >
                  <Plus
                    size={16}
                  />

                  Add Charge
                </button>

              </div>

            </>
          )
      }

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


function Summary({
  label,
  value,
  emphasis = false,
}) {
  return (
    <div
      className={`folio-summary-card ${
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