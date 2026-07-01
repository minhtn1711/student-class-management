#!/usr/bin/env python3
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request


BASE_URL = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else "http://localhost:8069"


def request(method, path, payload=None, query=None):
    url = BASE_URL + path
    if query:
        url += "?" + urllib.parse.urlencode(query)

    data = None
    headers = {"Accept": "application/json"}
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            body = response.read()
            content_type = response.headers.get("Content-Type", "")
            if "application/json" in content_type:
                return response.status, json.loads(body.decode("utf-8"))
            return response.status, {"bytes": len(body), "content_type": content_type}
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8")
        try:
            return exc.code, json.loads(body)
        except ValueError:
            return exc.code, {"error": body}


def print_step(name, status, body):
    print(f"\n{name}: HTTP {status}")
    print(json.dumps(body, ensure_ascii=False, indent=2, default=str))


def main():
    suffix = str(int(time.time()))

    steps = [
        ("External classes", "GET", "/api/external/classes", None, None),
        ("External students", "GET", "/api/external/students", None, None),
        ("Batch sync external to Odoo", "POST", "/api/batch/sync_external", {}, None),
    ]

    for name, method, path, payload, query in steps:
        status, body = request(method, path, payload, query)
        print_step(name, status, body)

    class_payload = {
        "code": f"CLS{suffix[-6:]}",
        "name": f"Simulation Class {suffix}",
        "description": "Class tao boi simulation test",
    }
    status, class_body = request("POST", "/api/class/create", class_payload)
    print_step("Create Odoo class", status, class_body)
    class_id = class_body.get("data", {}).get("id")

    student_payload = {
        "code": f"STU{suffix[-6:]}",
        "fullname": "Simulation Student",
        "dob": "2001-02-14",
        "sex": True,
        "homecity": "Ha Noi",
        "address": "Cau Giay",
        "hobbies": "Doc sach, bong da",
        "hair_color": "#000000",
        "email": f"simulation{suffix}@example.com",
        "facebook": f"https://facebook.com/simulation{suffix}",
        "class_id": class_id,
        "username": f"simulation{suffix}",
        "password": "Password@123",
        "description": "Hoc sinh tao boi simulation test",
    }
    status, student_body = request("POST", "/api/student/create", student_payload)
    print_step("Create Odoo student", status, student_body)
    student_id = student_body.get("data", {}).get("id")

    test_calls = [
        ("List Odoo students", "GET", "/api/student", None, {"columnlist": "id,co,fu,em,cl"}),
        ("Get Odoo student by id", "GET", f"/api/student/get_by_id/{student_id}", None, None),
        (
            "Update Odoo student",
            "PUT",
            f"/api/student/update/{student_id}",
            {"description": "Da update boi simulation test"},
            None,
        ),
        ("Export Odoo students Excel", "GET", "/api/student/export", None, {"idlist": student_id or ""}),
    ]

    for name, method, path, payload, query in test_calls:
        status, body = request(method, path, payload, query)
        print_step(name, status, body)


if __name__ == "__main__":
    main()
