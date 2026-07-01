import json

from odoo import http
from odoo.http import Response


STUDENT_FIELDS = {
    "id": {"type": "integer", "format": "int64", "readOnly": True},
    "code": {"type": "string", "maxLength": 50, "example": "STU001"},
    "fullname": {"type": "string", "maxLength": 30, "example": "Nguyen Van A"},
    "dob": {"type": "string", "format": "date", "example": "2001-02-14"},
    "sex": {"type": "boolean", "example": True},
    "homecity": {"type": "string", "maxLength": 100, "example": "Ha Noi"},
    "address": {"type": "string", "maxLength": 100, "example": "Cau Giay, Ha Noi"},
    "hobbies": {"type": "string", "maxLength": 255, "example": "Doc sach, bong da"},
    "hair_color": {"type": "string", "maxLength": 7, "example": "#000000"},
    "email": {"type": "string", "maxLength": 256, "example": "nguyenvana@example.com"},
    "facebook": {"type": "string", "maxLength": 256, "example": "https://facebook.com/nguyenvana"},
    "class_id": {
        "oneOf": [
            {"type": "integer", "example": 1},
            {"$ref": "#/components/schemas/RelationValue"},
        ]
    },
    "username": {"type": "string", "maxLength": 50, "example": "nguyenvana"},
    "password": {"type": "string", "maxLength": 256, "example": "Password@123"},
    "description": {"type": "string", "example": "Hoc sinh demo"},
    "attachment_filename": {"type": "string", "example": "nguyenvana.png"},
}

CLASS_FIELDS = {
    "id": {"type": "integer", "format": "int64", "readOnly": True},
    "code": {"type": "string", "maxLength": 50, "example": "CLS001"},
    "name": {"type": "string", "maxLength": 100, "example": "Odoo Development"},
    "description": {"type": "string", "example": "Lop hoc phat trien module Odoo"},
}


def _schema(properties, required=None):
    return {
        "type": "object",
        "properties": properties,
        "required": required or [],
    }


def _success_response(data_schema):
    return {"description": "Successful response"}


def _error_response():
    return {"description": "Error response"}


def _resource_paths(resource, tag, schema_name, create_schema_name):
    item_schema = {"$ref": f"#/components/schemas/{schema_name}"}
    list_schema = {"type": "array", "items": item_schema}
    return {
        f"/api/{resource}": {
            "get": {
                "tags": [tag],
                "summary": f"Lay danh sach {resource}",
                "parameters": [
                    {
                        "name": "columnlist",
                        "in": "query",
                        "schema": {"type": "string"},
                        "description": "Danh sach field hoac ten viet tat, cach nhau bang dau phay.",
                    }
                ],
                "responses": {"200": _success_response(list_schema), "400": _error_response()},
            }
        },
        f"/api/{resource}/get_by_page": {
            "get": {
                "tags": [tag],
                "summary": f"Lay danh sach {resource} co phan trang",
                "parameters": [
                    {"name": "page", "in": "query", "schema": {"type": "integer", "default": 1}},
                    {"name": "size", "in": "query", "schema": {"type": "integer", "default": 20}},
                    {"name": "keyword", "in": "query", "schema": {"type": "string"}},
                    {"name": "columnlist", "in": "query", "schema": {"type": "string"}},
                ],
                "responses": {"200": _success_response({"type": "object"}), "400": _error_response()},
            }
        },
        f"/api/{resource}/get_by_id/{{record_id}}": {
            "get": {
                "tags": [tag],
                "summary": f"Lay mot {resource} theo id",
                "parameters": [
                    {"name": "record_id", "in": "path", "required": True, "schema": {"type": "integer"}},
                    {"name": "columnlist", "in": "query", "schema": {"type": "string"}},
                ],
                "responses": {"200": _success_response(item_schema), "404": _error_response()},
            }
        },
        f"/api/{resource}/create": {
            "post": {
                "tags": [tag],
                "summary": f"Tao moi {resource}",
                "requestBody": {
                    "required": True,
                    "content": {"application/json": {"schema": {"$ref": f"#/components/schemas/{create_schema_name}"}}},
                },
                "responses": {"201": _success_response(item_schema), "400": _error_response()},
            }
        },
        f"/api/{resource}/update/{{record_id}}": {
            "put": {
                "tags": [tag],
                "summary": f"Cap nhat {resource}",
                "parameters": [
                    {"name": "record_id", "in": "path", "required": True, "schema": {"type": "integer"}}
                ],
                "requestBody": {
                    "required": True,
                    "content": {"application/json": {"schema": {"$ref": f"#/components/schemas/{create_schema_name}"}}},
                },
                "responses": {"200": _success_response(item_schema), "404": _error_response()},
            }
        },
        f"/api/{resource}/delete/{{record_id}}": {
            "delete": {
                "tags": [tag],
                "summary": f"Xoa {resource}",
                "parameters": [
                    {"name": "record_id", "in": "path", "required": True, "schema": {"type": "integer"}}
                ],
                "responses": {"200": _success_response({"type": "object"}), "404": _error_response()},
            }
        },
        f"/api/{resource}/export": {
            "get": {
                "tags": [tag],
                "summary": f"Export {resource} ra Excel",
                "parameters": [
                    {"name": "idlist", "in": "query", "schema": {"type": "string"}},
                    {"name": "columnlist", "in": "query", "schema": {"type": "string"}},
                ],
                "responses": {"200": {"description": "Excel file"}},
            }
        },
        f"/api/{resource}/export_pdf": {
            "get": {
                "tags": [tag],
                "summary": f"Export {resource} ra PDF",
                "parameters": [
                    {"name": "idlist", "in": "query", "schema": {"type": "string"}},
                    {"name": "columnlist", "in": "query", "schema": {"type": "string"}},
                ],
                "responses": {"200": {"description": "PDF file"}},
            }
        },
    }


