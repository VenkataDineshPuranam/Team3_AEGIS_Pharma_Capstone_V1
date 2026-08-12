"""Workflow C — supply/cold-chain recovery options. Decision-support only:
never reserves, allocates, changes quality status, ships or initiates a
recall. Every path, including error paths, carries no_side_effects: true.

Specs closed: `submission/tests/test_prohibited_supply_side_effects.py`.
Contract: `evaluation/contracts/supply_response.schema.json`.
Design basis: `submission/artefacts/04-ddd/domain_model.md` INV-06, INV-07, POL-05.
"""

from submission.src.services.authorization import check_authorization


def _detect_serialization_aggregation_break(packaging_events):
    """INJ-052: a case-to-pallet aggregation rebuild left "partial" after a
    line restart (data/packaging_events.csv PKG-3 restart
    aggregation_rebuild=partial) must be surfaced as a gap, never silently
    treated as complete."""
    gaps = []
    for row in packaging_events or []:
        if row.get("event") == "restart" and row.get("aggregation_rebuild") in ("partial", "missing"):
            gaps.append({
                "gap_type": "serialization_aggregation_break",
                "line": row.get("line"),
                "event_time": row.get("time"),
                "aggregation_rebuild": row.get("aggregation_rebuild"),
                "detail": (
                    f"Packaging line {row.get('line')} restarted at "
                    f"{row.get('time')} with aggregation_rebuild="
                    f"{row.get('aggregation_rebuild')} — case-to-pallet "
                    f"serialization aggregation is not confirmed complete."
                ),
            })
    return gaps


def _detect_counterfeit_suspicion(returns, serialisation_events):
    """INJ-053: two returned packs share a serial with a low print-authentication
    score and no distribution match (data/returns.csv RT-1/RT-2 on
    SN-10001, print_score 0.44/0.47, distribution_match=no), while the
    serialisation record for that serial shows an unresolved/unknown
    return_scan case/pallet (data/serialisation_events.csv). Surfaced as a
    contradiction — never resolved to authentic or counterfeit."""
    contradictions = []
    by_serial = {}
    for r in returns or []:
        by_serial.setdefault(r.get("serial"), []).append(r)
    for serial, rows in by_serial.items():
        suspicious = [r for r in rows if r.get("distribution_match") == "no"
                      and _to_float(r.get("print_score")) is not None
                      and _to_float(r.get("print_score")) < 0.9]
        if len(suspicious) >= 2:
            events = [e for e in (serialisation_events or []) if e.get("serial") == serial]
            contradictions.append({
                "type": "counterfeit_suspicion_indicator",
                "serial": serial,
                "return_ids": [r.get("return_id") for r in suspicious],
                "print_scores": [r.get("print_score") for r in suspicious],
                "serialisation_events": events,
                "detail": (
                    f"Serial {serial} was returned {len(suspicious)} times with "
                    f"low print-authentication scores and no distribution match "
                    f"— inconsistent print/distribution history. Not resolved to "
                    f"authentic or counterfeit; requires physical forensic review."
                ),
            })
    return contradictions


def _detect_customs_documentation_mismatch(shipments, trade_documents):
    """INJ-057: a shipment's trade documents disagree on product description
    (data/trade_documents.csv SH-902 invoice="sterile research samples" vs
    import_licence="commercial sterile injectable"). Surfaced as a
    contradiction — never resolved/cleared for shipment."""
    contradictions = []
    by_shipment = {}
    for d in trade_documents or []:
        by_shipment.setdefault(d.get("shipment_id"), []).append(d)
    for shipment_id, docs in by_shipment.items():
        descriptions = {d.get("description") for d in docs}
        if len(descriptions) > 1:
            shipment = next((s for s in (shipments or []) if s.get("shipment_id") == shipment_id), None)
            contradictions.append({
                "type": "customs_documentation_mismatch",
                "shipment_id": shipment_id,
                "documents": docs,
                "shipment_product": shipment.get("product") if shipment else None,
                "detail": (
                    f"Shipment {shipment_id} trade documents disagree on product "
                    f"description: {sorted(descriptions)} — not resolved or "
                    f"cleared for shipment."
                ),
            })
    return contradictions


def _to_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


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

        gaps = list(request.get("gaps", []))
        contradictions = list(request.get("contradictions", []))
        gaps.extend(_detect_serialization_aggregation_break(request.get("packaging_events")))
        contradictions.extend(_detect_counterfeit_suspicion(
            request.get("returns"), request.get("serialisation_events")))
        contradictions.extend(_detect_customs_documentation_mismatch(
            request.get("shipments"), request.get("trade_documents")))

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
            "contradictions": contradictions,
            "gaps": gaps,
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
