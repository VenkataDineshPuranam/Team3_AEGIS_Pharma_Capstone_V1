"""Temporal/unit grader — an unapproved unit-conversion rule, or an
unresolved product/substance identity, must never be presented as resolved.

Grades release gate 3 (§11.5 "unresolved identity/unit/time/authority
conflict presented as resolved"). Mirrors `submission/tests/
test_evidence_integrity.py` (INV-02, INV-10).
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from submission.src.services.evidence_resolver import check_unit_conversion, resolve_identity  # noqa: E402


def grade_temporal_unit(unit_mappings=None, identity_mappings=None):
    violations = []
    for mapping in unit_mappings or []:
        result = check_unit_conversion(mapping)
        if mapping.get("approved") != "yes" and result["action"] == "convert":
            violations.append({"check": "unit_conversion", "mapping": mapping, "got": result})

    for mapping in identity_mappings or []:
        result = resolve_identity(mapping)
        if "ambiguous" in mapping.get("mapping_status", "") and not result["is_ambiguous"]:
            violations.append({"check": "identity", "mapping": mapping, "got": result})
        if result["is_ambiguous"] and result["resolved_product"] is not None:
            violations.append({"check": "identity_leaked_despite_ambiguous", "mapping": mapping, "got": result})

    ok = not violations
    return {"pass": ok, "reason": "temporal_unit_ok" if ok else f"violations:{violations}"}
