#!/usr/bin/env sh
# Reset — remove generated/derived artifacts only (bytecode caches, prior
# evaluation reports, prior evidence exports). Never touches source code,
# challenge evidence, or submission_manifest.csv/file_hashes.csv/
# test_results.json/evaluation_results.json (those are evidence, not
# caches — regenerate them explicitly, they are not silently rebuilt here).
set -eu
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)
cd "$ROOT"
export PYTHONDONTWRITEBYTECODE=1

python3 -B submission/scripts/reset_generated.py
