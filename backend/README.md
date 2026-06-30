# Backend

Thư mục này chứa Odoo addon và các tài nguyên backend phụ trợ.

```text
backend/
├── controllers/                # Odoo HTTP controllers
├── models/                     # Odoo models
├── services/                   # Backend services
├── utils/                      # API helpers
├── data/                       # XML data/cron/seed
├── security/                   # Access rights
├── external_db/                # MySQL init scripts
├── scripts/                    # Script test/simulation/consumer
├── docker-compose.mysql.yml    # MySQL + RabbitMQ local infra
├── requirements.txt
├── .env
└── .env.example
```

`ADDONS_PATH` cần trỏ tới thư mục cha của root repo, vì addon Odoo vẫn là thư mục `student_class_management/`; source backend nằm trong `backend/`.

Chạy từ root repo:

```bash
make infra
make dev
make update
```

API quản trị đã có:

- `POST /api/auth/login`: đăng nhập admin bằng tài khoản trong model `tra.admin.user`.
- `GET /api/dashboard/summary`: thống kê tổng quan sinh viên/lớp.
- `POST /api/batch/sync_external`: sync MySQL external sang Odoo.
- `POST /api/batch/sync_odoo`: sync Odoo sang MySQL external.
- `POST /api/batch/sync_all`: sync hai chiều Odoo và MySQL external.
- `GET /api/class/get_by_page`, `POST /api/class/create`, `POST /api/class/update/<id>`, `POST /api/class/delete/<id>`.
- `GET /api/student/get_by_page`, `POST /api/student/create`, `POST /api/student/update/<id>`, `POST /api/student/delete/<id>`.

Admin mặc định được seed bởi `data/admin_user.xml`. Mật khẩu không hiển thị trên giao diện frontend.

Cron `Sync External MySQL Students and Classes` đang active và chạy mỗi 10 phút để sync hai chiều.
