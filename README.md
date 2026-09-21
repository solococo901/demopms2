# CITYHOUSE PMS — Next.js Prototype

Prototype PMS dùng để trình bày luồng nghiệp vụ Phase 1.

## Công nghệ

- Next.js App Router
- React
- CSS thuần
- lucide-react
- localStorage demo data

## Chạy project

```bash
npm install
npm run dev
```

Mở:

```text
http://localhost:3000
```

Trang `/` tự chuyển đến `/property`.

## Kiến trúc

- `app/(pms)/layout.js`: layout dùng chung cho toàn bộ module PMS.
- `components/Sidebar.js`: menu sidebar dùng chung.
- `context/PmsContext.js`: dữ liệu demo dùng chung giữa tất cả module.
- `lib/defaultData.js`: dữ liệu seed.
- Mỗi module là một route riêng: `/property`, `/room-type`, `/reservation`, ...
- Module 01 Property đã được làm chi tiết.
- Module 02–19 hiện có route + màn hình placeholder và sẽ được hoàn thiện tuần tự.

## Dữ liệu

Dữ liệu demo được lưu bằng localStorage với key:

`cityhouse_pms_nextjs_demo`

Vì vậy khi chuyển giữa các route, dữ liệu Property vẫn được giữ lại và các module sau có thể sử dụng chung.
