import json

from odoo.http import Response


def json_response(payload, status=200):
    return Response(
        json.dumps(payload, ensure_ascii=False, default=str),
        status=status,
        content_type="application/json; charset=utf-8",
    )


def ok(data=None, message="Success", status=200):
    return json_response(
        {
            "success": True,
            "message": message,
            "data": data,
        },
        status=status,
    )


def fail(message="Error", status=400, errors=None):
    payload = {
        "success": False,
        "message": message,
    }
    if errors:
        payload["errors"] = errors
    return json_response(payload, status=status)
