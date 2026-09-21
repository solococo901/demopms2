"use client";

import { X } from "lucide-react";

export default function Modal({ open, title, subtitle, children, footer, onClose, size = "md" }) {
  if (!open) return null;

  return (
    <div className="modal-layer" role="dialog" aria-modal="true">
      <button className="modal-backdrop" onClick={onClose} aria-label="Đóng popup" />

      <div className={`modal-card modal-${size}`}>
        <div className="modal-header">
          <div>
            {subtitle && <div className="eyebrow">{subtitle}</div>}
            <h2>{title}</h2>
          </div>

          <button className="icon-button" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
