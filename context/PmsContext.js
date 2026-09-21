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
   FOLIO HELPERS
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


function calculateOutstanding(
  folio,
  payments
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


  const paid =
    calculateReservationPayments(
      folio.reservationId,
      payments
    );


  return Math.max(
    charges -
      paid,
    0
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
    if (
      Array.isArray(
        merged.reservations
      )
    ) {
      merged.reservations =
        merged.reservations.map(
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
    }


    /* ===============================================
       RESERVATION 000006
    =============================================== */

    const defaultReservation6 =
      DEFAULT_PMS_DATA.reservations?.find(
        (reservation) =>
          reservation.id ===
          "reservation_000006"
      );


    const hasReservation6 =
      Array.isArray(
        merged.reservations
      ) &&
      merged.reservations.some(
        (reservation) =>
          reservation.id ===
          "reservation_000006"
      );


    if (
      !hasReservation6 &&
      defaultReservation6
    ) {
      merged.reservations = [
        ...(
          Array.isArray(
            merged.reservations
          )
            ? merged.reservations
            : []
        ),

        defaultReservation6,
      ];
    }


    /* ===============================================
       ASSIGNMENT 000006
    =============================================== */

    const defaultAssignment6 =
      DEFAULT_PMS_DATA.roomAssignments?.find(
        (assignment) =>
          assignment.id ===
          "assignment_res_000006"
      );


    const hasAssignment6 =
      Array.isArray(
        merged.roomAssignments
      ) &&
      merged.roomAssignments.some(
        (assignment) =>
          assignment.id ===
          "assignment_res_000006"
      );


    if (
      !hasAssignment6 &&
      defaultAssignment6
    ) {
      merged.roomAssignments = [
        ...(
          Array.isArray(
            merged.roomAssignments
          )
            ? merged.roomAssignments
            : []
        ),

        defaultAssignment6,
      ];
    }


    /* ===============================================
       OCCUPIED ROOMS
    =============================================== */

    if (
      Array.isArray(
        merged.physicalRooms
      )
    ) {
      merged.physicalRooms =
        merged.physicalRooms.map(
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
  }


  /* ===================================================
     STEP 11 — ROOM MOVE
  =================================================== */

  if (
    currentVersion < 11
  ) {
    /* ===============================================
       COMPATIBILITY — RES 000002
    =============================================== */

    if (
      Array.isArray(
        merged.reservations
      )
    ) {
      merged.reservations =
        merged.reservations.map(
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
    }


    /* ===============================================
       ROOM 307
    =============================================== */

    const defaultRoom307 =
      DEFAULT_PMS_DATA.physicalRooms?.find(
        (room) =>
          room.id ===
          "room_co_307"
      );


    const hasRoom307 =
      Array.isArray(
        merged.physicalRooms
      ) &&
      merged.physicalRooms.some(
        (room) =>
          room.id ===
          "room_co_307"
      );


    if (
      !hasRoom307 &&
      defaultRoom307
    ) {
      merged.physicalRooms = [
        ...(
          Array.isArray(
            merged.physicalRooms
          )
            ? merged.physicalRooms
            : []
        ),

        defaultRoom307,
      ];
    }


    /* ===============================================
       ROOM MOVE HISTORY
    =============================================== */

    const defaultRoomMove =
      DEFAULT_PMS_DATA.roomMoves?.find(
        (move) =>
          move.id ===
          "roommove_res_000006_001"
      );


    const hasRoomMove =
      Array.isArray(
        merged.roomMoves
      ) &&
      merged.roomMoves.some(
        (move) =>
          move.id ===
          "roommove_res_000006_001"
      );


    if (
      !hasRoomMove &&
      defaultRoomMove
    ) {
      merged.roomMoves = [
        ...(
          Array.isArray(
            merged.roomMoves
          )
            ? merged.roomMoves
            : []
        ),

        defaultRoomMove,
      ];
    }


    if (
      !Array.isArray(
        merged.roomMoves
      )
    ) {
      merged.roomMoves = [];
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


    if (
      !Array.isArray(
        merged.housekeeping
      )
    ) {
      merged.housekeeping = [];
    }


    merged.physicalRooms =
      (
        merged.physicalRooms ||
        []
      ).map(
        (room) => {
          if (
            room.id ===
              "room_co_201" &&
            !room.housekeepingStatus
          ) {
            return {
              ...room,

              housekeepingStatus:
                "Clean",
            };
          }


          if (
            room.id ===
              "room_co_202" &&
            !room.housekeepingStatus
          ) {
            return {
              ...room,

              housekeepingStatus:
                "Dirty",
            };
          }


          if (
            room.id ===
              "room_co_305" &&
            !room.housekeepingStatus
          ) {
            return {
              ...room,

              housekeepingStatus:
                "Inspected",
            };
          }


          if (
            room.id ===
              "room_co_307" &&
            !room.housekeepingStatus
          ) {
            return {
              ...room,

              housekeepingStatus:
                "Clean",
            };
          }


          if (
            room.id ===
              "room_nm_801" &&
            !room.housekeepingStatus
          ) {
            return {
              ...room,

              housekeepingStatus:
                "Cleaning",
            };
          }


          if (
            room.id ===
              "room_nm_802" &&
            !room.housekeepingStatus
          ) {
            return {
              ...room,

              housekeepingStatus:
                "Clean",
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
    /*
     * Folio mới được thêm ở Step 13.
     *
     * Nếu localStorage chưa có Folio,
     * seed toàn bộ Folio demo.
     *
     * Nếu đã có Folio do user test trước,
     * chỉ bổ sung những Folio demo còn thiếu.
     */


    const currentFolios =
      Array.isArray(
        merged.folios
      )
        ? merged.folios
        : [];


    const defaultFolios =
      Array.isArray(
        DEFAULT_PMS_DATA.folios
      )
        ? DEFAULT_PMS_DATA.folios
        : [];


    const folioMap =
      new Map(
        currentFolios.map(
          (folio) => [
            folio.id,
            folio,
          ]
        )
      );


    defaultFolios.forEach(
      (folio) => {
        if (
          !folioMap.has(
            folio.id
          )
        ) {
          folioMap.set(
            folio.id,
            folio
          );
        }
      }
    );


    merged.folios =
      Array.from(
        folioMap.values()
      );


    /*
     * Payments chưa triển khai đến Step 14
     * nhưng đảm bảo array tồn tại để Folio
     * có thể tính balance an toàn.
     */
    if (
      !Array.isArray(
        merged.payments
      )
    ) {
      merged.payments = [];
    }


    /* ===============================================
       SYNC OUTSTANDING BALANCE
    =============================================== */

    /*
     * Outstanding Balance của Reservation
     * giờ không còn là giá trị demo độc lập.
     *
     * Công thức:
     *
     * Active Charges
     * -
     * Valid Payments
     * =
     * Outstanding Balance
     *
     * Charge Voided không được tính.
     */


    merged.reservations =
      (
        merged.reservations ||
        []
      ).map(
        (reservation) => {
          const folio =
            merged.folios.find(
              (item) =>
                item.reservationId ===
                reservation.id
            );


          /*
           * Reservation chưa có Folio
           * thì giữ balance hiện tại.
           *
           * Ví dụ:
           * RES_000002 = 0
           * để tiếp tục demo Check-out.
           */
          if (
            !folio
          ) {
            return reservation;
          }


          const balance =
            calculateOutstanding(
              folio,
              merged.payments
            );


          return {
            ...reservation,

            outstandingBalance:
              balance,
          };
        }
      );
  }


  /* ===================================================
     FALLBACK ARRAYS
  =================================================== */

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
            DEFAULT_PMS_DATA
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
          DEFAULT_PMS_DATA
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
            DEFAULT_PMS_DATA
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