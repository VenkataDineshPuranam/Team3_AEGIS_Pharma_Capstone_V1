# Setup Runbook

Scope: getting from a clean checkout to a verified-working environment. No network access, cloud keys or external services are required — this whole package is stdlib-only and offline-capable by design (`CLAUDE.md` "What this repository is").

## Prerequisites

- Python 3.10+ (`python3 --version`)
- A modern browser, only if you intend to view `submission/app/` (§4)
- No `pip install` of anything is required to run the mandatory setup/run/test/evaluate/reset commands. `submission/tests/` and `submission/evaluation/graders/` are plain `unittest.TestCase` — `pytest` is only ever a convenience runner if you already have it, never a dependency.

## 1. Verify the environment

```sh
submission/scripts/setup.sh
```

Checks the Python version and prints a confirmation that no third-party packages are required. Exits non-zero if Python is older than 3.10.

## 2. Verify package integrity (repo-wide, run from repo root)

```sh
python3 -B tools/verify_package.py
```

Confirms required files exist, no NUL/non-UTF-8 bytes are present, all JSON/CSV parse, and file hashes match `FILE_HASHES.csv` for the immutable challenge trees (`case/`, `data/`, `knowledge/`, `source_documents/`, `evaluation/`, `requirements/`, `starter/`, `templates/`). This is a **repo-root** tool, not a `submission/` tool — it protects the challenge evidence, not this team's own deliverable.

## 3. Run the tests

```sh
submission/scripts/test.sh
```

Runs `submission/tests/` (35 prohibited-action/fail-closed specs) and `submission/evaluation/graders/` (21 grader unit tests) via `python3 -B -m unittest discover`. All 56 must pass.

## 4. Optional: view the offline demonstrator

```sh
submission/scripts/run.sh --serve
```

Serves `submission/app/` at `http://localhost:8000`. Ctrl+C to stop. Without `--serve`, `run.sh` only executes the AI-disabled workflow proof (§ AI_DISABLED.md) and exits.

## Platform limits (documented, not silently worked around)

- Scripts are POSIX `sh` (`#!/usr/bin/env sh`), tested on macOS/Linux. On native Windows, use `run_capstone.ps1` at the repo root for the repo-wide preflight, or run the underlying `python3 -B submission/evaluation/runner.py` / `python3 -B submission/scripts/ai_disabled_offline_demo.py` etc. directly — every `.sh` script is a thin wrapper around a single `python3 -B` invocation and nothing in this package depends on a Unix-only syscall.
- `python -B` / `PYTHONDONTWRITEBYTECODE=1` is used throughout per `AEGIS_PROJECT_PLAN_FINAL.md` non-negotiable constraint 7 — no `__pycache__` should appear after a clean run; if it does, `submission/scripts/reset.sh` removes it.

## Next

- `OPERATIONS.md` — day-to-day run/evaluate/observe
- `INCIDENT.md` — what to do when something goes wrong
- `AI_DISABLED.md` — the manual-mode continuity path