def build_openapi_spec():
    paths = {}
    paths.update(_resource_paths("student", "Odoo Student", "Student", "StudentInput"))
    paths.update(_resource_paths("class", "Odoo Class", "Class", "ClassInput"))
    paths.update(
        {
            "/api/batch/sync_external": {
                "post": {
                    "tags": ["Batch / Cache / Message"],
                    "summary": "Batch sync du lieu tu MySQL external DB vao Odoo",
                    "responses": {
                        "200": _success_response({"type": "object"}),
                        "400": _error_response(),
                    },
                }
            },
            "/api/cache/clear": {
                "post": {
                    "tags": ["Batch / Cache / Message"],
                    "summary": "Xoa cache API external",
                    "responses": {
                        "200": _success_response({"type": "object"}),
                        "400": _error_response(),
                    },
                }
            },
            "/api/external/classes": {
                "get": {
                    "tags": ["External MySQL"],
                    "summary": "Lay danh sach lop tu MySQL external DB",
                    "responses": {
                        "200": _success_response(
                            {"type": "array", "items": {"$ref": "#/components/schemas/ExternalClass"}}
                        ),
                        "400": _error_response(),
                    },
                }
            },
            "/api/external/classes/{record_id}": {
                "get": {
                    "tags": ["External MySQL"],
                    "summary": "Lay mot lop tu MySQL external DB",
                    "parameters": [
                        {"name": "record_id", "in": "path", "required": True, "schema": {"type": "integer"}}
                    ],
                    "responses": {
                        "200": _success_response({"$ref": "#/components/schemas/ExternalClass"}),
                        "404": _error_response(),
                    },
                }
            },
            "/api/external/students": {
                "get": {
                    "tags": ["External MySQL"],
                    "summary": "Lay danh sach hoc sinh tu MySQL external DB",
                    "responses": {
                        "200": _success_response(
                            {"type": "array", "items": {"$ref": "#/components/schemas/ExternalStudent"}}
                        ),
                        "400": _error_response(),
                    },
                }
            },
            "/api/external/students/{record_id}": {
                "get": {
                    "tags": ["External MySQL"],
                    "summary": "Lay mot hoc sinh tu MySQL external DB",
                    "parameters": [
                        {"name": "record_id", "in": "path", "required": True, "schema": {"type": "integer"}}
                    ],
                    "responses": {
                        "200": _success_response({"$ref": "#/components/schemas/ExternalStudent"}),
                        "404": _error_response(),
                    },
                }
            },
        }
    )
    return {
        "openapi": "3.0.3",
        "info": {
            "title": "Student Class Management API",
            "version": "1.0.0",
            "description": "Swagger UI de test API Odoo va API doc du lieu tu MySQL external DB.",
        },
        "servers": [{"url": "/", "description": "Current Odoo server"}],
        "tags": [
            {"name": "Odoo Student"},
            {"name": "Odoo Class"},
            {"name": "External MySQL"},
            {"name": "Batch / Cache / Message"},
        ],
        "paths": paths,
        "components": {
            "schemas": {
                "RelationValue": _schema(
                    {
                        "id": {"type": "integer", "example": 1},
                        "display_name": {"type": "string", "example": "Odoo Development"},
                    }
                ),
                "Class": _schema(CLASS_FIELDS, ["id", "code", "name", "description"]),
                "ClassInput": _schema(
                    {key: value for key, value in CLASS_FIELDS.items() if key != "id"},
                    ["code", "name", "description"],
                ),
                "Student": _schema(STUDENT_FIELDS, ["id", "code", "fullname", "dob", "email", "class_id", "username", "password"]),
                "StudentInput": _schema(
                    {key: value for key, value in STUDENT_FIELDS.items() if key != "id"},
                    ["code", "fullname", "dob", "email", "class_id", "username", "password"],
                ),
                "ExternalClass": _schema(
                    {
                        **CLASS_FIELDS,
                        "created_at": {"type": "string", "format": "date-time"},
                        "updated_at": {"type": "string", "format": "date-time"},
                    }
                ),
                "ExternalStudent": _schema(
                    {
                        **STUDENT_FIELDS,
                        "class_code": {"type": "string", "example": "CLS001"},
                        "class_name": {"type": "string", "example": "Odoo Development"},
                        "created_at": {"type": "string", "format": "date-time"},
                        "updated_at": {"type": "string", "format": "date-time"},
                    }
                ),
            }
        },
    }


class SwaggerController(http.Controller):
    @http.route("/api/swagger.json", type="http", auth="public", methods=["GET"], csrf=False)
    def swagger_json(self, **params):
        return Response(
            json.dumps(build_openapi_spec(), ensure_ascii=False),
            content_type="application/json; charset=utf-8",
        )

    @http.route("/api/docs", type="http", auth="public", methods=["GET"], csrf=False)
    def swagger_ui(self, **params):
        html = """
        <!doctype html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Student Class Management API Docs</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
        </head>
        <body>
            <div id="swagger-ui"></div>
            <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
            <script>
                window.onload = function () {
                    SwaggerUIBundle({
                        url: "/api/swagger.json",
                        dom_id: "#swagger-ui",
                        deepLinking: true
                    });
                };
            </script>
        </body>
        </html>
        """
        return Response(html, content_type="text/html; charset=utf-8")
