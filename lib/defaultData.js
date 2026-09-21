export const DEFAULT_PMS_DATA = {
  schemaVersion: 13,

  /* =====================================================
     01. KHÁCH SẠN — PROPERTY
  ===================================================== */

  properties: [
    {
      id: "property_city_oasis",

      name: "City Oasis",

      code: "CO",

      address:
        "42/3 Nguyễn Văn Trỗi, Phú Nhuận",

      city:
        "TP. Hồ Chí Minh",

      country:
        "Việt Nam",

      currency:
        "VND",

      timezone:
        "Asia/Ho_Chi_Minh",

      status:
        "Active",

      checkin:
        "14:00",

      checkout:
        "12:00",

      totalRooms:
        40,

      phone:
        "028 7300 2999",

      email:
        "cityoasis@cityhouse.com.vn",

      channexId:
        "chx-city-oasis-001",

      connected:
        true,

      lastSync:
        "21/09/2026 13:20",

      logs: [
        "21/09/2026 13:20 — Kiểm tra kết nối Channex thành công",

        "20/09/2026 09:10 — Đã cập nhật thông tin khách sạn",
      ],
    },

    {
      id:
        "property_nest_metro",

      name:
        "Nest Metro",

      code:
        "NM",

      address:
        "TP. Thủ Đức",

      city:
        "TP. Hồ Chí Minh",

      country:
        "Việt Nam",

      currency:
        "VND",

      timezone:
        "Asia/Ho_Chi_Minh",

      status:
        "Active",

      checkin:
        "14:00",

      checkout:
        "12:00",

      totalRooms:
        25,

      phone:
        "",

      email:
        "",

      channexId:
        "chx-nest-metro-002",

      connected:
        true,

      lastSync:
        "21/09/2026 12:45",

      logs: [
        "21/09/2026 12:45 — Đã liên kết khách sạn với Channex",
      ],
    },

    {
      id:
        "property_atelier",

      name:
        "Atelier Thao Dien",

      code:
        "ATS",

      address:
        "Thảo Điền, TP. Thủ Đức",

      city:
        "TP. Hồ Chí Minh",

      country:
        "Việt Nam",

      currency:
        "VND",

      timezone:
        "Asia/Ho_Chi_Minh",

      status:
        "Active",

      checkin:
        "14:00",

      checkout:
        "12:00",

      totalRooms:
        18,

      phone:
        "",

      email:
        "",

      channexId:
        "",

      connected:
        false,

      lastSync:
        "",

      logs: [
        "19/09/2026 15:30 — Đã tạo khách sạn",
      ],
    },
  ],


  /* =====================================================
     02. LOẠI PHÒNG — ROOM TYPE
  ===================================================== */

  roomTypes: [
    {
      id:
        "roomtype_co_studio",

      /*
       * Liên kết với Property City Oasis
       */
      propertyId:
        "property_city_oasis",

      name:
        "Studio",

      code:
        "STD",

      status:
        "Active",

      /*
       * Sức chứa
       */
      maxAdults:
        2,

      maxChildren:
        1,

      maxOccupancy:
        3,

      /*
       * Giá cơ sở.
       *
       * Đây chỉ là giá tham chiếu.
       * Giá thực tế theo ngày sẽ nằm
       * ở Rate Plan / Rate Calendar.
       */
      baseRate:
        1200000,

      /*
       * Tổng số phòng vật lý
       * thuộc Room Type này.
       */
      totalRooms:
        12,

      /*
       * Channex Mapping
       */
      channexRoomTypeId:
        "chx-room-studio-001",

      mapped:
        true,

      lastSync:
        "21/09/2026 13:35",

      logs: [
        "21/09/2026 13:35 — Kiểm tra Channex Room Type Mapping thành công",

        "20/09/2026 10:15 — Đã cập nhật loại phòng",
      ],
    },

    {
      id:
        "roomtype_co_deluxe",

      propertyId:
        "property_city_oasis",

      name:
        "Deluxe",

      code:
        "DLX",

      status:
        "Active",

      maxAdults:
        2,

      maxChildren:
        1,

      maxOccupancy:
        3,

      baseRate:
        1500000,

      totalRooms:
        18,

      channexRoomTypeId:
        "chx-room-deluxe-002",

      mapped:
        true,

      lastSync:
        "21/09/2026 13:30",

      logs: [
        "21/09/2026 13:30 — Đã mapping loại phòng với Channex",
      ],
    },

    {
      id:
        "roomtype_nm_suite",

      /*
       * Room Type này thuộc Nest Metro
       */
      propertyId:
        "property_nest_metro",

      name:
        "Suite",

      code:
        "STE",

      status:
        "Active",

      maxAdults:
        3,

      maxChildren:
        1,

      maxOccupancy:
        4,

      baseRate:
        2200000,

      totalRooms:
        8,

      /*
       * Chưa mapping Channex
       * để demo trạng thái
       * "Chưa mapping".
       */
      channexRoomTypeId:
        "",

      mapped:
        false,

      lastSync:
        "",

      logs: [
        "19/09/2026 16:10 — Đã tạo loại phòng",
      ],
    },
  ],


  /* =====================================================
   03. PHÒNG VẬT LÝ — PHYSICAL ROOM
===================================================== */

  physicalRooms: [
    {
      id: "room_co_201",

      propertyId: "property_city_oasis",

      roomTypeId: "roomtype_co_studio",

      roomNumber: "201",

      floor: "2",

      status: "Active",

      housekeepingStatus: "Clean",

      occupancyStatus: "Vacant",

      currentReservationId: null,

      note: "Phòng Studio tầng 2.",

      logs: [
        "21/09/2026 09:00 — Housekeeping chuyển thành Clean",
        "20/09/2026 14:30 — Đã tạo phòng vật lý",
      ],
    },

    {
      id: "room_co_202",

      propertyId: "property_city_oasis",

      roomTypeId: "roomtype_co_studio",

      roomNumber: "202",

      floor: "2",

      status: "Active",

      housekeepingStatus: "Dirty",

      occupancyStatus: "Vacant",

      currentReservationId: null,

      note: "Chờ Housekeeping vệ sinh sau khi khách trả phòng.",

      logs: [
        "21/09/2026 12:10 — Housekeeping chuyển thành Dirty",
        "20/09/2026 14:35 — Đã tạo phòng vật lý",
      ],
    },

    {
      id: "room_co_305",

      propertyId: "property_city_oasis",

      roomTypeId: "roomtype_co_deluxe",

      roomNumber: "305",

      floor: "3",

      status: "Active",

      housekeepingStatus: "Inspected",

      occupancyStatus: "Occupied",

      currentReservationId: null,

      note: "Phòng Deluxe đã được kiểm tra và sẵn sàng giao khách.",

      logs: [
        "21/09/2026 10:20 — Housekeeping chuyển thành Inspected",
        "20/09/2026 15:00 — Đã tạo phòng vật lý",
      ],
    },

    {
      id: "room_co_306",

      propertyId: "property_city_oasis",

      roomTypeId: "roomtype_co_deluxe",

      roomNumber: "306",

      floor: "3",

      status: "OutOfOrder",

      housekeepingStatus: "Clean",

      occupancyStatus: "Vacant",

      currentReservationId: null,

      note: "Đang kiểm tra hệ thống máy lạnh.",

      logs: [
        "21/09/2026 11:05 — Trạng thái phòng chuyển thành Out of Order",
        "20/09/2026 15:05 — Đã tạo phòng vật lý",
      ],
    },

    /* ===================================================
   ROOM 307
   Dùng để demo ROOM MOVE
=================================================== */

    {
      id:
        "room_co_307",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_deluxe",

      roomNumber:
        "307",

      floor:
        "3",

      /*
       * Phòng đang hoạt động bình thường.
       */
      status:
        "Active",

      /*
       * Clean => đạt điều kiện Room Move.
       */
      housekeepingStatus:
        "Clean",

      /*
       * Vacant => chưa có khách đang ở.
       */
      occupancyStatus:
        "Vacant",

      currentReservationId:
        null,

      note:
        "Phòng Deluxe sẵn sàng dùng để demo Room Move.",

      logs: [
        "21/09/2026 15:30 — Housekeeping chuyển thành Clean",
        "20/09/2026 15:10 — Đã tạo phòng vật lý",
      ],
    },

    {
      id: "room_nm_801",

      propertyId: "property_nest_metro",

      roomTypeId: "roomtype_nm_suite",

      roomNumber: "801",

      floor: "8",

      status: "Active",

      housekeepingStatus: "Cleaning",

      occupancyStatus: "Vacant",

      currentReservationId: null,

      note: "Suite tầng 8 đang được Housekeeping xử lý.",

      logs: [
        "21/09/2026 13:00 — Housekeeping chuyển thành Cleaning",
        "20/09/2026 16:15 — Đã tạo phòng vật lý",
      ],
    },

    {
      id: "room_nm_802",

      propertyId: "property_nest_metro",

      roomTypeId: "roomtype_nm_suite",

      roomNumber: "802",

      floor: "8",

      status: "Active",

      housekeepingStatus: "Clean",

      occupancyStatus: "Occupied",

      currentReservationId: null,

      note: "",

      logs: [
        "21/09/2026 08:45 — Housekeeping chuyển thành Clean",
        "20/09/2026 16:20 — Đã tạo phòng vật lý",
      ],
    },
  ],


  /* =====================================================
   04. CHÍNH SÁCH GIÁ — RATE PLAN
===================================================== */

  ratePlans: [
    /* ===================================================
       CITY OASIS — STUDIO
    =================================================== */

    {
      id: "rateplan_co_studio_bar",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_studio",

      name:
        "BAR",

      code:
        "BAR",

      /*
       * Base Rate mặc định.
       * Rate Calendar ở Bước 05
       * có thể override theo từng ngày.
       */
      baseRate:
        1200000,

      /*
       * Khách phải đặt tối thiểu
       * bao nhiêu đêm.
       */
      minimumStay:
        1,

      /*
       * false = đang mở bán
       * true  = đang đóng bán
       */
      stopSell:
        false,

      /*
       * Channex Mapping
       */
      channexRatePlanId:
        "chx-rate-co-std-bar-001",

      mapped:
        true,

      lastSync:
        "21/09/2026 14:10",

      logs: [
        "21/09/2026 14:10 — Kiểm tra Channex Rate Plan Mapping thành công",

        "20/09/2026 10:30 — Đã tạo Rate Plan",
      ],
    },


    {
      id:
        "rateplan_co_studio_room_only",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_studio",

      name:
        "Room Only",

      code:
        "RO",

      baseRate:
        1100000,

      minimumStay:
        1,

      stopSell:
        false,

      channexRatePlanId:
        "chx-rate-co-std-ro-002",

      mapped:
        true,

      lastSync:
        "21/09/2026 14:05",

      logs: [
        "21/09/2026 14:05 — Đã mapping Rate Plan với Channex",

        "20/09/2026 10:35 — Đã tạo Rate Plan",
      ],
    },


    /* ===================================================
       CITY OASIS — DELUXE
    =================================================== */

    {
      id:
        "rateplan_co_deluxe_bar",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_deluxe",

      name:
        "BAR",

      code:
        "BAR",

      baseRate:
        1500000,

      minimumStay:
        1,

      stopSell:
        false,

      channexRatePlanId:
        "chx-rate-co-dlx-bar-003",

      mapped:
        true,

      lastSync:
        "21/09/2026 14:00",

      logs: [
        "21/09/2026 14:00 — Kiểm tra Channex Rate Plan Mapping thành công",

        "20/09/2026 10:45 — Đã tạo Rate Plan",
      ],
    },


    {
      id:
        "rateplan_co_deluxe_breakfast",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_deluxe",

      name:
        "Breakfast Included",

      code:
        "BB",

      baseRate:
        1750000,

      minimumStay:
        1,

      stopSell:
        true,

      /*
       * Cố tình chưa mapping
       * để demo trạng thái
       * Chưa mapping.
       */
      channexRatePlanId:
        "",

      mapped:
        false,

      lastSync:
        "",

      logs: [
        "21/09/2026 08:45 — Đã Stop Sell Rate Plan",

        "20/09/2026 10:50 — Đã tạo Rate Plan",
      ],
    },


    /* ===================================================
       NEST METRO — SUITE
    =================================================== */

    {
      id:
        "rateplan_nm_suite_bar",

      propertyId:
        "property_nest_metro",

      roomTypeId:
        "roomtype_nm_suite",

      name:
        "BAR",

      code:
        "BAR",

      baseRate:
        2200000,

      minimumStay:
        2,

      stopSell:
        false,

      channexRatePlanId:
        "",

      mapped:
        false,

      lastSync:
        "",

      logs: [
        "20/09/2026 16:30 — Đã tạo Rate Plan",
      ],
    },
  ],


  /* =====================================================
    05. LỊCH GIÁ — RATE CALENDAR
 ===================================================== */

  rateCalendar: [
    /* ===================================================
       CITY OASIS — STUDIO — BAR
    =================================================== */

    {
      id: "ratecalendar_co_std_bar_20260921",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_studio",

      ratePlanId:
        "rateplan_co_studio_bar",

      date:
        "2026-09-21",

      rate:
        1200000,

      minimumStay:
        1,

      stopSell:
        false,

      synced:
        true,

      lastSync:
        "21/09/2026 14:30",

      createdAt:
        "20/09/2026 09:00",

      updatedAt:
        "21/09/2026 14:30",
    },


    {
      id: "ratecalendar_co_std_bar_20260922",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_studio",

      ratePlanId:
        "rateplan_co_studio_bar",

      date:
        "2026-09-22",

      rate:
        1200000,

      minimumStay:
        1,

      stopSell:
        false,

      synced:
        true,

      lastSync:
        "21/09/2026 14:31",

      createdAt:
        "20/09/2026 09:05",

      updatedAt:
        "21/09/2026 14:31",
    },


    {
      id: "ratecalendar_co_std_bar_20260926",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_studio",

      ratePlanId:
        "rateplan_co_studio_bar",

      /*
       * Giá cuối tuần cao hơn
       * Base Rate 1.200.000.
       */
      date:
        "2026-09-26",

      rate:
        1450000,

      minimumStay:
        2,

      stopSell:
        false,

      /*
       * Cố tình chưa sync để demo
       * trạng thái Chờ đồng bộ.
       */
      synced:
        false,

      lastSync:
        "",

      createdAt:
        "21/09/2026 08:00",

      updatedAt:
        "21/09/2026 08:00",
    },


    /* ===================================================
       CITY OASIS — DELUXE — BAR
    =================================================== */

    {
      id: "ratecalendar_co_dlx_bar_20260921",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_deluxe",

      ratePlanId:
        "rateplan_co_deluxe_bar",

      date:
        "2026-09-21",

      rate:
        1500000,

      minimumStay:
        1,

      stopSell:
        false,

      synced:
        true,

      lastSync:
        "21/09/2026 14:40",

      createdAt:
        "20/09/2026 10:00",

      updatedAt:
        "21/09/2026 14:40",
    },


    {
      id: "ratecalendar_co_dlx_bar_20260926",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_deluxe",

      ratePlanId:
        "rateplan_co_deluxe_bar",

      /*
       * Demo giá cuối tuần.
       */
      date:
        "2026-09-26",

      rate:
        1850000,

      minimumStay:
        2,

      stopSell:
        false,

      synced:
        false,

      lastSync:
        "",

      createdAt:
        "21/09/2026 08:15",

      updatedAt:
        "21/09/2026 08:15",
    },


    /* ===================================================
       CITY OASIS — DELUXE — BREAKFAST INCLUDED
    =================================================== */

    {
      id: "ratecalendar_co_dlx_bb_20260921",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_deluxe",

      ratePlanId:
        "rateplan_co_deluxe_breakfast",

      date:
        "2026-09-21",

      rate:
        1750000,

      minimumStay:
        1,

      /*
       * Rate Plan gốc đang Stop Sell.
       * Entry theo ngày này cũng để
       * Stop Sell để demo.
       */
      stopSell:
        true,

      synced:
        false,

      lastSync:
        "",

      createdAt:
        "21/09/2026 08:30",

      updatedAt:
        "21/09/2026 08:30",
    },


    /* ===================================================
       NEST METRO — SUITE — BAR
    =================================================== */

    {
      id: "ratecalendar_nm_ste_bar_20260921",

      propertyId:
        "property_nest_metro",

      roomTypeId:
        "roomtype_nm_suite",

      ratePlanId:
        "rateplan_nm_suite_bar",

      date:
        "2026-09-21",

      rate:
        2200000,

      minimumStay:
        2,

      stopSell:
        false,

      synced:
        false,

      lastSync:
        "",

      createdAt:
        "21/09/2026 08:40",

      updatedAt:
        "21/09/2026 08:40",
    },


    {
      id: "ratecalendar_nm_ste_bar_20260926",

      propertyId:
        "property_nest_metro",

      roomTypeId:
        "roomtype_nm_suite",

      ratePlanId:
        "rateplan_nm_suite_bar",

      date:
        "2026-09-26",

      rate:
        2600000,

      minimumStay:
        2,

      stopSell:
        false,

      synced:
        false,

      lastSync:
        "",

      createdAt:
        "21/09/2026 08:45",

      updatedAt:
        "21/09/2026 08:45",
    },
  ],


  /* =====================================================
   06. INVENTORY — SỐ LƯỢNG PHÒNG CÓ THỂ BÁN
===================================================== */

  inventory: [
    /* ===================================================
       21/09/2026
       CITY OASIS — STUDIO
    =================================================== */

    {
      id: "inventory_co_std_20260921",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_studio",

      date:
        "2026-09-21",

      /*
       * Studio có tổng cộng 12 phòng.
       */
      totalRooms:
        12,

      /*
       * Hiện có 4 phòng đã được giữ
       * bởi Reservation.
       */
      bookedRooms:
        4,

      /*
       * 1 phòng đang khóa bán
       * do vận hành / bảo trì.
       */
      blockedRooms:
        1,

      /*
       * 12 - 4 - 1 = 7
       */
      availableRooms:
        7,

      synced:
        true,

      lastSync:
        "21/09/2026 14:50",

      createdAt:
        "20/09/2026 09:30",

      updatedAt:
        "21/09/2026 14:50",

      logs: [
        "21/09/2026 14:50 — Đồng bộ Availability sang Channex thành công",
        "21/09/2026 10:15 — Booking Deduction: -1 phòng có thể bán",
        "20/09/2026 09:30 — Khởi tạo Daily Availability",
      ],
    },


    /* ===================================================
       21/09/2026
       CITY OASIS — DELUXE
    =================================================== */

    {
      id: "inventory_co_dlx_20260921",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_deluxe",

      date:
        "2026-09-21",

      totalRooms:
        18,

      bookedRooms:
        6,

      blockedRooms:
        1,

      /*
       * 18 - 6 - 1 = 11
       */
      availableRooms:
        11,

      /*
       * Cố tình để false
       * để demo trạng thái
       * Chờ đồng bộ.
       */
      synced:
        false,

      lastSync:
        "",

      createdAt:
        "20/09/2026 09:35",

      updatedAt:
        "21/09/2026 13:40",

      logs: [
        "21/09/2026 13:40 — Booking Deduction: -1 phòng có thể bán",
        "20/09/2026 09:35 — Khởi tạo Daily Availability",
      ],
    },


    /* ===================================================
       21/09/2026
       NEST METRO — SUITE
    =================================================== */

    {
      id: "inventory_nm_ste_20260921",

      propertyId:
        "property_nest_metro",

      roomTypeId:
        "roomtype_nm_suite",

      date:
        "2026-09-21",

      totalRooms:
        8,

      bookedRooms:
        3,

      blockedRooms:
        0,

      /*
       * 8 - 3 = 5
       */
      availableRooms:
        5,

      synced:
        false,

      lastSync:
        "",

      createdAt:
        "20/09/2026 09:40",

      updatedAt:
        "21/09/2026 12:30",

      logs: [
        "21/09/2026 12:30 — Booking Deduction: -1 phòng có thể bán",
        "20/09/2026 09:40 — Khởi tạo Daily Availability",
      ],
    },


    /* ===================================================
       22/09/2026
       CITY OASIS — STUDIO
    =================================================== */

    {
      id: "inventory_co_std_20260922",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_studio",

      date:
        "2026-09-22",

      totalRooms:
        12,

      bookedRooms:
        5,

      blockedRooms:
        0,

      availableRooms:
        7,

      synced:
        true,

      lastSync:
        "21/09/2026 14:55",

      createdAt:
        "20/09/2026 10:00",

      updatedAt:
        "21/09/2026 14:55",

      logs: [
        "21/09/2026 14:55 — Đồng bộ Availability sang Channex thành công",
        "20/09/2026 10:00 — Khởi tạo Daily Availability",
      ],
    },


    /* ===================================================
       22/09/2026
       CITY OASIS — DELUXE
    =================================================== */

    {
      id: "inventory_co_dlx_20260922",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_deluxe",

      date:
        "2026-09-22",

      totalRooms:
        18,

      bookedRooms:
        8,

      blockedRooms:
        0,

      availableRooms:
        10,

      synced:
        true,

      lastSync:
        "21/09/2026 14:56",

      createdAt:
        "20/09/2026 10:05",

      updatedAt:
        "21/09/2026 14:56",

      logs: [
        "21/09/2026 14:56 — Đồng bộ Availability sang Channex thành công",
        "20/09/2026 10:05 — Khởi tạo Daily Availability",
      ],
    },


    /* ===================================================
       22/09/2026
       NEST METRO — SUITE
    =================================================== */

    {
      id: "inventory_nm_ste_20260922",

      propertyId:
        "property_nest_metro",

      roomTypeId:
        "roomtype_nm_suite",

      date:
        "2026-09-22",

      totalRooms:
        8,

      bookedRooms:
        4,

      blockedRooms:
        1,

      /*
       * 8 - 4 - 1 = 3
       */
      availableRooms:
        3,

      synced:
        false,

      lastSync:
        "",

      createdAt:
        "20/09/2026 10:10",

      updatedAt:
        "21/09/2026 11:20",

      logs: [
        "21/09/2026 11:20 — Đã điều chỉnh Inventory",
        "20/09/2026 10:10 — Khởi tạo Daily Availability",
      ],
    },


    /* ===================================================
       26/09/2026
       CITY OASIS — STUDIO
    =================================================== */

    {
      id: "inventory_co_std_20260926",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_studio",

      date:
        "2026-09-26",

      totalRooms:
        12,

      bookedRooms:
        9,

      blockedRooms:
        1,

      /*
       * Chỉ còn 2 phòng.
       * UI sẽ hiển thị Sắp hết phòng.
       */
      availableRooms:
        2,

      synced:
        false,

      lastSync:
        "",

      createdAt:
        "21/09/2026 08:30",

      updatedAt:
        "21/09/2026 08:30",

      logs: [
        "21/09/2026 08:30 — Khởi tạo Daily Availability",
      ],
    },


    /* ===================================================
       26/09/2026
       CITY OASIS — DELUXE
    =================================================== */

    {
      id: "inventory_co_dlx_20260926",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_deluxe",

      date:
        "2026-09-26",

      totalRooms:
        18,

      bookedRooms:
        17,

      blockedRooms:
        1,

      /*
       * 18 - 17 - 1 = 0
       * Demo Sold Out.
       */
      availableRooms:
        0,

      synced:
        false,

      lastSync:
        "",

      createdAt:
        "21/09/2026 08:35",

      updatedAt:
        "21/09/2026 08:35",

      logs: [
        "21/09/2026 08:35 — Inventory đã về 0 phòng có thể bán",
      ],
    },


    /* ===================================================
       26/09/2026
       NEST METRO — SUITE
    =================================================== */

    {
      id: "inventory_nm_ste_20260926",

      propertyId:
        "property_nest_metro",

      roomTypeId:
        "roomtype_nm_suite",

      date:
        "2026-09-26",

      totalRooms:
        8,

      bookedRooms:
        6,

      blockedRooms:
        0,

      availableRooms:
        2,

      synced:
        false,

      lastSync:
        "",

      createdAt:
        "21/09/2026 08:40",

      updatedAt:
        "21/09/2026 08:40",

      logs: [
        "21/09/2026 08:40 — Khởi tạo Daily Availability",
      ],
    },
  ],


  /* =====================================================
   07. GUEST — HỒ SƠ KHÁCH HÀNG
===================================================== */

  guests: [
    /* ===================================================
       GUEST 01 — KHÁCH VIỆT NAM
    =================================================== */

    {
      id: "guest_nguyen_minh_anh",

      fullName:
        "Nguyễn Minh Anh",

      phone:
        "0903123456",

      email:
        "minhanh.demo@example.com",

      address:
        "Quận 3, TP. Hồ Chí Minh",

      nationality:
        "Việt Nam",

      documentType:
        "CCCD",

      /*
       * Dữ liệu demo.
       * Không phải giấy tờ thật.
       */
      documentNumber:
        "DEMO079001001",

      dateOfBirth:
        "1994-04-18",

      gender:
        "Female",

      createdAt:
        "18/09/2026 09:15",

      updatedAt:
        "21/09/2026 10:20",

      logs: [
        "21/09/2026 10:20 — Đã cập nhật hồ sơ khách",
        "18/09/2026 09:15 — Đã tạo Guest Profile",
      ],
    },


    /* ===================================================
       GUEST 02 — KHÁCH VIỆT NAM
    =================================================== */

    {
      id: "guest_tran_quoc_huy",

      fullName:
        "Trần Quốc Huy",

      phone:
        "0918456789",

      email:
        "quochuy.demo@example.com",

      address:
        "TP. Thủ Đức, TP. Hồ Chí Minh",

      nationality:
        "Việt Nam",

      documentType:
        "CCCD",

      documentNumber:
        "DEMO079002002",

      dateOfBirth:
        "1989-11-02",

      gender:
        "Male",

      createdAt:
        "19/09/2026 14:05",

      updatedAt:
        "19/09/2026 14:05",

      logs: [
        "19/09/2026 14:05 — Đã tạo Guest Profile",
      ],
    },


    /* ===================================================
       GUEST 03 — KHÁCH QUỐC TẾ
    =================================================== */

    {
      id: "guest_emily_carter",

      fullName:
        "Emily Carter",

      phone:
        "+1 202 555 0147",

      email:
        "emily.carter.demo@example.com",

      address:
        "Seattle, United States",

      nationality:
        "United States",

      documentType:
        "Passport",

      documentNumber:
        "DEMOUS84001",

      dateOfBirth:
        "1992-07-26",

      gender:
        "Female",

      createdAt:
        "20/09/2026 11:30",

      updatedAt:
        "20/09/2026 11:30",

      logs: [
        "20/09/2026 11:30 — Đã tạo Guest Profile",
      ],
    },


    /* ===================================================
       GUEST 04 — KHÁCH QUỐC TẾ
    =================================================== */

    {
      id: "guest_kenji_tanaka",

      fullName:
        "Kenji Tanaka",

      phone:
        "+81 90 1234 5678",

      email:
        "kenji.tanaka.demo@example.com",

      address:
        "Tokyo, Japan",

      nationality:
        "Japan",

      documentType:
        "Passport",

      documentNumber:
        "DEMOJP92001",

      dateOfBirth:
        "1987-02-14",

      gender:
        "Male",

      createdAt:
        "20/09/2026 16:45",

      updatedAt:
        "21/09/2026 09:05",

      logs: [
        "21/09/2026 09:05 — Đã cập nhật hồ sơ khách",
        "20/09/2026 16:45 — Đã tạo Guest Profile",
      ],
    },


    /* ===================================================
       GUEST 05 — THIẾU EMAIL ĐỂ DEMO HỒ SƠ CHƯA ĐẦY ĐỦ
    =================================================== */

    {
      id: "guest_le_hoang_nam",

      fullName:
        "Lê Hoàng Nam",

      phone:
        "0936777888",

      email:
        "",

      address:
        "Quận 7, TP. Hồ Chí Minh",

      nationality:
        "Việt Nam",

      documentType:
        "CCCD",

      documentNumber:
        "DEMO079003003",

      dateOfBirth:
        "1997-09-08",

      gender:
        "Male",

      createdAt:
        "21/09/2026 08:10",

      updatedAt:
        "21/09/2026 08:10",

      logs: [
        "21/09/2026 08:10 — Đã tạo Guest Profile",
      ],
    },
  ],


  /* =====================================================
   08. RESERVATION — QUẢN LÝ ĐẶT PHÒNG
===================================================== */

  reservations: [
    /* ===================================================
       RESERVATION 01
       CITY OASIS — STUDIO — BAR
    =================================================== */

    {
      id:
        "reservation_000001",

      reservationCode:
        "RES_000001",

      guestId:
        "guest_nguyen_minh_anh",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_studio",

      ratePlanId:
        "rateplan_co_studio_bar",

      checkin:
        "2026-09-21",

      checkout:
        "2026-09-22",

      nights:
        1,

      adults:
        2,

      children:
        0,

      source:
        "Website",

      status:
        "Confirmed",

      roomRate:
        1200000,

      totalAmount:
        1200000,

      specialRequest:
        "Khách muốn phòng yên tĩnh, ưu tiên tầng cao.",

      internalNote:
        "Booking trực tiếp từ website CITYHOUSE.",

      createdAt:
        "20/09/2026 10:15",

      updatedAt:
        "20/09/2026 10:15",

      logs: [
        "20/09/2026 10:15 — Đã tạo Reservation",
        "20/09/2026 10:15 — Booking Deduction Inventory",
      ],
    },


    /* ===================================================
       RESERVATION 02
       CITY OASIS — DELUXE — BAR
       CHECKED IN
    =================================================== */

    {
      id:
        "reservation_000002",

      reservationCode:
        "RES_000002",

      guestId:
        "guest_tran_quoc_huy",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_deluxe",

      ratePlanId:
        "rateplan_co_deluxe_bar",

      checkin:
        "2026-09-20",

      checkout:
        "2026-09-21",

      nights:
        1,

      adults:
        2,

      children:
        1,

      source:
        "Direct",

      /*
       * Step 10 — Front Desk
       * sau này sẽ xử lý Check-in thật.
       *
       * Hiện tại để sẵn status này
       * để demo danh sách In House.
       */
      status:
        "Checked In",

      checkedInAt:
        "20/09/2026 14:05",

      /*
       * Step 10 Front Desk dùng field này
       * để kiểm tra công nợ trước Check-out.
       *
       * Reservation này = 0 để demo
       * Check-out thành công.
       */
      outstandingBalance:
        0,

      roomRate:
        1500000,

      totalAmount:
        1500000,

      specialRequest:
        "Khách cần thêm 2 chai nước trong phòng.",

      internalNote:
        "Khách quen, ưu tiên hỗ trợ nhanh khi có yêu cầu.",

      createdAt:
        "19/09/2026 16:30",

      updatedAt:
        "20/09/2026 14:05",

      logs: [
        "20/09/2026 14:05 — Guest Checked In tại Room 305",
        "19/09/2026 16:30 — Booking Deduction Inventory",
        "19/09/2026 16:30 — Đã tạo Reservation",
      ],
    },


    /* ===================================================
       RESERVATION 03
       CITY OASIS — STUDIO — ROOM ONLY
    =================================================== */

    {
      id:
        "reservation_000003",

      reservationCode:
        "RES_000003",

      guestId:
        "guest_emily_carter",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_studio",

      ratePlanId:
        "rateplan_co_studio_room_only",

      checkin:
        "2026-09-22",

      checkout:
        "2026-09-23",

      nights:
        1,

      adults:
        1,

      children:
        0,

      source:
        "OTA",

      status:
        "Pending",

      /*
       * Room Only Base Rate
       * hiện tại là 1.100.000.
       */
      roomRate:
        1100000,

      totalAmount:
        1100000,

      specialRequest:
        "Late arrival khoảng 22:00.",

      internalNote:
        "Chờ xác nhận thông tin arrival của khách.",

      createdAt:
        "21/09/2026 08:40",

      updatedAt:
        "21/09/2026 08:40",

      logs: [
        "21/09/2026 08:40 — Booking Deduction Inventory",
        "21/09/2026 08:40 — Đã tạo Reservation",
      ],
    },


    /* ===================================================
       RESERVATION 04
       RETURNING GUEST — CANCELLED
    =================================================== */

    {
      id:
        "reservation_000004",

      reservationCode:
        "RES_000004",

      /*
       * Cùng Guest của RES_000001.
       *
       * Điều này giúp Step 07
       * hiển thị Guest History
       * và Returning Guest.
       */
      guestId:
        "guest_nguyen_minh_anh",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_deluxe",

      ratePlanId:
        "rateplan_co_deluxe_bar",

      checkin:
        "2026-09-26",

      checkout:
        "2026-09-27",

      nights:
        1,

      adults:
        2,

      children:
        0,

      source:
        "Phone",

      status:
        "Cancelled",

      /*
       * Rate Calendar ngày 26/09
       * của Deluxe BAR = 1.850.000.
       */
      roomRate:
        1850000,

      totalAmount:
        1850000,

      specialRequest:
        "Khách từng yêu cầu phòng gần thang máy.",

      internalNote:
        "Khách hủy do thay đổi lịch công tác.",

      createdAt:
        "20/09/2026 13:20",

      updatedAt:
        "21/09/2026 09:30",

      cancelledAt:
        "21/09/2026 09:30",

      logs: [
        "21/09/2026 09:30 — Reservation đã Cancelled",
        "21/09/2026 09:30 — Inventory đã được release",
        "20/09/2026 13:20 — Booking Deduction Inventory",
        "20/09/2026 13:20 — Đã tạo Reservation",
      ],
    },


    /* ===================================================
       RESERVATION 05
       NEST METRO — SUITE — BAR
    =================================================== */

    {
      id:
        "reservation_000005",

      reservationCode:
        "RES_000005",

      guestId:
        "guest_kenji_tanaka",

      propertyId:
        "property_nest_metro",

      roomTypeId:
        "roomtype_nm_suite",

      ratePlanId:
        "rateplan_nm_suite_bar",

      checkin:
        "2026-09-21",

      checkout:
        "2026-09-23",

      /*
       * Suite BAR yêu cầu
       * Minimum Stay = 2.
       */
      nights:
        2,

      adults:
        2,

      children:
        0,

      source:
        "Channex",

      status:
        "Confirmed",

      roomRate:
        2200000,

      /*
       * 2 đêm x 2.200.000
       */
      totalAmount:
        4400000,

      specialRequest:
        "Non-smoking room. Guest requests quiet room.",

      internalNote:
        "Booking nhận từ Channex.",

      createdAt:
        "20/09/2026 18:15",

      updatedAt:
        "20/09/2026 18:15",

      logs: [
        "20/09/2026 18:15 — Booking Deduction Inventory",
        "20/09/2026 18:15 — Đã tạo Reservation từ Channex",
      ],
    },

    /* ===================================================
   RESERVATION 06
   NEST METRO — SUITE — IN HOUSE
   DEMO OUTSTANDING BALANCE
=================================================== */

    {
      id:
        "reservation_000006",

      reservationCode:
        "RES_000006",

      guestId:
        "guest_le_hoang_nam",

      propertyId:
        "property_nest_metro",

      roomTypeId:
        "roomtype_nm_suite",

      ratePlanId:
        "rateplan_nm_suite_bar",

      checkin:
        "2026-09-20",

      checkout:
        "2026-09-22",

      nights:
        2,

      adults:
        1,

      children:
        0,

      source:
        "Direct",

      status:
        "Checked In",

      checkedInAt:
        "20/09/2026 16:20",

      roomRate:
        2200000,

      totalAmount:
        4400000,

      /*
       * Dùng để demo:
       *
       * Front Desk KHÔNG cho Check-out
       * nếu Outstanding Balance > 0.
       *
       * Step 13 Folio và Step 14 Payment
       * sau này sẽ tính field này tự động.
       */
      outstandingBalance:
        350000,

      specialRequest:
        "Khách cần xuất hóa đơn công ty.",

      internalNote:
        "Còn 350.000đ minibar chưa thanh toán.",

      createdAt:
        "19/09/2026 11:40",

      updatedAt:
        "20/09/2026 16:20",

      logs: [
        "20/09/2026 16:20 — Guest Checked In tại Room 802",
        "19/09/2026 11:40 — Booking Deduction Inventory",
        "19/09/2026 11:40 — Đã tạo Reservation",
      ],
    },
  ],


  /* =====================================================
   09. ROOM ASSIGNMENT — GÁN PHÒNG THỰC TẾ
===================================================== */

  roomAssignments: [
    /* ===================================================
       ASSIGNMENT 01
       RES_000001
       CITY OASIS — STUDIO — ROOM 201
    =================================================== */

    {
      id:
        "assignment_res_000001",

      reservationId:
        "reservation_000001",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_studio",

      physicalRoomId:
        "room_co_201",

      assignedAt:
        "20/09/2026 15:30",

      updatedAt:
        "20/09/2026 15:30",

      logs: [
        "20/09/2026 15:30 — Gán Room 201 cho RES_000001",
      ],
    },


    /* ===================================================
       ASSIGNMENT 02
       RES_000002
       CITY OASIS — DELUXE — ROOM 305
  
       Reservation này đã Checked In,
       vì vậy Room Assignment sẽ bị khóa.
       Nếu đổi phòng phải dùng Step 11.
    =================================================== */

    {
      id:
        "assignment_res_000002",

      reservationId:
        "reservation_000002",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_deluxe",

      physicalRoomId:
        "room_co_305",

      assignedAt:
        "20/09/2026 18:10",

      updatedAt:
        "21/09/2026 14:05",

      logs: [
        "21/09/2026 14:05 — Guest đã Checked In tại Room 305",
        "20/09/2026 18:10 — Gán Room 305 cho RES_000002",
      ],
    },


    /* ===================================================
       ASSIGNMENT 03
       RES_000005
       NEST METRO — SUITE — ROOM 801
    =================================================== */

    {
      id:
        "assignment_res_000005",

      reservationId:
        "reservation_000005",

      propertyId:
        "property_nest_metro",

      roomTypeId:
        "roomtype_nm_suite",

      physicalRoomId:
        "room_nm_801",

      assignedAt:
        "21/09/2026 09:20",

      updatedAt:
        "21/09/2026 09:20",

      logs: [
        "21/09/2026 09:20 — Gán Room 801 cho RES_000005",
      ],
    },


    /* ===================================================
   ASSIGNMENT 04
   RES_000006
   NEST METRO — SUITE — ROOM 802
=================================================== */

    {
      id:
        "assignment_res_000006",

      reservationId:
        "reservation_000006",

      propertyId:
        "property_nest_metro",

      roomTypeId:
        "roomtype_nm_suite",

      physicalRoomId:
        "room_nm_802",

      assignedAt:
        "20/09/2026 15:50",

      updatedAt:
        "20/09/2026 16:20",

      logs: [
        "20/09/2026 16:20 — Guest đã Checked In tại Room 802",
        "20/09/2026 15:50 — Gán Room 802 cho RES_000006",
      ],
    },
  ],


  roomMoves: [
    /* ===================================================
       ROOM MOVE HISTORY 01
  
       RES_000006
       Lê Hoàng Nam
  
       Room 801 → Room 802
  
       Đây là dữ liệu lịch sử để màn Room Move
       có sẵn ví dụ khi demo.
    =================================================== */

    {
      id:
        "roommove_res_000006_001",

      reservationId:
        "reservation_000006",

      propertyId:
        "property_nest_metro",

      roomTypeId:
        "roomtype_nm_suite",

      fromPhysicalRoomId:
        "room_nm_801",

      toPhysicalRoomId:
        "room_nm_802",

      movedAt:
        "20/09/2026 16:20",

      reason:
        "Room Issue",

      note:
        "Khách phản ánh điều hòa Room 801 hoạt động không ổn định. Lễ tân chuyển khách sang Room 802.",

      createdAt:
        "20/09/2026 16:20",
    },
  ],

  housekeeping: [
    /* ===================================================
       ROOM 201
       CLEANING → CLEAN
    =================================================== */

    {
      id:
        "housekeeping_room_co_201_001",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_studio",

      physicalRoomId:
        "room_co_201",

      fromStatus:
        "Cleaning",

      toStatus:
        "Clean",

      changedAt:
        "21/09/2026 09:00",

      note:
        "Đã vệ sinh phòng, thay ga giường và bổ sung amenities.",

      source:
        "Housekeeping",

      createdAt:
        "21/09/2026 09:00",
    },


    /* ===================================================
       ROOM 202
       CLEAN → DIRTY
    =================================================== */

    {
      id:
        "housekeeping_room_co_202_001",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_studio",

      physicalRoomId:
        "room_co_202",

      fromStatus:
        "Clean",

      toStatus:
        "Dirty",

      changedAt:
        "21/09/2026 12:10",

      note:
        "Phòng cần vệ sinh sau khi khách trả phòng.",

      source:
        "Front Desk",

      createdAt:
        "21/09/2026 12:10",
    },


    /* ===================================================
       ROOM 305
       CLEAN → INSPECTED
    =================================================== */

    {
      id:
        "housekeeping_room_co_305_001",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_deluxe",

      physicalRoomId:
        "room_co_305",

      fromStatus:
        "Clean",

      toStatus:
        "Inspected",

      changedAt:
        "21/09/2026 10:20",

      note:
        "Supervisor đã kiểm tra phòng và xác nhận đạt tiêu chuẩn.",

      source:
        "Housekeeping",

      createdAt:
        "21/09/2026 10:20",
    },


    /* ===================================================
       ROOM 307
       CLEANING → CLEAN
    =================================================== */

    {
      id:
        "housekeeping_room_co_307_001",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_deluxe",

      physicalRoomId:
        "room_co_307",

      fromStatus:
        "Cleaning",

      toStatus:
        "Clean",

      changedAt:
        "21/09/2026 15:30",

      note:
        "Phòng đã vệ sinh xong và sẵn sàng sử dụng cho Room Move.",

      source:
        "Housekeeping",

      createdAt:
        "21/09/2026 15:30",
    },


    /* ===================================================
       ROOM 801
       DIRTY → CLEANING
    =================================================== */

    {
      id:
        "housekeeping_room_nm_801_001",

      propertyId:
        "property_nest_metro",

      roomTypeId:
        "roomtype_nm_suite",

      physicalRoomId:
        "room_nm_801",

      fromStatus:
        "Dirty",

      toStatus:
        "Cleaning",

      changedAt:
        "21/09/2026 13:00",

      note:
        "Housekeeping đang xử lý phòng sau Room Move.",

      source:
        "Housekeeping",

      createdAt:
        "21/09/2026 13:00",
    },


    /* ===================================================
       ROOM 802
       CLEANING → CLEAN
    =================================================== */

    {
      id:
        "housekeeping_room_nm_802_001",

      propertyId:
        "property_nest_metro",

      roomTypeId:
        "roomtype_nm_suite",

      physicalRoomId:
        "room_nm_802",

      fromStatus:
        "Cleaning",

      toStatus:
        "Clean",

      changedAt:
        "21/09/2026 08:45",

      note:
        "Đã hoàn tất vệ sinh và bổ sung amenities.",

      source:
        "Housekeeping",

      createdAt:
        "21/09/2026 08:45",
    },
  ],


  /* =====================================================
     13–16. TÀI CHÍNH
  ===================================================== */

  folios: [
  /* ===================================================
     FOLIO 01
     RES_000001 — NGUYỄN MINH ANH

     Demo:
     Room Charge + Tax
  =================================================== */

  {
    id:
      "folio_res_000001",

    reservationId:
      "reservation_000001",

    propertyId:
      "property_city_oasis",

    guestId:
      "guest_nguyen_minh_anh",

    status:
      "Open",

    currency:
      "VND",

    charges: [
      {
        id:
          "charge_res_000001_room",

        type:
          "Room Charge",

        description:
          "Room Charge 21/09/2026 → 22/09/2026",

        amount:
          1200000,

        status:
          "Posted",

        postedAt:
          "20/09/2026 10:15",

        note:
          "1 night — RES_000001",
      },


      {
        id:
          "charge_res_000001_tax",

        type:
          "Tax",

        description:
          "Thuế và phí lưu trú",

        amount:
          120000,

        status:
          "Posted",

        postedAt:
          "20/09/2026 10:16",

        note:
          "Demo Tax Charge.",
      },
    ],

    createdAt:
      "20/09/2026 10:15",

    updatedAt:
      "20/09/2026 10:16",

    logs: [
      "20/09/2026 10:16 — Posted Tax: 120.000 ₫",
      "20/09/2026 10:15 — Posted Room Charge: 1.200.000 ₫",
      "20/09/2026 10:15 — Folio được tạo cho RES_000001",
    ],
  },


  /* ===================================================
     FOLIO 02
     RES_000005 — KENJI TANAKA

     Demo:
     Room Charge + Airport Transfer
  =================================================== */

  {
    id:
      "folio_res_000005",

    reservationId:
      "reservation_000005",

    propertyId:
      "property_nest_metro",

    guestId:
      "guest_kenji_tanaka",

    status:
      "Open",

    currency:
      "VND",

    charges: [
      {
        id:
          "charge_res_000005_room",

        type:
          "Room Charge",

        description:
          "Room Charge 21/09/2026 → 23/09/2026",

        amount:
          4400000,

        status:
          "Posted",

        postedAt:
          "20/09/2026 18:15",

        note:
          "2 nights — RES_000005",
      },


      {
        id:
          "charge_res_000005_transfer",

        type:
          "Airport Transfer",

        description:
          "Airport Transfer — One Way",

        amount:
          650000,

        status:
          "Posted",

        postedAt:
          "21/09/2026 08:30",

        note:
          "Đón khách từ sân bay Tân Sơn Nhất.",
      },
    ],

    createdAt:
      "20/09/2026 18:15",

    updatedAt:
      "21/09/2026 08:30",

    logs: [
      "21/09/2026 08:30 — Posted Airport Transfer: 650.000 ₫",
      "20/09/2026 18:15 — Posted Room Charge: 4.400.000 ₫",
      "20/09/2026 18:15 — Folio được tạo cho RES_000005",
    ],
  },


  /* ===================================================
     FOLIO 03
     RES_000006 — LÊ HOÀNG NAM

     Demo Front Desk Outstanding Balance = 350.000

     Reservation này hiện đang In House.
     Khoản 350.000 là Minibar chưa thanh toán.
  =================================================== */

  {
    id:
      "folio_res_000006",

    reservationId:
      "reservation_000006",

    propertyId:
      "property_nest_metro",

    guestId:
      "guest_le_hoang_nam",

    status:
      "Open",

    currency:
      "VND",

    charges: [
      {
        id:
          "charge_res_000006_minibar",

        type:
          "Minibar",

        description:
          "Minibar — đồ uống trong phòng",

        amount:
          350000,

        status:
          "Posted",

        postedAt:
          "21/09/2026 10:30",

        note:
          "Khoản minibar chưa thanh toán.",
      },


      /* ===============================================
         VOID CHARGE DEMO

         Khoản này nhập nhầm.
         Vẫn giữ record để Audit
         nhưng KHÔNG tính vào balance.
      =============================================== */

      {
        id:
          "charge_res_000006_laundry_void",

        type:
          "Laundry",

        description:
          "Laundry Service",

        amount:
          180000,

        status:
          "Voided",

        postedAt:
          "21/09/2026 11:10",

        note:
          "Nhân viên nhập nhầm Reservation.",

        voidedAt:
          "21/09/2026 11:15",

        voidReason:
          "Charge được post nhầm vào RES_000006.",
      },
    ],

    createdAt:
      "21/09/2026 10:30",

    updatedAt:
      "21/09/2026 11:15",

    logs: [
      "21/09/2026 11:15 — Voided Laundry 180.000 ₫. Lý do: Charge được post nhầm vào RES_000006.",
      "21/09/2026 11:10 — Posted Laundry: 180.000 ₫",
      "21/09/2026 10:30 — Posted Minibar: 350.000 ₫",
      "21/09/2026 10:30 — Folio được tạo cho RES_000006",
    ],
  },
],

  payments: [],

  refunds: [],

  noShows: [],


  /* =====================================================
     17. CHANNEX / SYNC LOG
  ===================================================== */

  syncLogs: [],
};