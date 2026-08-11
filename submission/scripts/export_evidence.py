#!/usr/bin/env python3
"""Evidence export — bundles submission/evidence/, submission/evaluation/
reports/, and submission/artefacts/ into a single timestamped zip for an
inspector who wants everything in one file, per DEFINITION_OF_DONE.md §3
("Reproducible setup, run, test, evaluate, reset and evidence-export
commands exist.").

Output goes to submission/evidence/exports/ (gitignored — a generated
deliverable, not source; regenerate on demand, never hand-edit)."""
import zipfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SUBMISSION = ROOT / "submission"
EXPORT_DIR = SUBMISSION / "evidence" / "exports"

INCLUDE_DIRS = [
    SUBMISSION / "evidence",
    SUBMISSION / "evaluation" / "reports",
    SUBMISSION / "artefacts",
]


def main():
    EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    out_path = EXPORT_DIR / f"aegis_evidence_export_{stamp}.zip"

    count = 0
    with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for d in INCLUDE_DIRS:
            if not d.exists():
                continue
            for f in sorted(d.rglob("*")):
                if f.is_file() and "exports" not in f.parts:
                    zf.write(f, f.relative_to(ROOT).as_posix())
                    count += 1

    print(f"Wrote {count} files to {out_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
