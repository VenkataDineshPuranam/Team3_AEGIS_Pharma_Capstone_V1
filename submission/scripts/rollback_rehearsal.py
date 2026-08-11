#!/usr/bin/env python3
"""Backup/restore + rollback rehearsal (P9 workstream, `AEGIS_PROJECT_
PLAN_FINAL.md` §8.1: owner P3+P5, "Done when: RTO/RPO evidence").

This system has no live database or mutable server-side state — every
workflow response is computed fresh from disclosed CSV/JSON evidence and
`execution_status` never leaves `not_executed` (INV-01/05/06/07). "Backup"
and "rollback" therefore map onto what this architecture actually has:
git history as the backup, and a git-based rollback as the restore path.
This script rehearses that rollback for real, in a disposable clone, and
measures how long it takes (RTO) — it does not assert a number.

RPO (Recovery Point Objective): 0, by construction — there is no window
of unsaved state to lose, because nothing is held in memory between
requests; every commit is a complete, self-consistent snapshot (confirmed
by `tools/hash_submission.py --check` passing on every commit this
session, not just the last one).

Stdlib-only except for calling `git` as a subprocess (git is assumed
present, per the repository itself being a git repo — no additional
runtime dependency introduced). Run from repo root:
    python3 -B submission/scripts/rollback_rehearsal.py
"""
import json
import shutil
import subprocess
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def run(cmd, cwd):
    return subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, check=True)


def main():
    current_commit = run(["git", "rev-parse", "HEAD"], ROOT).stdout.strip()
    previous_commit = run(["git", "rev-parse", "HEAD~1"], ROOT).stdout.strip()

    with tempfile.TemporaryDirectory(prefix="aegis_rollback_") as tmp:
        clone_dir = Path(tmp) / "clone"

        start = time.perf_counter()
        run(["git", "clone", "--quiet", str(ROOT), str(clone_dir)], ROOT)
        run(["git", "checkout", "--quiet", previous_commit], clone_dir)
        checkout_elapsed = time.perf_counter() - start

        # Restore verification: the previous commit's own test suite must
        # still pass in the rolled-back clone — a rollback that doesn't
        # actually restore a working state isn't a real rollback.
        verify_start = time.perf_counter()
        try:
            result = subprocess.run(
                ["python3", "-B", "-m", "unittest", "discover", "-s", "submission/tests", "-t", ".", "-p", "test_*.py"],
                cwd=clone_dir, capture_output=True, text=True, timeout=60,
            )
            tests_passed = result.returncode == 0
        except FileNotFoundError:
            tests_passed = None
        verify_elapsed = time.perf_counter() - verify_start

        total_rto_seconds = checkout_elapsed + verify_elapsed

    report = {
        "run_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "rollback_from_commit": current_commit,
        "rollback_to_commit": previous_commit,
        "rto_seconds": round(total_rto_seconds, 3),
        "rto_breakdown": {
            "clone_and_checkout_seconds": round(checkout_elapsed, 3),
            "test_verification_seconds": round(verify_elapsed, 3),
        },
        "rollback_verified_working": tests_passed,
        "rpo_statement": "0 — no server-side mutable state exists between requests; every commit is a self-consistent, hash-verified snapshot (INV-01/05/06/07: execution_status never leaves not_executed, so no in-flight side effect can be lost)",
        "method": "git clone + checkout HEAD~1 in a disposable temp directory, then run the rolled-back commit's own test suite to confirm it actually still works — not just that the checkout succeeded",
    }

    out_path = ROOT / "submission" / "evidence" / "rollback_rehearsal_report.json"
    out_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0 if tests_passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
