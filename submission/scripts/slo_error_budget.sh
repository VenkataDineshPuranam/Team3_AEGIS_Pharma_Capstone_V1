#!/usr/bin/env sh
# Observability & SLOs (P9). Appends the latest evaluation run to the SLO
# history and reports error-budget consumption against the declared
# >=99.5% release-gate-pass SLO. Run evaluate.sh first for a fresh summary.
set -eu
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)
cd "$ROOT"
export PYTHONDONTWRITEBYTECODE=1
python3 -B submission/scripts/slo_error_budget.py
