#!/usr/bin/env sh
# Performance/budget soak (P9). Runs all 3 workflows 200x each (override
# with an argument) and confirms zero execution_status drift + p99 latency
# within the declared budget.
set -eu
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)
cd "$ROOT"
export PYTHONDONTWRITEBYTECODE=1
python3 -B submission/scripts/soak_test.py "${1:-200}"
