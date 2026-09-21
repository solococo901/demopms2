"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  BedDouble,
  Grid3X3,
  Tags,
  CalendarDays,
  Boxes,
  Contact,
  ClipboardCheck,
  DoorClosed,
  ConciergeBell,
  ArrowLeftRight,
  Sparkles,
  ReceiptText,
  CreditCard,
  RotateCcw,
  UserX,
  Network,
  Gauge,
  BarChart3,
  X,
} from "lucide-react";

const groups = [
  {
    title: "Cấu hình hệ thống",
    items: [
      ["/property", "01. Khách sạn", "Property", Building2],
      ["/room-type", "02. Loại phòng", "Room Type", BedDouble],
      ["/physical-room", "03. Phòng vật lý", "Physical Room", Grid3X3],
      ["/rate-plan", "04. Chính sách giá", "Rate Plan", Tags],
      ["/rate-calendar", "05. Lịch giá", "Rate Calendar", CalendarDays],
      ["/inventory", "06. Tồn phòng", "Inventory", Boxes],
    ],
  },
  {
    title: "Khách hàng & đặt phòng",
    items: [
      ["/guest", "07. Hồ sơ khách", "Guest", Contact],
      ["/reservation", "08. Đặt phòng", "Reservation", ClipboardCheck],
      ["/room-assignment", "09. Gán phòng", "Room Assignment", DoorClosed],
    ],
  },
  {
    title: "Vận hành khách sạn",
    items: [
      ["/front-desk", "10. Lễ tân", "Front Desk", ConciergeBell],
      ["/room-move", "11. Đổi phòng", "Room Move", ArrowLeftRight],
      ["/housekeeping", "12. Vệ sinh phòng", "Housekeeping", Sparkles],
    ],
  },
  {
    title: "Tài chính",
    items: [
      ["/folio", "13. Chi phí khách", "Folio", ReceiptText],
      ["/payment", "14. Thanh toán", "Payment", CreditCard],
      ["/refund", "15. Hoàn tiền", "Refund", RotateCcw],
      ["/no-show", "16. Khách không đến", "No-show", UserX],
    ],
  },
  {
    title: "Hệ thống & báo cáo",
    items: [
      ["/channex", "17. Kết nối Channex", "Channel Distribution", Network],
      ["/dashboard", "18. Tổng quan", "Dashboard", Gauge],
      ["/reports", "19. Báo cáo", "Reports", BarChart3],
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {open && <button className="sidebar-backdrop" onClick={onClose} aria-label="Đóng menu" />}

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand-row">
          <div>
            <div className="brand-title">CITYHOUSE PMS</div>
            <div className="brand-subtitle">GIAI ĐOẠN 1 — PMS DEMO</div>
          </div>

          <button className="sidebar-close" onClick={onClose} aria-label="Đóng menu">
            <X size={18} />
          </button>
        </div>

        {groups.map((group) => (
          <div key={group.title}>
            <div className="sidebar-group-title">{group.title}</div>

            <nav className="sidebar-menu">
              {group.items.map(([href, vi, en, Icon]) => {
                const active = pathname === href;

                return (
                  <Link
                    href={href}
                    key={href}
                    className={`sidebar-item ${active ? "active" : ""}`}
                    onClick={onClose}
                  >
                    <Icon size={17} />
                    <div>
                      <span>{vi}</span>
                      <small>{en}</small>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </aside>
    </>
  );
}
