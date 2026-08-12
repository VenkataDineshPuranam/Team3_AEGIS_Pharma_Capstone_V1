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

CONTRACTS_DIR = ROOT / "evaluation" / "contracts"  # immutable — the 3 mandated workflows
SUBMISSION_CONTRACTS_DIR = ROOT / "submission" / "evaluation" / "contracts"  # submission-owned — additional/optional workflows

_SCHEMA_BY_WORKFLOW = {
    "batch_evidence": (CONTRACTS_DIR, "batch_response.schema.json"),
    "pv_intake": (CONTRACTS_DIR, "pv_response.schema.json"),
    "supply_options": (CONTRACTS_DIR, "supply_response.schema.json"),
    # Workflow D — additional, optional scope, not one of the three mandated
    # workflows. See submission/artefacts/WORKFLOW_D_CLINICAL_TRIAL_CONTEXT.md.
    "clinical_trial_context": (SUBMISSION_CONTRACTS_DIR, "clinical_response.schema.json"),
    # Workflow E — additional, optional scope, not one of the three mandated
    # workflows. See submission/artefacts/WORKFLOW_E_DISCOVERY_TRANSLATIONAL_SCIENCE.md.
    "discovery_translational_science": (SUBMISSION_CONTRACTS_DIR, "discovery_response.schema.json"),
}


def grade_schema(workflow, response):
    """response must be a dict; workflow must be a registered contract
    workflow. Returns {"pass": bool, "reason": str, "errors": [...]}."""
    entry = _SCHEMA_BY_WORKFLOW.get(workflow)
    if entry is None:
        return {"pass": False, "reason": f"no contract registered for workflow={workflow!r}", "errors": []}
    if not isinstance(response, dict):
        return {"pass": False, "reason": "response is not an object", "errors": ["$: expected object"]}
    contracts_dir, schema_name = entry
    schema = __import__("json").loads((contracts_dir / schema_name).read_text(encoding="utf-8"))
    errors = _validate(response, schema)
    return {"pass": not errors, "reason": "schema_valid" if not errors else "schema_invalid", "errors": errors}
