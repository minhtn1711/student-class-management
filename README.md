# Student Class Management

Workspace gồm 2 phần chính:

```text
.
├── backend/
│   ├── controllers/                # Odoo HTTP controllers
│   ├── models/                     # Odoo models
│   ├── services/                   # Backend services
│   ├── utils/                      # API helpers
│   ├── external_db/                # MySQL seed/schema
│   ├── scripts/                    # Dev/test helper scripts
│   ├── docker-compose.mysql.yml
│   └── requirements.txt
├── __manifest__.py                 # Odoo addon manifest
├── frontend/                       # React + Vite + Ant Design admin UI
└── Makefile                        # Lệnh chạy chung cho backend/frontend
```

## Backend

Odoo addon vẫn giữ technical module name là `student_class_management`; phần source backend nằm trong `backend/`.

```bash
make deps
make infra
make dev
```

Sau khi pull/thay đổi model hoặc data XML, chạy:

```bash
make update
```

Các lệnh hữu ích:

```bash
make install
make update
make sync-db
make simulate
make rabbitmq-consumer
make infra-down
```

## Xem Database

Odoo dùng PostgreSQL database `odoo_test`:

```bash
psql -d odoo_test
```

Trong `psql`:

```sql
\dt tra_*
select id, code, name from tra_class;
select id, code, fullname, email from tra_student;
select id, name, email, active from tra_admin_user;
```

External MySQL chạy trong Docker:

```bash
docker exec -it backend-student_external_mysql-1 mysql -ustudent_user -pstudent_password student_external_db
```

Trong MySQL:

```sql
show tables;
select * from external_classes;
select * from external_students;
```

Sync thủ công hai chiều Odoo <-> MySQL:

```bash
make sync-db
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Hoặc chạy từ root:

```bash
make fe-dev
make fe-build
```

Khi chạy dev, frontend proxy `/api` sang backend Odoo tại `http://localhost:8069`. Có thể đổi bằng `frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:8069
```

Tài khoản admin được seed trong DB bằng `backend/data/admin_user.xml`.
