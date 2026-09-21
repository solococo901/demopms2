export const DEFAULT_PMS_DATA = {
  schemaVersion: 17,

  /* =====================================================
     01. KHÁCH SẠN — PROPERTY
  ===================================================== */

  properties: [
    {
      id: "property_city_oasis",

      name: "City Oasis",

      code: "CO",

      address: "42/3 Nguyễn Văn Trỗi, Phú Nhuận",

      city: "TP. Hồ Chí Minh",

      country: "Việt Nam",

      currency: "VND",

      timezone: "Asia/Ho_Chi_Minh",

      status: "Active",

      checkin: "14:00",

      checkout: "12:00",

      totalRooms: 40,

      phone: "028 7300 2999",

      email: "cityoasis@cityhouse.com.vn",

      channexId: "chx-city-oasis-001",

      connected: true,

      lastSync: "21/09/2026 13:20",

      logs: [
        "21/09/2026 13:20 — Kiểm tra kết nối Channex thành công",
        "20/09/2026 09:10 — Đã cập nhật thông tin khách sạn",
      ],
    },

    {
      id: "property_nest_metro",

      name: "Nest Metro",

      code: "NM",

      address: "TP. Thủ Đức",

      city: "TP. Hồ Chí Minh",

      country: "Việt Nam",

      currency: "VND",

      timezone: "Asia/Ho_Chi_Minh",

      status: "Active",

      checkin: "14:00",

      checkout: "12:00",

      totalRooms: 25,

      phone: "",

      email: "",

      channexId: "chx-nest-metro-002",

      connected: true,

      lastSync: "21/09/2026 12:45",

      logs: [
        "21/09/2026 12:45 — Đã liên kết khách sạn với Channex",
      ],
    },

    {
      id: "property_atelier",

      name: "Atelier Thao Dien",

      code: "ATS",

      address: "Thảo Điền, TP. Thủ Đức",

      city: "TP. Hồ Chí Minh",

      country: "Việt Nam",

      currency: "VND",

      timezone: "Asia/Ho_Chi_Minh",

      status: "Active",

      checkin: "14:00",

      checkout: "12:00",

      totalRooms: 18,

      phone: "",

      email: "",

      channexId: "",

      connected: false,

      lastSync: "",

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
      id: "roomtype_co_studio",

      propertyId: "property_city_oasis",

      name: "Studio",

      code: "STD",

      status: "Active",

      maxAdults: 2,

      maxChildren: 1,

      maxOccupancy: 3,

      baseRate: 1200000,

      totalRooms: 12,

      channexRoomTypeId: "chx-room-studio-001",

      mapped: true,

      lastSync: "21/09/2026 13:35",

      logs: [
        "21/09/2026 13:35 — Kiểm tra Channex Room Type Mapping thành công",
        "20/09/2026 10:15 — Đã cập nhật loại phòng",
      ],
    },

    {
      id: "roomtype_co_deluxe",

      propertyId: "property_city_oasis",

      name: "Deluxe",

      code: "DLX",

      status: "Active",

      maxAdults: 2,

      maxChildren: 1,

      maxOccupancy: 3,

      baseRate: 1500000,

      totalRooms: 18,

      channexRoomTypeId: "chx-room-deluxe-002",

      mapped: true,

      lastSync: "21/09/2026 13:30",

      logs: [
        "21/09/2026 13:30 — Đã mapping loại phòng với Channex",
      ],
    },

    {
      id: "roomtype_nm_suite",

      propertyId: "property_nest_metro",

      name: "Suite",

      code: "STE",

      status: "Active",

      maxAdults: 3,

      maxChildren: 1,

      maxOccupancy: 4,

      baseRate: 2200000,

      totalRooms: 8,

      channexRoomTypeId: "",

      mapped: false,

      lastSync: "",

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

      note:
        "Phòng Deluxe đã được kiểm tra và sẵn sàng giao khách.",

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

      note:
        "Đang kiểm tra hệ thống máy lạnh.",

      logs: [
        "21/09/2026 11:05 — Trạng thái phòng chuyển thành Out of Order",
        "20/09/2026 15:05 — Đã tạo phòng vật lý",
      ],
    },

    {
      id: "room_co_307",

      propertyId: "property_city_oasis",

      roomTypeId: "roomtype_co_deluxe",

      roomNumber: "307",

      floor: "3",

      status: "Active",

      housekeepingStatus: "Clean",

      occupancyStatus: "Vacant",

      currentReservationId: null,

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

      note:
        "Suite tầng 8 đang được Housekeeping xử lý.",

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
    {
      id: "rateplan_co_studio_bar",

      propertyId: "property_city_oasis",

      roomTypeId: "roomtype_co_studio",

      name: "BAR",

      code: "BAR",

      baseRate: 1200000,

      minimumStay: 1,

      stopSell: false,

      channexRatePlanId:
        "chx-rate-co-std-bar-001",

      mapped: true,

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
    {
      id:
        "ratecalendar_co_std_bar_20260921",

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
      id:
        "ratecalendar_co_std_bar_20260922",

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
      id:
        "ratecalendar_co_std_bar_20260926",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_studio",

      ratePlanId:
        "rateplan_co_studio_bar",

      date:
        "2026-09-26",

      rate:
        1450000,

      minimumStay:
        2,

      stopSell:
        false,

      synced:
        false,

      lastSync:
        "",

      createdAt:
        "21/09/2026 08:00",

      updatedAt:
        "21/09/2026 08:00",
    },

    {
      id:
        "ratecalendar_co_dlx_bar_20260921",

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
      id:
        "ratecalendar_co_dlx_bar_20260926",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_deluxe",

      ratePlanId:
        "rateplan_co_deluxe_bar",

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

    {
      id:
        "ratecalendar_co_dlx_bb_20260921",

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

    {
      id:
        "ratecalendar_nm_ste_bar_20260921",

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
      id:
        "ratecalendar_nm_ste_bar_20260926",

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
    {
      id:
        "inventory_co_std_20260921",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_studio",

      date:
        "2026-09-21",

      totalRooms:
        12,

      bookedRooms:
        4,

      blockedRooms:
        1,

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

    {
      id:
        "inventory_co_dlx_20260921",

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

      availableRooms:
        11,

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

    {
      id:
        "inventory_nm_ste_20260921",

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

    {
      id:
        "inventory_co_std_20260922",

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

    {
      id:
        "inventory_co_dlx_20260922",

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

    {
      id:
        "inventory_nm_ste_20260922",

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

    {
      id:
        "inventory_co_std_20260926",

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

    {
      id:
        "inventory_co_dlx_20260926",

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

    {
      id:
        "inventory_nm_ste_20260926",

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
    {
      id:
        "guest_nguyen_minh_anh",

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

    {
      id:
        "guest_tran_quoc_huy",

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

    {
      id:
        "guest_emily_carter",

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

    {
      id:
        "guest_kenji_tanaka",

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

    {
      id:
        "guest_le_hoang_nam",

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

      status:
        "Checked In",

      checkedInAt:
        "20/09/2026 14:05",

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

    {
      id:
        "reservation_000004",

      reservationCode:
        "RES_000004",

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
     09. ROOM ASSIGNMENT
  ===================================================== */

  roomAssignments: [
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

  /* =====================================================
     11. ROOM MOVE
  ===================================================== */

  roomMoves: [
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

  /* =====================================================
     12. HOUSEKEEPING
  ===================================================== */

  housekeeping: [
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

  payments: [
    {
      id:
        "payment_res_000001_001",

      reservationId:
        "reservation_000001",

      folioId:
        "folio_res_000001",

      propertyId:
        "property_city_oasis",

      guestId:
        "guest_nguyen_minh_anh",

      method:
        "Bank Transfer",

      provider:
        "Vietcombank",

      transactionReference:
        "VCB-RES000001-001",

      amount:
        500000,

      currency:
        "VND",

      status:
        "Posted",

      paidAt:
        "21/09/2026 09:40",

      note:
        "Khách chuyển khoản trước một phần chi phí lưu trú.",

      createdAt:
        "21/09/2026 09:40",

      updatedAt:
        "21/09/2026 09:40",
    },

    {
      id:
        "payment_res_000005_001",

      reservationId:
        "reservation_000005",

      folioId:
        "folio_res_000005",

      propertyId:
        "property_nest_metro",

      guestId:
        "guest_kenji_tanaka",

      method:
        "Payment Gateway",

      provider:
        "VNPay",

      transactionReference:
        "VNPAY-RES000005-001",

      amount:
        5050000,

      currency:
        "VND",

      status:
        "Posted",

      paidAt:
        "21/09/2026 11:25",

      note:
        "Khách thanh toán toàn bộ Folio qua VNPay.",

      createdAt:
        "21/09/2026 11:25",

      updatedAt:
        "21/09/2026 11:25",
    },

    {
      id:
        "payment_res_000005_void_001",

      reservationId:
        "reservation_000005",

      folioId:
        "folio_res_000005",

      propertyId:
        "property_nest_metro",

      guestId:
        "guest_kenji_tanaka",

      method:
        "Card",

      provider:
        "Visa",

      transactionReference:
        "CARD-RES000005-ERROR-001",

      amount:
        1000000,

      currency:
        "VND",

      status:
        "Voided",

      paidAt:
        "21/09/2026 11:10",

      note:
        "Giao dịch được nhập nhầm trước khi ghi nhận VNPay.",

      voidedAt:
        "21/09/2026 11:15",

      voidReason:
        "Nhân viên chọn nhầm phương thức và nhập sai giao dịch.",

      createdAt:
        "21/09/2026 11:10",

      updatedAt:
        "21/09/2026 11:15",
    },
  ],

  refunds: [
    {
      id:
        "refund_res_000001_001",

      reservationId:
        "reservation_000001",

      folioId:
        "folio_res_000001",

      propertyId:
        "property_city_oasis",

      guestId:
        "guest_nguyen_minh_anh",

      type:
        "Full Refund",

      amount:
        500000,

      currency:
        "VND",

      refundReference:
        "VCB-RF-RES000001-001",

      reason:
        "Khách yêu cầu hoàn lại toàn bộ khoản đã chuyển trước.",

      status:
        "Posted",

      refundedAt:
        "21/09/2026 14:20",

      createdAt:
        "21/09/2026 14:20",

      updatedAt:
        "21/09/2026 14:20",
    },

    {
      id:
        "refund_res_000005_001",

      reservationId:
        "reservation_000005",

      folioId:
        "folio_res_000005",

      propertyId:
        "property_nest_metro",

      guestId:
        "guest_kenji_tanaka",

      type:
        "Partial Refund",

      amount:
        650000,

      currency:
        "VND",

      refundReference:
        "VNPAY-RF-RES000005-001",

      reason:
        "Hoàn một phần tiền theo yêu cầu điều chỉnh dịch vụ của khách.",

      status:
        "Posted",

      refundedAt:
        "21/09/2026 15:05",

      createdAt:
        "21/09/2026 15:05",

      updatedAt:
        "21/09/2026 15:05",
    },
  ],

  /* =====================================================
     16. NO-SHOW
  ===================================================== */

  noShows: [
    {
      id:
        "noshow_demo_000001",

      reservationId:
        "reservation_noshow_demo_000001",

      reservationCode:
        "RES_000007",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_studio",

      guestId:
        "guest_emily_carter",

      releasedPhysicalRoomId:
        "room_co_202",

      stayDates: [
        "2026-09-20",
      ],

      reason:
        "Guest did not arrive",

      note:
        "Front Desk đã liên hệ nhưng không nhận được phản hồi từ khách.",

      date:
        "2026-09-20",

      markedAt:
        "20/09/2026 22:10",

      inventoryReleased:
        true,

      physicalRoomReleased:
        true,

      channelSyncStatus:
        "Queued",

      createdAt:
        "20/09/2026 22:10",
    },
  ],

  /* =====================================================
     16. CHANNEL SYNC QUEUE
  ===================================================== */

  channelSyncLogs: [
    {
      id:
        "channel_sync_noshow_000001",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_studio",

      reservationId:
        "reservation_noshow_demo_000001",

      action:
        "Availability Sync",

      source:
        "No-show",

      dates: [
        "2026-09-20",
      ],

      status:
        "Queued",

      message:
        "Inventory released after No-show RES_000007",

      createdAt:
        "20/09/2026 22:10",
    },
  ],

  /* =====================================================
     17. CHANNEX BOOKING INBOX
  ===================================================== */

  channexBookingInbox: [
    {
      id:
        "channex_booking_inbox_000001",

      externalBookingId:
        "BDC-684291753",

      channel:
        "Booking.com",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_studio",

      ratePlanId:
        "rateplan_co_studio_bar",

      guestName:
        "Sophia Williams",

      guestEmail:
        "sophia.williams@example.com",

      guestPhone:
        "+1 415 555 0188",

      nationality:
        "United States",

      checkin:
        "2026-09-22",

      checkout:
        "2026-09-24",

      adults:
        2,

      children:
        0,

      totalAmount:
        2400000,

      currency:
        "VND",

      specialRequest:
        "High floor if available.",

      status:
        "New",

      receivedAt:
        "21/09/2026 18:30",

      createdAt:
        "21/09/2026 18:30",
    },

    {
      id:
        "channex_booking_inbox_000002",

      externalBookingId:
        "AGD-93847261",

      channel:
        "Agoda",

      propertyId:
        "property_nest_metro",

      roomTypeId:
        "roomtype_nm_suite",

      ratePlanId:
        "rateplan_nm_suite_bar",

      guestName:
        "Daniel Lee",

      guestEmail:
        "daniel.lee@example.com",

      guestPhone:
        "+65 9123 4455",

      nationality:
        "Singapore",

      checkin:
        "2026-09-26",

      checkout:
        "2026-09-28",

      adults:
        2,

      children:
        0,

      totalAmount:
        5200000,

      currency:
        "VND",

      specialRequest:
        "Late arrival around 22:00.",

      status:
        "New",

      receivedAt:
        "21/09/2026 19:10",

      createdAt:
        "21/09/2026 19:10",
    },
  ],

  /* =====================================================
     17. CHANNEX / SYNC LOG
  ===================================================== */

  syncLogs: [
    {
      id:
        "sync_demo_availability_000001",

      action:
        "Availability Sync",

      direction:
        "PMS → Channex",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_studio",

      ratePlanId:
        null,

      status:
        "Success",

      message:
        "21/09/2026: Availability synced successfully.",

      payload: {
        date:
          "2026-09-21",

        available:
          7,

        booked:
          4,

        blocked:
          1,
      },

      referenceId:
        null,

      createdAt:
        "21/09/2026 14:50",
    },

    {
      id:
        "sync_demo_rate_000001",

      action:
        "Rate Sync",

      direction:
        "PMS → Channex",

      propertyId:
        "property_city_oasis",

      roomTypeId:
        "roomtype_co_studio",

      ratePlanId:
        "rateplan_co_studio_bar",

      status:
        "Success",

      message:
        "21/09/2026: 1.200.000 ₫ synced.",

      payload: {
        date:
          "2026-09-21",

        rate:
          1200000,
      },

      referenceId:
        null,

      createdAt:
        "21/09/2026 14:31",
    },

    {
      id:
        "sync_demo_failed_000001",

      action:
        "Rate Sync",

      direction:
        "PMS → Channex",

      propertyId:
        "property_nest_metro",

      roomTypeId:
        "roomtype_nm_suite",

      ratePlanId:
        "rateplan_nm_suite_bar",

      status:
        "Failed",

      message:
        "Room Type chưa mapping Channex.",

      payload: {
        date:
          "2026-09-26",
      },

      referenceId:
        null,

      createdAt:
        "21/09/2026 14:35",
    },
  ],
};