# Student Class Admin FE

Frontend quản trị dùng React, Vite và Ant Design.

## Chạy local

```bash
cd frontend
npm install
npm run dev
```

Mặc định Vite chạy tại `http://localhost:5173`.

Khi chạy dev, Vite proxy `/api` sang Odoo tại `http://localhost:8069`, nên frontend gọi API cùng origin và tránh lỗi CORS local.

Có thể override backend API bằng:

```bash
VITE_API_BASE_URL=http://localhost:8069
```

## Màn hình đã có

- Login admin gọi `POST /api/auth/login`, không còn đăng nhập mock.
- Layout quản trị gồm sidebar trái, header trên và nội dung chính.
- Footer cố định trong layout quản trị.
- Tổng quan lấy dữ liệu từ `GET /api/dashboard/summary`.
- Quản lý lớp dùng bảng, tìm kiếm, thêm, sửa, xoá, export Excel.
- Quản lý sinh viên dùng bảng đủ trường backend, tìm kiếm, thêm, sửa, xoá, export Excel/PDF.
