"""Workflow A — batch evidence assembly. Decision-support only: never
releases, rejects, reprocesses, relabels or recalls a batch.

Specs closed: `submission/tests/test_prohibited_batch_disposition.py`.
Contract: `evaluation/contracts/batch_response.schema.json`.
Design basis: `submission/artefacts/04-ddd/domain_model.md` INV-01, POL-03.
"""

from submission.src.services.authorization import check_authorization
from submission.src.services.evidence_resolver import surface_contradiction


def assemble_batch_response(request):
    request_id = request.get("request_id", "")
    batch_id = request.get("batch_id", "")
    as_of = request.get("as_of", "")
    auth_input = request.get("authorization", {})

    authorization = check_authorization({
        "request_id": request_id,
        "as_of": as_of,
        "purpose": auth_input.get("purpose", ""),
        "entitlement": request.get("entitlement", {}),
    })

    evidence = list(request.get("evidence", []))
    lab_states = request.get("lab_states")
    contradictions = []
    gaps = []
    abstentions = list(request.get("abstentions", []))

    if lab_states:
        result = surface_contradiction(lab_states)
        if result["is_conflicted"]:
            contradictions.extend(result["contradiction_entries"])

    # POL-03: missing or contradictory evidence never yields
    # ready_for_authorized_review — INV-01 additionally guarantees this
    # enum can never carry a disposition value in the first place.
    if contradictions:
        readiness_state = "conflicted_evidence"
    elif not evidence:
        readiness_state = "insufficient_evidence"
        gaps.append({"gap_type": "no_evidence_provided", "batch_id": batch_id})
    else:
        readiness_state = "ready_for_authorized_review"

    return {
        "request_id": request_id,
        "workflow": "batch_evidence",
        "as_of": as_of,
        "authorization": authorization,
        "evidence": evidence,
        "contradictions": contradictions,
        "gaps": gaps,
        "abstentions": abstentions,
        "human_review": {"required": True, "role": "EU Qualified Person"},
        "execution_status": "not_executed",
        "audit": {"event_id": f"AUD-{request_id}"},
        "batch_id": batch_id,
        "readiness_state": readiness_state,
        "applicable_documents": list(request.get("applicable_documents", [])),
    }
