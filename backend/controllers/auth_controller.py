import json

from odoo import http
from odoo.http import request

from ..services import external_db_service
from ..utils.api_response import fail, ok


class StudentClassAuthController(http.Controller):
    def _payload(self):
        if not request.httprequest.data:
            return {}
        try:
            return json.loads(request.httprequest.data.decode("utf-8"))
        except ValueError:
            return {}

    @http.route(
        "/api/auth/login",
        type="http",
        auth="public",
        methods=["POST"],
        csrf=False,
        cors="*",
    )
    def login(self, **params):
        payload = self._payload()
        email = (payload.get("email") or "").strip().lower()
        password = payload.get("password") or ""

        if not email or not password:
            return fail("Vui long nhap email va mat khau.", status=400)

        admin = request.env["tra.admin.user"].sudo().search(
            [("email", "=", email), ("active", "=", True)],
            limit=1,
        )
        if not admin:
            return fail("Không tồn tại tài khoản đó.", status=404)

        if not admin.check_password(password):
            return fail("Mật khẩu không đúng.", status=401)

        return ok(
            {
                "id": admin.id,
                "name": admin.name,
                "email": admin.email,
            },
            message="Logged in",
        )


class StudentClassDashboardController(http.Controller):
    @http.route(
        "/api/dashboard/summary",
        type="http",
        auth="public",
        methods=["GET"],
        csrf=False,
        cors="*",
    )
    def summary(self, **params):
        env = request.env
        class_model = env["tra.class"].sudo()
        student_model = env["tra.student"].sudo()
        class_count = class_model.search_count([])
        student_count = student_model.search_count([])
        source = "odoo"

        classes = class_model.search([])
        class_rows = []
        for class_record in classes:
            count = student_model.search_count([("class_id", "=", class_record.id)])
            class_rows.append(
                {
                    "id": class_record.id,
                    "code": class_record.code,
                    "name": class_record.name,
                    "student_count": count,
                }
            )

        try:
            external_classes = external_db_service.get_classes()
            external_students = external_db_service.get_students()
        except Exception:
            external_classes = []
            external_students = []

        if len(external_students) > student_count or len(external_classes) > class_count:
            source = "external_mysql"
            class_count = max(class_count, len(external_classes))
            student_count = max(student_count, len(external_students))
            external_student_count_by_class = {}
            for student in external_students:
                class_code = student.get("class_code")
                external_student_count_by_class[class_code] = external_student_count_by_class.get(class_code, 0) + 1
            class_rows = [
                {
                    "id": row["id"],
                    "code": row["code"],
                    "name": row["name"],
                    "student_count": external_student_count_by_class.get(row["code"], 0),
                }
                for row in external_classes
            ]

        return ok(
            {
                "student_count": student_count,
                "class_count": class_count,
                "classes": class_rows,
                "source": source,
            }
        )
