from odoo.exceptions import UserError

from . import cache_service
from . import external_db_service
from .message_service import publish_event


def _class_values(row):
    return {
        "code": row["code"],
        "name": row["name"],
        "description": row["description"],
    }


def _student_values(row, class_record):
    return {
        "code": row["code"],
        "fullname": row["fullname"],
        "dob": row["dob"],
        "sex": row["sex"],
        "homecity": row["homecity"],
        "address": row["address"],
        "hobbies": row["hobbies"],
        "hair_color": row["hair_color"],
        "email": row["email"],
        "facebook": row["facebook"],
        "class_id": class_record.id,
        "username": row["username"],
        "password": row["password"],
        "description": row["description"],
        "attachment_filename": row["attachment_filename"],
    }


def sync_external_to_odoo(env):
    class_model = env["tra.class"].sudo()
    student_model = env["tra.student"].sudo()

    result = {
        "classes_created": 0,
        "classes_updated": 0,
        "students_created": 0,
        "students_updated": 0,
    }

    external_classes = external_db_service.get_classes()
    for row in external_classes:
        existing = class_model.search([("code", "=", row["code"])], limit=1)
        values = _class_values(row)
        if existing:
            existing.write(values)
            result["classes_updated"] += 1
        else:
            class_model.create(values)
            result["classes_created"] += 1

    external_students = external_db_service.get_students()
    for row in external_students:
        class_record = class_model.search([("code", "=", row["class_code"])], limit=1)
        if not class_record:
            raise UserError("Khong tim thay lop khi sync hoc sinh external.")

        existing = student_model.search([("code", "=", row["code"])], limit=1)
        values = _student_values(row, class_record)
        if existing:
            existing.write(values)
            result["students_updated"] += 1
        else:
            student_model.create(values)
            result["students_created"] += 1

    cache_service.clear("external:")
    publish_event("batch.external_mysql.synced", result)
    return result


def sync_odoo_to_external(env):
    class_model = env["tra.class"].sudo()
    student_model = env["tra.student"].sudo()

    result = {
        "classes_synced": 0,
        "students_synced": 0,
    }

    for class_record in class_model.search([]):
        external_db_service.sync_odoo_record("tra.class", class_record)
        result["classes_synced"] += 1

    for student_record in student_model.search([]):
        external_db_service.sync_odoo_record("tra.student", student_record)
        result["students_synced"] += 1

    cache_service.clear("external:")
    publish_event("batch.odoo.synced_to_external_mysql", result)
    return result


def sync_all(env):
    external_to_odoo = sync_external_to_odoo(env)
    odoo_to_external = sync_odoo_to_external(env)
    result = {
        "external_to_odoo": external_to_odoo,
        "odoo_to_external": odoo_to_external,
    }
    publish_event("batch.odoo_external_mysql.synced_all", result)
    return result
