"use client";

import { X } from "lucide-react";

export default function Drawer({ open, title, subtitle, children, onClose }) {
  if (!open) return null;

  return (
    <div className="drawer-layer">
      <button className="modal-backdrop" onClick={onClose} aria-label="Đóng chi tiết" />

      <aside className="drawer">
        <div className="drawer-header">
          <div>
            {subtitle && <div className="eyebrow">{subtitle}</div>}
            <h2>{title}</h2>
          </div>

          <button className="icon-button" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">{children}</div>
      </aside>
    </div>
  );
}
