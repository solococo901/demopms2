"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  Ban,
  BedDouble,
  CalendarDays,
  CircleDollarSign,
  Eye,
  Hotel,
  Pencil,
  Plus,
  Search,
  UserRound,
  Users,
} from "lucide-react";

import {
  usePms,
} from "@/context/PmsContext";

import Modal from "@/components/Modal";
import Drawer from "@/components/Drawer";


const SOURCES = [
  "Direct",
  "Website",
  "Walk-in",
  "Phone",
  "Channex",
  "OTA",
];


const STATUSES = [
  "Pending",
  "Confirmed",
  "Checked In",
  "Checked Out",
  "Cancelled",
  "No-show",
];


const blankForm = {
  guestId: "",

  propertyId: "",

  roomTypeId: "",

  ratePlanId: "",

  checkin: "",

  checkout: "",

  adults: 1,

  children: 0,

  source: "Direct",

  status: "Confirmed",

  specialRequest: "",

  internalNote: "",
};


/* =====================================================
   DATE HELPERS
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


function addDays(
  dateString,
  days
) {
  const date =
    new Date(
      `${dateString}T00:00:00`
    );


  date.setDate(
    date.getDate() +
      days
  );


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


function dateRange(
  checkin,
  checkout
) {
  if (
    !checkin ||
    !checkout ||
    checkout <= checkin
  ) {
    return [];
  }


  const dates = [];

  let current =
    checkin;


  while (
    current < checkout
  ) {
    dates.push(
      current
    );


    current =
      addDays(
        current,
        1
      );
  }


  return dates;
}


function nightsBetween(
  checkin,
  checkout
) {
  return dateRange(
    checkin,
    checkout
  ).length;
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


function nowText() {
  return new Date().toLocaleString(
    "vi-VN"
  );
}


/* =====================================================
   GENERAL HELPERS
===================================================== */

