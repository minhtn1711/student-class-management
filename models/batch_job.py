from odoo import models

from ..services import batch_service


class TraBatchJob(models.AbstractModel):
    _name = "tra.batch.job"
    _description = "Student Class Batch Job"

    def cron_sync_external_to_odoo(self):
        batch_service.sync_external_to_odoo(self.env)
