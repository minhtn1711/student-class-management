#!/usr/bin/env bash
set -euo pipefail

ODOO_DIR="${ODOO_DIR:-/Users/minhtn/Projects/odoo}"
ODOO_DB="${ODOO_DB:-odoo_test}"
ADDONS_PATH="${ADDONS_PATH:-${ODOO_DIR}/addons,${ODOO_DIR}/odoo/addons,/Users/minhtn/cong-ty}"

cd "$ODOO_DIR"
source venv/bin/activate
python3 odoo-bin -d "$ODOO_DB" --addons-path="$ADDONS_PATH" --dev=reload