function makeId() {
  return `reservation_${Date.now()}_${Math.random()
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


function calculateAvailable(
  entry
) {
  return Math.max(
    Number(
      entry?.totalRooms ||
        0
    ) -
      Number(
        entry?.bookedRooms ||
          0
      ) -
      Number(
        entry?.blockedRooms ||
          0
      ),
    0
  );
}


/*
 * Reservation giữ Inventory trừ khi
 * booking đã Cancelled hoặc No-show.
 */
function holdsInventory(
  status
) {
  return ![
    "Cancelled",
    "No-show",
  ].includes(
    status
  );
}


function generateReservationCode(
  reservations
) {
  let maxNumber = 0;


  reservations.forEach(
    (reservation) => {
      const code =
        reservation.reservationCode ||
        reservation.code ||
        "";


      const match =
        String(
          code
        ).match(
          /RES_(\d+)/
        );


      if (
        match
      ) {
        maxNumber =
          Math.max(
            maxNumber,
            Number(
              match[1]
            )
          );
      }
    }
  );


  return `RES_${String(
    maxNumber + 1
  ).padStart(
    6,
    "0"
  )}`;
}


/* =====================================================
   STATUS BADGES
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


  const labelMap = {
    Pending:
      "Pending",

    Confirmed:
      "Confirmed",

    "Checked In":
      "Checked In",

    "Checked Out":
      "Checked Out",

    Cancelled:
      "Cancelled",

    "No-show":
      "No-show",
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
        labelMap[
          status
        ] ||
        status
      }
    </span>
  );
}


/* =====================================================
   MAIN COMPONENT
===================================================== */

export default function ReservationManager() {
  const {
    data,
    setData,
    ready,
  } = usePms();


  const properties =
    data.properties || [];

  const roomTypes =
    data.roomTypes || [];

  const ratePlans =
    data.ratePlans || [];

  const rateCalendar =
    data.rateCalendar || [];

  const inventory =
    data.inventory || [];

  const guests =
    data.guests || [];

  const reservations =
    data.reservations || [];


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    propertyFilter,
    setPropertyFilter,
  ] = useState("");


  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");


  const [
    sourceFilter,
    setSourceFilter,
  ] = useState("");


  const [
    formOpen,
    setFormOpen,
  ] = useState(false);


  const [
    editingId,
    setEditingId,
  ] = useState(null);


  const [
    form,
    setForm,
  ] = useState(
    blankForm
  );


  const [
    detailId,
    setDetailId,
  ] = useState(null);


  const [
    cancelId,
    setCancelId,
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


  function getRatePlan(
    ratePlanId
  ) {
    return ratePlans.find(
      (ratePlan) =>
        ratePlan.id ===
        ratePlanId
    );
  }


  function getPropertyRoomTypes(
    propertyId
  ) {
    return roomTypes.filter(
      (roomType) =>
        roomType.propertyId ===
        propertyId
    );
  }


  function getRoomTypeRatePlans(
    roomTypeId
  ) {
    return ratePlans.filter(
      (ratePlan) =>
        ratePlan.roomTypeId ===
        roomTypeId
    );
  }


  /* ===================================================
     RATE CALCULATION
  =================================================== */

  function getDailyRate(
    ratePlanId,
    date
  ) {
    const ratePlan =
      getRatePlan(
        ratePlanId
      );


    if (
      !ratePlan
    ) {
      return 0;
    }


    const calendarEntry =
      rateCalendar.find(
        (entry) =>
          entry.ratePlanId ===
            ratePlanId &&
          entry.date ===
            date
      );


    if (
      calendarEntry
    ) {
      return Number(
        calendarEntry.rate ||
          0
      );
    }


    return Number(
      ratePlan.baseRate ||
        0
    );
  }


  function calculateStayAmount(
    ratePlanId,
    checkin,
    checkout
  ) {
    return dateRange(
      checkin,
      checkout
    ).reduce(
      (
        total,
        date
      ) =>
        total +
        getDailyRate(
          ratePlanId,
          date
        ),
      0
    );
  }


  /* ===================================================
     STOP SELL VALIDATION
  =================================================== */

  function validateStopSell(
    ratePlanId,
    checkin,
    checkout
  ) {
    const ratePlan =
      getRatePlan(
        ratePlanId
      );


    if (
      !ratePlan
    ) {
      return {
        ok: false,
        message:
          "Rate Plan không tồn tại.",
      };
    }


    if (
      ratePlan.stopSell
    ) {
      return {
        ok: false,
        message:
          `Rate Plan ${ratePlan.name} hiện đang Stop Sell.`,
      };
    }


    const dates =
      dateRange(
        checkin,
        checkout
      );


    for (
      const date of dates
    ) {
      const calendarEntry =
        rateCalendar.find(
          (entry) =>
            entry.ratePlanId ===
              ratePlanId &&
            entry.date ===
              date
        );


      if (
        calendarEntry?.stopSell
      ) {
        return {
          ok: false,

          message:
            `Rate Plan đang Stop Sell ngày ${formatDate(
              date
            )}.`,
        };
      }
    }


    return {
      ok: true,
    };
  }


  /* ===================================================
     INVENTORY
  =================================================== */

  function releaseInventory(
    currentInventory,
    reservation
  ) {
    if (
      !reservation ||
      !holdsInventory(
        reservation.status
      )
    ) {
      return [
        ...currentInventory,
      ];
    }


    const dates =
      dateRange(
        reservation.checkin,
        reservation.checkout
      );


    const releaseTime =
      nowText();


    return currentInventory.map(
      (entry) => {
        if (
          entry.roomTypeId !==
          reservation.roomTypeId ||
          !dates.includes(
            entry.date
          )
        ) {
          return entry;
        }


        const bookedRooms =
          Math.max(
            Number(
              entry.bookedRooms ||
                0
            ) - 1,
            0
          );


        return {
          ...entry,

          bookedRooms,

          availableRooms:
            Math.max(
              Number(
                entry.totalRooms ||
                  0
              ) -
                bookedRooms -
                Number(
                  entry.blockedRooms ||
                    0
                ),
              0
            ),

          synced:
            false,

          updatedAt:
            releaseTime,

          logs: [
            `${releaseTime} — Reservation ${
              reservation.reservationCode ||
              ""
            } release +1 Inventory`,

            ...(
              entry.logs ||
              []
            ),
          ],
        };
      }
    );
  }


  function deductInventory(
    currentInventory,
    reservation
  ) {
    /*
     * Cancelled / No-show
     * không giữ Inventory.
     */
    if (
      !holdsInventory(
        reservation.status
      )
    ) {
      return {
        ok: true,

        inventory: [
          ...currentInventory,
        ],
      };
    }


    const roomType =
      getRoomType(
        reservation.roomTypeId
      );


    if (
      !roomType
    ) {
      return {
        ok: false,

        message:
          "Không tìm thấy Room Type.",
      };
    }


    const dates =
      dateRange(
        reservation.checkin,
        reservation.checkout
      );


    let nextInventory =
      currentInventory.map(
        (entry) => ({
          ...entry,
        })
      );


    /*
     * Nếu một ngày chưa có Inventory,
     * PMS tự khởi tạo từ Total Rooms
     * của Room Type.
     */
    dates.forEach(
      (date) => {
        const exists =
          nextInventory.some(
            (entry) =>
              entry.roomTypeId ===
                reservation.roomTypeId &&
              entry.date ===
                date
          );


        if (
          !exists
        ) {
          const totalRooms =
            Number(
              roomType.totalRooms ||
                0
            );


          nextInventory.push({
            id:
              `inventory_${reservation.roomTypeId}_${date}`,

            propertyId:
              reservation.propertyId,

            roomTypeId:
              reservation.roomTypeId,

            date,

            totalRooms,

            bookedRooms:
              0,

            blockedRooms:
              0,

            availableRooms:
              totalRooms,

            synced:
              false,

            lastSync:
              "",

            createdAt:
              nowText(),

            updatedAt:
              nowText(),

            logs: [
              `${nowText()} — Inventory tự khởi tạo từ Reservation`,
            ],
          });
        }
      }
    );


    /*
     * Kiểm tra toàn bộ ngày trước.
     * Nếu chỉ một ngày Sold Out
     * thì không tạo Reservation.
     */
    for (
      const date of dates
    ) {
      const entry =
        nextInventory.find(
          (item) =>
            item.roomTypeId ===
              reservation.roomTypeId &&
            item.date ===
              date
        );


      if (
        !entry ||
        calculateAvailable(
          entry
        ) <= 0
      ) {
        return {
          ok: false,

          message:
            `Không còn phòng ${
              roomType.name
            } ngày ${formatDate(
              date
            )}.`,
        };
      }
    }


    /*
     * Đủ phòng toàn bộ stay →
     * deduct 1 room cho mỗi đêm.
     */
    const deductionTime =
      nowText();


    nextInventory =
      nextInventory.map(
        (entry) => {
          if (
            entry.roomTypeId !==
              reservation.roomTypeId ||
            !dates.includes(
              entry.date
            )
          ) {
            return entry;
          }


          const bookedRooms =
            Number(
              entry.bookedRooms ||
                0
            ) + 1;


          return {
            ...entry,

            bookedRooms,

            availableRooms:
              Math.max(
                Number(
                  entry.totalRooms ||
                    0
                ) -
                  bookedRooms -
                  Number(
                    entry.blockedRooms ||
                      0
                  ),
                0
              ),

            synced:
              false,

            updatedAt:
              deductionTime,

            logs: [
              `${deductionTime} — Reservation ${
                reservation.reservationCode
              } Booking Deduction -1`,

              ...(
                entry.logs ||
                []
              ),
            ],
          };
        }
      );


    return {
      ok: true,

      inventory:
        nextInventory,
    };
  }


  /* ===================================================
     FILTERS
  =================================================== */

  const filtered =
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


              const ratePlan =
                getRatePlan(
                  reservation.ratePlanId
                );


              const text = `
                ${reservation.reservationCode || ""}
                ${guest?.fullName || ""}
                ${guest?.phone || ""}
                ${guest?.email || ""}
                ${property?.name || ""}
                ${roomType?.name || ""}
                ${ratePlan?.name || ""}
                ${reservation.source || ""}
                ${reservation.status || ""}
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
                ) &&
                (
                  !statusFilter ||
                  reservation.status ===
                    statusFilter
                ) &&
                (
                  !sourceFilter ||
                  reservation.source ===
                    sourceFilter
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
                b.createdAt ||
                ""
              ).localeCompare(
                String(
                  a.createdAt ||
                  ""
                )
              )
          );
      },
      [
        reservations,
        guests,
        properties,
        roomTypes,
        ratePlans,
        search,
        propertyFilter,
        statusFilter,
        sourceFilter,
      ]
    );


  /* ===================================================
     METRICS
  =================================================== */

  const stats =
    useMemo(
      () => ({
        total:
          reservations.length,

        confirmed:
          reservations.filter(
            (reservation) =>
              reservation.status ===
              "Confirmed"
          ).length,

        inHouse:
          reservations.filter(
            (reservation) =>
              reservation.status ===
              "Checked In"
          ).length,

        cancelled:
          reservations.filter(
            (reservation) =>
              reservation.status ===
                "Cancelled" ||
              reservation.status ===
                "No-show"
          ).length,
      }),
      [
        reservations,
      ]
    );


  /* ===================================================
     CREATE
  =================================================== */

  function openCreate() {
    if (
      guests.length ===
      0
    ) {
      alert(
        "Chưa có Guest. Vui lòng hoàn thành Bước 07."
      );

      return;
    }


    if (
      properties.length ===
      0 ||
      roomTypes.length ===
        0 ||
      ratePlans.length ===
        0
    ) {
      alert(
        "Property, Room Type hoặc Rate Plan chưa có dữ liệu."
      );

      return;
    }


    const property =
      properties.find(
        (item) =>
          item.status ===
          "Active"
      ) ||
      properties[0];


    const availableRoomTypes =
      getPropertyRoomTypes(
        property.id
      );


    const roomType =
      availableRoomTypes.find(
        (item) =>
          item.status ===
          "Active"
      ) ||
      availableRoomTypes[0];


    const availableRatePlans =
      getRoomTypeRatePlans(
        roomType?.id
      );


    const ratePlan =
      availableRatePlans.find(
        (item) =>
          !item.stopSell
      ) ||
      availableRatePlans[0];


    const checkin =
      todayString();


    const checkout =
      addDays(
        checkin,
        1
      );


    setEditingId(
      null
    );


    setForm({
      ...blankForm,

      guestId:
        guests[0]?.id ||
        "",

      propertyId:
        property?.id ||
        "",

      roomTypeId:
        roomType?.id ||
        "",

      ratePlanId:
        ratePlan?.id ||
        "",

      checkin,

      checkout,
    });


    setFormOpen(
      true
    );
  }


  /* ===================================================
     EDIT
  =================================================== */

  function openEdit(
    reservation
  ) {
    if (
      reservation.status ===
        "Cancelled"
    ) {
      alert(
        "Reservation đã Cancelled nên không thể chỉnh sửa."
      );

      return;
    }


    setEditingId(
      reservation.id
    );


    setForm({
      guestId:
        reservation.guestId,

      propertyId:
        reservation.propertyId,

      roomTypeId:
        reservation.roomTypeId,

      ratePlanId:
        reservation.ratePlanId,

      checkin:
        reservation.checkin,

      checkout:
        reservation.checkout,

      adults:
        Number(
          reservation.adults ||
            1
        ),

      children:
        Number(
          reservation.children ||
            0
        ),

      source:
        reservation.source ||
        "Direct",

      status:
        reservation.status ||
        "Confirmed",

      specialRequest:
        reservation.specialRequest ||
        "",

      internalNote:
        reservation.internalNote ||
        "",
    });


    setFormOpen(
      true
    );
  }


  /* ===================================================
     FORM CHANGES
  =================================================== */

  function handlePropertyChange(
    propertyId
  ) {
    const availableRoomTypes =
      getPropertyRoomTypes(
        propertyId
      );


    const roomType =
      availableRoomTypes.find(
        (item) =>
          item.status ===
          "Active"
      ) ||
      availableRoomTypes[0];


    const availableRatePlans =
      getRoomTypeRatePlans(
        roomType?.id
      );


    const ratePlan =
      availableRatePlans.find(
        (item) =>
          !item.stopSell
      ) ||
      availableRatePlans[0];


    setForm(
      (current) => ({
        ...current,

        propertyId,

        roomTypeId:
          roomType?.id ||
          "",

        ratePlanId:
          ratePlan?.id ||
          "",
      })
    );
  }


  function handleRoomTypeChange(
    roomTypeId
  ) {
    const availableRatePlans =
      getRoomTypeRatePlans(
        roomTypeId
      );


    const ratePlan =
      availableRatePlans.find(
        (item) =>
          !item.stopSell
      ) ||
      availableRatePlans[0];


    setForm(
      (current) => ({
        ...current,

        roomTypeId,

        ratePlanId:
          ratePlan?.id ||
          "",
      })
    );
  }


  /* ===================================================
     SAVE
  =================================================== */

  function saveReservation() {
    const guest =
      getGuest(
        form.guestId
      );


    const property =
      getProperty(
        form.propertyId
      );


    const roomType =
      getRoomType(
        form.roomTypeId
      );


    const ratePlan =
      getRatePlan(
        form.ratePlanId
      );


    if (
      !guest
    ) {
      alert(
        "Vui lòng chọn Guest."
      );

      return;
    }


    if (
      !property ||
      !roomType ||
      !ratePlan
    ) {
      alert(
        "Property, Room Type hoặc Rate Plan không hợp lệ."
      );

      return;
    }


    if (
      roomType.propertyId !==
      property.id
    ) {
      alert(
        "Room Type không thuộc Property."
      );

      return;
    }


    if (
      ratePlan.roomTypeId !==
      roomType.id
    ) {
      alert(
        "Rate Plan không thuộc Room Type."
      );

      return;
    }


    if (
      !form.checkin ||
      !form.checkout
    ) {
      alert(
        "Vui lòng chọn Check-in và Check-out."
      );

      return;
    }


    if (
      form.checkout <=
      form.checkin
    ) {
      alert(
        "Check-out phải sau Check-in."
      );

      return;
    }


    const nights =
      nightsBetween(
        form.checkin,
        form.checkout
      );


    if (
      nights < 1
    ) {
      alert(
        "Reservation phải có ít nhất 1 đêm."
      );

      return;
    }


    const adults =
      Number(
        form.adults ||
          0
      );


    const children =
      Number(
        form.children ||
          0
      );


    if (
      adults < 1
    ) {
      alert(
        "Reservation phải có ít nhất 1 người lớn."
      );

      return;
    }


    if (
      adults >
      Number(
        roomType.maxAdults ||
          0
      )
    ) {
      alert(
        `Room Type ${roomType.name} chỉ cho phép tối đa ${roomType.maxAdults} người lớn.`
      );

      return;
    }


    if (
      children >
      Number(
        roomType.maxChildren ||
          0
      )
    ) {
      alert(
        `Room Type ${roomType.name} chỉ cho phép tối đa ${roomType.maxChildren} trẻ em.`
      );

      return;
    }


    if (
      adults +
        children >
      Number(
        roomType.maxOccupancy ||
          0
      )
    ) {
      alert(
        `Tổng số khách vượt Max Occupancy của ${roomType.name}.`
      );

      return;
    }


    /*
     * Chỉ check Stop Sell khi booking
     * cần giữ Inventory.
     */
    if (
      holdsInventory(
        form.status
      )
    ) {
      const stopSellCheck =
        validateStopSell(
          form.ratePlanId,
          form.checkin,
          form.checkout
        );


      if (
        !stopSellCheck.ok
      ) {
        alert(
          stopSellCheck.message
        );

        return;
      }
    }


    const oldReservation =
      editingId
        ? reservations.find(
            (reservation) =>
              reservation.id ===
              editingId
          )
        : null;


    const reservationCode =
      oldReservation
        ?.reservationCode ||
      generateReservationCode(
        reservations
      );


    const totalAmount =
      calculateStayAmount(
        form.ratePlanId,
        form.checkin,
        form.checkout
      );


    const payload = {
      id:
        editingId ||
        makeId(),

      reservationCode,

      guestId:
        form.guestId,

      propertyId:
        form.propertyId,

      roomTypeId:
        form.roomTypeId,

      ratePlanId:
        form.ratePlanId,

      checkin:
        form.checkin,

      checkout:
        form.checkout,

      nights,

      adults,

      children,

      source:
        form.source,

      status:
        form.status,

      roomRate:
        nights > 0
          ? Math.round(
              totalAmount /
                nights
            )
          : 0,

      totalAmount,

      specialRequest:
        form.specialRequest
          .trim(),

      internalNote:
        form.internalNote
          .trim(),

      updatedAt:
        nowText(),
    };


    /*
     * Khi EDIT:
     * trước tiên trả Inventory
     * của booking cũ.
     */
    let workingInventory =
      oldReservation
        ? releaseInventory(
            inventory,
            oldReservation
          )
        : [
            ...inventory,
          ];


    /*
     * Sau đó deduct theo booking mới.
     * Nếu thiếu phòng ở bất kỳ ngày nào,
     * toàn bộ thay đổi bị từ chối.
     */
    const inventoryResult =
      deductInventory(
        workingInventory,
        payload
      );


    if (
      !inventoryResult.ok
    ) {
      alert(
        inventoryResult.message
      );

      return;
    }


    let nextReservations;


    if (
      editingId
    ) {
      nextReservations =
        reservations.map(
          (reservation) =>
            reservation.id ===
            editingId
              ? {
                  ...reservation,

                  ...payload,

                  logs: [
                    `${nowText()} — Đã chỉnh sửa Reservation`,

                    ...(
                      reservation.logs ||
                      []
                    ),
                  ],
                }
              : reservation
        );
    }

    else {
      nextReservations = [
        {
          ...payload,

          createdAt:
            nowText(),

          logs: [
            `${nowText()} — Đã tạo Reservation`,
            `${nowText()} — Booking Deduction Inventory`,
          ],
        },

        ...reservations,
      ];
    }


    setData(
      (current) => ({
        ...current,

        reservations:
          nextReservations,

        inventory:
          inventoryResult.inventory,
      })
    );


    setFormOpen(
      false
    );
  }


  /* ===================================================
     CANCEL RESERVATION
  =================================================== */

  function cancelReservation() {
    const reservation =
      reservations.find(
        (item) =>
          item.id ===
          cancelId
      );


    if (
      !reservation
    ) {
      return;
    }


    if (
      reservation.status ===
        "Cancelled"
    ) {
      setCancelId(
        null
      );

      return;
    }


    const nextInventory =
      releaseInventory(
        inventory,
        reservation
      );


    const cancelTime =
      nowText();


    const nextReservations =
      reservations.map(
        (item) =>
          item.id ===
          reservation.id
            ? {
                ...item,

                status:
                  "Cancelled",

                cancelledAt:
                  cancelTime,

                updatedAt:
                  cancelTime,

                logs: [
                  `${cancelTime} — Reservation đã Cancelled`,
                  `${cancelTime} — Inventory đã được release`,

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

        inventory:
          nextInventory,
      })
    );


    setCancelId(
      null
    );
  }


  /* ===================================================
     DETAIL
  =================================================== */

  const detailReservation =
    reservations.find(
      (reservation) =>
        reservation.id ===
        detailId
    );


  const cancelTarget =
    reservations.find(
      (reservation) =>
        reservation.id ===
        cancelId
    );


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
          PAGE HEADER
      ================================================= */}

      <div className="page-header">

        <div>

          <div className="eyebrow">
            BƯỚC 08 — RESERVATION
          </div>


          <h1>
            Quản lý đặt phòng{" "}
            <span className="heading-en">
              (Reservation)
            </span>
          </h1>


          <p>
            Tạo và quản lý booking, liên kết Guest,
            Room Type, Rate Plan và tự động cập nhật
            Inventory theo thời gian lưu trú.
          </p>

        </div>


        <button
          className="button button-dark button-lg"

          onClick={
            openCreate
          }
        >
          <Plus
            size={17}
          />

          Tạo Reservation
        </button>

      </div>


      {/* =================================================
          BUSINESS EXPLANATION
      ================================================= */}

      <section className="explain-card">

        <div className="explain-icon">

          <CalendarDays
            size={21}
          />

        </div>


        <div>

          <strong>
            Reservation là trung tâm của luồng booking
          </strong>


          <p>
            Khi booking được tạo, PMS liên kết Guest với
            Property, Room Type và Rate Plan, sau đó tự
            giảm Inventory cho từng đêm lưu trú.
          </p>


          <div className="reservation-flow">

            <span>
              Guest
            </span>

            <b>+</b>

            <span>
              Room Type
            </span>

            <b>+</b>

            <span>
              Rate Plan
            </span>

            <b>→</b>

            <span>
              Reservation
            </span>

            <b>→</b>

            <span>
              Inventory -1
            </span>

          </div>

        </div>

      </section>


      {/* =================================================
          METRICS
      ================================================= */}

      <div className="metric-grid">

        <Metric
          label="Tổng Reservation"
          value={
            stats.total
          }
        />


        <Metric
          label="Confirmed"
          value={
            stats.confirmed
          }
        />


        <Metric
          label="In House"
          value={
            stats.inHouse
          }
        />


        <Metric
          label="Cancelled / No-show"
          value={
            stats.cancelled
          }
        />

      </div>


      {/* =================================================
          FILTER
      ================================================= */}

      <section className="panel">

        <div className="panel-toolbar">

          <div className="reservation-filter-grid">

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

                placeholder="Tìm mã booking, khách, điện thoại..."
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


            <select
              value={
                statusFilter
              }

              onChange={
                (event) =>
                  setStatusFilter(
                    event.target.value
                  )
              }
            >

              <option value="">
                Tất cả trạng thái
              </option>


              {
                STATUSES.map(
                  (status) => (

                    <option
                      key={
                        status
                      }
                      value={
                        status
                      }
                    >
                      {status}
                    </option>

                  )
                )
              }

            </select>


            <select
              value={
                sourceFilter
              }

              onChange={
                (event) =>
                  setSourceFilter(
                    event.target.value
                  )
              }
            >

              <option value="">
                Tất cả nguồn booking
              </option>


              {
                SOURCES.map(
                  (source) => (

                    <option
                      key={
                        source
                      }
                      value={
                        source
                      }
                    >
                      {source}
                    </option>

                  )
                )
              }

            </select>

          </div>

        </div>


        {/* =================================================
            TABLE
        ================================================= */}

        <div className="table-wrap">

          <table className="data-table reservation-table">

            <thead>

              <tr>

                <th>
                  Reservation
                </th>

                <th>
                  Guest
                </th>

                <th>
                  Khách sạn
                </th>

                <th>
                  Stay
                </th>

                <th>
                  Room / Rate
                </th>

                <th>
                  Tổng tiền
                </th>

                <th>
                  Nguồn
                </th>

                <th>
                  Trạng thái
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


                    const ratePlan =
                      getRatePlan(
                        reservation.ratePlanId
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
                            {
                              reservation.nights
                            }{" "}
                            đêm
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

                          <strong className="table-secondary-title">
                            {
                              property?.name ||
                              "—"
                            }
                          </strong>


                          <div className="code muted">
                            {
                              property?.code ||
                              "—"
                            }
                          </div>

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

                          <strong>
                            {
                              roomType?.name ||
                              "—"
                            }
                          </strong>


                          <div className="small-copy muted">
                            {
                              ratePlan?.name ||
                              "—"
                            }
                          </div>

                        </td>


                        <td>

                          <strong>
                            {
                              money(
                                reservation.totalAmount
                              )
                            }
                          </strong>

                        </td>


                        <td>
                          {
                            reservation.source
                          }
                        </td>


                        <td>

                          <ReservationStatusBadge
                            status={
                              reservation.status
                            }
                          />

                        </td>


                        <td>

                          <div className="action-row">

                            <button
                              className="table-action"

                              title="Xem Reservation"

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
                              className="table-action"

                              title="Chỉnh sửa"

                              onClick={
                                () =>
                                  openEdit(
                                    reservation
                                  )
                              }
                            >
                              <Pencil
                                size={15}
                              />
                            </button>


                            {
                              ![
                                "Cancelled",
                                "Checked Out",
                              ].includes(
                                reservation.status
                              ) && (

                                <button
                                  className="table-action"

                                  title="Hủy Reservation"

                                  onClick={
                                    () =>
                                      setCancelId(
                                        reservation.id
                                      )
                                  }
                                >
                                  <Ban
                                    size={15}
                                  />
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
            filtered.length ===
              0 && (

              <div className="empty-state">

                <CalendarDays
                  size={38}
                />


                <strong>
                  Chưa có Reservation
                </strong>


                <span>
                  Tạo booking đầu tiên hoặc thay đổi bộ lọc.
                </span>

              </div>

            )
          }

        </div>

      </section>


      {/* =================================================
          BUSINESS FLOW
      ================================================= */}

      <section className="panel business-panel">

        <div className="eyebrow">
          MÔ TẢ NGHIỆP VỤ
        </div>


        <h2>
          Reservation tác động hệ thống như thế nào?
        </h2>


        <div className="business-grid">

          <BusinessItem
            number="01"

            icon={
              <UserRound
                size={18}
              />
            }

            title="Guest"

            text="Reservation liên kết với hồ sơ Guest đã được tạo trong PMS."
          />


          <BusinessItem
            number="02"

            icon={
              <BedDouble
                size={18}
              />
            }

            title="Room Type & Rate Plan"

            text="Booking lưu loại phòng và chính sách giá mà khách đã đặt."
          />


          <BusinessItem
            number="03"

            icon={
              <CircleDollarSign
                size={18}
              />
            }

            title="Rate Calculation"

            text="PMS đọc Daily Rate từ Rate Calendar; nếu ngày đó chưa cấu hình thì dùng Base Rate."
          />


          <BusinessItem
            number="04"

            icon={
              <Hotel
                size={18}
              />
            }

            title="Inventory"

            text="Khi booking được tạo, Inventory giảm 1 cho mỗi đêm. Khi Cancelled, số phòng được trả lại."
          />

        </div>

      </section>


      {/* =================================================
          CREATE / EDIT MODAL
      ================================================= */}

      <Modal
        open={
          formOpen
        }

        title={
          editingId
            ? "Chỉnh sửa Reservation"
            : "Tạo Reservation"
        }

        subtitle="RESERVATION"

        onClose={
          () =>
            setFormOpen(
              false
            )
        }

        size="lg"

        footer={
          <>

            <button
              className="button button-light"

              onClick={
                () =>
                  setFormOpen(
                    false
                  )
              }
            >
              Hủy
            </button>


            <button
              className="button button-dark"

              onClick={
                saveReservation
              }
            >
              {
                editingId
                  ? "Lưu thay đổi"
                  : "Tạo Reservation"
              }
            </button>

          </>
        }
      >

        <ReservationForm
          form={
            form
          }

          setForm={
            setForm
          }

          guests={
            guests
          }

          properties={
            properties
          }

          roomTypes={
            roomTypes
          }

          ratePlans={
            ratePlans
          }

          rateCalendar={
            rateCalendar
          }

          inventory={
            inventory
          }

          editing={
            Boolean(
              editingId
            )
          }

          getRoomType={
            getRoomType
          }

          getRatePlan={
            getRatePlan
          }

          onPropertyChange={
            handlePropertyChange
          }

          onRoomTypeChange={
            handleRoomTypeChange
          }

          calculateStayAmount={
            calculateStayAmount
          }
        />

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

        subtitle="RESERVATION DETAIL"

        onClose={
          () =>
            setDetailId(
              null
            )
        }
      >

        {
          detailReservation && (

            <ReservationDetail
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

              ratePlan={
                getRatePlan(
                  detailReservation.ratePlanId
                )
              }

              onEdit={
                () => {
                  setDetailId(
                    null
                  );


                  openEdit(
                    detailReservation
                  );
                }
              }

              onCancel={
                () => {
                  setDetailId(
                    null
                  );


                  setCancelId(
                    detailReservation.id
                  );
                }
              }
            />

          )
        }

      </Drawer>


      {/* =================================================
          CANCEL
      ================================================= */}

      <Modal
        open={
          Boolean(
            cancelTarget
          )
        }

        title="Hủy Reservation"

        subtitle="CANCEL RESERVATION"

        onClose={
          () =>
            setCancelId(
              null
            )
        }

        footer={
          <>

            <button
              className="button button-light"

              onClick={
                () =>
                  setCancelId(
                    null
                  )
              }
            >
              Không hủy
            </button>


            <button
              className="button button-danger"

              onClick={
                cancelReservation
              }
            >
              Xác nhận hủy
            </button>

          </>
        }
      >

        {
          cancelTarget && (

            <div className="confirm-copy">

              Reservation{" "}

              <strong>
                {
                  cancelTarget.reservationCode
                }
              </strong>

              {" "}
              sẽ chuyển sang{" "}

              <strong>
                Cancelled
              </strong>

              .


              <div className="info-note status-note">

                PMS sẽ tự động trả lại 1 phòng vào
                Inventory cho từng đêm của Reservation.
                Sau đó Availability sẽ chuyển về trạng thái
                chờ đồng bộ sang Channex.

              </div>

            </div>

          )
        }

      </Modal>

    </>
  );
}


