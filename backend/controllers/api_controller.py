import base64
import json

from odoo import http
from odoo.http import request

from ..services import crud_service
from ..utils.api_response import fail, ok
from ..utils.field_maps import RESOURCE_CONFIGS
from ..utils.normalizer import ApiNormalizer


class StudentClassApiController(http.Controller):
    def _config(self, resource):
        return RESOURCE_CONFIGS.get(resource)

    def _payload(self):
        if not request.httprequest.data:
            return {}
        try:
            return json.loads(request.httprequest.data.decode("utf-8"))
        except ValueError:
            return {}

    @http.route(
        ["/api/<string:resource>/get_all", "/api/<string:resource>"],
        type="http",
        auth="public",
        methods=["GET"],
        csrf=False,
        cors="*",
    )
    def get_all(self, resource, **params):
        config = self._config(resource)
        if not config:
            return fail("Resource khong hop le.", status=404)
        try:
            data = crud_service.get_all(request.env, config, params.get("columnlist"))
            return ok(data)
        except Exception as exc:
            return fail(crud_service.readable_error(exc))

    @http.route(
        "/api/<string:resource>/get_by_page",
        type="http",
        auth="public",
        methods=["GET"],
        csrf=False,
        cors="*",
    )
    def get_by_page(self, resource, **params):
        config = self._config(resource)
        if not config:
            return fail("Resource khong hop le.", status=404)
        try:
            data = crud_service.get_by_page(
                request.env,
                config,
                page=params.get("page"),
                size=params.get("size"),
                column_list=params.get("columnlist"),
                keyword=params.get("keyword"),
            )
            return ok(data)
        except Exception as exc:
            return fail(crud_service.readable_error(exc))

    @http.route(
        ["/api/<string:resource>/get_by_id", "/api/<string:resource>/get_by_id/<int:record_id>"],
        type="http",
        auth="public",
        methods=["GET"],
        csrf=False,
        cors="*",
    )
    def get_by_id(self, resource, record_id=None, **params):
        config = self._config(resource)
        if not config:
            return fail("Resource khong hop le.", status=404)
        record_id = record_id or params.get("id")
        if not record_id:
            return fail("Vui long truyen id.")
        try:
            data = crud_service.get_by_id(
                request.env,
                config,
                record_id,
                params.get("columnlist"),
            )
            if not data:
                return fail("Khong tim thay ban ghi.", status=404)
            return ok(data)
        except Exception as exc:
            return fail(crud_service.readable_error(exc))

    @http.route(
        "/api/<string:resource>/create",
        type="http",
        auth="public",
        methods=["POST"],
        csrf=False,
        cors="*",
    )
    def create(self, resource, **params):
        config = self._config(resource)
        if not config:
            return fail("Resource khong hop le.", status=404)
        try:
            data = crud_service.create_record(request.env, config, self._payload())
            return ok(data, message="Created", status=201)
        except Exception as exc:
            return fail(crud_service.readable_error(exc))

    @http.route(
        "/api/<string:resource>/update/<int:record_id>",
        type="http",
        auth="public",
        methods=["PUT", "POST"],
        csrf=False,
        cors="*",
    )
    def update(self, resource, record_id, **params):
        config = self._config(resource)
        if not config:
            return fail("Resource khong hop le.", status=404)
        try:
            data = crud_service.update_record(request.env, config, record_id, self._payload())
            if not data:
                return fail("Khong tim thay ban ghi.", status=404)
            return ok(data, message="Updated")
        except Exception as exc:
            return fail(crud_service.readable_error(exc))

    @http.route(
        ["/api/<string:resource>/copy", "/api/<string:resource>/copy/<int:record_id>"],
        type="http",
        auth="public",
        methods=["POST"],
        csrf=False,
        cors="*",
    )
    def copy(self, resource, record_id=None, **params):
        config = self._config(resource)
        if not config:
            return fail("Resource khong hop le.", status=404)
        try:
            payload = self._payload()
            raw_ids = params.get("idlist") or payload.get("idlist")
            if raw_ids:
                ids = ApiNormalizer(config).ids(raw_ids)
                data = crud_service.copy_records(request.env, config, ids)
            else:
                data = crud_service.copy_record(request.env, config, record_id, payload)
            if not data:
                return fail("Khong tim thay ban ghi.", status=404)
            return ok(data, message="Copied", status=201)
        except Exception as exc:
            return fail(crud_service.readable_error(exc))

    @http.route(
        ["/api/<string:resource>/delete", "/api/<string:resource>/delete/<int:record_id>"],
        type="http",
        auth="public",
        methods=["DELETE", "POST"],
        csrf=False,
        cors="*",
    )
    def delete(self, resource, record_id=None, **params):
        config = self._config(resource)
        if not config:
            return fail("Resource khong hop le.", status=404)
        try:
            payload = self._payload()
            raw_ids = params.get("idlist") or payload.get("idlist")
            ids = ApiNormalizer(config).ids(raw_ids) if raw_ids else None
            deleted = crud_service.delete_record(request.env, config, record_id, ids)
            if not deleted:
                return fail("Khong tim thay ban ghi.", status=404)
            return ok({"deleted": deleted}, message="Deleted")
        except Exception as exc:
            return fail(crud_service.readable_error(exc))

    @http.route(
        "/api/<string:resource>/template_import",
        type="http",
        auth="public",
        methods=["GET"],
        csrf=False,
        cors="*",
    )
    def template_import(self, resource, **params):
        config = self._config(resource)
        if not config:
            return fail("Resource khong hop le.", status=404)
        try:
            content = crud_service.template_import(config)
            return request.make_response(
                content,
                headers=[
                    ("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
                    ("Content-Disposition", f"attachment; filename={resource}_template.xlsx"),
                ],
            )
        except Exception as exc:
            return fail(crud_service.readable_error(exc))

    @http.route(
        "/api/<string:resource>/import",
        type="http",
        auth="public",
        methods=["POST"],
        csrf=False,
        cors="*",
    )
    def import_file(self, resource, **params):
        config = self._config(resource)
        if not config:
            return fail("Resource khong hop le.", status=404)
        upload = request.httprequest.files.get("file")
        if not upload:
            return fail("Vui long upload file voi key la file.")
        try:
            file_content = base64.b64encode(upload.read())
            data = crud_service.import_records(request.env, config, file_content)
            return ok(data, message="Imported")
        except Exception as exc:
            return fail(crud_service.readable_error(exc))

    @http.route(
        "/api/<string:resource>/export",
        type="http",
        auth="public",
        methods=["GET"],
        csrf=False,
        cors="*",
    )
    def export(self, resource, **params):
        config = self._config(resource)
        if not config:
            return fail("Resource khong hop le.", status=404)
        try:
            raw_ids = params.get("idlist")
            ids = ApiNormalizer(config).ids(raw_ids) if raw_ids else None
            content = crud_service.export_records(
                request.env,
                config,
                ids=ids,
                column_list=params.get("columnlist"),
            )
            return request.make_response(
                content,
                headers=[
                    ("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
                    ("Content-Disposition", f"attachment; filename={resource}.xlsx"),
                ],
            )
        except Exception as exc:
            return fail(crud_service.readable_error(exc))

    @http.route(
        "/api/<string:resource>/export_pdf",
        type="http",
        auth="public",
        methods=["GET"],
        csrf=False,
        cors="*",
    )
    def export_pdf(self, resource, **params):
        config = self._config(resource)
        if not config:
            return fail("Resource khong hop le.", status=404)
        try:
            raw_ids = params.get("idlist")
            ids = ApiNormalizer(config).ids(raw_ids) if raw_ids else None
            content = crud_service.export_pdf(
                request.env,
                config,
                resource,
                ids=ids,
                column_list=params.get("columnlist"),
            )
            return request.make_response(
                content,
                headers=[
                    ("Content-Type", "application/pdf"),
                    ("Content-Disposition", f"attachment; filename={resource}.pdf"),
                ],
            )
        except Exception as exc:
            return fail(crud_service.readable_error(exc))
