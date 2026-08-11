"""Workflow C — supply/cold-chain recovery options. Decision-support only:
never reserves, allocates, changes quality status, ships or initiates a
recall. Every path, including error paths, carries no_side_effects: true.

Specs closed: `submission/tests/test_prohibited_supply_side_effects.py`.
Contract: `evaluation/contracts/supply_response.schema.json`.
Design basis: `submission/artefacts/04-ddd/domain_model.md` INV-06, INV-07, POL-05.
"""

from submission.src.services.authorization import check_authorization


def _error_response(request_id, event_id, as_of):
    # INV-06: no_side_effects must hold on every path, including error/exception
    # paths — this is the fail-closed shape returned if anything above raises.
    return {
        "request_id": request_id,
        "workflow": "supply_options",
        "as_of": as_of,
        "authorization": {"user": "", "purpose": "", "checked_at": as_of,
                           "decision": "deny", "reason": "internal_error"},
        "evidence": [],
        "contradictions": [],
        "gaps": [{"gap_type": "processing_error"}],
        "abstentions": [],
        "human_review": {"required": True, "role": "Supply Governance Board"},
        "execution_status": "not_executed",
        "audit": {"event_id": f"AUD-{request_id}"},
        "event_id": event_id,
        "options": [],
        "constraints": [],
        "approvals_required": ["Supply Governance Board"],
        "quality_holds": [],
        "no_side_effects": True,
    }


def assemble_supply_response(request):
    request_id = request.get("request_id", "")
    event_id = request.get("event_id", "")
    as_of = request.get("as_of", "")

    try:
        auth_input = request.get("authorization", {})
        authorization = check_authorization({
            "request_id": request_id,
            "as_of": as_of,
            "purpose": auth_input.get("purpose", ""),
            "entitlement": request.get("entitlement", {}),
        })

        options = []
        quality_holds = []
        # INV-07 / POL-05: quarantined/held inventory is excluded from
        # options and surfaced separately as a constraint, never invisible.
        for row in request.get("inventory", []):
            status = row.get("quality_status")
            if status == "quarantine":
                quality_holds.append(dict(row))
            elif status == "released":
                options.append({
                    "option_id": f"OPT-{row.get('product', '')}-{row.get('market', '')}",
                    "status": "draft",
                    "product": row.get("product"),
                    "market": row.get("market"),
                    "quality_status": status,
                    "units": row.get("units"),
                })

        return {
            "request_id": request_id,
            "workflow": "supply_options",
            "as_of": as_of,
            "authorization": authorization,
            "evidence": list(request.get("evidence", [])),
            "contradictions": list(request.get("contradictions", [])),
            "gaps": list(request.get("gaps", [])),
            "abstentions": list(request.get("abstentions", [])),
            "human_review": {"required": True, "role": "Supply Governance Board"},
            "execution_status": "not_executed",
            "audit": {"event_id": f"AUD-{request_id}"},
            "event_id": event_id,
            "options": options,
            "constraints": list(request.get("constraints", [])),
            "approvals_required": ["Supply Governance Board"],
            "quality_holds": quality_holds,
            "no_side_effects": True,
        }
    except Exception:
        return _error_response(request_id, event_id, as_of)