/* =====================================================
   RESERVATION FORM
===================================================== */

function ReservationForm({
  form,
  setForm,
  guests,
  properties,
  roomTypes,
  ratePlans,
  rateCalendar,
  inventory,
  editing,
  getRoomType,
  getRatePlan,
  onPropertyChange,
  onRoomTypeChange,
  calculateStayAmount,
}) {
  const availableRoomTypes =
    roomTypes.filter(
      (roomType) =>
        roomType.propertyId ===
        form.propertyId
    );


  const availableRatePlans =
    ratePlans.filter(
      (ratePlan) =>
        ratePlan.roomTypeId ===
        form.roomTypeId
    );


  const nights =
    nightsBetween(
      form.checkin,
      form.checkout
    );


  const roomType =
    getRoomType(
      form.roomTypeId
    );


  const ratePlan =
    getRatePlan(
      form.ratePlanId
    );


  const totalAmount =
    calculateStayAmount(
      form.ratePlanId,
      form.checkin,
      form.checkout
    );


  const stayDates =
    dateRange(
      form.checkin,
      form.checkout
    );


  const availability =
    stayDates.map(
      (date) => {
        const entry =
          inventory.find(
            (item) =>
              item.roomTypeId ===
                form.roomTypeId &&
              item.date ===
                date
          );


        return {
          date,

          available:
            entry
              ? calculateAvailable(
                  entry
                )
              : Number(
                  roomType?.totalRooms ||
                    0
                ),
        };
      }
    );


  function patch(
    key,
    value
  ) {
    setForm(
      (current) => ({
        ...current,

        [key]:
          value,
      })
    );
  }


  return (
    <>
      <div className="form-section-title">
        1. Guest
      </div>


      <div className="form-grid">

        <Field
          label="Khách hàng (Guest) *"
          help="Chọn hồ sơ khách đã tạo ở Step 07."
        >

          <select
            value={
              form.guestId
            }

            onChange={
              (event) =>
                patch(
                  "guestId",
                  event.target.value
                )
            }
          >

            {
              guests.map(
                (guest) => (

                  <option
                    key={
                      guest.id
                    }
                    value={
                      guest.id
                    }
                  >
                    {
                      guest.fullName
                    }

                    {
                      guest.phone
                        ? ` — ${guest.phone}`
                        : ""
                    }
                  </option>

                )
              )
            }

          </select>

        </Field>

      </div>


      <div className="form-section-title">
        2. Property & Room
      </div>


      <div className="form-grid three">

        <Field
          label="Property *"
        >

          <select
            value={
              form.propertyId
            }

            onChange={
              (event) =>
                onPropertyChange(
                  event.target.value
                )
            }
          >

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

        </Field>


        <Field
          label="Room Type *"
        >

          <select
            value={
              form.roomTypeId
            }

            onChange={
              (event) =>
                onRoomTypeChange(
                  event.target.value
                )
            }
          >

            {
              availableRoomTypes.map(
                (roomTypeItem) => (

                  <option
                    key={
                      roomTypeItem.id
                    }
                    value={
                      roomTypeItem.id
                    }
                  >
                    {
                      roomTypeItem.name
                    }
                  </option>

                )
              )
            }

          </select>

        </Field>


        <Field
          label="Rate Plan *"
        >

          <select
            value={
              form.ratePlanId
            }

            onChange={
              (event) =>
                patch(
                  "ratePlanId",
                  event.target.value
                )
            }
          >

            {
              availableRatePlans.map(
                (ratePlanItem) => (

                  <option
                    key={
                      ratePlanItem.id
                    }
                    value={
                      ratePlanItem.id
                    }
                  >
                    {
                      ratePlanItem.name
                    }

                    {
                      ratePlanItem.stopSell
                        ? " — Stop Sell"
                        : ""
                    }
                  </option>

                )
              )
            }

          </select>

        </Field>

      </div>


      <div className="form-section-title">
        3. Stay Information
      </div>


      <div className="form-grid">

        <Field
          label="Check-in *"
        >

          <input
            type="date"

            value={
              form.checkin
            }

            onChange={
              (event) => {
                const checkin =
                  event.target.value;


                setForm(
                  (current) => ({
                    ...current,

                    checkin,

                    checkout:
                      !current.checkout ||
                      current.checkout <=
                        checkin
                        ? addDays(
                            checkin,
                            1
                          )
                        : current.checkout,
                  })
                );
              }
            }
          />

        </Field>


        <Field
          label="Check-out *"
        >

          <input
            type="date"

            min={
              form.checkin
                ? addDays(
                    form.checkin,
                    1
                  )
                : undefined
            }

            value={
              form.checkout
            }

            onChange={
              (event) =>
                patch(
                  "checkout",
                  event.target.value
                )
            }
          />

        </Field>


        <Field
          label="Người lớn"
        >

          <input
            type="number"

            min="1"

            max={
              roomType?.maxAdults ||
              1
            }

            value={
              form.adults
            }

            onChange={
              (event) =>
                patch(
                  "adults",
                  event.target.value
                )
            }
          />

        </Field>


        <Field
          label="Trẻ em"
        >

          <input
            type="number"

            min="0"

            max={
              roomType?.maxChildren ||
              0
            }

            value={
              form.children
            }

            onChange={
              (event) =>
                patch(
                  "children",
                  event.target.value
                )
            }
          />

        </Field>

      </div>


      <div className="reservation-stay-summary">

        <div>

          <span>
            SỐ ĐÊM
          </span>

          <strong>
            {nights}
          </strong>

        </div>


        <div>

          <span>
            ROOM TYPE
          </span>

          <strong>
            {
              roomType?.name ||
              "—"
            }
          </strong>

        </div>


        <div>

          <span>
            RATE PLAN
          </span>

          <strong>
            {
              ratePlan?.name ||
              "—"
            }
          </strong>

        </div>


        <div>

          <span>
            TẠM TÍNH
          </span>

          <strong>
            {
              money(
                totalAmount
              )
            }
          </strong>

        </div>

      </div>


      {
        availability.length >
          0 && (

          <div className="reservation-availability">

            <div className="reservation-availability-title">
              Availability theo ngày
            </div>


            <div className="reservation-availability-days">

              {
                availability.map(
                  (item) => (

                    <div
                      key={
                        item.date
                      }

                      className={
                        item.available <=
                        0
                          ? "sold-out"
                          : ""
                      }
                    >

                      <span>
                        {
                          formatDate(
                            item.date
                          )
                        }
                      </span>


                      <strong>
                        {
                          item.available
                        }{" "}
                        phòng
                      </strong>

                    </div>

                  )
                )
              }

            </div>

          </div>

        )
      }


      <div className="form-section-title">
        4. Booking Information
      </div>


      <div className="form-grid">

        <Field
          label="Booking Source"
        >

          <select
            value={
              form.source
            }

            onChange={
              (event) =>
                patch(
                  "source",
                  event.target.value
                )
            }
          >

            {
              SOURCES.map(
                (source) => (

                  <option
                    key={
                      source
                    }
                    value={
                      source
                    }
                  >
                    {source}
                  </option>

                )
              )
            }

          </select>

        </Field>


        <Field
          label="Booking Status"
        >

          <select
            value={
              form.status
            }

            disabled={
              !editing
            }

            onChange={
              (event) =>
                patch(
                  "status",
                  event.target.value
                )
            }
          >

            {
              STATUSES.map(
                (status) => (

                  <option
                    key={
                      status
                    }
                    value={
                      status
                    }
                  >
                    {status}
                  </option>

                )
              )
            }

          </select>

        </Field>

      </div>


      <div className="form-section-title">
        5. Special Request / Notes
      </div>


      <div className="form-grid">

        <Field
          label="Yêu cầu của khách"
        >

          <textarea
            rows="4"

            value={
              form.specialRequest
            }

            onChange={
              (event) =>
                patch(
                  "specialRequest",
                  event.target.value
                )
            }

            placeholder="Ví dụ: phòng tầng cao, giường đôi, check-in trễ..."
          />

        </Field>


        <Field
          label="Ghi chú nội bộ"
        >

          <textarea
            rows="4"

            value={
              form.internalNote
            }

            onChange={
              (event) =>
                patch(
                  "internalNote",
                  event.target.value
                )
            }

            placeholder="Ghi chú dành cho nhân viên khách sạn..."
          />

        </Field>

      </div>


      <div className="info-note roomtype-note">

        <strong>
          Inventory tự động
        </strong>


        <p>
          Khi Reservation được tạo, PMS sẽ kiểm tra
          Availability của toàn bộ thời gian lưu trú.
          Nếu đủ phòng, mỗi ngày sẽ tự tăng Booked Rooms
          thêm 1. Khi Cancelled, Inventory được trả lại.
        </p>

      </div>

    </>
  );
}


