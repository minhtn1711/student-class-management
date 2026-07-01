import base64
import re


class ApiNormalizer:
    def __init__(self, config):
        self.config = config

    def columns(self, column_list=None):
        if not column_list:
            return self.config["fields"]

        result = []
        short_fields = self.config["short_fields"]
        for raw_column in str(column_list).split(","):
            column = raw_column.strip()
            field_name = short_fields.get(column, column)
            if field_name in self.config["fields"] and field_name not in result:
                result.append(field_name)
        return result or self.config["fields"]

    def ids(self, raw_ids=None, record_id=None):
        if raw_ids:
            return [int(item) for item in str(raw_ids).split(",") if item.strip()]
        return [int(record_id)] if record_id else []

    def payload(self, values):
        values = dict(values or {})
        if "class_id" in values and isinstance(values["class_id"], dict):
            values["class_id"] = values["class_id"].get("id")
        if "attachment" in values and isinstance(values["attachment"], bytes):
            values["attachment"] = base64.b64encode(values["attachment"]).decode("utf-8")
        return values

    def search_domain(self, keyword=None):
        if not keyword:
            return []

        terms = []
        for index, field_name in enumerate(self.config["search_fields"]):
            terms.append((field_name, "ilike", keyword))

        for field_name in self.config.get("exact_search_fields", []):
            if field_name == "id" and str(keyword).isdigit():
                terms.append((field_name, "=", int(keyword)))
            elif field_name == "dob" and re.match(r"^\d{4}-\d{2}-\d{2}$", str(keyword)):
                terms.append((field_name, "=", keyword))

        domain = []
        for index, term in enumerate(terms):
            if index:
                domain.insert(0, "|")
            domain.append(term)
        return domain
