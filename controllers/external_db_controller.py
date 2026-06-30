from odoo import http

from ..services import cache_service
from ..services import external_db_service
from ..utils.api_response import fail, ok


class ExternalDbController(http.Controller):
    @http.route(
        "/api/external/classes",
        type="http",
        auth="public",
        methods=["GET"],
        csrf=False,
    )
    def get_external_classes(self, **params):
        try:
            data = cache_service.remember("external:classes", external_db_service.get_classes)
            return ok(data)
        except Exception as exc:
            return fail(str(exc))

    @http.route(
        "/api/external/classes/<int:record_id>",
        type="http",
        auth="public",
        methods=["GET"],
        csrf=False,
    )
    def get_external_class(self, record_id, **params):
        try:
            data = cache_service.remember(
                f"external:classes:{record_id}",
                lambda: external_db_service.get_class(record_id),
            )
            if not data:
                return fail("Khong tim thay lop external.", status=404)
            return ok(data)
        except Exception as exc:
            return fail(str(exc))

    @http.route(
        "/api/external/students",
        type="http",
        auth="public",
        methods=["GET"],
        csrf=False,
    )
    def get_external_students(self, **params):
        try:
            data = cache_service.remember("external:students", external_db_service.get_students)
            return ok(data)
        except Exception as exc:
            return fail(str(exc))

    @http.route(
        "/api/external/students/<int:record_id>",
        type="http",
        auth="public",
        methods=["GET"],
        csrf=False,
    )
    def get_external_student(self, record_id, **params):
        try:
            data = cache_service.remember(
                f"external:students:{record_id}",
                lambda: external_db_service.get_student(record_id),
            )
            if not data:
                return fail("Khong tim thay hoc sinh external.", status=404)
            return ok(data)
        except Exception as exc:
            return fail(str(exc))
