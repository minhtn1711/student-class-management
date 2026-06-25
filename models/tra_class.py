from odoo import fields, models


class TraClass(models.Model):
    _name = "tra.class"
    _description = "Class"
    _table = "tra_class"
    _order = "id desc"
    _rec_name = "name"

    code = fields.Char(string="Ma lop", required=True, size=50)
    name = fields.Char(string="Ten lop", required=True, size=100)
    description = fields.Text(string="Mo ta", required=True)

    _sql_constraints = [
        ("tra_class_code_unique", "unique(code)", "Ma lop da ton tai."),
    ]
