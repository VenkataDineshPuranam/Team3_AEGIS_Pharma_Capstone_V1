#!/usr/bin/env python3
"""Remove generated/derived artifacts (bytecode caches, prior evaluation
reports) so the next `evaluate.sh` run regenerates them from scratch — a
"reset" for reproducibility checks, never a deletion of source code or of
disclosed challenge/evidence files. Never touches anything outside
`submission/`."""
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SUBMISSION = ROOT / "submission"


def main():
    removed = []
    for cache_dir in SUBMISSION.rglob("__pycache__"):
        shutil.rmtree(cache_dir)
        removed.append(str(cache_dir.relative_to(ROOT)))
    for cache_dir in SUBMISSION.rglob(".pytest_cache"):
        shutil.rmtree(cache_dir)
        removed.append(str(cache_dir.relative_to(ROOT)))
    # Only the machine-regenerated report files — never
    # final_evaluation_report.md, which is a hand-curated deliverable
    # runner.py does not (and should not) overwrite.
    reports_dir = SUBMISSION / "evaluation" / "reports"
    machine_generated = {"summary.json", "detailed_results.jsonl", "scorecard.csv", "failed_cases.json"}
    if reports_dir.exists():
        for f in reports_dir.iterdir():
            if f.is_file() and f.name in machine_generated:
                f.unlink()
                removed.append(str(f.relative_to(ROOT)))
    exports_dir = SUBMISSION / "evidence" / "exports"
    if exports_dir.exists():
        shutil.rmtree(exports_dir)
        removed.append(str(exports_dir.relative_to(ROOT)))

    print(f"Removed {len(removed)} generated path(s):")
    for r in removed:
        print(f"  - {r}")
    print("\nNote: submission/evidence/{submission_manifest.csv,file_hashes.csv,")
    print("test_results.json,evaluation_results.json} are NOT source — regenerate")
    print("with evaluate.sh / test.sh / tools/hash_submission.py before the next")
    print("`--final` structure check. submission/evaluation/reports/")
    print("final_evaluation_report.md is a hand-curated deliverable and is never")
    print("removed by this script.")


if __name__ == "__main__":
    main()
