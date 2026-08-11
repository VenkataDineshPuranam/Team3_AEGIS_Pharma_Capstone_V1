#!/usr/bin/env sh
# Export — bundle evidence/, evaluation reports/, and artefacts/ into a
# single timestamped zip under submission/evidence/exports/ (gitignored;
# regenerated on demand, never committed).
set -eu
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)
cd "$ROOT"
export PYTHONDONTWRITEBYTECODE=1

python3 -B submission/scripts/export_evidence.py
