#!/usr/bin/env sh
# Accessibility smoke (P9). Static structural checks against submission/app
# for keyboard reachability, ARIA roles, and safe-DOM rendering.
set -eu
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)
cd "$ROOT"
export PYTHONDONTWRITEBYTECODE=1
python3 -B submission/scripts/accessibility_smoke.py
