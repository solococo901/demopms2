export default function ModulePlaceholder({ step, title, english, description }) {
  return (
    <>
      <div className="page-header">
        <div>
          <div className="eyebrow">BƯỚC {step}</div>
          <h1>
            {title} <span className="heading-en">({english})</span>
          </h1>
          <p>{description}</p>
        </div>
      </div>

      <section className="panel module-placeholder">
        <div className="placeholder-number">{step}</div>
        <div>
          <h2>Khung module đã sẵn sàng</h2>
          <p>
            Module này đã có route riêng trong Next.js và sử dụng chung sidebar, layout
            và dữ liệu PMS. Mình sẽ hoàn thiện nghiệp vụ ở bước tương ứng.
          </p>
        </div>
      </section>
    </>
  );
}
