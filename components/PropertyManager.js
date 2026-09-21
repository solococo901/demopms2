"use client";

import { useMemo, useState } from "react";
import {
  Eye,
  Pencil,
  Link2,
  Power,
  Plus,
  Search,
  Building2,
  Clock3,
  Wifi,
  History,
} from "lucide-react";
import { usePms } from "@/context/PmsContext";
import Modal from "@/components/Modal";
import Drawer from "@/components/Drawer";

const blankForm = {
  name: "",
  code: "",
  address: "",
  city: "TP. Hồ Chí Minh",
  country: "Việt Nam",
  currency: "VND",
  timezone: "Asia/Ho_Chi_Minh",
  status: "Active",
  checkin: "14:00",
  checkout: "12:00",
  totalRooms: 0,
  phone: "",
  email: "",
};

function nowText() {
  return new Date().toLocaleString("vi-VN");
}

function makeId() {
  return `property_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function StatusBadge({ active }) {
  return (
    <span className={`status-badge ${active ? "status-success" : "status-danger"}`}>
      {active ? "Đang hoạt động" : "Ngưng hoạt động"}
    </span>
  );
}

function ChannexBadge({ connected }) {
  return (
    <span className={`status-badge ${connected ? "status-info" : "status-warning"}`}>
      {connected ? "Đã kết nối" : "Chưa kết nối"}
    </span>
  );
}

export default function PropertyManager() {
  const { data, setData, ready } = usePms();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [channelFilter, setChannelFilter] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankForm);

  const [detailId, setDetailId] = useState(null);

  const [channexId, setChannexId] = useState(null);
  const [channexValue, setChannexValue] = useState("");

  const [statusId, setStatusId] = useState(null);

  const properties = data.properties || [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return properties.filter((property) => {
      const text = `${property.name} ${property.code} ${property.city} ${property.address}`.toLowerCase();
      const channel = property.connected ? "Connected" : "Not Connected";

      return (
        (!q || text.includes(q)) &&
        (!statusFilter || property.status === statusFilter) &&
        (!channelFilter || channel === channelFilter)
      );
    });
  }, [properties, search, statusFilter, channelFilter]);

  const stats = useMemo(
    () => ({
      total: properties.length,
      active: properties.filter((p) => p.status === "Active").length,
      connected: properties.filter((p) => p.connected).length,
      rooms: properties.reduce((sum, p) => sum + Number(p.totalRooms || 0), 0),
    }),
    [properties]
  );

  function updateProperties(nextProperties) {
    setData((current) => ({
      ...current,
      properties: nextProperties,
    }));
  }

  function openCreate() {
    setEditingId(null);
    setForm(blankForm);
    setFormOpen(true);
  }

  function openEdit(property) {
    setEditingId(property.id);
    setForm({
      name: property.name,
      code: property.code,
      address: property.address || "",
      city: property.city || "",
      country: property.country || "Việt Nam",
      currency: property.currency || "VND",
      timezone: property.timezone || "Asia/Ho_Chi_Minh",
      status: property.status || "Active",
      checkin: property.checkin || "14:00",
      checkout: property.checkout || "12:00",
      totalRooms: Number(property.totalRooms || 0),
      phone: property.phone || "",
      email: property.email || "",
    });
    setFormOpen(true);
  }

  function saveProperty() {
    const name = form.name.trim();
    const code = form.code.trim().toUpperCase();
    const city = form.city.trim();

    if (!name || !code || !city) {
      alert("Vui lòng nhập Tên khách sạn, Mã khách sạn và Thành phố.");
      return;
    }

    if (
      !editingId &&
      properties.some((property) => property.code.toUpperCase() === code)
    ) {
      alert("Mã khách sạn đã tồn tại.");
      return;
    }

    if (editingId) {
      updateProperties(
        properties.map((property) =>
          property.id === editingId
            ? {
                ...property,
                ...form,
                name,
                code,
                city,
                totalRooms: Number(form.totalRooms || 0),
                logs: [
                  `${nowText()} — Đã cập nhật thông tin khách sạn`,
                  ...(property.logs || []),
                ],
              }
            : property
        )
      );
    } else {
      updateProperties([
        {
          id: makeId(),
          ...form,
          name,
          code,
          city,
          totalRooms: Number(form.totalRooms || 0),
          channexId: "",
          connected: false,
          lastSync: "",
          logs: [`${nowText()} — Đã tạo khách sạn`],
        },
        ...properties,
      ]);
    }

    setFormOpen(false);
  }

  function openChannex(property) {
    setChannexId(property.id);
    setChannexValue(property.channexId || "");
  }

  function connectChannex() {
    if (channexValue.trim().length < 8) {
      alert("Vui lòng nhập Channex Property ID hợp lệ.");
      return;
    }

    updateProperties(
      properties.map((property) =>
        property.id === channexId
          ? {
              ...property,
              channexId: channexValue.trim(),
              connected: true,
              lastSync: nowText(),
              logs: [
                `${nowText()} — Đã kết nối Property với Channex`,
                ...(property.logs || []),
              ],
            }
          : property
      )
    );
  }

  function testChannex() {
    if (channexValue.trim().length < 8) {
      alert("Kiểm tra thất bại: Channex Property ID chưa hợp lệ.");
      return;
    }

    updateProperties(
      properties.map((property) =>
        property.id === channexId
          ? {
              ...property,
              lastSync: nowText(),
              logs: [
                `${nowText()} — Kiểm tra kết nối Channex thành công`,
                ...(property.logs || []),
              ],
            }
          : property
      )
    );
  }

  function disconnectChannex() {
    updateProperties(
      properties.map((property) =>
        property.id === channexId
          ? {
              ...property,
              connected: false,
              lastSync: nowText(),
              logs: [
                `${nowText()} — Đã ngắt kết nối Channex`,
                ...(property.logs || []),
              ],
            }
          : property
      )
    );
  }

  function toggleStatus() {
    const property = properties.find((p) => p.id === statusId);
    if (!property) return;

    const nextStatus = property.status === "Active" ? "Inactive" : "Active";

    updateProperties(
      properties.map((p) =>
        p.id === statusId
          ? {
              ...p,
              status: nextStatus,
              logs: [
                `${nowText()} — Đã chuyển trạng thái thành ${
                  nextStatus === "Active" ? "Đang hoạt động" : "Ngưng hoạt động"
                }`,
                ...(p.logs || []),
              ],
            }
          : p
      )
    );

    setStatusId(null);
  }

  const detailProperty = properties.find((p) => p.id === detailId);
  const channexProperty = properties.find((p) => p.id === channexId);
  const statusProperty = properties.find((p) => p.id === statusId);

  if (!ready) {
    return <div className="panel loading-panel">Đang tải dữ liệu PMS...</div>;
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="eyebrow">BƯỚC 01 — KHÁCH SẠN</div>
          <h1>
            Quản lý khách sạn <span className="heading-en">(Property)</span>
          </h1>
          <p>
            Nơi khai báo và quản lý từng khách sạn trong PMS: thông tin cơ bản,
            giờ nhận/trả phòng, trạng thái hoạt động và kết nối với Channex.
          </p>
        </div>

        <button className="button button-dark button-lg" onClick={openCreate}>
          <Plus size={17} />
          Thêm khách sạn
        </button>
      </div>

      <section className="explain-card">
        <div className="explain-icon">
          <Building2 size={21} />
        </div>

        <div>
          <strong>Khách sạn (Property) là dữ liệu gốc của PMS</strong>
          <p>
            Mỗi Property đại diện cho một cơ sở lưu trú. Các loại phòng, phòng vật lý,
            giá, tồn phòng, booking và mapping Channex sau này đều phải thuộc về một Property.
          </p>
        </div>
      </section>

      <div className="metric-grid">
        <Metric label="Tổng số khách sạn" value={stats.total} />
        <Metric label="Đang hoạt động" value={stats.active} />
        <Metric label="Đã kết nối Channex" value={stats.connected} />
        <Metric label="Tổng số phòng" value={stats.rooms} />
      </div>

      <section className="panel">
        <div className="panel-toolbar">
          <div className="filter-grid">
            <label className="search-box">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm tên, mã, thành phố..."
              />
            </label>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="Active">Đang hoạt động</option>
              <option value="Inactive">Ngưng hoạt động</option>
            </select>

            <select value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)}>
              <option value="">Tất cả kết nối Channex</option>
              <option value="Connected">Đã kết nối</option>
              <option value="Not Connected">Chưa kết nối</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Khách sạn</th>
                <th>Thành phố</th>
                <th>Số phòng</th>
                <th>Nhận / trả phòng</th>
                <th>Channex</th>
                <th>Trạng thái</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((property) => (
                <tr key={property.id}>
                  <td>
                    <strong>{property.name}</strong>
                    <div className="code muted">{property.code}</div>
                  </td>
                  <td>{property.city}</td>
                  <td>{property.totalRooms}</td>
                  <td className="code">
                    {property.checkin} / {property.checkout}
                  </td>
                  <td>
                    <ChannexBadge connected={property.connected} />
                  </td>
                  <td>
                    <StatusBadge active={property.status === "Active"} />
                  </td>
                  <td>
                    <div className="action-row">
                      <ActionButton title="Xem chi tiết" onClick={() => setDetailId(property.id)}>
                        <Eye size={15} />
                      </ActionButton>

                      <ActionButton title="Chỉnh sửa" onClick={() => openEdit(property)}>
                        <Pencil size={15} />
                      </ActionButton>

                      <ActionButton title="Channex" onClick={() => openChannex(property)}>
                        <Link2 size={15} />
                      </ActionButton>

                      <ActionButton
                        title="Đổi trạng thái"
                        onClick={() => setStatusId(property.id)}
                      >
                        <Power size={15} />
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="empty-state">
              <Building2 size={38} />
              <strong>Không tìm thấy khách sạn</strong>
              <span>Hãy thay đổi bộ lọc hoặc tạo Property mới.</span>
            </div>
          )}
        </div>
      </section>

      <section className="panel business-panel">
        <div className="eyebrow">MÔ TẢ NGHIỆP VỤ</div>
        <h2>Trong phần này nhân viên sẽ làm gì?</h2>

        <div className="business-grid">
          <BusinessItem
            number="01"
            icon={<Building2 size={18} />}
            title="Tạo khách sạn"
            text="Khai báo tên, mã nội bộ, địa chỉ, thành phố, tiền tệ, múi giờ và thông tin liên hệ."
          />
          <BusinessItem
            number="02"
            icon={<Clock3 size={18} />}
            title="Cấu hình vận hành"
            text="Thiết lập giờ Check-in, Check-out và trạng thái khách sạn đang hoạt động hay tạm ngưng."
          />
          <BusinessItem
            number="03"
            icon={<Wifi size={18} />}
            title="Kết nối Channex"
            text="Mapping PMS Property ID với Channex Property ID để chuẩn bị đồng bộ giá, tồn phòng và booking."
          />
          <BusinessItem
            number="04"
            icon={<History size={18} />}
            title="Theo dõi lịch sử"
            text="Lưu lại những thay đổi quan trọng để dễ trình bày, kiểm tra và audit sau này."
          />
        </div>
      </section>

      <Modal
        open={formOpen}
        title={editingId ? "Chỉnh sửa khách sạn" : "Thêm khách sạn"}
        subtitle={editingId ? "CHỈNH SỬA PROPERTY" : "TẠO PROPERTY MỚI"}
        onClose={() => setFormOpen(false)}
        size="lg"
        footer={
          <>
            <button className="button button-light" onClick={() => setFormOpen(false)}>
              Hủy
            </button>
            <button className="button button-dark" onClick={saveProperty}>
              Lưu khách sạn
            </button>
          </>
        }
      >
        <PropertyForm form={form} setForm={setForm} editing={Boolean(editingId)} />
      </Modal>

      <Drawer
        open={Boolean(detailProperty)}
        title={detailProperty?.name || ""}
        subtitle="CHI TIẾT KHÁCH SẠN"
        onClose={() => setDetailId(null)}
      >
        {detailProperty && (
          <PropertyDetail
            property={detailProperty}
            onEdit={() => {
              setDetailId(null);
              openEdit(detailProperty);
            }}
            onChannex={() => {
              setDetailId(null);
              openChannex(detailProperty);
            }}
          />
        )}
      </Drawer>

      <Modal
        open={Boolean(channexProperty)}
        title="Liên kết khách sạn với Channex"
        subtitle="CHANNEL MAPPING"
        onClose={() => setChannexId(null)}
        footer={
          <>
            <button className="button button-danger-outline" onClick={disconnectChannex}>
              Ngắt kết nối
            </button>

            <div className="footer-actions">
              <button className="button button-light" onClick={testChannex}>
                Kiểm tra
              </button>
              <button className="button button-dark" onClick={connectChannex}>
                Kết nối
              </button>
            </div>
          </>
        }
      >
        {channexProperty && (
          <>
            <div className="info-note">
              <strong>Channex Mapping là gì?</strong>
              <p>
                Đây là bước liên kết khách sạn trong CITYHOUSE PMS với đúng khách sạn
                trên Channex. Sau khi mapping, các module sau có thể đồng bộ giá,
                tồn phòng và booking.
              </p>
            </div>

            <div className="form-grid single">
              <Field label="PMS Property ID">
                <input value={`PMS-${channexProperty.code}`} readOnly />
              </Field>

              <Field label="Channex Property ID">
                <input
                  value={channexValue}
                  onChange={(event) => setChannexValue(event.target.value)}
                  placeholder="Nhập Channex Property ID"
                />
              </Field>
            </div>

            <div className="connection-grid">
              <div>
                <span>Trạng thái kết nối</span>
                <ChannexBadge connected={channexProperty.connected} />
              </div>
              <div>
                <span>Lần đồng bộ gần nhất</span>
                <strong>{channexProperty.lastSync || "—"}</strong>
              </div>
            </div>
          </>
        )}
      </Modal>

      <Modal
        open={Boolean(statusProperty)}
        title="Thay đổi trạng thái khách sạn"
        onClose={() => setStatusId(null)}
        footer={
          <>
            <button className="button button-light" onClick={() => setStatusId(null)}>
              Hủy
            </button>
            <button className="button button-dark" onClick={toggleStatus}>
              Xác nhận
            </button>
          </>
        }
      >
        {statusProperty && (
          <div className="confirm-copy">
            Khách sạn <strong>{statusProperty.name}</strong> sẽ chuyển từ{" "}
            <strong>
              {statusProperty.status === "Active" ? "Đang hoạt động" : "Ngưng hoạt động"}
            </strong>{" "}
            sang{" "}
            <strong>
              {statusProperty.status === "Active" ? "Ngưng hoạt động" : "Đang hoạt động"}
            </strong>
            .
          </div>
        )}
      </Modal>
    </>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
    </div>
  );
}

function ActionButton({ title, children, onClick }) {
  return (
    <button className="table-action" title={title} onClick={onClick}>
      {children}
    </button>
  );
}

function BusinessItem({ number, icon, title, text }) {
  return (
    <article className="business-item">
      <div className="business-item-top">
        <span>{number}</span>
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function Field({ label, help, children, full = false }) {
  return (
    <label className={`form-field ${full ? "full" : ""}`}>
      <span className="form-label">{label}</span>
      {children}
      {help && <small>{help}</small>}
    </label>
  );
}

function PropertyForm({ form, setForm, editing }) {
  function patch(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <>
      <div className="form-section-title">1. Thông tin cơ bản</div>

      <div className="form-grid">
        <Field
          label="Tên khách sạn (Property Name) *"
          help="Tên chính thức của khách sạn hiển thị trong PMS."
        >
          <input
            value={form.name}
            onChange={(e) => patch("name", e.target.value)}
            placeholder="Ví dụ: City Oasis"
          />
        </Field>

        <Field
          label="Mã khách sạn (Property Code) *"
          help={
            editing
              ? "Mã được khóa sau khi tạo để tránh ảnh hưởng dữ liệu liên quan."
              : "Mã nội bộ ngắn gọn dùng xuyên suốt PMS."
          }
        >
          <input
            value={form.code}
            disabled={editing}
            onChange={(e) => patch("code", e.target.value.toUpperCase())}
            placeholder="Ví dụ: CO"
          />
        </Field>

        <Field label="Địa chỉ" full>
          <input
            value={form.address}
            onChange={(e) => patch("address", e.target.value)}
            placeholder="Địa chỉ khách sạn"
          />
        </Field>

        <Field label="Thành phố *">
          <input value={form.city} onChange={(e) => patch("city", e.target.value)} />
        </Field>

        <Field label="Quốc gia">
          <input value={form.country} onChange={(e) => patch("country", e.target.value)} />
        </Field>
      </div>

      <div className="form-section-title">2. Cấu hình vận hành</div>

      <div className="form-grid three">
        <Field label="Đơn vị tiền tệ">
          <select value={form.currency} onChange={(e) => patch("currency", e.target.value)}>
            <option value="VND">VND</option>
            <option value="USD">USD</option>
          </select>
        </Field>

        <Field label="Múi giờ">
          <select value={form.timezone} onChange={(e) => patch("timezone", e.target.value)}>
            <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</option>
            <option value="Asia/Bangkok">Asia/Bangkok</option>
            <option value="Asia/Singapore">Asia/Singapore</option>
          </select>
        </Field>

        <Field label="Trạng thái">
          <select value={form.status} onChange={(e) => patch("status", e.target.value)}>
            <option value="Active">Đang hoạt động</option>
            <option value="Inactive">Ngưng hoạt động</option>
          </select>
        </Field>

        <Field label="Giờ nhận phòng (Check-in)">
          <input type="time" value={form.checkin} onChange={(e) => patch("checkin", e.target.value)} />
        </Field>

        <Field label="Giờ trả phòng (Check-out)">
          <input type="time" value={form.checkout} onChange={(e) => patch("checkout", e.target.value)} />
        </Field>

        <Field label="Tổng số phòng" help="Tạm nhập tay; sau này có thể tính từ Physical Room.">
          <input
            type="number"
            min="0"
            value={form.totalRooms}
            onChange={(e) => patch("totalRooms", e.target.value)}
          />
        </Field>
      </div>

      <div className="form-section-title">3. Thông tin liên hệ</div>

      <div className="form-grid">
        <Field label="Số điện thoại">
          <input
            value={form.phone}
            onChange={(e) => patch("phone", e.target.value)}
            placeholder="028..."
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            value={form.email}
            onChange={(e) => patch("email", e.target.value)}
            placeholder="hotel@cityhouse.com.vn"
          />
        </Field>
      </div>
    </>
  );
}

function PropertyDetail({ property, onEdit, onChannex }) {
  return (
    <>
      <div className="badge-row">
        <StatusBadge active={property.status === "Active"} />
        <ChannexBadge connected={property.connected} />
      </div>

      <div className="detail-section-title">Thông tin cơ bản</div>

      <div className="detail-grid">
        <Detail label="Tên khách sạn" value={property.name} />
        <Detail label="Mã khách sạn" value={property.code} mono />
        <Detail label="Địa chỉ" value={property.address || "—"} />
        <Detail label="Thành phố" value={property.city} />
        <Detail label="Quốc gia" value={property.country} />
        <Detail label="Tổng số phòng" value={property.totalRooms} />
      </div>

      <div className="detail-section-title">Cấu hình vận hành</div>

      <div className="detail-grid">
        <Detail label="Check-in" value={property.checkin} mono />
        <Detail label="Check-out" value={property.checkout} mono />
        <Detail label="Tiền tệ" value={property.currency} />
        <Detail label="Múi giờ" value={property.timezone} />
        <Detail label="Số điện thoại" value={property.phone || "—"} />
        <Detail label="Email" value={property.email || "—"} />
      </div>

      <div className="detail-section-title">Channex Mapping</div>

      <div className="detail-box">
        <Detail label="PMS Property ID" value={`PMS-${property.code}`} mono />
        <Detail label="Channex Property ID" value={property.channexId || "Chưa mapping"} mono />
        <Detail label="Lần đồng bộ gần nhất" value={property.lastSync || "—"} />
      </div>

      <div className="detail-section-title">Lịch sử thao tác</div>

      <div className="timeline">
        {(property.logs || []).map((log, index) => (
          <div className="timeline-item" key={`${log}-${index}`}>
            {log}
          </div>
        ))}
      </div>

      <div className="drawer-actions">
        <button className="button button-dark" onClick={onEdit}>
          <Pencil size={16} />
          Chỉnh sửa khách sạn
        </button>

        <button className="button button-light" onClick={onChannex}>
          <Link2 size={16} />
          Quản lý Channex
        </button>
      </div>
    </>
  );
}

function Detail({ label, value, mono = false }) {
  return (
    <div>
      <div className="detail-label">{label}</div>
      <div className={`detail-value ${mono ? "code" : ""}`}>{value}</div>
    </div>
  );
}
