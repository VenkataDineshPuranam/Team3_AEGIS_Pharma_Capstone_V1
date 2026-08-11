#!/usr/bin/env sh
# Test — run all deterministic + adversarial specs. Stdlib-only: uses
# unittest discover, not pytest, so this reproduces on a clean machine
# with no third-party packages installed.
set -eu
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)
cd "$ROOT"
export PYTHONDONTWRITEBYTECODE=1

echo "=== submission/tests (Phase 4/5 prohibited-action + fail-closed specs) ==="
python3 -B -m unittest discover -s submission/tests -t . -p "test_*.py" -v

echo ""
echo "=== submission/evaluation/graders (Phase 6 grader unit tests) ==="
python3 -B -m unittest discover -s submission/evaluation/graders -t . -p "test_*.py" -v
