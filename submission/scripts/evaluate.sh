#!/usr/bin/env sh
# Evaluate — run the P6 TEVV harness (12 suites, 21 scenarios) and
# regenerate submission/evaluation/reports/. Non-zero exit iff a
# regression scenario (real submission/src code) trips a release gate.
set -eu
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)
cd "$ROOT"
export PYTHONDONTWRITEBYTECODE=1

python3 -B submission/evaluation/runner.py
echo "Report set: submission/evaluation/reports/{summary.json,detailed_results.jsonl,scorecard.csv,failed_cases.json,final_evaluation_report.md}"
