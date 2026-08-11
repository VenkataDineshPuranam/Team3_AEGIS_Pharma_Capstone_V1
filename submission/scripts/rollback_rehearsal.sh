#!/usr/bin/env sh
# Backup/restore + rollback rehearsal (P9). Clones the repo to a disposable
# temp directory, checks out the previous commit, and re-runs its tests to
# prove the rollback target actually works — records real RTO, states RPO.
set -eu
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)
cd "$ROOT"
export PYTHONDONTWRITEBYTECODE=1
python3 -B submission/scripts/rollback_rehearsal.py
