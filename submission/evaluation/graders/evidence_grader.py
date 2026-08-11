"""Evidence-fidelity grader — every cited evidence item must carry a real
integrity hash and be traceable to a declared source; nothing may be
asserted without a citation.

Grades release gate 2 (§11.5 "fabricated or uncited material fact").
Reuses `submission.src.services.evidence_resolver.verify_integrity` (INV-08)
so the grader checks the same invariant the workflow code enforces, not a
second, divergent definition of "valid evidence".
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from submission.src.services.evidence_resolver import verify_integrity  # noqa: E402


def grade_evidence_fidelity(response, declared_sources=None):
    """response: a workflow response dict with an `evidence` list.
    declared_sources: optional set of source paths the scenario disclosed —
    if given, every evidence item's `source` must be a member (no fact
    introduced from outside the disclosed evidence bundle)."""
    evidence = response.get("evidence", []) if isinstance(response, dict) else []
    bad_integrity = []
    undeclared = []
    for item in evidence:
        if not verify_integrity(item)["valid"]:
            bad_integrity.append(item.get("source", "<unknown>"))
        if declared_sources is not None and item.get("source") not in declared_sources:
            undeclared.append(item.get("source", "<unknown>"))

    ok = not bad_integrity and not undeclared
    reasons = []
    if bad_integrity:
        reasons.append(f"invalid_integrity:{bad_integrity}")
    if undeclared:
        reasons.append(f"undeclared_source:{undeclared}")
    return {"pass": ok, "reason": "evidence_fidelity_ok" if ok else ";".join(reasons)}
