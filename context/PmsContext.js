"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  DEFAULT_PMS_DATA,
} from "@/lib/defaultData";


const STORAGE_KEY =
  "cityhouse_pms_nextjs_demo";


const PmsContext =
  createContext(null);


/* =====================================================
   FINANCIAL HELPERS
===================================================== */

function calculateFolioCharges(
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


function calculateReservationPayments(
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


function calculateReservationRefunds(
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


function calculateNetPayments(
  reservationId,
  payments,
  refunds
) {
  const grossPaid =
    calculateReservationPayments(
      reservationId,
      payments
    );


  const refunded =
    calculateReservationRefunds(
      reservationId,
      refunds
    );


  return Math.max(
    grossPaid -
      refunded,
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


  const charges =
    calculateFolioCharges(
      folio
    );


  const netPaid =
    calculateNetPayments(
      folio.reservationId,
      payments,
      refunds
    );


  return Math.max(
    charges -
      netPaid,
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
    calculateFolioCharges(
      folio
    );


  const grossPaid =
    calculateReservationPayments(
      folio.reservationId,
      payments
    );


  const refunded =
    calculateReservationRefunds(
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
   ARRAY MERGE HELPER

   Giữ dữ liệu user đang có trong localStorage
   và bổ sung dữ liệu demo mới từ defaultData.

   Không overwrite record đã tồn tại cùng ID.
===================================================== */

function mergeById(
  currentItems,
  defaultItems
) {
  const map =
    new Map(
      (
        Array.isArray(
          currentItems
        )
          ? currentItems
          : []
      ).map(
        (item) => [
          item.id,
          item,
        ]
      )
    );


  (
    Array.isArray(
      defaultItems
    )
      ? defaultItems
      : []
  ).forEach(
    (item) => {
      if (
        !map.has(
          item.id
        )
      ) {
        map.set(
          item.id,
          item
        );
      }
    }
  );


  return Array.from(
    map.values()
  );
}


/* =====================================================
   MIGRATION DATA
===================================================== */

function migrateData(
  savedData
) {
  const currentVersion =
    Number(
      savedData?.schemaVersion ||
      1
    );


  const merged = {
    ...DEFAULT_PMS_DATA,
    ...savedData,
  };


  /* ===================================================
     STEP 02 — ROOM TYPE
  =================================================== */

  if (
    currentVersion < 2
  ) {
    if (
      !Array.isArray(
        savedData?.roomTypes
      ) ||
      savedData.roomTypes.length ===
        0
    ) {
      merged.roomTypes =
        DEFAULT_PMS_DATA.roomTypes;
    }
  }


  /* ===================================================
     STEP 03 — PHYSICAL ROOM
  =================================================== */

  if (
    currentVersion < 3
  ) {
    if (
      !Array.isArray(
        savedData?.physicalRooms
      ) ||
      savedData.physicalRooms.length ===
        0
    ) {
      merged.physicalRooms =
        DEFAULT_PMS_DATA.physicalRooms;
    }
  }


  /* ===================================================
     STEP 04 — RATE PLAN
  =================================================== */

  if (
    currentVersion < 4
  ) {
    if (
      !Array.isArray(
        savedData?.ratePlans
      ) ||
      savedData.ratePlans.length ===
        0
    ) {
      merged.ratePlans =
        DEFAULT_PMS_DATA.ratePlans;
    }
  }


  /* ===================================================
     STEP 05 — RATE CALENDAR
  =================================================== */

  if (
    currentVersion < 5
  ) {
    if (
      !Array.isArray(
        savedData?.rateCalendar
      ) ||
      savedData.rateCalendar.length ===
        0
    ) {
      merged.rateCalendar =
        DEFAULT_PMS_DATA.rateCalendar;
    }
  }


  /* ===================================================
     STEP 06 — INVENTORY
  =================================================== */

  if (
    currentVersion < 6
  ) {
    if (
      !Array.isArray(
        savedData?.inventory
      ) ||
      savedData.inventory.length ===
        0
    ) {
      merged.inventory =
        DEFAULT_PMS_DATA.inventory;
    }
  }


  /* ===================================================
     STEP 07 — GUEST
  =================================================== */

  if (
    currentVersion < 7
  ) {
    if (
      !Array.isArray(
        savedData?.guests
      ) ||
      savedData.guests.length ===
        0
    ) {
      merged.guests =
        DEFAULT_PMS_DATA.guests;
    }
  }


  /* ===================================================
     STEP 08 — RESERVATION
  =================================================== */

  if (
    currentVersion < 8
  ) {
    if (
      !Array.isArray(
        savedData?.reservations
      ) ||
      savedData.reservations.length ===
        0
    ) {
      merged.reservations =
        DEFAULT_PMS_DATA.reservations;
    }
  }


  /* ===================================================
     STEP 09 — ROOM ASSIGNMENT
  =================================================== */

  if (
    currentVersion < 9
  ) {
    if (
      !Array.isArray(
        savedData?.roomAssignments
      ) ||
      savedData.roomAssignments.length ===
        0
    ) {
      merged.roomAssignments =
        DEFAULT_PMS_DATA.roomAssignments;
    }
  }


  /* ===================================================
     STEP 10 — FRONT DESK
  =================================================== */

  if (
    currentVersion < 10
  ) {
    merged.reservations =
      (
        merged.reservations ||
        []
      ).map(
        (reservation) =>
          reservation.id ===
          "reservation_000002"
            ? {
                ...reservation,

                checkin:
                  reservation.checkin ===
                  "2026-09-21"
                    ? "2026-09-20"
                    : reservation.checkin,

                checkout:
                  reservation.checkout ===
                  "2026-09-22"
                    ? "2026-09-21"
                    : reservation.checkout,

                checkedInAt:
                  reservation.checkedInAt ||
                  "20/09/2026 14:05",

                outstandingBalance:
                  reservation.outstandingBalance ??
                  0,
              }
            : reservation
      );


    const defaultReservation6 =
      DEFAULT_PMS_DATA.reservations?.find(
        (reservation) =>
          reservation.id ===
          "reservation_000006"
      );


    if (
      defaultReservation6 &&
      !(
        merged.reservations ||
        []
      ).some(
        (reservation) =>
          reservation.id ===
          "reservation_000006"
      )
    ) {
      merged.reservations = [
        ...(
          merged.reservations ||
          []
        ),

        defaultReservation6,
      ];
    }


    const defaultAssignment6 =
      DEFAULT_PMS_DATA.roomAssignments?.find(
        (assignment) =>
          assignment.id ===
          "assignment_res_000006"
      );


    if (
      defaultAssignment6 &&
      !(
        merged.roomAssignments ||
        []
      ).some(
        (assignment) =>
          assignment.id ===
          "assignment_res_000006"
      )
    ) {
      merged.roomAssignments = [
        ...(
          merged.roomAssignments ||
          []
        ),

        defaultAssignment6,
      ];
    }


    merged.physicalRooms =
      (
        merged.physicalRooms ||
        []
      ).map(
        (room) => {
          if (
            room.id ===
            "room_co_305"
          ) {
            return {
              ...room,

              occupancyStatus:
                "Occupied",
            };
          }


          if (
            room.id ===
            "room_nm_802"
          ) {
            return {
              ...room,

              occupancyStatus:
                "Occupied",
            };
          }


          return room;
        }
      );
  }


  /* ===================================================
     STEP 11 — ROOM MOVE
  =================================================== */

  if (
    currentVersion < 11
  ) {
    merged.reservations =
      (
        merged.reservations ||
        []
      ).map(
        (reservation) => {
          if (
            reservation.id ===
              "reservation_000002" &&
            reservation.checkin ===
              "2026-09-21" &&
            reservation.checkout ===
              "2026-09-22"
          ) {
            return {
              ...reservation,

              checkin:
                "2026-09-20",

              checkout:
                "2026-09-21",

              nights:
                1,

              checkedInAt:
                reservation.checkedInAt ||
                "20/09/2026 14:05",

              outstandingBalance:
                reservation.outstandingBalance ??
                0,
            };
          }


          return reservation;
        }
      );


    const defaultRoom307 =
      DEFAULT_PMS_DATA.physicalRooms?.find(
        (room) =>
          room.id ===
          "room_co_307"
      );


    if (
      defaultRoom307 &&
      !(
        merged.physicalRooms ||
        []
      ).some(
        (room) =>
          room.id ===
          "room_co_307"
      )
    ) {
      merged.physicalRooms = [
        ...(
          merged.physicalRooms ||
          []
        ),

        defaultRoom307,
      ];
    }


    const defaultRoomMove =
      DEFAULT_PMS_DATA.roomMoves?.find(
        (move) =>
          move.id ===
          "roommove_res_000006_001"
      );


    if (
      defaultRoomMove &&
      !(
        merged.roomMoves ||
        []
      ).some(
        (move) =>
          move.id ===
          "roommove_res_000006_001"
      )
    ) {
      merged.roomMoves = [
        ...(
          merged.roomMoves ||
          []
        ),

        defaultRoomMove,
      ];
    }
  }


  /* ===================================================
     STEP 12 — HOUSEKEEPING
  =================================================== */

  if (
    currentVersion < 12
  ) {
    if (
      !Array.isArray(
        savedData?.housekeeping
      ) ||
      savedData.housekeeping.length ===
        0
    ) {
      merged.housekeeping =
        DEFAULT_PMS_DATA.housekeeping;
    }


    merged.physicalRooms =
      (
        merged.physicalRooms ||
        []
      ).map(
        (room) => {
          const defaults = {
            room_co_201:
              "Clean",

            room_co_202:
              "Dirty",

            room_co_305:
              "Inspected",

            room_co_307:
              "Clean",

            room_nm_801:
              "Cleaning",

            room_nm_802:
              "Clean",
          };


          if (
            !room.housekeepingStatus &&
            defaults[
              room.id
            ]
          ) {
            return {
              ...room,

              housekeepingStatus:
                defaults[
                  room.id
                ],
            };
          }


          return room;
        }
      );
  }


  /* ===================================================
     STEP 13 — FOLIO
  =================================================== */

  if (
    currentVersion < 13
  ) {
    merged.folios =
      mergeById(
        merged.folios,
        DEFAULT_PMS_DATA.folios
      );
  }


  /* ===================================================
     STEP 14 — PAYMENT
  =================================================== */

  if (
    currentVersion < 14
  ) {
    merged.payments =
      mergeById(
        merged.payments,
        DEFAULT_PMS_DATA.payments
      );
  }


  /* ===================================================
     STEP 15 — REFUND
  =================================================== */

  if (
    currentVersion < 15
  ) {
    merged.refunds =
      mergeById(
        merged.refunds,
        DEFAULT_PMS_DATA.refunds
      );
  }


  /* ===================================================
     STEP 16 — NO-SHOW
  =================================================== */

  if (
    currentVersion < 16
  ) {
    merged.noShows =
      mergeById(
        merged.noShows,
        DEFAULT_PMS_DATA.noShows
      );


    merged.channelSyncLogs =
      mergeById(
        merged.channelSyncLogs,
        DEFAULT_PMS_DATA.channelSyncLogs
      );
  }


  /* ===================================================
     STEP 17 — CHANNEX / CHANNEL DISTRIBUTION
  =================================================== */

  if (
    currentVersion < 17
  ) {
    /*
     * 1. Giữ Queue đã được tạo từ Step 16.
     *
     * Nếu localStorage schema 16 chưa có
     * channelSyncLogs thì bổ sung Queue demo
     * từ DEFAULT_PMS_DATA.
     */

    merged.channelSyncLogs =
      mergeById(
        merged.channelSyncLogs,
        DEFAULT_PMS_DATA.channelSyncLogs
      );


    /*
     * 2. Booking Inbox.
     *
     * Booking từ OTA/Channex chưa được import
     * sẽ nằm trong collection này.
     */

    merged.channexBookingInbox =
      mergeById(
        merged.channexBookingInbox,
        DEFAULT_PMS_DATA.channexBookingInbox
      );


    /*
     * 3. Sync Result Logs.
     *
     * Đây là kết quả thực thi:
     *
     * PMS → Channex
     * Channex → PMS
     *
     * Success / Failed
     */

    merged.syncLogs =
      mergeById(
        merged.syncLogs,
        DEFAULT_PMS_DATA.syncLogs
      );
  }


  /* ===================================================
     FALLBACK ARRAYS
  =================================================== */

  if (
    !Array.isArray(
      merged.properties
    )
  ) {
    merged.properties = [];
  }


  if (
    !Array.isArray(
      merged.roomTypes
    )
  ) {
    merged.roomTypes = [];
  }


  if (
    !Array.isArray(
      merged.physicalRooms
    )
  ) {
    merged.physicalRooms = [];
  }


  if (
    !Array.isArray(
      merged.ratePlans
    )
  ) {
    merged.ratePlans = [];
  }


  if (
    !Array.isArray(
      merged.rateCalendar
    )
  ) {
    merged.rateCalendar = [];
  }


  if (
    !Array.isArray(
      merged.inventory
    )
  ) {
    merged.inventory = [];
  }


  if (
    !Array.isArray(
      merged.guests
    )
  ) {
    merged.guests = [];
  }


  if (
    !Array.isArray(
      merged.reservations
    )
  ) {
    merged.reservations = [];
  }


  if (
    !Array.isArray(
      merged.roomAssignments
    )
  ) {
    merged.roomAssignments = [];
  }


  if (
    !Array.isArray(
      merged.roomMoves
    )
  ) {
    merged.roomMoves = [];
  }


  if (
    !Array.isArray(
      merged.housekeeping
    )
  ) {
    merged.housekeeping = [];
  }


  if (
    !Array.isArray(
      merged.folios
    )
  ) {
    merged.folios = [];
  }


  if (
    !Array.isArray(
      merged.payments
    )
  ) {
    merged.payments = [];
  }


  if (
    !Array.isArray(
      merged.refunds
    )
  ) {
    merged.refunds = [];
  }


  if (
    !Array.isArray(
      merged.noShows
    )
  ) {
    merged.noShows = [];
  }


  if (
    !Array.isArray(
      merged.channelSyncLogs
    )
  ) {
    merged.channelSyncLogs = [];
  }


  if (
    !Array.isArray(
      merged.channexBookingInbox
    )
  ) {
    merged.channexBookingInbox = [];
  }


  if (
    !Array.isArray(
      merged.syncLogs
    )
  ) {
    merged.syncLogs = [];
  }


  /* ===================================================
     FINANCIAL RE-CALCULATION

     Folio
       ↓
     Payments
       ↓
     Refunds
       ↓
     Net Paid
       ↓
     Outstanding
       ↓
     Payment Status
  =================================================== */

  merged.folios =
    (
      merged.folios ||
      []
    ).map(
      (folio) => {
        const balance =
          calculateOutstanding(
            folio,
            merged.payments,
            merged.refunds
          );


        const status =
          calculatePaymentStatus(
            folio,
            merged.payments,
            merged.refunds
          );


        return {
          ...folio,

          paymentStatus:
            status,

          status:
            status ===
            "Paid"
              ? "Settled"
              : "Open",

          outstandingBalance:
            balance,
        };
      }
    );


  /* ===================================================
     RESERVATION FINANCIAL STATUS
  =================================================== */

  merged.reservations =
    (
      merged.reservations ||
      []
    ).map(
      (reservation) => {
        const folio =
          (
            merged.folios ||
            []
          ).find(
            (item) =>
              item.reservationId ===
              reservation.id
          );


        /*
         * Reservation chưa có Folio:
         * giữ nguyên Outstanding cũ.
         */

        if (
          !folio
        ) {
          return reservation;
        }


        const balance =
          calculateOutstanding(
            folio,
            merged.payments,
            merged.refunds
          );


        const status =
          calculatePaymentStatus(
            folio,
            merged.payments,
            merged.refunds
          );


        return {
          ...reservation,

          outstandingBalance:
            balance,

          paymentStatus:
            status,
        };
      }
    );


  /* ===================================================
     CURRENT SCHEMA VERSION
  =================================================== */

  merged.schemaVersion =
    DEFAULT_PMS_DATA.schemaVersion;


  return merged;
}


/* =====================================================
   PMS PROVIDER
===================================================== */

export function PmsProvider({
  children,
}) {
  const [
    data,
    setData,
  ] = useState(
    DEFAULT_PMS_DATA
  );


  const [
    ready,
    setReady,
  ] = useState(false);


  /* ===================================================
     LOAD LOCAL STORAGE
  =================================================== */

  useEffect(
    () => {
      try {
        const saved =
          localStorage.getItem(
            STORAGE_KEY
          );


        if (
          saved
        ) {
          const parsed =
            JSON.parse(
              saved
            );


          const migrated =
            migrateData(
              parsed
            );


          setData(
            migrated
          );
        }

        else {
          setData(
            migrateData(
              DEFAULT_PMS_DATA
            )
          );
        }
      }

      catch (
        error
      ) {
        console.error(
          "Không thể đọc dữ liệu PMS:",
          error
        );


        setData(
          migrateData(
            DEFAULT_PMS_DATA
          )
        );
      }

      finally {
        setReady(
          true
        );
      }
    },

    []
  );


  /* ===================================================
     SAVE LOCAL STORAGE
  =================================================== */

  useEffect(
    () => {
      if (
        !ready
      ) {
        return;
      }


      try {
        localStorage.setItem(
          STORAGE_KEY,

          JSON.stringify(
            data
          )
        );
      }

      catch (
        error
      ) {
        console.error(
          "Không thể lưu dữ liệu PMS:",
          error
        );
      }
    },

    [
      data,
      ready,
    ]
  );


  /* ===================================================
     CONTEXT VALUE
  =================================================== */

  const value =
    useMemo(
      () => ({
        data,

        setData,

        ready,


        resetDemo() {
          setData(
            migrateData(
              DEFAULT_PMS_DATA
            )
          );
        },
      }),

      [
        data,
        ready,
      ]
    );


  return (
    <PmsContext.Provider
      value={
        value
      }
    >
      {children}
    </PmsContext.Provider>
  );
}


/* =====================================================
   PMS HOOK
===================================================== */

export function usePms() {
  const context =
    useContext(
      PmsContext
    );


  if (
    !context
  ) {
    throw new Error(
      "usePms phải được sử dụng bên trong PmsProvider."
    );
  }


  return context;
}