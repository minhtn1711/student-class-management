class ApiSerializer:
    def __init__(self, fields):
        self.fields = fields

    def record(self, record):
        data = {}
        for field_name in self.fields:
            value = record[field_name]
            data[field_name] = self.value(value)
        return data

    def records(self, records):
        return [self.record(record) for record in records]

    def row(self, record):
        return [self.flat_value(record[field_name]) for field_name in self.fields]

    def rows(self, records):
        return [self.row(record) for record in records]

    def value(self, value):
        if hasattr(value, "id"):
            return {
                "id": value.id,
                "display_name": value.display_name,
            } if value else False
        return value

    def flat_value(self, value):
        if hasattr(value, "id"):
            return value.display_name if value else ""
        return value
