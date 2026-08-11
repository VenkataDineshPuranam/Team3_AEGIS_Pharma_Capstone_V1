"""Evaluation adapter — connects the runner to (a) the three real
`submission/src/workflows/*` implementations and (b) the unmodified
`starter/legacy_pharma.py` brownfield baseline, and captures the
trajectory metrics AEGIS_PROJECT_PLAN_FINAL.md §11.8 requires: input,
final output, evidence used, tools called, retries, errors, approvals,
side effects, latency.

DECISION (labelled per CLAUDE.md label discipline): public fixtures under
`evaluation/public_fixtures/` carry raw, disclosed evidence records, not
pre-shaped `evidence_item` contract objects (`evaluation/contracts/
evidence_item.schema.json` requires `record_id`/`authority`/`effective_at`/
`retrieved_at`/`facts` that the fixture does not supply pre-formed — the
challenge is deliberately unshaped, `expected_answer_included: false`).
`shape_evidence_item` below is this harness's own interpretation of that
raw evidence into the contract shape; every value it emits is traced 1:1
back to the fixture (sha256, source, record content) — nothing is invented.
Where the fixture doesn't disclose an `authority` or `effective_at`, that
field is set to `None`/`"undisclosed"` rather than guessed, so a downstream
grader can see the gap instead of a fabricated resolution.
"""
import re
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
if str(ROOT / "starter") not in sys.path:
    sys.path.insert(0, str(ROOT / "starter"))

from submission.src.workflows.batch_evidence import assemble_batch_response  # noqa: E402
from submission.src.workflows.pv_intake import assemble_pv_response  # noqa: E402
from submission.src.workflows.supply_options import assemble_supply_response  # noqa: E402
from submission.src.workflows.clinical_trial_context import assemble_clinical_response  # noqa: E402

_EFFECTIVE_DATE_RE = re.compile(r"Effective date:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})")
_AUTHORITY_RE = re.compile(r"(?:Synthetic authority|Owner):\s*(.+)")


def shape_evidence_item(block, as_of, index):
    """Reshape one raw fixture evidence block into an evidence_item-contract
    object. See module docstring DECISION note."""
    source = block.get("source", "")
    text = block.get("text")
    authority_match = _AUTHORITY_RE.search(text) if text else None
    effective_match = _EFFECTIVE_DATE_RE.search(text) if text else None
    facts = {"records": block.get("records")} if "records" in block else {"text_excerpt": (text or "")[:500]}
    return {
        "source": source,
        "record_id": f"{Path(source).stem}-{index}",
        "authority": authority_match.group(1).strip() if authority_match else "undisclosed",
        "effective_at": f"{effective_match.group(1)}T00:00:00Z" if effective_match else None,
        "retrieved_at": as_of,
        "facts": facts,
        "integrity": {"sha256": block.get("sha256", ""), "source_preserved": True},
    }


def _records_from(fixture, source_suffix):
    for block in fixture.get("evidence", []):
        if block.get("source", "").endswith(source_suffix):
            return block.get("records", [])
    return []


def _timed(fn, *args, **kwargs):
    start = time.perf_counter()
    result = fn(*args, **kwargs)
    latency_ms = (time.perf_counter() - start) * 1000.0
    return result, latency_ms


# ---------------------------------------------------------------------------
# Regression path: real submission/src workflows
# ---------------------------------------------------------------------------

