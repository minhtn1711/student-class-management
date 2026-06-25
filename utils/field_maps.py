CLASS_FIELDS = ["id", "code", "name", "description"]
CLASS_SHORT_FIELDS = {
    "id": "id",
    "co": "code",
    "na": "name",
    "des": "description",
}
CLASS_SEARCH_FIELDS = ["code", "name", "description"]

STUDENT_FIELDS = [
    "id",
    "code",
    "fullname",
    "dob",
    "sex",
    "homecity",
    "address",
    "hobbies",
    "hair_color",
    "email",
    "facebook",
    "class_id",
    "username",
    "password",
    "description",
    "attachment_filename",
]
STUDENT_SHORT_FIELDS = {
    "id": "id",
    "co": "code",
    "fu": "fullname",
    "do": "dob",
    "se": "sex",
    "ho": "homecity",
    "ad": "address",
    "hobbies": "hobbies",
    "hc": "hair_color",
    "em": "email",
    "fa": "facebook",
    "cl": "class_id",
    "us": "username",
    "pa": "password",
    "des": "description",
    "att": "attachment_filename",
}
STUDENT_SEARCH_FIELDS = ["fullname", "description", "email"]


RESOURCE_CONFIGS = {
    "class": {
        "model": "tra.class",
        "fields": CLASS_FIELDS,
        "short_fields": CLASS_SHORT_FIELDS,
        "search_fields": CLASS_SEARCH_FIELDS,
    },
    "classes": {
        "model": "tra.class",
        "fields": CLASS_FIELDS,
        "short_fields": CLASS_SHORT_FIELDS,
        "search_fields": CLASS_SEARCH_FIELDS,
    },
    "tra_class": {
        "model": "tra.class",
        "fields": CLASS_FIELDS,
        "short_fields": CLASS_SHORT_FIELDS,
        "search_fields": CLASS_SEARCH_FIELDS,
    },
    "student": {
        "model": "tra.student",
        "fields": STUDENT_FIELDS,
        "short_fields": STUDENT_SHORT_FIELDS,
        "search_fields": STUDENT_SEARCH_FIELDS,
    },
    "students": {
        "model": "tra.student",
        "fields": STUDENT_FIELDS,
        "short_fields": STUDENT_SHORT_FIELDS,
        "search_fields": STUDENT_SEARCH_FIELDS,
    },
    "tra_student": {
        "model": "tra.student",
        "fields": STUDENT_FIELDS,
        "short_fields": STUDENT_SHORT_FIELDS,
        "search_fields": STUDENT_SEARCH_FIELDS,
    },
}
