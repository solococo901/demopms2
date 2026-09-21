"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  Eye,
  History,
  IdCard,
  Mail,
  MapPin,
  Pencil,
  Phone,
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


const blankForm = {
  fullName: "",
  phone: "",
  email: "",
  address: "",

  nationality: "Việt Nam",

  documentType: "CCCD",
  documentNumber: "",

  dateOfBirth: "",
  gender: "",
};


function nowText() {
  return new Date().toLocaleString(
    "vi-VN"
  );
}


function makeId() {
  return `guest_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
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


function genderLabel(
  value
) {
  const labels = {
    Male: "Nam",
    Female: "Nữ",
    Other: "Khác",
  };


  return (
    labels[value] ||
    "—"
  );
}


function documentTypeLabel(
  value
) {
  const labels = {
    CCCD: "CCCD",
    CMND: "CMND",
    Passport: "Hộ chiếu",
    Other: "Khác",
  };


  return (
    labels[value] ||
    value ||
    "—"
  );
}


export default function GuestManager() {
  const {
    data,
    setData,
    ready,
  } = usePms();


  const guests =
    data.guests || [];

  const reservations =
    data.reservations || [];


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    nationalityFilter,
    setNationalityFilter,
  ] = useState("");


  const [
    documentFilter,
    setDocumentFilter,
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


  function getGuestReservations(
    guestId
  ) {
    return reservations
      .filter(
        (reservation) =>
          reservation.guestId ===
          guestId
      )
      .sort(
        (
          a,
          b
        ) =>
          String(
            b.checkin ||
            ""
          ).localeCompare(
            String(
              a.checkin ||
              ""
            )
          )
      );
  }


  const nationalities =
    useMemo(
      () =>
        [
          ...new Set(
            guests
              .map(
                (guest) =>
                  guest.nationality
              )
              .filter(
                Boolean
              )
          ),
        ].sort(),
      [
        guests,
      ]
    );


  const filtered =
    useMemo(
      () => {
        const q =
          search
            .trim()
            .toLowerCase();


        return guests
          .filter(
            (guest) => {
              const text = `
                ${guest.fullName || ""}
                ${guest.phone || ""}
                ${guest.email || ""}
                ${guest.address || ""}
                ${guest.nationality || ""}
                ${guest.documentType || ""}
                ${guest.documentNumber || ""}
              `.toLowerCase();


              return (
                (
                  !q ||
                  text.includes(
                    q
                  )
                ) &&
                (
                  !nationalityFilter ||
                  guest.nationality ===
                    nationalityFilter
                ) &&
                (
                  !documentFilter ||
                  guest.documentType ===
                    documentFilter
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
                a.fullName ||
                ""
              ).localeCompare(
                String(
                  b.fullName ||
                  ""
                ),
                "vi"
              )
          );
      },
      [
        guests,
        search,
        nationalityFilter,
        documentFilter,
      ]
    );


  const stats =
    useMemo(
      () => ({
        total:
          guests.length,

        contactComplete:
          guests.filter(
            (guest) =>
              guest.phone &&
              guest.email
          ).length,

        identityComplete:
          guests.filter(
            (guest) =>
              guest.documentType &&
              guest.documentNumber
          ).length,

        returning:
          guests.filter(
            (guest) =>
              getGuestReservations(
                guest.id
              ).length > 1
          ).length,
      }),
      [
        guests,
        reservations,
      ]
    );


  function updateGuests(
    nextGuests
  ) {
    setData(
      (current) => ({
        ...current,

        guests:
          nextGuests,
      })
    );
  }


  function openCreate() {
    setEditingId(
      null
    );


    setForm({
      ...blankForm,
    });


    setFormOpen(
      true
    );
  }


  function openEdit(
    guest
  ) {
    setEditingId(
      guest.id
    );


    setForm({
      fullName:
        guest.fullName ||
        "",

      phone:
        guest.phone ||
        "",

      email:
        guest.email ||
        "",

      address:
        guest.address ||
        "",

      nationality:
        guest.nationality ||
        "",

      documentType:
        guest.documentType ||
        "CCCD",

      documentNumber:
        guest.documentNumber ||
        "",

      dateOfBirth:
        guest.dateOfBirth ||
        "",

      gender:
        guest.gender ||
        "",
    });


    setFormOpen(
      true
    );
  }


  function saveGuest() {
    const fullName =
      form.fullName
        .trim();

    const phone =
      form.phone
        .trim();

    const email =
      form.email
        .trim()
        .toLowerCase();

    const address =
      form.address
        .trim();

    const nationality =
      form.nationality
        .trim();

    const documentNumber =
      form.documentNumber
        .trim()
        .toUpperCase();


    if (
      !fullName
    ) {
      alert(
        "Vui lòng nhập họ tên khách."
      );

      return;
    }


    if (
      !phone &&
      !email
    ) {
      alert(
        "Vui lòng nhập ít nhất số điện thoại hoặc email."
      );

      return;
    }


    if (
      form.documentType &&
      !documentNumber
    ) {
      alert(
        "Vui lòng nhập số giấy tờ."
      );

      return;
    }


    if (
      documentNumber
    ) {
      const duplicateDocument =
        guests.some(
          (guest) =>
            String(
              guest.documentNumber ||
              ""
            )
              .trim()
              .toUpperCase() ===
              documentNumber &&
            guest.id !==
              editingId
        );


      if (
        duplicateDocument
      ) {
        alert(
          "Số giấy tờ này đã tồn tại trong hồ sơ khách."
        );

        return;
      }
    }


    if (
      email
    ) {
      const duplicateEmail =
        guests.some(
          (guest) =>
            String(
              guest.email ||
              ""
            )
              .trim()
              .toLowerCase() ===
              email &&
            guest.id !==
              editingId
        );


      if (
        duplicateEmail
      ) {
        const confirmed =
          window.confirm(
            "Email này đã tồn tại ở một Guest khác. Anh vẫn muốn lưu hồ sơ này?"
          );


        if (
          !confirmed
        ) {
          return;
        }
      }
    }


    if (
      editingId
    ) {
      updateGuests(
        guests.map(
          (guest) =>
            guest.id ===
            editingId
              ? {
                  ...guest,

                  fullName,
                  phone,
                  email,
                  address,
                  nationality,

                  documentType:
                    form.documentType,

                  documentNumber,

                  dateOfBirth:
                    form.dateOfBirth,

                  gender:
                    form.gender,

                  updatedAt:
                    nowText(),

                  logs: [
                    `${nowText()} — Đã cập nhật hồ sơ khách`,

                    ...(
                      guest.logs ||
                      []
                    ),
                  ],
                }
              : guest
        )
      );
    }

    else {
      updateGuests([
        {
          id:
            makeId(),

          fullName,
          phone,
          email,
          address,
          nationality,

          documentType:
            form.documentType,

          documentNumber,

          dateOfBirth:
            form.dateOfBirth,

          gender:
            form.gender,

          createdAt:
            nowText(),

          updatedAt:
            nowText(),

          logs: [
            `${nowText()} — Đã tạo Guest Profile`,
          ],
        },

        ...guests,
      ]);
    }


    setFormOpen(
      false
    );
  }


  const detailGuest =
    guests.find(
      (guest) =>
        guest.id ===
        detailId
    );


  const detailReservations =
    detailGuest
      ? getGuestReservations(
          detailGuest.id
        )
      : [];


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
      <div className="page-header">

        <div>

          <div className="eyebrow">
            BƯỚC 07 — GUEST
          </div>


          <h1>
            Hồ sơ khách hàng{" "}
            <span className="heading-en">
              (Guest Profile)
            </span>
          </h1>


          <p>
            Lưu thông tin khách hàng một lần để có thể
            tái sử dụng khi tạo Reservation, theo dõi
            thông tin liên hệ, giấy tờ và lịch sử lưu trú.
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

          Thêm khách hàng
        </button>

      </div>


      <section className="explain-card">

        <div className="explain-icon">

          <UserRound
            size={21}
          />

        </div>


        <div>

          <strong>
            Guest Profile là hồ sơ khách dùng chung trong PMS
          </strong>


          <p>
            Khi khách quay lại đặt phòng, nhân viên chỉ cần
            chọn Guest đã tồn tại thay vì nhập lại toàn bộ
            họ tên, liên hệ và giấy tờ.
          </p>


          <div className="guest-flow">

            <span>
              Guest Profile
            </span>

            <b>→</b>

            <span>
              Reservation
            </span>

            <b>→</b>

            <span>
              Stay History
            </span>

          </div>

        </div>

      </section>


      <div className="metric-grid">

        <Metric
          label="Tổng hồ sơ khách"
          value={
            stats.total
          }
        />


        <Metric
          label="Đủ thông tin liên hệ"
          value={
            stats.contactComplete
          }
        />


        <Metric
          label="Đủ thông tin giấy tờ"
          value={
            stats.identityComplete
          }
        />


        <Metric
          label="Khách quay lại"
          value={
            stats.returning
          }
        />

      </div>


      <section className="panel">

        <div className="panel-toolbar">

          <div className="guest-filter-grid">

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

                placeholder="Tìm tên, điện thoại, email, giấy tờ..."
              />

            </label>


            <select
              value={
                nationalityFilter
              }

              onChange={
                (event) =>
                  setNationalityFilter(
                    event.target.value
                  )
              }
            >

              <option value="">
                Tất cả quốc tịch
              </option>


              {
                nationalities.map(
                  (nationality) => (

                    <option
                      key={
                        nationality
                      }
                      value={
                        nationality
                      }
                    >
                      {
                        nationality
                      }
                    </option>

                  )
                )
              }

            </select>


            <select
              value={
                documentFilter
              }

              onChange={
                (event) =>
                  setDocumentFilter(
                    event.target.value
                  )
              }
            >

              <option value="">
                Tất cả loại giấy tờ
              </option>

              <option value="CCCD">
                CCCD
              </option>

              <option value="CMND">
                CMND
              </option>

              <option value="Passport">
                Hộ chiếu
              </option>

              <option value="Other">
                Khác
              </option>

            </select>

          </div>

        </div>


        <div className="table-wrap">

          <table className="data-table guest-table">

            <thead>

              <tr>

                <th>
                  Khách hàng
                </th>

                <th>
                  Liên hệ
                </th>

                <th>
                  Quốc tịch
                </th>

                <th>
                  Giấy tờ
                </th>

                <th>
                  Ngày sinh
                </th>

                <th>
                  Giới tính
                </th>

                <th>
                  Lịch sử
                </th>

                <th className="text-right">
                  Thao tác
                </th>

              </tr>

            </thead>


            <tbody>

              {
                filtered.map(
                  (guest) => {
                    const guestReservations =
                      getGuestReservations(
                        guest.id
                      );


                    return (
                      <tr
                        key={
                          guest.id
                        }
                      >

                        <td>

                          <div className="guest-name-cell">

                            <div className="guest-avatar">

                              <UserRound
                                size={16}
                              />

                            </div>


                            <div>

                              <strong>
                                {
                                  guest.fullName
                                }
                              </strong>


                              {
                                guest.address && (

                                  <div className="small-copy muted">
                                    {
                                      guest.address
                                    }
                                  </div>

                                )
                              }

                            </div>

                          </div>

                        </td>


                        <td>

                          <div className="guest-contact">

                            {
                              guest.phone && (

                                <span>

                                  <Phone
                                    size={12}
                                  />

                                  {
                                    guest.phone
                                  }

                                </span>

                              )
                            }


                            {
                              guest.email && (

                                <span>

                                  <Mail
                                    size={12}
                                  />

                                  {
                                    guest.email
                                  }

                                </span>

                              )
                            }

                          </div>

                        </td>


                        <td>
                          {
                            guest.nationality ||
                            "—"
                          }
                        </td>


                        <td>

                          <strong className="table-secondary-title">
                            {
                              documentTypeLabel(
                                guest.documentType
                              )
                            }
                          </strong>


                          <div className="code muted">
                            {
                              guest.documentNumber ||
                              "—"
                            }
                          </div>

                        </td>


                        <td>
                          {
                            formatDate(
                              guest.dateOfBirth
                            )
                          }
                        </td>


                        <td>
                          {
                            genderLabel(
                              guest.gender
                            )
                          }
                        </td>


                        <td>

                          <span className="guest-history-count">

                            <History
                              size={13}
                            />

                            {
                              guestReservations.length
                            }{" "}
                            booking

                          </span>

                        </td>


                        <td>

                          <div className="action-row">

                            <button
                              className="table-action"

                              title="Xem hồ sơ"

                              onClick={
                                () =>
                                  setDetailId(
                                    guest.id
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
                                    guest
                                  )
                              }
                            >
                              <Pencil
                                size={15}
                              />
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


          {
            filtered.length ===
              0 && (

              <div className="empty-state">

                <Users
                  size={38}
                />


                <strong>
                  Chưa có Guest phù hợp
                </strong>


                <span>
                  Thêm Guest Profile mới hoặc thay đổi bộ lọc.
                </span>

              </div>

            )
          }

        </div>

      </section>


      <section className="panel business-panel">

        <div className="eyebrow">
          MÔ TẢ NGHIỆP VỤ
        </div>


        <h2>
          Hồ sơ Guest được dùng như thế nào?
        </h2>


        <div className="business-grid">

          <BusinessItem
            number="01"

            icon={
              <UserRound
                size={18}
              />
            }

            title="Guest Profile"

            text="Mỗi khách có một hồ sơ riêng để không phải nhập lại thông tin cho mỗi Reservation."
          />


          <BusinessItem
            number="02"

            icon={
              <Phone
                size={18}
              />
            }

            title="Contact Information"

            text="Lưu họ tên, số điện thoại, email và địa chỉ liên hệ của khách."
          />


          <BusinessItem
            number="03"

            icon={
              <IdCard
                size={18}
              />
            }

            title="Identity Information"

            text="Quản lý quốc tịch, loại giấy tờ, số giấy tờ, ngày sinh và giới tính."
          />


          <BusinessItem
            number="04"

            icon={
              <History
                size={18}
              />
            }

            title="Guest History"

            text="Khi Reservation được triển khai, PMS sẽ hiển thị các lần lưu trú trước đây của Guest."
          />

        </div>

      </section>


      <Modal
        open={
          formOpen
        }

        title={
          editingId
            ? "Chỉnh sửa hồ sơ khách"
            : "Thêm khách hàng"
        }

        subtitle="GUEST PROFILE"

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
                saveGuest
              }
            >
              Lưu Guest
            </button>

          </>
        }
      >

        <GuestForm
          form={
            form
          }

          setForm={
            setForm
          }
        />

      </Modal>


      <Drawer
        open={
          Boolean(
            detailGuest
          )
        }

        title={
          detailGuest?.fullName ||
          ""
        }

        subtitle="GUEST PROFILE"

        onClose={
          () =>
            setDetailId(
              null
            )
        }
      >

        {
          detailGuest && (

            <GuestDetail
              guest={
                detailGuest
              }

              reservations={
                detailReservations
              }

              onEdit={
                () => {
                  setDetailId(
                    null
                  );


                  openEdit(
                    detailGuest
                  );
                }
              }
            />

          )
        }

      </Drawer>

    </>
  );
}


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


function GuestForm({
  form,
  setForm,
}) {
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
        1. Thông tin khách hàng
      </div>


      <div className="form-grid">

        <Field
          label="Họ và tên *"
          help="Tên đầy đủ của khách."
        >

          <input
            value={
              form.fullName
            }

            onChange={
              (event) =>
                patch(
                  "fullName",
                  event.target.value
                )
            }

            placeholder="Ví dụ: Nguyễn Văn An"
          />

        </Field>


        <Field
          label="Quốc tịch"
        >

          <input
            value={
              form.nationality
            }

            onChange={
              (event) =>
                patch(
                  "nationality",
                  event.target.value
                )
            }

            placeholder="Ví dụ: Việt Nam"
          />

        </Field>

      </div>


      <div className="form-section-title">
        2. Thông tin liên hệ
      </div>


      <div className="form-grid">

        <Field
          label="Số điện thoại"
          help="Cần ít nhất điện thoại hoặc email."
        >

          <input
            type="tel"

            value={
              form.phone
            }

            onChange={
              (event) =>
                patch(
                  "phone",
                  event.target.value
                )
            }

            placeholder="0901 234 567"
          />

        </Field>


        <Field
          label="Email"
        >

          <input
            type="email"

            value={
              form.email
            }

            onChange={
              (event) =>
                patch(
                  "email",
                  event.target.value
                )
            }

            placeholder="guest@email.com"
          />

        </Field>


        <Field
          label="Địa chỉ"
        >

          <input
            value={
              form.address
            }

            onChange={
              (event) =>
                patch(
                  "address",
                  event.target.value
                )
            }

            placeholder="Địa chỉ khách hàng"
          />

        </Field>

      </div>


      <div className="form-section-title">
        3. Thông tin giấy tờ
      </div>


      <div className="form-grid">

        <Field
          label="Loại giấy tờ"
        >

          <select
            value={
              form.documentType
            }

            onChange={
              (event) =>
                patch(
                  "documentType",
                  event.target.value
                )
            }
          >

            <option value="CCCD">
              CCCD
            </option>

            <option value="CMND">
              CMND
            </option>

            <option value="Passport">
              Hộ chiếu
            </option>

            <option value="Other">
              Khác
            </option>

          </select>

        </Field>


        <Field
          label="Số giấy tờ"
          help="Không cho phép trùng số giấy tờ giữa hai Guest."
        >

          <input
            value={
              form.documentNumber
            }

            onChange={
              (event) =>
                patch(
                  "documentNumber",
                  event.target.value
                )
            }

            placeholder="Nhập số CCCD / Passport"
          />

        </Field>


        <Field
          label="Ngày sinh"
        >

          <input
            type="date"

            value={
              form.dateOfBirth
            }

            onChange={
              (event) =>
                patch(
                  "dateOfBirth",
                  event.target.value
                )
            }
          />

        </Field>


        <Field
          label="Giới tính"
        >

          <select
            value={
              form.gender
            }

            onChange={
              (event) =>
                patch(
                  "gender",
                  event.target.value
                )
            }
          >

            <option value="">
              Chưa chọn
            </option>

            <option value="Male">
              Nam
            </option>

            <option value="Female">
              Nữ
            </option>

            <option value="Other">
              Khác
            </option>

          </select>

        </Field>

      </div>


      <div className="info-note roomtype-note">

        <strong>
          Guest Profile dùng lại cho nhiều Reservation
        </strong>


        <p>
          Khi khách quay lại CITYHOUSE, nhân viên sẽ tìm
          hồ sơ bằng tên, điện thoại, email hoặc giấy tờ
          thay vì tạo một hồ sơ mới.
        </p>

      </div>

    </>
  );
}


function GuestDetail({
  guest,
  reservations,
  onEdit,
}) {
  return (
    <>
      <div className="guest-profile-hero">

        <div className="guest-profile-avatar">

          <UserRound
            size={26}
          />

        </div>


        <div>

          <strong>
            {
              guest.fullName
            }
          </strong>


          <span>
            {
              guest.nationality ||
              "Chưa có quốc tịch"
            }
          </span>

        </div>

      </div>


      <div className="detail-section-title">
        Thông tin liên hệ
      </div>


      <div className="detail-grid">

        <Detail
          label="Số điện thoại"
          value={
            guest.phone ||
            "—"
          }

          icon={
            <Phone
              size={14}
            />
          }
        />


        <Detail
          label="Email"
          value={
            guest.email ||
            "—"
          }

          icon={
            <Mail
              size={14}
            />
          }
        />


        <Detail
          label="Địa chỉ"
          value={
            guest.address ||
            "—"
          }

          icon={
            <MapPin
              size={14}
            />
          }
        />

      </div>


      <div className="detail-section-title">
        Thông tin định danh
      </div>


      <div className="guest-identity-card">

        <Detail
          label="Quốc tịch"
          value={
            guest.nationality ||
            "—"
          }
        />


        <Detail
          label="Loại giấy tờ"
          value={
            documentTypeLabel(
              guest.documentType
            )
          }
        />


        <Detail
          label="Số giấy tờ"
          value={
            guest.documentNumber ||
            "—"
          }
          mono
        />


        <Detail
          label="Ngày sinh"
          value={
            formatDate(
              guest.dateOfBirth
            )
          }
        />


        <Detail
          label="Giới tính"
          value={
            genderLabel(
              guest.gender
            )
          }
        />

      </div>


      <div className="detail-section-title">
        Guest History
      </div>


      {
        reservations.length >
        0
          ? (

            <div className="guest-history-list">

              {
                reservations.map(
                  (reservation) => (

                    <div
                      className="guest-history-item"

                      key={
                        reservation.id
                      }
                    >

                      <div>

                        <strong>
                          {
                            reservation.code ||
                            reservation.reservationCode ||
                            "Reservation"
                          }
                        </strong>


                        <span>

                          <CalendarDays
                            size={12}
                          />

                          {
                            formatDate(
                              reservation.checkin
                            )
                          }

                          {" → "}

                          {
                            formatDate(
                              reservation.checkout
                            )
                          }

                        </span>

                      </div>


                      <span className="status-badge status-info">
                        {
                          reservation.status ||
                          "—"
                        }
                      </span>

                    </div>

                  )
                )
              }

            </div>

          )
          : (

            <div className="empty-detail-state">

              <History
                size={26}
              />


              <strong>
                Chưa có lịch sử lưu trú
              </strong>


              <span>
                Guest History sẽ tự xuất hiện khi
                Reservation được tạo cho khách này.
              </span>

            </div>

          )
      }


      <div className="detail-section-title">
        Lịch sử hồ sơ
      </div>


      <div className="timeline">

        {
          (
            guest.logs ||
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

        <button
          className="button button-dark"

          onClick={
            onEdit
          }
        >
          <Pencil
            size={16}
          />

          Chỉnh sửa Guest
        </button>

      </div>

    </>
  );
}


function Detail({
  label,
  value,
  mono = false,
  icon = null,
}) {
  return (
    <div>

      <div className="detail-label">
        {label}
      </div>


      <div
        className={`detail-value ${
          mono
            ? "code"
            : ""
        }`}
      >

        {
          icon && (
            <span className="detail-value-icon">
              {icon}
            </span>
          )
        }

        {value}

      </div>

    </div>
  );
}