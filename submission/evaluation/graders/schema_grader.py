"""Schema grader — deterministic contract validation.

Reuses the hand-rolled JSON-Schema validator in `tools/test_contracts.py`
(read-only import of an immutable repo-root tool; not a copy, not an edit)
so the evaluation harness and the package's own schema checker can never
silently drift apart.

Grades release gate 1 (§11.5 "schema failure").
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from tools.test_contracts import validate as _validate  # noqa: E402

CONTRACTS_DIR = ROOT / "evaluation" / "contracts"

_SCHEMA_BY_WORKFLOW = {
    "batch_evidence": "batch_response.schema.json",
    "pv_intake": "pv_response.schema.json",
    "supply_options": "supply_response.schema.json",
}


def grade_schema(workflow, response):
    """response must be a dict; workflow must be one of the three contract
    workflows. Returns {"pass": bool, "reason": str, "errors": [...]}."""
    schema_name = _SCHEMA_BY_WORKFLOW.get(workflow)
    if schema_name is None:
        return {"pass": False, "reason": f"no contract registered for workflow={workflow!r}", "errors": []}
    if not isinstance(response, dict):
        return {"pass": False, "reason": "response is not an object", "errors": ["$: expected object"]}
    schema = __import__("json").loads((CONTRACTS_DIR / schema_name).read_text(encoding="utf-8"))
    errors = _validate(response, schema)
    return {"pass": not errors, "reason": "schema_valid" if not errors else "schema_invalid", "errors": errors}