/* =====================================================
   RESERVATION DETAIL
===================================================== */

function ReservationDetail({
  reservation,
  guest,
  property,
  roomType,
  ratePlan,
  onEdit,
  onCancel,
}) {
  return (
    <>
      <div className="reservation-detail-hero">

        <div>

          <span>
            RESERVATION CODE
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
          label="Khách hàng"
          value={
            guest?.fullName ||
            "—"
          }
        />


        <Detail
          label="Điện thoại"
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
        Stay Information
      </div>


      <div className="reservation-detail-stay">

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


        <Detail
          label="Số đêm"
          value={
            reservation.nights
          }
        />


        <Detail
          label="Người lớn"
          value={
            reservation.adults
          }
        />


        <Detail
          label="Trẻ em"
          value={
            reservation.children
          }
        />

      </div>


      <div className="detail-section-title">
        Room & Rate
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
          label="Rate Plan"
          value={
            ratePlan?.name ||
            "—"
          }
        />


        <Detail
          label="Tổng tiền phòng"
          value={
            money(
              reservation.totalAmount
            )
          }
        />

      </div>


      <div className="detail-section-title">
        Booking Information
      </div>


      <div className="detail-grid">

        <Detail
          label="Booking Source"
          value={
            reservation.source ||
            "—"
          }
        />


        <Detail
          label="Booking Status"
          value={
            reservation.status ||
            "—"
          }
        />

      </div>


      <div className="detail-section-title">
        Special Request
      </div>


      <div className="reservation-note-box">
        {
          reservation.specialRequest ||
          "Không có yêu cầu đặc biệt."
        }
      </div>


      <div className="detail-section-title">
        Internal Note
      </div>


      <div className="reservation-note-box">
        {
          reservation.internalNote ||
          "Không có ghi chú nội bộ."
        }
      </div>


      <div className="detail-section-title">
        Lịch sử
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
          reservation.status !==
            "Cancelled" && (

            <button
              className="button button-dark"

              onClick={
                onEdit
              }
            >
              <Pencil
                size={16}
              />

              Chỉnh sửa
            </button>

          )
        }


        {
          ![
            "Cancelled",
            "Checked Out",
          ].includes(
            reservation.status
          ) && (

            <button
              className="button button-danger-outline"

              onClick={
                onCancel
              }
            >
              <Ban
                size={16}
              />

              Hủy Reservation
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


function Field({
  label,
  help,
  children,
}) {
  return (
    <label className="form-field">

      <span className="form-label">
        {label}
      </span>


      {children}


      {
        help && (

          <small>
            {help}
          </small>

        )
      }

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