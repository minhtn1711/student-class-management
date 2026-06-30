ODOO_DIR ?= /Users/minhtn/Projects/odoo
ODOO_DB ?= odoo_test
ODOO_MODULE ?= student_class_management
BACKEND_DIR := backend
FRONTEND_DIR := frontend
ADDONS_PATH ?= $(ODOO_DIR)/addons,$(ODOO_DIR)/odoo/addons,$(abspath $(CURDIR)/..)

.PHONY: dev update install deps infra infra-down simulate sync-db rabbitmq-consumer fe-dev fe-build

dev:
	cd $(ODOO_DIR) && . venv/bin/activate && python3 odoo-bin -d $(ODOO_DB) --addons-path=$(ADDONS_PATH) --dev=reload

update:
	cd $(ODOO_DIR) && . venv/bin/activate && python3 odoo-bin -d $(ODOO_DB) -u $(ODOO_MODULE) --addons-path=$(ADDONS_PATH) --dev=reload

install:
	cd $(ODOO_DIR) && . venv/bin/activate && python3 odoo-bin -d $(ODOO_DB) -i $(ODOO_MODULE) --addons-path=$(ADDONS_PATH) --stop-after-init

deps:
	$(ODOO_DIR)/venv/bin/pip install -r $(BACKEND_DIR)/requirements.txt

infra:
	docker compose -f $(BACKEND_DIR)/docker-compose.mysql.yml up -d

infra-down:
	docker compose -f $(BACKEND_DIR)/docker-compose.mysql.yml down

simulate:
	$(ODOO_DIR)/venv/bin/python $(BACKEND_DIR)/scripts/simulate_api_test.py

sync-db:
	curl -X POST http://localhost:8069/api/batch/sync_all

rabbitmq-consumer:
	$(ODOO_DIR)/venv/bin/python $(BACKEND_DIR)/scripts/rabbitmq_consumer.py

fe-dev:
	cd $(FRONTEND_DIR) && npm run dev

fe-build:
	cd $(FRONTEND_DIR) && npm run build
