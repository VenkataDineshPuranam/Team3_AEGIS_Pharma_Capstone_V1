#!/usr/bin/env sh
# Run — execute all three workflows against real fixture data with the
# AI-disabled continuity proof (zero network calls, by construction), then
# optionally serve the offline demonstrator UI.
#
# Usage:
#   submission/scripts/run.sh            # workflow proof only
#   submission/scripts/run.sh --serve    # also serve submission/app/ at :8000
set -eu
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)
cd "$ROOT"
export PYTHONDONTWRITEBYTECODE=1

python3 -B submission/scripts/ai_disabled_offline_demo.py

if [ "${1:-}" = "--serve" ]; then
    echo ""
    echo "Serving submission/app/ at http://localhost:8000 (Ctrl+C to stop)"
    cd submission/app
    exec python3 -B -m http.server 8000
fi
