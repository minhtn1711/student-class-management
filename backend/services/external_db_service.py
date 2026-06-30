from odoo.exceptions import UserError

from .env_service import setting

CLASS_FIELDS = ["id", "code", "name", "description", "created_at", "updated_at"]
STUDENT_FIELDS = [
    "id",
    "code",
    "fullname",
    "dob",
    "sex",
    "homecity",
    "address",
    "hobbies",
    "hair_color",
    "email",
    "facebook",
    "class_id",
    "class_code",
    "class_name",
    "username",
    "password",
    "description",
    "attachment_filename",
    "created_at",
    "updated_at",
]


def _connect():
    try:
        import pymysql
    except ImportError as exc:
        raise UserError("Can cai thu vien PyMySQL de ket noi External MySQL DB.") from exc

    try:
        return pymysql.connect(
            host=setting("EXTERNAL_DB_HOST", "127.0.0.1"),
            port=int(setting("EXTERNAL_DB_PORT", "3307")),
            user=setting("EXTERNAL_DB_USER", "student_user"),
            password=setting("EXTERNAL_DB_PASSWORD", "student_password"),
            database=setting("EXTERNAL_DB_NAME", "student_external_db"),
            charset="utf8mb4",
            cursorclass=pymysql.cursors.DictCursor,
            connect_timeout=5,
            read_timeout=10,
            write_timeout=10,
        )
    except Exception as exc:
        raise UserError("Khong ket noi duoc External MySQL DB. Hay kiem tra MySQL da chay va dung cau hinh.") from exc


def _fetch_all(query, params=None):
    connection = _connect()
    try:
        with connection.cursor() as cursor:
            cursor.execute(query, params or ())
            return cursor.fetchall()
    finally:
        connection.close()


def _fetch_one(query, params=None):
    rows = _fetch_all(query, params)
    return rows[0] if rows else None


def _execute(query, params=None):
    connection = _connect()
    try:
        with connection.cursor() as cursor:
            affected = cursor.execute(query, params or ())
        connection.commit()
        return affected
    finally:
        connection.close()


def get_classes():
    return _fetch_all(
        """
        SELECT id, code, name, description, created_at, updated_at
        FROM external_classes
        ORDER BY id DESC
        """
    )


def get_class(record_id):
    return _fetch_one(
        """
        SELECT id, code, name, description, created_at, updated_at
        FROM external_classes
        WHERE id = %s
        """,
        (record_id,),
    )


def get_students():
    return _fetch_all(
        """
        SELECT
            student.id,
            student.code,
            student.fullname,
            student.dob,
            student.sex,
            student.homecity,
            student.address,
            student.hobbies,
            student.hair_color,
            student.email,
            student.facebook,
            student.class_id,
            class_table.code AS class_code,
            class_table.name AS class_name,
            student.username,
            student.password,
            student.description,
            student.attachment_filename,
            student.created_at,
            student.updated_at
        FROM external_students student
        INNER JOIN external_classes class_table ON class_table.id = student.class_id
        ORDER BY student.id DESC
        """
    )


def get_student(record_id):
    return _fetch_one(
        """
        SELECT
            student.id,
            student.code,
            student.fullname,
            student.dob,
            student.sex,
            student.homecity,
            student.address,
            student.hobbies,
            student.hair_color,
            student.email,
            student.facebook,
            student.class_id,
            class_table.code AS class_code,
            class_table.name AS class_name,
            student.username,
            student.password,
            student.description,
            student.attachment_filename,
            student.created_at,
            student.updated_at
        FROM external_students student
        INNER JOIN external_classes class_table ON class_table.id = student.class_id
        WHERE student.id = %s
        """,
        (record_id,),
    )


def upsert_class(values):
    return _execute(
        """
        INSERT INTO external_classes (code, name, description)
        VALUES (%s, %s, %s)
        ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            description = VALUES(description)
        """,
        (
            values.get("code"),
            values.get("name"),
            values.get("description"),
        ),
    )


def delete_class_by_code(code):
    connection = _connect()
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                DELETE student
                FROM external_students student
                INNER JOIN external_classes class_table ON class_table.id = student.class_id
                WHERE class_table.code = %s
                """,
                (code,),
            )
            affected = cursor.execute("DELETE FROM external_classes WHERE code = %s", (code,))
        connection.commit()
        return affected
    finally:
        connection.close()


def get_class_by_code(code):
    return _fetch_one(
        """
        SELECT id, code, name, description, created_at, updated_at
        FROM external_classes
        WHERE code = %s
        """,
        (code,),
    )


def upsert_student(values):
    class_row = get_class_by_code(values.get("class_code"))
    if not class_row:
        upsert_class(
            {
                "code": values.get("class_code"),
                "name": values.get("class_name"),
                "description": values.get("class_description") or values.get("class_name"),
            }
        )
        class_row = get_class_by_code(values.get("class_code"))

    return _execute(
        """
        INSERT INTO external_students (
            code,
            fullname,
            dob,
            sex,
            homecity,
            address,
            hobbies,
            hair_color,
            email,
            facebook,
            class_id,
            username,
            password,
            description,
            attachment_filename
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            fullname = VALUES(fullname),
            dob = VALUES(dob),
            sex = VALUES(sex),
            homecity = VALUES(homecity),
            address = VALUES(address),
            hobbies = VALUES(hobbies),
            hair_color = VALUES(hair_color),
            email = VALUES(email),
            facebook = VALUES(facebook),
            class_id = VALUES(class_id),
            username = VALUES(username),
            password = VALUES(password),
            description = VALUES(description),
            attachment_filename = VALUES(attachment_filename)
        """,
        (
            values.get("code"),
            values.get("fullname"),
            values.get("dob"),
            values.get("sex"),
            values.get("homecity"),
            values.get("address"),
            values.get("hobbies"),
            values.get("hair_color"),
            values.get("email"),
            values.get("facebook"),
            class_row["id"],
            values.get("username"),
            values.get("password"),
            values.get("description"),
            values.get("attachment_filename"),
        ),
    )


def delete_student_by_code(code):
    return _execute("DELETE FROM external_students WHERE code = %s", (code,))


def sync_odoo_record(model_name, record, old_code=None):
    if model_name == "tra.class":
        if old_code and old_code != record.code:
            delete_class_by_code(old_code)
        return upsert_class(
            {
                "code": record.code,
                "name": record.name,
                "description": record.description,
            }
        )

    if model_name == "tra.student":
        if old_code and old_code != record.code:
            delete_student_by_code(old_code)
        return upsert_student(
            {
                "code": record.code,
                "fullname": record.fullname,
                "dob": record.dob,
                "sex": record.sex,
                "homecity": record.homecity,
                "address": record.address,
                "hobbies": record.hobbies,
                "hair_color": record.hair_color,
                "email": record.email,
                "facebook": record.facebook,
                "class_code": record.class_id.code,
                "class_name": record.class_id.name,
                "class_description": record.class_id.description,
                "username": record.username,
                "password": record.password,
                "description": record.description,
                "attachment_filename": record.attachment_filename,
            }
        )

    return False


def delete_odoo_records(model_name, records):
    if model_name == "tra.student":
        for record in records:
            delete_student_by_code(record.code)
        return True

    if model_name == "tra.class":
        for record in records:
            delete_class_by_code(record.code)
        return True

    return False
