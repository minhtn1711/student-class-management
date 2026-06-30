import re

from odoo import api, fields, models
from odoo.exceptions import ValidationError


EMAIL_PATTERN = r"^[0-9a-zA-Z._-]+@[0-9a-zA-Z._-]+$"
FACEBOOK_PATTERN = r"^https?://[0-9a-zA-Z._/-]+$"
PASSWORD_PATTERN = r"^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9\s]).{8,}$"


class TraStudent(models.Model):
    _name = "tra.student"
    _description = "Student"
    _table = "tra_student"
    _order = "id desc"
    _rec_name = "fullname"

    code = fields.Char(string="Ma hoc sinh", required=True, size=50)
    fullname = fields.Char(string="Ho va ten", required=True, size=30)
    dob = fields.Date(string="Ngay sinh", required=True, default="2000-02-04")
    sex = fields.Boolean(string="Gioi tinh")
    homecity = fields.Char(string="Que quan", size=100)
    address = fields.Char(string="Dia chi", size=100)
    hobbies = fields.Integer(string="So thich")
    hair_color = fields.Char(string="Mau toc", size=7)
    email = fields.Char(string="Hom thu", required=True, size=256)
    facebook = fields.Char(string="Facebook", size=256)
    class_id = fields.Many2one(
        "tra.class",
        string="Lop quan ly",
        required=True,
        ondelete="restrict",
    )
    username = fields.Char(string="Tai khoan", required=True, size=50)
    password = fields.Char(string="Mat khau", required=True, size=256)
    description = fields.Text(string="Mo ta")
    attachment = fields.Binary(string="Anh the", attachment=True)
    attachment_filename = fields.Char(string="Ten file anh")

    _sql_constraints = [
        ("tra_student_code_unique", "unique(code)", "Ma hoc sinh da ton tai."),
        ("tra_student_email_unique", "unique(email)", "Email da ton tai."),
        ("tra_student_username_unique", "unique(username)", "Tai khoan da ton tai."),
    ]

    @api.constrains("email")
    def _check_email(self):
        for record in self:
            if record.email and not re.match(EMAIL_PATTERN, record.email):
                raise ValidationError("Email khong dung dinh dang.")

    @api.constrains("facebook")
    def _check_facebook(self):
        for record in self:
            if record.facebook and not re.match(FACEBOOK_PATTERN, record.facebook):
                raise ValidationError("Facebook phai bat dau bang http:// hoac https://.")

    @api.constrains("password")
    def _check_password(self):
        for record in self:
            if record.password and not re.match(PASSWORD_PATTERN, record.password):
                raise ValidationError(
                    "Mat khau can toi thieu 8 ky tu, gom chu hoa, chu thuong, so va ky tu dac biet."
                )

    @api.constrains("attachment", "attachment_filename")
    def _check_attachment(self):
        for record in self:
            if not record.attachment:
                continue

            filename = (record.attachment_filename or "").lower()
            allowed_extensions = (".jpg", ".jpeg", ".png")
            if filename and not filename.endswith(allowed_extensions):
                raise ValidationError("Anh the chi chap nhan file jpg, jpeg hoac png.")

            raw_size = len(record.attachment) * 3 / 4
            if raw_size > 5 * 1024 * 1024:
                raise ValidationError("Anh the khong duoc lon hon 5MB.")
