#!/usr/bin/env bash
set -euo pipefail

ODOO_DIR="${ODOO_DIR:-/Users/minhtn/Projects/odoo}"
ODOO_DB="${ODOO_DB:-odoo_test}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
PROJECT_DIR="$(cd "${BACKEND_DIR}/.." && pwd)"
PROJECT_PARENT="$(cd "${PROJECT_DIR}/.." && pwd)"
ADDONS_PATH="${ADDONS_PATH:-${ODOO_DIR}/addons,${ODOO_DIR}/odoo/addons,${PROJECT_PARENT}}"

cd "$ODOO_DIR"
source venv/bin/activate
python3 odoo-bin -d "$ODOO_DB" --addons-path="$ADDONS_PATH" --dev=reload
