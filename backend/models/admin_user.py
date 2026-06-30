import hashlib

from odoo import fields, models


PASSWORD_SALT = "student-admin"
PASSWORD_ITERATIONS = 120000


class TraAdminUser(models.Model):
    _name = "tra.admin.user"
    _description = "Admin User"
    _table = "tra_admin_user"
    _order = "id desc"
    _rec_name = "name"

    name = fields.Char(string="Ho ten", required=True, size=100)
    email = fields.Char(string="Email", required=True, size=256)
    password_hash = fields.Char(string="Mat khau hash", required=True, size=256)
    active = fields.Boolean(string="Hoat dong", default=True)

    _sql_constraints = [
        ("tra_admin_user_email_unique", "unique(email)", "Email admin da ton tai."),
    ]

    def check_password(self, password):
        self.ensure_one()
        return self.password_hash == self.hash_password(password)

    @staticmethod
    def hash_password(password):
        return hashlib.pbkdf2_hmac(
            "sha256",
            (password or "").encode("utf-8"),
            PASSWORD_SALT.encode("utf-8"),
            PASSWORD_ITERATIONS,
        ).hex()
