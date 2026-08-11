#!/usr/bin/env sh
# Setup — verify the environment. Stdlib-only, offline: nothing to install.
# Per submission/runbooks/SETUP.md. Run from repo root or from anywhere;
# resolves its own location either way.
set -eu
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)
cd "$ROOT"
export PYTHONDONTWRITEBYTECODE=1

python3 -B - <<'PY'
import sys
if sys.version_info < (3, 10):
    print(f"FAIL — Python 3.10+ required, found {sys.version.split()[0]}")
    raise SystemExit(1)
print(f"PASS — Python {sys.version.split()[0]} (>=3.10)")
print("PASS — no third-party packages required for setup/run/test/evaluate/reset")
print("       (submission/tests and submission/evaluation/graders are stdlib")
print("        unittest.TestCase; pytest is used only as a convenience runner")
print("        if already installed, never a requirement)")
PY

echo "PASS — setup complete. Next: submission/scripts/test.sh, then run.sh / evaluate.sh"
