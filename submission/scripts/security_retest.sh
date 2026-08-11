#!/usr/bin/env sh
# Security harden + retest (P9). Re-runs the security-relevant test/grader
# subset and writes an RC-tagged evidence file distinct from test_results.json.
set -eu
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)
cd "$ROOT"
export PYTHONDONTWRITEBYTECODE=1
python3 -B submission/scripts/security_retest.py
