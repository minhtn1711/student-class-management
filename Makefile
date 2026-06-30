ODOO_DIR ?= /Users/minhtn/Projects/odoo
ODOO_DB ?= odoo_test
ADDONS_PATH ?= $(ODOO_DIR)/addons,$(ODOO_DIR)/odoo/addons,/Users/minhtn/cong-ty

.PHONY: dev update install deps infra infra-down simulate rabbitmq-consumer

dev:
	cd $(ODOO_DIR) && . venv/bin/activate && python3 odoo-bin -d $(ODOO_DB) --addons-path=$(ADDONS_PATH) --dev=reload

update:
	cd $(ODOO_DIR) && . venv/bin/activate && python3 odoo-bin -d $(ODOO_DB) -u student_class_management --addons-path=$(ADDONS_PATH) --dev=reload

install:
	cd $(ODOO_DIR) && . venv/bin/activate && python3 odoo-bin -d $(ODOO_DB) -i student_class_management --addons-path=$(ADDONS_PATH) --stop-after-init

deps:
	$(ODOO_DIR)/venv/bin/pip install -r requirements.txt

infra:
	docker compose -f docker-compose.mysql.yml up -d

infra-down:
	docker compose -f docker-compose.mysql.yml down

simulate:
	$(ODOO_DIR)/venv/bin/python scripts/simulate_api_test.py

rabbitmq-consumer:
	$(ODOO_DIR)/venv/bin/python scripts/rabbitmq_consumer.py