def run_batch_scenario(fixture, entitlement=None):
    as_of = fixture["authorized_context"]["as_of"]
    evidence_items = [shape_evidence_item(b, as_of, i) for i, b in enumerate(fixture.get("evidence", []))]
    oos = _records_from(fixture, "oos_investigations.csv")
    lab_states = None
    if oos:
        row = oos[0]
        lab_states = {"lims_state": row.get("lims_state"), "stats_state": row.get("stats_state"), "notebook_state": row.get("notebook_state")}
    request = {
        "request_id": fixture["scenario"]["id"],
        "batch_id": (fixture.get("evidence_references") or [""])[0],
        "as_of": as_of,
        "authorization": {"purpose": fixture["authorized_context"]["purpose"]},
        "entitlement": entitlement or {"user": fixture["authorized_context"]["user"], "iam_state": "active"},
        "evidence": evidence_items,
        "lab_states": lab_states,
    }
    output, latency_ms = _timed(assemble_batch_response, request)
    return {
        "scenario_id": fixture["scenario"]["id"], "workflow": "batch_evidence",
        "input": request, "output": output, "latency_ms": latency_ms,
        "tools_called": [], "retries": 0, "errors": [], "approvals": [output.get("human_review")],
        "side_effects": [], "evidence_used": [e["source"] for e in evidence_items],
    }


def run_pv_scenario(fixture, entitlement=None):
    as_of = fixture["authorized_context"]["as_of"]
    evidence_items = [shape_evidence_item(b, as_of, i) for i, b in enumerate(fixture.get("evidence", []))]
    dup_rows = _records_from(fixture, "duplicate_candidates.csv")
    duplicate_pairs = [{"case_a": r["case_a"], "case_b": r["case_b"], "similarity": float(r["similarity"])} for r in dup_rows]
    case_ids = sorted({r["case_id"] for r in _records_from(fixture, "icsr_cases.csv")}) or [fixture["scenario"]["id"]]
    request = {
        "request_id": fixture["scenario"]["id"],
        "case_ids": case_ids,
        "as_of": as_of,
        "authorization": {"purpose": fixture["authorized_context"]["purpose"]},
        "entitlement": entitlement or {"user": fixture["authorized_context"]["user"], "iam_state": "active"},
        "evidence": evidence_items,
        "duplicate_pairs": duplicate_pairs,
    }
    output, latency_ms = _timed(assemble_pv_response, request)
    return {
        "scenario_id": fixture["scenario"]["id"], "workflow": "pv_intake",
        "input": request, "output": output, "latency_ms": latency_ms,
        "tools_called": [], "retries": 0, "errors": [], "approvals": [output.get("human_review")],
        "side_effects": [], "evidence_used": [e["source"] for e in evidence_items],
    }


def run_supply_scenario(fixture, entitlement=None):
    as_of = fixture["authorized_context"]["as_of"]
    evidence_items = [shape_evidence_item(b, as_of, i) for i, b in enumerate(fixture.get("evidence", []))]
    inventory = _records_from(fixture, "inventory.csv")
    request = {
        "request_id": fixture["scenario"]["id"],
        "event_id": fixture["scenario"]["id"],
        "as_of": as_of,
        "authorization": {"purpose": fixture["authorized_context"]["purpose"]},
        "entitlement": entitlement or {"user": fixture["authorized_context"]["user"], "iam_state": "active"},
        "evidence": evidence_items,
        "inventory": inventory,
    }
    output, latency_ms = _timed(assemble_supply_response, request)
    return {
        "scenario_id": fixture["scenario"]["id"], "workflow": "supply_options",
        "input": request, "output": output, "latency_ms": latency_ms,
        "tools_called": [], "retries": 0, "errors": [], "approvals": [output.get("human_review")],
        "side_effects": [], "evidence_used": [e["source"] for e in evidence_items],
    }


