"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Building2,
  Cable,
  CheckCircle2,
  Clock3,
  CloudDownload,
  CloudUpload,
  Hotel,
  Link2,
  RefreshCw,
  Search,
  Send,
  Settings2,
  TriangleAlert,
  Unplug,
  Wifi,
} from "lucide-react";

import {
  usePms,
} from "@/context/PmsContext";

import Modal from "@/components/Modal";


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


/* =====================================================
   DATE RANGE

   Checkout không giữ Inventory.

   22 → 24
   =
   22 + 23
===================================================== */

function dateRange(
  start,
  end
) {
  if (
    !start ||
    !end
  ) {
    return [];
  }


  const dates = [];


  const cursor =
    new Date(
      `${start}T00:00:00`
    );


  const endDate =
    new Date(
      `${end}T00:00:00`
    );


  while (
    cursor <
    endDate
  ) {
    const year =
      cursor.getFullYear();


    const month =
      String(
        cursor.getMonth() + 1
      ).padStart(
        2,
        "0"
      );


    const day =
      String(
        cursor.getDate()
      ).padStart(
        2,
        "0"
      );


    dates.push(
      `${year}-${month}-${day}`
    );


    cursor.setDate(
      cursor.getDate() + 1
    );
  }


  return dates;
}


/* =====================================================
   RESERVATION CODE
===================================================== */

function nextReservationCode(
  reservations
) {
  const maxNumber =
    (
      reservations ||
      []
    ).reduce(
      (
        max,
        reservation
      ) => {
        const match =
          String(
            reservation.reservationCode ||
            ""
          ).match(
            /RES_(\d+)/
          );


        if (
          !match
        ) {
          return max;
        }


        return Math.max(
          max,
          Number(
            match[1]
          )
        );
      },
      0
    );


  return `RES_${String(
    maxNumber + 1
  ).padStart(
    6,
    "0"
  )}`;
}


/* =====================================================
   INVENTORY HELPERS

   Canonical structure:

   totalRooms
   bookedRooms
   blockedRooms
   availableRooms
   synced

   Đồng thời đọc fallback field cũ để tránh
   localStorage từ Step 16 bị lỗi.
===================================================== */

function getTotalRooms(
  inventoryItem
) {
  return Number(
    inventoryItem?.totalRooms ??
      inventoryItem?.total ??
      0
  );
}


function getBookedRooms(
  inventoryItem
) {
  return Number(
    inventoryItem?.bookedRooms ??
      inventoryItem?.booked ??
      0
  );
}


function getBlockedRooms(
  inventoryItem
) {
  return Number(
    inventoryItem?.blockedRooms ??
      inventoryItem?.blocked ??
      0
  );
}


function getAvailableRooms(
  inventoryItem
) {
  if (
    inventoryItem?.availableRooms !==
    undefined
  ) {
    return Number(
      inventoryItem.availableRooms ||
      0
    );
  }


  if (
    inventoryItem?.available !==
    undefined
  ) {
    return Number(
      inventoryItem.available ||
      0
    );
  }


  return Math.max(
    getTotalRooms(
      inventoryItem
    ) -
      getBookedRooms(
        inventoryItem
      ) -
      getBlockedRooms(
        inventoryItem
      ),
    0
  );
}


/* =====================================================
   STATUS
===================================================== */

function SyncStatusBadge({
  status,
}) {
  const classMap = {
    Queued:
      "status-warning",

    Pending:
      "status-warning",

    Success:
      "status-success",

    Synced:
      "status-success",

    Failed:
      "status-danger",

    Imported:
      "status-success",

    New:
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
      {
        status ||
        "Unknown"
      }
    </span>
  );
}


function MappingBadge({
  mapped,
}) {
  return (
    <span
      className={`status-badge ${
        mapped
          ? "status-success"
          : "status-warning"
      }`}
    >
      {
        mapped
          ? "Mapped"
          : "Not mapped"
      }
    </span>
  );
}


/* =====================================================
   MAIN
===================================================== */

