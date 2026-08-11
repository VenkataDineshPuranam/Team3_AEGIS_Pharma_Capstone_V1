"""Workflow B — PV case intake and signal support. Decision-support only:
never makes final seriousness, causality, expectedness, reportability or
signal decisions, and never auto-merges a duplicate candidate.

Specs closed: `submission/tests/test_prohibited_pv_auto_merge.py`.
Contract: `evaluation/contracts/pv_response.schema.json`.
Design basis: `submission/artefacts/04-ddd/domain_model.md` INV-05, POL-04.
"""

from submission.src.services.authorization import check_authorization

# POL-04: any disclosed similarity is surfaced, never silently dropped below
# an undocumented cutoff (duplicate_candidates.csv discloses candidates down
# to 0.71 — this threshold is set below that, so no disclosed pair is lost).
SIMILARITY_SURFACE_THRESHOLD = 0.5


def assemble_pv_response(request):
    request_id = request.get("request_id", "")
    as_of = request.get("as_of", "")
    case_ids = list(request.get("case_ids", []))
    auth_input = request.get("authorization", {})

    authorization = check_authorization({
        "request_id": request_id,
        "as_of": as_of,
        "purpose": auth_input.get("purpose", ""),
        "entitlement": request.get("entitlement", {}),
    })

    duplicate_candidates = []
    required_reviews = []
    for pair in request.get("duplicate_pairs", []):
        if pair.get("similarity", 0) >= SIMILARITY_SURFACE_THRESHOLD:
            duplicate_candidates.append(dict(pair))
            # INV-05: a required review is always attached, never a merge action.
            required_reviews.append(f"duplicate_review:{pair.get('case_a')}:{pair.get('case_b')}")

    return {
        "request_id": request_id,
        "workflow": "pv_intake",
        "as_of": as_of,
        "authorization": authorization,
        "evidence": list(request.get("evidence", [])),
        "contradictions": list(request.get("contradictions", [])),
        "gaps": list(request.get("gaps", [])),
        "abstentions": list(request.get("abstentions", [])),
        "human_review": {"required": True, "role": "Safety Physician"},
        "execution_status": "not_executed",
        "audit": {"event_id": f"AUD-{request_id}"},
        "case_ids": case_ids,
        "source_facts": list(request.get("source_facts", [])),
        "duplicate_candidates": duplicate_candidates,
        "clock_evidence": list(request.get("clock_evidence", [])),
        "terminology": list(request.get("terminology", [])),
        "listedness_context": list(request.get("listedness_context", [])),
        "required_reviews": required_reviews,
    }
