#!/usr/bin/env sh
# Run — execute all three workflows against real fixture data with the
# AI-disabled continuity proof (zero network calls, by construction), then
# optionally serve the offline demonstrator UI.
#
# Usage:
#   submission/scripts/run.sh            # workflow proof only
#   submission/scripts/run.sh --serve    # also serve submission/app/ at :8000
#
# Kill switch (P9 workstream, AEGIS_PROJECT_PLAN_FINAL.md §8.1 "Support
# runbooks ... kill switch"): if submission/evidence/KILL_SWITCH exists,
# or AEGIS_KILL_SWITCH=1 is set, this script refuses to run anything and
# exits non-zero. This system has no live server/daemon to "kill" — it is
# a stateless CLI + static-file app — so the honest equivalent of a kill
# switch is a single, obvious, file-or-env gate every entry point checks
# before doing anything else. See submission/runbooks/INCIDENT.md.
set -eu
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)
cd "$ROOT"
export PYTHONDONTWRITEBYTECODE=1

if [ "${AEGIS_KILL_SWITCH:-0}" = "1" ] || [ -f "submission/evidence/KILL_SWITCH" ]; then
    echo "KILL SWITCH ACTIVE — refusing to run. Remove submission/evidence/KILL_SWITCH" >&2
    echo "or unset AEGIS_KILL_SWITCH to resume. See submission/runbooks/INCIDENT.md." >&2
    exit 1
fi

python3 -B submission/scripts/ai_disabled_offline_demo.py

if [ "${1:-}" = "--serve" ]; then
    echo ""
    echo "Serving submission/app/ at http://localhost:8000 (Ctrl+C to stop)"
    cd submission/app
    exec python3 -B -m http.server 8000
fi