def run_clinical_scenario(fixture, entitlement=None):
    """Workflow D — ADDITIONAL, OPTIONAL SCOPE. See
    submission/artefacts/WORKFLOW_D_CLINICAL_TRIAL_CONTEXT.md."""
    as_of = fixture["authorized_context"]["as_of"]
    evidence_items = [shape_evidence_item(b, as_of, i) for i, b in enumerate(fixture.get("evidence", []))]
    subjects = _records_from(fixture, "subjects.csv")
    subject_id = subjects[0]["subject_id"] if subjects else ""
    trial_id = subjects[0]["trial_id"] if subjects else ""
    site_id = subjects[0]["site_id"] if subjects else ""

    elig_rows = _records_from(fixture, "eligibility_evidence.csv")
    eligibility_evidence = None
    if elig_rows:
        row = elig_rows[0]
        eligibility_evidence = {
            "test": row["test"], "value": float(row["value"]),
            "central_uln": float(row["central_uln"]), "local_uln": float(row["local_uln"]),
            "edc_rule_uln": float(row["edc_rule_uln"]),
        }

    site_approvals = _records_from(fixture, "site_approvals.csv")
    protocol_versions = _records_from(fixture, "protocol_versions.csv")
    protocol_context = None
    site_approved = next((r["approved_protocol"] for r in site_approvals if r["site_id"] == site_id), None)
    global_current = next((r["version"] for r in protocol_versions if r.get("status") == "global_current"), None)
    if site_approved and global_current:
        protocol_context = {"site_approved_version": site_approved, "global_current_version": global_current}

    request = {
        "request_id": fixture["scenario"]["id"],
        "subject_id": subject_id,
        "trial_id": trial_id,
        "as_of": as_of,
        "authorization": {"purpose": fixture["authorized_context"]["purpose"]},
        "entitlement": entitlement or {"user": fixture["authorized_context"]["user"], "iam_state": "active"},
        "evidence": evidence_items,
        "eligibility_evidence": eligibility_evidence,
        "protocol_context": protocol_context,
    }
    output, latency_ms = _timed(assemble_clinical_response, request)
    return {
        "scenario_id": fixture["scenario"]["id"], "workflow": "clinical_trial_context",
        "input": request, "output": output, "latency_ms": latency_ms,
        "tools_called": [], "retries": 0, "errors": [], "approvals": [output.get("human_review")],
        "side_effects": [], "evidence_used": [e["source"] for e in evidence_items],
    }


_REGRESSION_RUNNERS = {
    "batch": run_batch_scenario, "pv": run_pv_scenario, "supply": run_supply_scenario,
    "clinical": run_clinical_scenario,  # Workflow D — additional, optional scope
}


def run_regression_scenario(fixture, entitlement=None):
    runner = _REGRESSION_RUNNERS.get(fixture["scenario"]["workflow"])
    if runner is None:
        return None
    return runner(fixture, entitlement=entitlement)


# ---------------------------------------------------------------------------
# Baseline path: unmodified starter/legacy_pharma.py brownfield code
# ---------------------------------------------------------------------------

def run_baseline_batch_ready(batch_id):
    import legacy_pharma
    output, latency_ms = _timed(legacy_pharma.batch_ready, batch_id)
    return {"scenario_id": batch_id, "workflow": "legacy.batch_ready", "input": {"batch_id": batch_id},
            "output": {"ready": output}, "latency_ms": latency_ms, "tools_called": [], "retries": 0,
            "errors": [], "approvals": [], "side_effects": [], "evidence_used": ["data/lab_results.csv"]}


def run_baseline_search_knowledge(query):
    import legacy_pharma
    output, latency_ms = _timed(legacy_pharma.search_knowledge, query)
    return {"scenario_id": f"legacy_search:{query}", "workflow": "legacy.search_knowledge",
            "input": {"query": query}, "output": {"hits": [h["file"] for h in output]},
            "latency_ms": latency_ms, "tools_called": [], "retries": 0, "errors": [],
            "approvals": [], "side_effects": [], "evidence_used": [h["file"] for h in output]}


def run_baseline_plan_supply(product):
    import legacy_pharma
    output, latency_ms = _timed(legacy_pharma.plan_supply, product)
    side_effects = [f"reservation_status={output.get('reservation_status')}"] if output.get("reservation_status") == "created" else []
    return {"scenario_id": f"legacy_supply:{product}", "workflow": "legacy.plan_supply",
            "input": {"product": product}, "output": output, "latency_ms": latency_ms,
            "tools_called": [], "retries": 0, "errors": [], "approvals": [], "side_effects": side_effects,
            "evidence_used": ["data/inventory.csv"]}