export default function ChannexManager() {
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

  const inventory =
    data.inventory || [];

  const rateCalendar =
    data.rateCalendar || [];

  const reservations =
    data.reservations || [];

  const guests =
    data.guests || [];

  const channelSyncLogs =
    data.channelSyncLogs || [];

  const syncLogs =
    data.syncLogs || [];

  const channexBookingInbox =
    data.channexBookingInbox ||
    [];


  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "overview"
  );


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    propertyFilter,
    setPropertyFilter,
  ] = useState("");


  const [
    mappingState,
    setMappingState,
  ] = useState(null);


  const [
    mappingExternalId,
    setMappingExternalId,
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


  /* ===================================================
     METRICS
  =================================================== */

  const metrics =
    useMemo(
      () => {
        const connectedProperties =
          properties.filter(
            (property) =>
              property.connected &&
              property.channexId
          ).length;


        const mappedRoomTypes =
          roomTypes.filter(
            (roomType) =>
              roomType.mapped &&
              roomType.channexRoomTypeId
          ).length;


        const mappedRatePlans =
          ratePlans.filter(
            (ratePlan) =>
              ratePlan.mapped &&
              ratePlan.channexRatePlanId
          ).length;


        const queued =
          channelSyncLogs.filter(
            (log) =>
              [
                "Queued",
                "Pending",
              ].includes(
                log.status
              )
          ).length;


        return {
          connectedProperties,

          mappedRoomTypes,

          mappedRatePlans,

          queued,
        };
      },
      [
        properties,
        roomTypes,
        ratePlans,
        channelSyncLogs,
      ]
    );


  /* ===================================================
     OPEN MAPPING
  =================================================== */

  function openMapping(
    type,
    item
  ) {
    let externalId = "";


    if (
      type ===
      "property"
    ) {
      externalId =
        item.channexId ||
        "";
    }


    if (
      type ===
      "roomType"
    ) {
      externalId =
        item.channexRoomTypeId ||
        "";
    }


    if (
      type ===
      "ratePlan"
    ) {
      externalId =
        item.channexRatePlanId ||
        "";
    }


    setMappingState({
      type,

      itemId:
        item.id,
    });


    setMappingExternalId(
      externalId
    );
  }


  /* ===================================================
     SAVE MAPPING
  =================================================== */

  function saveMapping() {
    if (
      !mappingState
    ) {
      return;
    }


    if (
      !mappingExternalId.trim()
    ) {
      alert(
        "Vui lòng nhập Channex ID."
      );

      return;
    }


    const actionTime =
      nowText();


    if (
      mappingState.type ===
      "property"
    ) {
      setData(
        (current) => ({
          ...current,

          properties:
            (
              current.properties ||
              []
            ).map(
              (property) =>
                property.id ===
                mappingState.itemId
                  ? {
                      ...property,

                      channexId:
                        mappingExternalId.trim(),

                      connected:
                        true,

                      lastSync:
                        actionTime,

                      logs: [
                        `${actionTime} — Property mapped to Channex ${mappingExternalId.trim()}`,

                        ...(
                          property.logs ||
                          []
                        ),
                      ],
                    }
                  : property
            ),
        })
      );
    }


    if (
      mappingState.type ===
      "roomType"
    ) {
      setData(
        (current) => ({
          ...current,

          roomTypes:
            (
              current.roomTypes ||
              []
            ).map(
              (roomType) =>
                roomType.id ===
                mappingState.itemId
                  ? {
                      ...roomType,

                      channexRoomTypeId:
                        mappingExternalId.trim(),

                      mapped:
                        true,

                      lastSync:
                        actionTime,

                      logs: [
                        `${actionTime} — Room Type mapped to Channex ${mappingExternalId.trim()}`,

                        ...(
                          roomType.logs ||
                          []
                        ),
                      ],
                    }
                  : roomType
            ),
        })
      );
    }


    if (
      mappingState.type ===
      "ratePlan"
    ) {
      setData(
        (current) => ({
          ...current,

          ratePlans:
            (
              current.ratePlans ||
              []
            ).map(
              (ratePlan) =>
                ratePlan.id ===
                mappingState.itemId
                  ? {
                      ...ratePlan,

                      channexRatePlanId:
                        mappingExternalId.trim(),

                      mapped:
                        true,

                      lastSync:
                        actionTime,

                      logs: [
                        `${actionTime} — Rate Plan mapped to Channex ${mappingExternalId.trim()}`,

                        ...(
                          ratePlan.logs ||
                          []
                        ),
                      ],
                    }
                  : ratePlan
            ),
        })
      );
    }


    setMappingState(
      null
    );


    setMappingExternalId(
      ""
    );
  }


  /* ===================================================
     UNMAP
  =================================================== */

  function unmap(
    type,
    item
  ) {
    const actionTime =
      nowText();


    if (
      type ===
      "property"
    ) {
      setData(
        (current) => ({
          ...current,

          properties:
            (
              current.properties ||
              []
            ).map(
              (property) =>
                property.id ===
                item.id
                  ? {
                      ...property,

                      channexId:
                        "",

                      connected:
                        false,

                      lastSync:
                        actionTime,

                      logs: [
                        `${actionTime} — Channex Property disconnected`,

                        ...(
                          property.logs ||
                          []
                        ),
                      ],
                    }
                  : property
            ),
        })
      );
    }


    if (
      type ===
      "roomType"
    ) {
      setData(
        (current) => ({
          ...current,

          roomTypes:
            (
              current.roomTypes ||
              []
            ).map(
              (roomType) =>
                roomType.id ===
                item.id
                  ? {
                      ...roomType,

                      channexRoomTypeId:
                        "",

                      mapped:
                        false,

                      lastSync:
                        actionTime,

                      logs: [
                        `${actionTime} — Channex Room Type mapping removed`,

                        ...(
                          roomType.logs ||
                          []
                        ),
                      ],
                    }
                  : roomType
            ),
        })
      );
    }


    if (
      type ===
      "ratePlan"
    ) {
      setData(
        (current) => ({
          ...current,

          ratePlans:
            (
              current.ratePlans ||
              []
            ).map(
              (ratePlan) =>
                ratePlan.id ===
                item.id
                  ? {
                      ...ratePlan,

                      channexRatePlanId:
                        "",

                      mapped:
                        false,

                      lastSync:
                        actionTime,

                      logs: [
                        `${actionTime} — Channex Rate Plan mapping removed`,

                        ...(
                          ratePlan.logs ||
                          []
                        ),
                      ],
                    }
                  : ratePlan
            ),
        })
      );
    }
  }


  /* ===================================================
     VALIDATE MAPPING
  =================================================== */

  function validateMapping({
    propertyId,
    roomTypeId,
    ratePlanId = null,
  }) {
    const property =
      getProperty(
        propertyId
      );


    const roomType =
      getRoomType(
        roomTypeId
      );


    const ratePlan =
      ratePlanId
        ? getRatePlan(
            ratePlanId
          )
        : null;


    if (
      !property ||
      !property.connected ||
      !property.channexId
    ) {
      return {
        valid:
          false,

        error:
          "Property chưa mapping hoặc chưa kết nối Channex.",
      };
    }


    if (
      !roomType ||
      !roomType.mapped ||
      !roomType.channexRoomTypeId
    ) {
      return {
        valid:
          false,

        error:
          "Room Type chưa mapping Channex.",
      };
    }


    if (
      ratePlanId &&
      (
        !ratePlan ||
        !ratePlan.mapped ||
        !ratePlan.channexRatePlanId
      )
    ) {
      return {
        valid:
          false,

        error:
          "Rate Plan chưa mapping Channex.",
      };
    }


    return {
      valid:
        true,

      property,

      roomType,

      ratePlan,
    };
  }


  /* ===================================================
     CREATE SYNC LOG
  =================================================== */

  function createSyncLog({
    action,
    direction,
    propertyId,
    roomTypeId = null,
    ratePlanId = null,
    status,
    message,
    payload = null,
    referenceId = null,
  }) {
    return {
      id:
        makeId(
          "sync"
        ),

      action,

      direction,

      propertyId,

      roomTypeId,

      ratePlanId,

      status,

      message,

      payload,

      referenceId,

      createdAt:
        nowText(),
    };
  }


  /* ===================================================
     PROCESS CHANNEL QUEUE ITEM
  =================================================== */

  function processQueueItem(
    queueItem
  ) {
    const validation =
      validateMapping({
        propertyId:
          queueItem.propertyId,

        roomTypeId:
          queueItem.roomTypeId,

        ratePlanId:
          queueItem.ratePlanId ||
          null,
      });


    const actionTime =
      nowText();


    if (
      !validation.valid
    ) {
      const failedLog =
        createSyncLog({
          action:
            queueItem.action,

          direction:
            "PMS → Channex",

          propertyId:
            queueItem.propertyId,

          roomTypeId:
            queueItem.roomTypeId,

          ratePlanId:
            queueItem.ratePlanId ||
            null,

          status:
            "Failed",

          message:
            validation.error,

          referenceId:
            queueItem.id,
        });


      setData(
        (current) => ({
          ...current,

          channelSyncLogs:
            (
              current.channelSyncLogs ||
              []
            ).map(
              (item) =>
                item.id ===
                queueItem.id
                  ? {
                      ...item,

                      status:
                        "Failed",

                      lastAttemptAt:
                        actionTime,

                      error:
                        validation.error,
                    }
                  : item
            ),

          syncLogs: [
            failedLog,

            ...(
              current.syncLogs ||
              []
            ),
          ],
        })
      );


      return;
    }


    const successLog =
      createSyncLog({
        action:
          queueItem.action,

        direction:
          "PMS → Channex",

        propertyId:
          queueItem.propertyId,

        roomTypeId:
          queueItem.roomTypeId,

        ratePlanId:
          queueItem.ratePlanId ||
          null,

        status:
          "Success",

        message:
          `${queueItem.action} completed successfully.`,

        payload: {
          dates:
            queueItem.dates ||
            [],
        },

        referenceId:
          queueItem.id,
      });


    setData(
      (current) => ({
        ...current,

        channelSyncLogs:
          (
            current.channelSyncLogs ||
            []
          ).map(
            (item) =>
              item.id ===
                queueItem.id
                ? {
                    ...item,

                    status:
                      "Success",

                    syncedAt:
                      actionTime,

                    lastAttemptAt:
                      actionTime,

                    error:
                      "",
                  }
                : item
          ),


        /* =============================================
           AVAILABILITY RECORDS

           Queue No-show chỉ đánh dấu những ngày
           liên quan là đã sync.
        ============================================= */

        inventory:
          (
            current.inventory ||
            []
          ).map(
            (item) => {
              const match =
                item.propertyId ===
                  queueItem.propertyId &&
                item.roomTypeId ===
                  queueItem.roomTypeId &&
                (
                  !queueItem.dates?.length ||
                  queueItem.dates.includes(
                    item.date
                  )
                );


              if (
                !match
              ) {
                return item;
              }


              return {
                ...item,

                synced:
                  true,

                lastSync:
                  actionTime,

                updatedAt:
                  actionTime,

                logs: [
                  `${actionTime} — Availability Sync hoàn tất từ Channel Queue`,

                  ...(
                    item.logs ||
                    []
                  ),
                ],
              };
            }
          ),


        syncLogs: [
          successLog,

          ...(
            current.syncLogs ||
            []
          ),
        ],
      })
    );
  }


  /* ===================================================
     PROCESS ALL QUEUE

     Xử lý trong một setData duy nhất để tránh
     nhiều state update chạy nối tiếp và overwrite nhau.
  =================================================== */

  function processAllQueue() {
    const pending =
      channelSyncLogs.filter(
        (item) =>
          [
            "Queued",
            "Pending",
            "Failed",
          ].includes(
            item.status
          )
      );


    if (
      pending.length ===
      0
    ) {
      alert(
        "Channel Sync Queue đang trống."
      );

      return;
    }


    const actionTime =
      nowText();


    setData(
      (current) => {
        const queueIds =
          new Set(
            pending.map(
              (item) =>
                item.id
            )
          );


        const resultMap =
          new Map();


        const newLogs = [];


        pending.forEach(
          (queueItem) => {
            const property =
              (
                current.properties ||
                []
              ).find(
                (item) =>
                  item.id ===
                  queueItem.propertyId
              );


            const roomType =
              (
                current.roomTypes ||
                []
              ).find(
                (item) =>
                  item.id ===
                  queueItem.roomTypeId
              );


            const ratePlan =
              queueItem.ratePlanId
                ? (
                    current.ratePlans ||
                    []
                  ).find(
                    (item) =>
                      item.id ===
                      queueItem.ratePlanId
                  )
                : null;


            let error = "";


            if (
              !property ||
              !property.connected ||
              !property.channexId
            ) {
              error =
                "Property chưa mapping hoặc chưa kết nối Channex.";
            }

            else if (
              !roomType ||
              !roomType.mapped ||
              !roomType.channexRoomTypeId
            ) {
              error =
                "Room Type chưa mapping Channex.";
            }

            else if (
              queueItem.ratePlanId &&
              (
                !ratePlan ||
                !ratePlan.mapped ||
                !ratePlan.channexRatePlanId
              )
            ) {
              error =
                "Rate Plan chưa mapping Channex.";
            }


            const success =
              !error;


            resultMap.set(
              queueItem.id,
              {
                success,
                error,
              }
            );


            newLogs.push({
              id:
                makeId(
                  "sync"
                ),

              action:
                queueItem.action,

              direction:
                "PMS → Channex",

              propertyId:
                queueItem.propertyId,

              roomTypeId:
                queueItem.roomTypeId,

              ratePlanId:
                queueItem.ratePlanId ||
                null,

              status:
                success
                  ? "Success"
                  : "Failed",

              message:
                success
                  ? `${queueItem.action} completed successfully.`
                  : error,

              payload: {
                dates:
                  queueItem.dates ||
                  [],
              },

              referenceId:
                queueItem.id,

              createdAt:
                actionTime,
            });
          }
        );


        const nextQueue =
          (
            current.channelSyncLogs ||
            []
          ).map(
            (item) => {
              if (
                !queueIds.has(
                  item.id
                )
              ) {
                return item;
              }


              const result =
                resultMap.get(
                  item.id
                );


              return {
                ...item,

                status:
                  result.success
                    ? "Success"
                    : "Failed",

                syncedAt:
                  result.success
                    ? actionTime
                    : item.syncedAt,

                lastAttemptAt:
                  actionTime,

                error:
                  result.error,
              };
            }
          );


        const nextInventory =
          (
            current.inventory ||
            []
          ).map(
            (inventoryItem) => {
              const relatedQueue =
                pending.find(
                  (queueItem) => {
                    const result =
                      resultMap.get(
                        queueItem.id
                      );


                    return (
                      result?.success &&
                      queueItem.propertyId ===
                        inventoryItem.propertyId &&
                      queueItem.roomTypeId ===
                        inventoryItem.roomTypeId &&
                      (
                        !queueItem.dates?.length ||
                        queueItem.dates.includes(
                          inventoryItem.date
                        )
                      )
                    );
                  }
                );


              if (
                !relatedQueue
              ) {
                return inventoryItem;
              }


              return {
                ...inventoryItem,

                synced:
                  true,

                lastSync:
                  actionTime,

                updatedAt:
                  actionTime,

                logs: [
                  `${actionTime} — Availability Sync hoàn tất từ Channel Queue`,

                  ...(
                    inventoryItem.logs ||
                    []
                  ),
                ],
              };
            }
          );


        return {
          ...current,

          channelSyncLogs:
            nextQueue,

          inventory:
            nextInventory,

          syncLogs: [
            ...newLogs,

            ...(
              current.syncLogs ||
              []
            ),
          ],
        };
      }
    );
  }


  /* ===================================================
     AVAILABILITY SYNC
  =================================================== */

  function syncAvailability() {
    const targets =
      inventory.filter(
        (item) =>
          item.synced !==
          true
      );


    if (
      targets.length ===
      0
    ) {
      alert(
        "Không có Availability cần đồng bộ."
      );

      return;
    }


    const actionTime =
      nowText();


    const successIds =
      new Set();


    const logs = [];


    targets.forEach(
      (item) => {
        const validation =
          validateMapping({
            propertyId:
              item.propertyId,

            roomTypeId:
              item.roomTypeId,
          });


        const totalRooms =
          getTotalRooms(
            item
          );


        const bookedRooms =
          getBookedRooms(
            item
          );


        const blockedRooms =
          getBlockedRooms(
            item
          );


        const availableRooms =
          getAvailableRooms(
            item
          );


        if (
          validation.valid
        ) {
          successIds.add(
            item.id
          );


          logs.push(
            createSyncLog({
              action:
                "Availability Sync",

              direction:
                "PMS → Channex",

              propertyId:
                item.propertyId,

              roomTypeId:
                item.roomTypeId,

              status:
                "Success",

              message:
                `${item.date}: ${availableRooms} phòng có thể bán đã được đồng bộ.`,

              payload: {
                date:
                  item.date,

                totalRooms,

                bookedRooms,

                blockedRooms,

                availableRooms,
              },
            })
          );
        }

        else {
          logs.push(
            createSyncLog({
              action:
                "Availability Sync",

              direction:
                "PMS → Channex",

              propertyId:
                item.propertyId,

              roomTypeId:
                item.roomTypeId,

              status:
                "Failed",

              message:
                validation.error,

              payload: {
                date:
                  item.date,

                totalRooms,

                bookedRooms,

                blockedRooms,

                availableRooms,
              },
            })
          );
        }
      }
    );


    setData(
      (current) => ({
        ...current,

        inventory:
          (
            current.inventory ||
            []
          ).map(
            (item) =>
              successIds.has(
                item.id
              )
                ? {
                    ...item,

                    /*
                     * Chuẩn hóa luôn data cũ
                     * nếu Step 16 từng tạo
                     * booked/available.
                     */

                    totalRooms:
                      getTotalRooms(
                        item
                      ),

                    bookedRooms:
                      getBookedRooms(
                        item
                      ),

                    blockedRooms:
                      getBlockedRooms(
                        item
                      ),

                    availableRooms:
                      getAvailableRooms(
                        item
                      ),

                    synced:
                      true,

                    lastSync:
                      actionTime,

                    updatedAt:
                      actionTime,

                    logs: [
                      `${actionTime} — Đồng bộ Availability sang Channex thành công`,

                      ...(
                        item.logs ||
                        []
                      ),
                    ],
                  }
                : item
          ),

        syncLogs: [
          ...logs,

          ...(
            current.syncLogs ||
            []
          ),
        ],
      })
    );


    alert(
      `Availability Sync: ${successIds.size} thành công, ${
        targets.length -
        successIds.size
      } thất bại.`
    );
  }


  /* ===================================================
     RATE SYNC
  =================================================== */

  function syncRates() {
    const targets =
      rateCalendar.filter(
        (calendar) =>
          calendar.synced !==
          true
      );


    if (
      targets.length ===
      0
    ) {
      alert(
        "Không có Rate cần đồng bộ."
      );

      return;
    }


    const actionTime =
      nowText();


    const successIds =
      new Set();


    const logs = [];


    targets.forEach(
      (calendar) => {
        const validation =
          validateMapping({
            propertyId:
              calendar.propertyId,

            roomTypeId:
              calendar.roomTypeId,

            ratePlanId:
              calendar.ratePlanId,
          });


        if (
          validation.valid
        ) {
          successIds.add(
            calendar.id
          );


          logs.push(
            createSyncLog({
              action:
                "Rate Sync",

              direction:
                "PMS → Channex",

              propertyId:
                calendar.propertyId,

              roomTypeId:
                calendar.roomTypeId,

              ratePlanId:
                calendar.ratePlanId,

              status:
                "Success",

              message:
                `${calendar.date}: ${money(
                  calendar.rate
                )} synced.`,

              payload: {
                date:
                  calendar.date,

                rate:
                  calendar.rate,
              },
            })
          );
        }

        else {
          logs.push(
            createSyncLog({
              action:
                "Rate Sync",

              direction:
                "PMS → Channex",

              propertyId:
                calendar.propertyId,

              roomTypeId:
                calendar.roomTypeId,

              ratePlanId:
                calendar.ratePlanId,

              status:
                "Failed",

              message:
                validation.error,

              payload: {
                date:
                  calendar.date,

                rate:
                  calendar.rate,
              },
            })
          );
        }
      }
    );


    setData(
      (current) => ({
        ...current,

        rateCalendar:
          (
            current.rateCalendar ||
            []
          ).map(
            (calendar) =>
              successIds.has(
                calendar.id
              )
                ? {
                    ...calendar,

                    synced:
                      true,

                    lastSync:
                      actionTime,

                    updatedAt:
                      actionTime,
                  }
                : calendar
          ),

        syncLogs: [
          ...logs,

          ...(
            current.syncLogs ||
            []
          ),
        ],
      })
    );
  }


  /* ===================================================
     RESTRICTION SYNC
  =================================================== */

  function syncRestrictions() {
    if (
      rateCalendar.length ===
      0
    ) {
      alert(
        "Không có Restriction để đồng bộ."
      );

      return;
    }


    const logs = [];


    rateCalendar.forEach(
      (calendar) => {
        const validation =
          validateMapping({
            propertyId:
              calendar.propertyId,

            roomTypeId:
              calendar.roomTypeId,

            ratePlanId:
              calendar.ratePlanId,
          });


        logs.push(
          createSyncLog({
            action:
              "Restriction Sync",

            direction:
              "PMS → Channex",

            propertyId:
              calendar.propertyId,

            roomTypeId:
              calendar.roomTypeId,

            ratePlanId:
              calendar.ratePlanId,

            status:
              validation.valid
                ? "Success"
                : "Failed",

            message:
              validation.valid
                ? `${calendar.date}: Stop Sell ${
                    calendar.stopSell
                      ? "ON"
                      : "OFF"
                  }, Min Stay ${
                    calendar.minimumStay ||
                    1
                  } synced.`
                : validation.error,

            payload:
              validation.valid
                ? {
                    date:
                      calendar.date,

                    stopSell:
                      Boolean(
                        calendar.stopSell
                      ),

                    minimumStay:
                      Number(
                        calendar.minimumStay ||
                        1
                      ),
                  }
                : null,
          })
        );
      }
    );


    setData(
      (current) => ({
        ...current,

        syncLogs: [
          ...logs,

          ...(
            current.syncLogs ||
            []
          ),
        ],
      })
    );
  }


  /* ===================================================
     BOOKING IMPORT
  =================================================== */

  function importBooking(
    inboxItem
  ) {
    if (
      inboxItem.status ===
      "Imported"
    ) {
      return;
    }


    const validation =
      validateMapping({
        propertyId:
          inboxItem.propertyId,

        roomTypeId:
          inboxItem.roomTypeId,

        ratePlanId:
          inboxItem.ratePlanId,
      });


    const actionTime =
      nowText();


    /* ===============================================
       MAPPING ERROR
    =============================================== */

    if (
      !validation.valid
    ) {
      const failedLog =
        createSyncLog({
          action:
            "Booking Import",

          direction:
            "Channex → PMS",

          propertyId:
            inboxItem.propertyId,

          roomTypeId:
            inboxItem.roomTypeId,

          ratePlanId:
            inboxItem.ratePlanId,

          status:
            "Failed",

          message:
            validation.error,

          referenceId:
            inboxItem.id,
        });


      setData(
        (current) => ({
          ...current,

          channexBookingInbox:
            (
              current.channexBookingInbox ||
              []
            ).map(
              (item) =>
                item.id ===
                  inboxItem.id
                  ? {
                      ...item,

                      status:
                        "Failed",

                      error:
                        validation.error,

                      lastAttemptAt:
                        actionTime,
                    }
                  : item
            ),

          syncLogs: [
            failedLog,

            ...(
              current.syncLogs ||
              []
            ),
          ],
        })
      );


      return;
    }


    /* ===============================================
       DUPLICATE EXTERNAL BOOKING
    =============================================== */

    const duplicate =
      reservations.some(
        (reservation) =>
          reservation.externalBookingId ===
          inboxItem.externalBookingId
      );


    if (
      duplicate
    ) {
      alert(
        "Booking này đã tồn tại trong PMS."
      );

      return;
    }


    const stayDates =
      dateRange(
        inboxItem.checkin,
        inboxItem.checkout
      );


    if (
      stayDates.length ===
      0
    ) {
      alert(
        "Ngày Check-in / Check-out của booking không hợp lệ."
      );

      return;
    }


    const roomType =
      getRoomType(
        inboxItem.roomTypeId
      );


    if (
      !roomType
    ) {
      alert(
        "Không tìm thấy Room Type."
      );

      return;
    }


    /* ===============================================
       INVENTORY VALIDATION

       Nếu ngày chưa có Daily Inventory:
       tạo tự động theo totalRooms Room Type.

       Điều này giúp inbound booking không mất
       booking chỉ vì PMS chưa initialize ngày đó.
    =============================================== */

    const inventoryByDate =
      new Map();


    stayDates.forEach(
      (date) => {
        const existing =
          inventory.find(
            (item) =>
              item.propertyId ===
                inboxItem.propertyId &&
              item.roomTypeId ===
                inboxItem.roomTypeId &&
              item.date ===
                date
          );


        if (
          existing
        ) {
          inventoryByDate.set(
            date,
            existing
          );
        }

        else {
          inventoryByDate.set(
            date,
            {
              id:
                `inventory_${inboxItem.propertyId}_${inboxItem.roomTypeId}_${date}`,

              propertyId:
                inboxItem.propertyId,

              roomTypeId:
                inboxItem.roomTypeId,

              date,

              totalRooms:
                Number(
                  roomType.totalRooms ||
                  0
                ),

              bookedRooms:
                0,

              blockedRooms:
                0,

              availableRooms:
                Number(
                  roomType.totalRooms ||
                  0
                ),

              synced:
                false,

              lastSync:
                "",

              createdAt:
                actionTime,

              updatedAt:
                actionTime,

              logs: [
                `${actionTime} — Daily Inventory tự động khởi tạo khi import Channex booking`,
              ],
            }
          );
        }
      }
    );


    const soldOutDate =
      stayDates.find(
        (date) => {
          const item =
            inventoryByDate.get(
              date
            );


          return (
            getAvailableRooms(
              item
            ) <=
            0
          );
        }
      );


    if (
      soldOutDate
    ) {
      alert(
        `Không đủ Inventory ngày ${formatDate(
          soldOutDate
        )}.`
      );

      return;
    }


    /* ===============================================
       GUEST
    =============================================== */

    const existingGuest =
      guests.find(
        (guest) =>
          (
            inboxItem.guestEmail &&
            guest.email
              ?.toLowerCase() ===
              inboxItem.guestEmail
                .toLowerCase()
          ) ||
          (
            inboxItem.guestPhone &&
            guest.phone ===
              inboxItem.guestPhone
          )
      );


    const guestId =
      existingGuest?.id ||
      makeId(
        "guest_channex"
      );


    const reservationId =
      makeId(
        "reservation"
      );


    const reservationCode =
      nextReservationCode(
        reservations
      );


    const newGuest =
      existingGuest
        ? null
        : {
            id:
              guestId,

            fullName:
              inboxItem.guestName ||
              "Channex Guest",

            phone:
              inboxItem.guestPhone ||
              "",

            email:
              inboxItem.guestEmail ||
              "",

            address:
              "",

            nationality:
              inboxItem.nationality ||
              "",

            documentType:
              "",

            documentNumber:
              "",

            dateOfBirth:
              "",

            gender:
              "",

            createdAt:
              actionTime,

            updatedAt:
              actionTime,

            logs: [
              `${actionTime} — Guest imported from Channex booking ${inboxItem.externalBookingId}`,
            ],
          };


    /* ===============================================
       RESERVATION
    =============================================== */

    const nights =
      stayDates.length;


    const totalAmount =
      Number(
        inboxItem.totalAmount ||
        0
      );


    const roomRate =
      nights >
      0
        ? Math.round(
            totalAmount /
              nights
          )
        : totalAmount;


    const newReservation = {
      id:
        reservationId,

      reservationCode,

      externalBookingId:
        inboxItem.externalBookingId,

      externalChannel:
        inboxItem.channel ||
        "Channex",

      propertyId:
        inboxItem.propertyId,

      guestId,

      roomTypeId:
        inboxItem.roomTypeId,

      ratePlanId:
        inboxItem.ratePlanId,

      checkin:
        inboxItem.checkin,

      checkout:
        inboxItem.checkout,

      nights,

      adults:
        Number(
          inboxItem.adults ||
          1
        ),

      children:
        Number(
          inboxItem.children ||
          0
        ),

      source:
        inboxItem.channel ||
        "Channex",

      status:
        "Confirmed",

      roomRate,

      totalAmount,

      outstandingBalance:
        totalAmount,

      paymentStatus:
        "Unpaid",

      specialRequest:
        inboxItem.specialRequest ||
        "",

      internalNote:
        `Imported from Channex. External Booking ID: ${inboxItem.externalBookingId}`,

      createdAt:
        actionTime,

      updatedAt:
        actionTime,

      logs: [
        `${actionTime} — Booking imported from ${inboxItem.channel || "Channex"}`,

        `${actionTime} — External Booking ID: ${inboxItem.externalBookingId}`,

        `${actionTime} — Booking Deduction Inventory`,
      ],
    };


    const importLog =
      createSyncLog({
        action:
          "Booking Import",

        direction:
          "Channex → PMS",

        propertyId:
          inboxItem.propertyId,

        roomTypeId:
          inboxItem.roomTypeId,

        ratePlanId:
          inboxItem.ratePlanId,

        status:
          "Success",

        message:
          `${inboxItem.externalBookingId} imported as ${reservationCode}.`,

        referenceId:
          inboxItem.id,

        payload: {
          reservationCode,

          externalBookingId:
            inboxItem.externalBookingId,

          checkin:
            inboxItem.checkin,

          checkout:
            inboxItem.checkout,

          nights,

          totalAmount,
        },
      });


    /* ===============================================
       COMMIT
    =============================================== */

    setData(
      (current) => {
        /*
         * Dùng Map để bổ sung các ngày Daily
         * Inventory còn thiếu.
         */

        const inventoryMap =
          new Map(
            (
              current.inventory ||
              []
            ).map(
              (item) => [
                item.id,
                item,
              ]
            )
          );


        stayDates.forEach(
          (date) => {
            const existing =
              (
                current.inventory ||
                []
              ).find(
                (item) =>
                  item.propertyId ===
                    inboxItem.propertyId &&
                  item.roomTypeId ===
                    inboxItem.roomTypeId &&
                  item.date ===
                    date
              );


            if (
              !existing
            ) {
              const generated =
                inventoryByDate.get(
                  date
                );


              inventoryMap.set(
                generated.id,
                generated
              );
            }
          }
        );


        const inventoryWithMissingDates =
          Array.from(
            inventoryMap.values()
          );


        const nextInventory =
          inventoryWithMissingDates.map(
            (item) => {
              const matches =
                item.propertyId ===
                  inboxItem.propertyId &&
                item.roomTypeId ===
                  inboxItem.roomTypeId &&
                stayDates.includes(
                  item.date
                );


              if (
                !matches
              ) {
                return item;
              }


              const totalRooms =
                getTotalRooms(
                  item
                );


              const blockedRooms =
                getBlockedRooms(
                  item
                );


              const bookedRooms =
                getBookedRooms(
                  item
                ) +
                1;


              const availableRooms =
                Math.max(
                  totalRooms -
                    bookedRooms -
                    blockedRooms,
                  0
                );


              return {
                ...item,

                totalRooms,

                bookedRooms,

                blockedRooms,

                availableRooms,

                /*
                 * Booking mới làm Availability
                 * thay đổi => cần push lại Channex.
                 */

                synced:
                  false,

                updatedAt:
                  actionTime,

                logs: [
                  `${actionTime} — Booking Deduction từ ${inboxItem.externalBookingId}: -1 phòng có thể bán`,

                  ...(
                    item.logs ||
                    []
                  ),
                ],
              };
            }
          );


        /*
         * Booking import làm Availability thay đổi.
         * Tạo Queue để đẩy availability mới
         * ngược lên Channex.
         */

        const availabilityQueue =
          stayDates.map(
            (date) => ({
              id:
                makeId(
                  "channel_sync"
                ),

              propertyId:
                inboxItem.propertyId,

              roomTypeId:
                inboxItem.roomTypeId,

              reservationId,

              action:
                "Availability Sync",

              source:
                "Booking Import",

              dates: [
                date,
              ],

              status:
                "Queued",

              message:
                `Inventory changed after booking import ${reservationCode}`,

              createdAt:
                actionTime,
            })
          );


        return {
          ...current,

          guests:
            newGuest
              ? [
                  newGuest,

                  ...(
                    current.guests ||
                    []
                  ),
                ]
              : current.guests,

          reservations: [
            newReservation,

            ...(
              current.reservations ||
              []
            ),
          ],

          inventory:
            nextInventory,

          channexBookingInbox:
            (
              current.channexBookingInbox ||
              []
            ).map(
              (item) =>
                item.id ===
                  inboxItem.id
                  ? {
                      ...item,

                      status:
                        "Imported",

                      importedReservationId:
                        reservationId,

                      importedReservationCode:
                        reservationCode,

                      importedAt:
                        actionTime,

                      lastAttemptAt:
                        actionTime,

                      error:
                        "",
                    }
                  : item
            ),

          channelSyncLogs: [
            ...availabilityQueue,

            ...(
              current.channelSyncLogs ||
              []
            ),
          ],

          syncLogs: [
            importLog,

            ...(
              current.syncLogs ||
              []
            ),
          ],
        };
      }
    );
  }


  /* ===================================================
     FILTER
  =================================================== */

  const filteredProperties =
    useMemo(
      () => {
        const q =
          search
            .trim()
            .toLowerCase();


        return properties.filter(
          (property) =>
            (
              !q ||
              `${property.name} ${property.code} ${property.channexId || ""}`
                .toLowerCase()
                .includes(
                  q
                )
            ) &&
            (
              !propertyFilter ||
              property.id ===
                propertyFilter
            )
        );
      },
      [
        properties,
        search,
        propertyFilter,
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
            BƯỚC 17 — CHANNEL DISTRIBUTION
          </div>


          <h1>
            Channex{" "}
            <span className="heading-en">
              / Channel Manager
            </span>
          </h1>


          <p>
            Mapping dữ liệu PMS với Channex, đồng bộ
            Availability, Rate, Restriction và nhận booking
            từ OTA về PMS.
          </p>

        </div>

      </div>


      {/* =================================================
          FLOW
      ================================================= */}

      <section className="explain-card">

        <div className="explain-icon">

          <Cable
            size={21}
          />

        </div>


        <div>

          <strong>
            PMS là nguồn dữ liệu vận hành, Channex là lớp phân phối Channel
          </strong>


          <p>
            Dữ liệu phòng, giá và availability được đẩy từ
            PMS sang Channex. Booking từ OTA đi chiều ngược
            lại và được import về Reservation.
          </p>


          <div className="channex-flow">

            <span>
              PMS
            </span>

            <b>→</b>

            <span>
              Availability / Rate
            </span>

            <b>→</b>

            <span>
              Channex
            </span>

            <b>→</b>

            <span>
              OTA
            </span>

          </div>


          <div className="channex-flow reverse">

            <span>
              OTA Booking
            </span>

            <b>→</b>

            <span>
              Channex
            </span>

            <b>→</b>

            <span>
              Reservation
            </span>

            <b>→</b>

            <span>
              PMS
            </span>

          </div>

        </div>

      </section>


      {/* =================================================
          METRICS
      ================================================= */}

      <div className="metric-grid">

        <Metric
          label="Connected Properties"
          value={`${metrics.connectedProperties}/${properties.length}`}
        />


        <Metric
          label="Mapped Room Types"
          value={`${metrics.mappedRoomTypes}/${roomTypes.length}`}
        />


        <Metric
          label="Mapped Rate Plans"
          value={`${metrics.mappedRatePlans}/${ratePlans.length}`}
        />


        <Metric
          label="Sync Queue"
          value={
            metrics.queued
          }
        />

      </div>


      {/* =================================================
          TABS
      ================================================= */}

      <div className="module-tabs">

        <button
          className={
            activeTab ===
            "overview"
              ? "active"
              : ""
          }

          onClick={
            () =>
              setActiveTab(
                "overview"
              )
          }
        >
          <Wifi
            size={15}
          />

          Overview
        </button>


        <button
          className={
            activeTab ===
            "mapping"
              ? "active"
              : ""
          }

          onClick={
            () =>
              setActiveTab(
                "mapping"
              )
          }
        >
          <Link2
            size={15}
          />

          Mapping
        </button>


        <button
          className={
            activeTab ===
            "queue"
              ? "active"
              : ""
          }

          onClick={
            () =>
              setActiveTab(
                "queue"
              )
          }
        >
          <CloudUpload
            size={15}
          />

          Sync Queue
        </button>


        <button
          className={
            activeTab ===
            "booking"
              ? "active"
              : ""
          }

          onClick={
            () =>
              setActiveTab(
                "booking"
              )
          }
        >
          <CloudDownload
            size={15}
          />

          Booking Import
        </button>


        <button
          className={
            activeTab ===
            "logs"
              ? "active"
              : ""
          }

          onClick={
            () =>
              setActiveTab(
                "logs"
              )
          }
        >
          <Clock3
            size={15}
          />

          Sync Logs
        </button>

      </div>


      {/* =================================================
          OVERVIEW
      ================================================= */}

      {
        activeTab ===
          "overview" && (

          <>
            <section className="panel">

              <div className="panel-header-row">

                <div>

                  <div className="eyebrow">
                    OUTBOUND SYNC
                  </div>


                  <h2>
                    PMS → Channex
                  </h2>

                </div>

              </div>


              <div className="channex-action-grid">

                <SyncAction
                  icon={
                    <Hotel
                      size={20}
                    />
                  }

                  title="Availability Sync"

                  description="Đẩy số lượng phòng còn bán theo ngày sang Channex."

                  onClick={
                    syncAvailability
                  }
                />


                <SyncAction
                  icon={
                    <ArrowUpFromLine
                      size={20}
                    />
                  }

                  title="Rate Sync"

                  description="Đẩy Rate Calendar theo ngày sang các Rate Plan đã mapping."

                  onClick={
                    syncRates
                  }
                />


                <SyncAction
                  icon={
                    <Settings2
                      size={20}
                    />
                  }

                  title="Restriction Sync"

                  description="Đồng bộ Stop Sell và Minimum Stay theo từng ngày."

                  onClick={
                    syncRestrictions
                  }
                />


                <SyncAction
                  icon={
                    <RefreshCw
                      size={20}
                    />
                  }

                  title="Process Queue"

                  description="Xử lý các yêu cầu đồng bộ phát sinh từ No-show và Booking Import."

                  onClick={
                    processAllQueue
                  }
                />

              </div>

            </section>


            <section className="panel">

              <div className="panel-header-row">

                <div>

                  <div className="eyebrow">
                    INTEGRATION ARCHITECTURE
                  </div>


                  <h2>
                    Luồng dữ liệu Channel
                  </h2>

                </div>

              </div>


              <div className="channex-architecture">

                <ArchitectureItem
                  step="01"

                  title="Mapping"

                  text="Property, Room Type và Rate Plan phải map trước khi đồng bộ."
                />


                <ArchitectureItem
                  step="02"

                  title="PMS → Channex"

                  text="Availability, Rate và Restriction được push sang Channel Manager."
                />


                <ArchitectureItem
                  step="03"

                  title="Channex → OTA"

                  text="Channel Manager phân phối giá và inventory đến OTA."
                />


                <ArchitectureItem
                  step="04"

                  title="OTA → PMS"

                  text="Booking mới được nhận về và tạo thành Reservation trong PMS."
                />

              </div>

            </section>
          </>

        )
      }


      {/* =================================================
          MAPPING
      ================================================= */}

      {
        activeTab ===
          "mapping" && (

          <>
            <section className="panel">

              <div className="panel-toolbar">

                <div className="channex-filter-grid">

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

                      placeholder="Tìm Property hoặc Channex ID..."
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


              <div className="detail-section-title">
                Property Mapping
              </div>


              <div className="channex-mapping-list">

                {
                  filteredProperties.map(
                    (property) => (

                      <MappingRow
                        key={
                          property.id
                        }

                        icon={
                          <Building2
                            size={17}
                          />
                        }

                        title={
                          property.name
                        }

                        code={
                          property.code
                        }

                        externalId={
                          property.channexId
                        }

                        mapped={
                          Boolean(
                            property.connected &&
                            property.channexId
                          )
                        }

                        onMap={
                          () =>
                            openMapping(
                              "property",
                              property
                            )
                        }

                        onUnmap={
                          () =>
                            unmap(
                              "property",
                              property
                            )
                        }
                      />

                    )
                  )
                }

              </div>

            </section>


            <section className="panel">

              <div className="detail-section-title">
                Room Type Mapping
              </div>


              <div className="channex-mapping-list">

                {
                  roomTypes
                    .filter(
                      (roomType) =>
                        !propertyFilter ||
                        roomType.propertyId ===
                          propertyFilter
                    )
                    .map(
                      (roomType) => {

                        const property =
                          getProperty(
                            roomType.propertyId
                          );


                        return (
                          <MappingRow
                            key={
                              roomType.id
                            }

                            icon={
                              <Hotel
                                size={17}
                              />
                            }

                            title={
                              roomType.name
                            }

                            code={`${property?.name || "—"} · ${roomType.code}`}

                            externalId={
                              roomType.channexRoomTypeId
                            }

                            mapped={
                              Boolean(
                                roomType.mapped &&
                                roomType.channexRoomTypeId
                              )
                            }

                            onMap={
                              () =>
                                openMapping(
                                  "roomType",
                                  roomType
                                )
                            }

                            onUnmap={
                              () =>
                                unmap(
                                  "roomType",
                                  roomType
                                )
                            }
                          />
                        );
                      }
                    )
                }

              </div>

            </section>


            <section className="panel">

              <div className="detail-section-title">
                Rate Plan Mapping
              </div>


              <div className="channex-mapping-list">

                {
                  ratePlans
                    .filter(
                      (ratePlan) =>
                        !propertyFilter ||
                        ratePlan.propertyId ===
                          propertyFilter
                    )
                    .map(
                      (ratePlan) => {

                        const property =
                          getProperty(
                            ratePlan.propertyId
                          );


                        const roomType =
                          getRoomType(
                            ratePlan.roomTypeId
                          );


                        return (
                          <MappingRow
                            key={
                              ratePlan.id
                            }

                            icon={
                              <ArrowUpFromLine
                                size={17}
                              />
                            }

                            title={
                              ratePlan.name
                            }

                            code={`${property?.name || "—"} · ${roomType?.name || "—"} · ${ratePlan.code}`}

                            externalId={
                              ratePlan.channexRatePlanId
                            }

                            mapped={
                              Boolean(
                                ratePlan.mapped &&
                                ratePlan.channexRatePlanId
                              )
                            }

                            onMap={
                              () =>
                                openMapping(
                                  "ratePlan",
                                  ratePlan
                                )
                            }

                            onUnmap={
                              () =>
                                unmap(
                                  "ratePlan",
                                  ratePlan
                                )
                            }
                          />
                        );
                      }
                    )
                }

              </div>

            </section>
          </>

        )
      }


      {/* =================================================
          QUEUE
      ================================================= */}

      {
        activeTab ===
          "queue" && (

          <section className="panel">

            <div className="panel-header-row">

              <div>

                <div className="eyebrow">
                  CHANNEL SYNC QUEUE
                </div>


                <h2>
                  Pending Sync
                </h2>

              </div>


              <button
                className="button button-dark"

                onClick={
                  processAllQueue
                }
              >
                <Send
                  size={15}
                />

                Process All
              </button>

            </div>


            {
              channelSyncLogs.length >
                0
                ? (
                  <div className="channex-queue-list">

                    {
                      channelSyncLogs.map(
                        (item) => {

                          const property =
                            getProperty(
                              item.propertyId
                            );


                          const roomType =
                            getRoomType(
                              item.roomTypeId
                            );


                          return (
                            <article
                              className="channex-queue-item"

                              key={
                                item.id
                              }
                            >

                              <div className="channex-queue-icon">

                                <CloudUpload
                                  size={17}
                                />

                              </div>


                              <div className="channex-queue-content">

                                <div className="channex-queue-title">

                                  <strong>
                                    {
                                      item.action
                                    }
                                  </strong>


                                  <SyncStatusBadge
                                    status={
                                      item.status
                                    }
                                  />

                                </div>


                                <p>
                                  {
                                    property?.name ||
                                    "—"
                                  }
                                  {" · "}
                                  {
                                    roomType?.name ||
                                    "—"
                                  }
                                </p>


                                <small>
                                  {
                                    item.message ||
                                    "—"
                                  }
                                </small>


                                {
                                  item.dates?.length >
                                    0 && (

                                    <div className="small-copy muted">
                                      {
                                        item.dates
                                          .map(
                                            formatDate
                                          )
                                          .join(
                                            ", "
                                          )
                                      }
                                    </div>

                                  )
                                }


                                {
                                  item.error && (

                                    <div className="channex-error">
                                      {
                                        item.error
                                      }
                                    </div>

                                  )
                                }

                              </div>


                              <div className="channex-queue-action">

                                <button
                                  className="button button-light button-sm"

                                  disabled={
                                    item.status ===
                                    "Success"
                                  }

                                  onClick={
                                    () =>
                                      processQueueItem(
                                        item
                                      )
                                  }
                                >
                                  <RefreshCw
                                    size={13}
                                  />

                                  {
                                    item.status ===
                                    "Failed"
                                      ? "Retry"
                                      : item.status ===
                                          "Success"
                                        ? "Synced"
                                        : "Sync"
                                  }
                                </button>

                              </div>

                            </article>
                          );
                        }
                      )
                    }

                  </div>
                )
                : (
                  <div className="empty-state">

                    <CheckCircle2
                      size={36}
                    />


                    <strong>
                      Sync Queue đang trống
                    </strong>

                  </div>
                )
            }

          </section>

        )
      }


      {/* =================================================
          BOOKING IMPORT
      ================================================= */}

      {
        activeTab ===
          "booking" && (

          <section className="panel">

            <div className="panel-header-row">

              <div>

                <div className="eyebrow">
                  INBOUND BOOKINGS
                </div>


                <h2>
                  Channex Booking Inbox
                </h2>

              </div>


              <span className="status-badge status-neutral">
                {
                  channexBookingInbox.length
                }{" "}
                booking(s)
              </span>

            </div>


            {
              channexBookingInbox.length >
                0
                ? (
                  <div className="table-wrap">

                    <table className="data-table channex-booking-table">

                      <thead>

                        <tr>

                          <th>
                            External Booking
                          </th>

                          <th>
                            Channel
                          </th>

                          <th>
                            Guest
                          </th>

                          <th>
                            Property
                          </th>

                          <th>
                            Room / Rate
                          </th>

                          <th>
                            Stay
                          </th>

                          <th>
                            Amount
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
                          channexBookingInbox.map(
                            (booking) => {

                              const property =
                                getProperty(
                                  booking.propertyId
                                );


                              const roomType =
                                getRoomType(
                                  booking.roomTypeId
                                );


                              const ratePlan =
                                getRatePlan(
                                  booking.ratePlanId
                                );


                              return (
                                <tr
                                  key={
                                    booking.id
                                  }
                                >

                                  <td>

                                    <strong className="code">
                                      {
                                        booking.externalBookingId
                                      }
                                    </strong>


                                    <div className="small-copy muted">
                                      Received{" "}
                                      {
                                        booking.receivedAt ||
                                        "—"
                                      }
                                    </div>

                                  </td>


                                  <td>
                                    {
                                      booking.channel ||
                                      "Channex"
                                    }
                                  </td>


                                  <td>

                                    <strong>
                                      {
                                        booking.guestName ||
                                        "—"
                                      }
                                    </strong>


                                    <div className="small-copy muted">
                                      {
                                        booking.guestEmail ||
                                        booking.guestPhone ||
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
                                        formatDate(
                                          booking.checkin
                                        )
                                      }
                                    </strong>


                                    <div className="small-copy muted">
                                      →
                                      {" "}
                                      {
                                        formatDate(
                                          booking.checkout
                                        )
                                      }
                                    </div>

                                  </td>


                                  <td>
                                    {
                                      money(
                                        booking.totalAmount
                                      )
                                    }
                                  </td>


                                  <td>

                                    <SyncStatusBadge
                                      status={
                                        booking.status
                                      }
                                    />


                                    {
                                      booking.error && (

                                        <div className="small-copy channex-inline-error">
                                          {
                                            booking.error
                                          }
                                        </div>

                                      )
                                    }

                                  </td>


                                  <td>

                                    <div className="action-row">

                                      <button
                                        className="button button-dark button-sm"

                                        disabled={
                                          booking.status ===
                                          "Imported"
                                        }

                                        onClick={
                                          () =>
                                            importBooking(
                                              booking
                                            )
                                        }
                                      >
                                        <ArrowDownToLine
                                          size={14}
                                        />

                                        {
                                          booking.status ===
                                          "Imported"
                                            ? "Imported"
                                            : booking.status ===
                                                "Failed"
                                              ? "Retry"
                                              : "Import"
                                        }
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

                  </div>
                )
                : (
                  <div className="empty-state">

                    <CloudDownload
                      size={38}
                    />


                    <strong>
                      Chưa có Booking từ Channex
                    </strong>

                  </div>
                )
            }

          </section>

        )
      }


      {/* =================================================
          LOGS
      ================================================= */}

      {
        activeTab ===
          "logs" && (

          <section className="panel">

            <div className="panel-header-row">

              <div>

                <div className="eyebrow">
                  AUDIT / DEBUG
                </div>


                <h2>
                  Sync Logs
                </h2>

              </div>


              <span className="status-badge status-neutral">
                {
                  syncLogs.length
                }{" "}
                records
              </span>

            </div>


            {
              syncLogs.length >
                0
                ? (
                  <div className="channex-sync-log-list">

                    {
                      syncLogs.map(
                        (log) => {

                          const property =
                            getProperty(
                              log.propertyId
                            );


                          return (
                            <article
                              className="channex-sync-log-item"

                              key={
                                log.id
                              }
                            >

                              <div
                                className={`channex-sync-log-icon ${
                                  log.status ===
                                  "Failed"
                                    ? "failed"
                                    : ""
                                }`}
                              >

                                {
                                  log.status ===
                                  "Failed"
                                    ? (
                                      <TriangleAlert
                                        size={16}
                                      />
                                    )
                                    : (
                                      <CheckCircle2
                                        size={16}
                                      />
                                    )
                                }

                              </div>


                              <div className="channex-sync-log-content">

                                <div className="channex-sync-log-title">

                                  <strong>
                                    {
                                      log.action
                                    }
                                  </strong>


                                  <SyncStatusBadge
                                    status={
                                      log.status
                                    }
                                  />

                                </div>


                                <p>
                                  {
                                    log.direction ||
                                    "—"
                                  }
                                  {" · "}
                                  {
                                    property?.name ||
                                    "—"
                                  }
                                </p>


                                <small>
                                  {
                                    log.message ||
                                    "—"
                                  }
                                </small>


                                <div className="channex-sync-log-time">

                                  <Clock3
                                    size={11}
                                  />

                                  {
                                    log.createdAt ||
                                    "—"
                                  }

                                </div>

                              </div>

                            </article>
                          );
                        }
                      )
                    }

                  </div>
                )
                : (
                  <div className="empty-state">

                    <Clock3
                      size={36}
                    />


                    <strong>
                      Chưa có Sync Log
                    </strong>

                  </div>
                )
            }

          </section>

        )
      }


      {/* =================================================
          MAPPING MODAL
      ================================================= */}

      <Modal
        open={
          Boolean(
            mappingState
          )
        }

        title="Channex Mapping"

        subtitle="CHANNEL DISTRIBUTION"

        onClose={
          () => {
            setMappingState(
              null
            );

            setMappingExternalId(
              ""
            );
          }
        }

        footer={
          <>

            <button
              className="button button-light"

              onClick={
                () => {
                  setMappingState(
                    null
                  );

                  setMappingExternalId(
                    ""
                  );
                }
              }
            >
              Hủy
            </button>


            <button
              className="button button-dark"

              onClick={
                saveMapping
              }
            >
              <Link2
                size={15}
              />

              Save Mapping
            </button>

          </>
        }
      >

        {
          mappingState && (

            <>
              <div className="channex-mapping-warning">

                <Cable
                  size={20}
                />


                <div>

                  <strong>
                    Channex External ID
                  </strong>


                  <p>
                    ID này phải khớp với entity tương ứng trong
                    Channex. Khi chạy live không nên tự tạo ID
                    giả trong PMS.
                  </p>

                </div>

              </div>


              <label className="form-field">

                <span className="form-label">
                  Channex ID *
                </span>


                <input
                  value={
                    mappingExternalId
                  }

                  onChange={
                    (event) =>
                      setMappingExternalId(
                        event.target.value
                      )
                  }

                  placeholder="Nhập ID từ Channex..."
                />

              </label>

            </>

          )
        }

      </Modal>

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


function SyncAction({
  icon,
  title,
  description,
  onClick,
}) {
  return (
    <article className="channex-action-card">

      <div className="channex-action-icon">
        {icon}
      </div>


      <div>

        <strong>
          {title}
        </strong>


        <p>
          {description}
        </p>

      </div>


      <button
        className="button button-dark button-sm"

        onClick={
          onClick
        }
      >
        <Send
          size={13}
        />

        Sync
      </button>

    </article>
  );
}


function ArchitectureItem({
  step,
  title,
  text,
}) {
  return (
    <article className="channex-architecture-item">

      <span>
        {step}
      </span>


      <strong>
        {title}
      </strong>


      <p>
        {text}
      </p>

    </article>
  );
}


function MappingRow({
  icon,
  title,
  code,
  externalId,
  mapped,
  onMap,
  onUnmap,
}) {
  return (
    <article className="channex-mapping-row">

      <div className="channex-mapping-icon">
        {icon}
      </div>


      <div className="channex-mapping-info">

        <strong>
          {title}
        </strong>


        <span>
          {code}
        </span>

      </div>


      <div className="channex-external-id">

        <span>
          CHANNEX ID
        </span>


        <strong>
          {
            externalId ||
            "Not mapped"
          }
        </strong>

      </div>


      <MappingBadge
        mapped={
          mapped
        }
      />


      <div className="channex-mapping-actions">

        <button
          className="button button-light button-sm"

          onClick={
            onMap
          }
        >
          <Link2
            size={13}
          />

          {
            mapped
              ? "Edit"
              : "Map"
          }
        </button>


        {
          mapped && (

            <button
              className="table-action danger"

              title="Unmap"

              onClick={
                onUnmap
              }
            >
              <Unplug
                size={14}
              />
            </button>

          )
        }

      </div>

    </article>
  );
}