from odoo import http
from odoo.http import request

from ..services import batch_service
from ..services import cache_service
from ..utils.api_response import fail, ok


class BatchController(http.Controller):
    @http.route(
        "/api/batch/sync_external",
        type="http",
        auth="public",
        methods=["POST"],
        csrf=False,
    )
    def sync_external(self, **params):
        try:
            return ok(batch_service.sync_external_to_odoo(request.env), message="Synced")
        except Exception as exc:
            return fail(str(exc))

    @http.route(
        "/api/batch/sync_odoo",
        type="http",
        auth="public",
        methods=["POST"],
        csrf=False,
        cors="*",
    )
    def sync_odoo(self, **params):
        try:
            return ok(batch_service.sync_odoo_to_external(request.env), message="Synced")
        except Exception as exc:
            return fail(str(exc))

    @http.route(
        "/api/batch/sync_all",
        type="http",
        auth="public",
        methods=["POST"],
        csrf=False,
        cors="*",
    )
    def sync_all(self, **params):
        try:
            return ok(batch_service.sync_all(request.env), message="Synced")
        except Exception as exc:
            return fail(str(exc))

    @http.route(
        "/api/cache/clear",
        type="http",
        auth="public",
        methods=["POST"],
        csrf=False,
    )
    def clear_cache(self, **params):
        cache_service.clear()
        return ok({"cleared": True}, message="Cache cleared")
