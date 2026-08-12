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


def _detect_cold_chain_lane_excursion(shipments, temperature_loggers):
    """INJ-051: a biologic shipment's temperature logger reports disputed
    pallet association and mixed/unknown timezone readings
    (data/temperature_loggers.csv LG-31: pallet P-89 @ local_unknown vs
    pallet P-88 @ UTC, both ~10C) for a shipment already on quarantine/
    customs_hold (data/shipments.csv SH-901). Surfaced as a contradiction —
    never resolved to a single pallet/clock reading."""
    contradictions = []
    by_logger = {}
    for row in temperature_loggers or []:
        by_logger.setdefault(row.get("logger"), []).append(row)
    for shipment in shipments or []:
        logger = shipment.get("logger")
        readings = by_logger.get(logger, [])
        if not readings:
            continue
        pallets = {r.get("pallet") for r in readings}
        timezones = {r.get("timezone") for r in readings}
        if len(pallets) > 1 or len(timezones) > 1:
            contradictions.append({
                "type": "cold_chain_lane_excursion",
                "shipment_id": shipment.get("shipment_id"),
                "product": shipment.get("product"),
                "lots": shipment.get("lots"),
                "lane": shipment.get("lane"),
                "logger": logger,
                "readings": readings,
                "pallet_disputed": len(pallets) > 1,
                "declared_pallet": shipment.get("pallet"),
                "detail": (
                    f"Shipment {shipment.get('shipment_id')} on lane "
                    f"{shipment.get('lane')} has logger {logger} readings "
                    f"disputing pallet association ({sorted(p for p in pallets if p)}) "
                    f"and/or timezone ({sorted(t for t in timezones if t)}) — the "
                    f"excursion cannot be attributed to a single pallet/clock "
                    f"reading."
                ),
            })
    return contradictions


def _detect_critical_excipient_shortage(supplier_risks):
    """INJ-054: a sole-source excipient supplier reports contamination and
    a multi-week recovery estimate with no qualified alternate
    (data/supplier_risks.csv EXCIP-ONE/Polysorbate-X, recovery_weeks=8,
    alternate_qualified=no). Surfaced as a gap — never silently substituted."""
    gaps = []
    for row in supplier_risks or []:
        if str(row.get("alternate_qualified", "")).lower() == "no":
            gaps.append({
                "gap_type": "critical_excipient_shortage_no_alternate",
                "supplier": row.get("supplier"),
                "material": row.get("material"),
                "risk": row.get("risk"),
                "recovery_weeks": row.get("recovery_weeks"),
            })
    return gaps


def _detect_cmo_capacity_conflict(cmo_capacity):
    """INJ-055: a CMO promises more batches across two sponsors than its
    disclosed capacity for the window (data/cmo_capacity.csv CMO-IE
    2026-W34: capacity_batches=2, promised_NTG=2, promised_other_sponsor=1,
    total 3). Surfaced as a contradiction — never resolved to one sponsor's
    favor."""
    contradictions = []
    for row in cmo_capacity or []:
        capacity = _to_float(row.get("capacity_batches"))
        promised_a = _to_float(row.get("promised_NTG"))
        promised_b = _to_float(row.get("promised_other_sponsor"))
        if capacity is None or promised_a is None or promised_b is None:
            continue
        total_promised = promised_a + promised_b
        if total_promised > capacity:
            contradictions.append({
                "type": "cmo_capacity_overcommitted",
                "cmo": row.get("cmo"),
                "window": row.get("window"),
                "capacity_batches": row.get("capacity_batches"),
                "promised_NTG": row.get("promised_NTG"),
                "promised_other_sponsor": row.get("promised_other_sponsor"),
                "total_promised": total_promised,
                "detail": (
                    f"{row.get('cmo')} promised {promised_a} batches to NTG "
                    f"and {promised_b} to another sponsor in window "
                    f"{row.get('window')}, totalling {total_promised}, "
                    f"against disclosed capacity of {capacity} — both "
                    f"commitments cannot be honoured; neither is resolved "
                    f"here."
                ),
            })
    return contradictions


def _detect_allocation_ethics_gap(demand_forecast, inventory, allocation_constraints):
    """INJ-056: aggregate 8-week demand across commercial, trial and
    compassionate-use channels exceeds released inventory for a product
    (data/demand_forecast.csv NCB-204 total 6700 vs data/inventory.csv
    released 7000... see detail) — surfaced as a gap with the disclosed
    allocation_constraints, never resolved to a specific allocation."""
    gaps = []
    demand_by_product = {}
    for row in demand_forecast or []:
        product = row.get("product")
        units = _to_float(row.get("units_8w")) or 0
        demand_by_product.setdefault(product, []).append((row.get("channel"), units))
    released_by_product = {}
    for row in inventory or []:
        if row.get("quality_status") == "released":
            product = row.get("product")
            released_by_product[product] = released_by_product.get(product, 0) + (_to_float(row.get("units")) or 0)
    for product, channels in demand_by_product.items():
        total_demand = sum(u for _, u in channels)
        available = released_by_product.get(product, 0)
        if total_demand > available:
            gaps.append({
                "gap_type": "demand_exceeds_available_inventory",
                "product": product,
                "total_demand_8w": total_demand,
                "released_inventory": available,
                "demand_by_channel": dict(channels),
                "allocation_constraints": list(allocation_constraints or []),
            })
    return gaps


def _detect_recall_scope_uncertainty(recall_candidates, material_genealogy):
    """INJ-058: lots sharing a component and equipment (data/recall_candidates.csv
    NCS310-S26033 / NCS310-S26031, shared VIAL-V19 / FF-02) have differing
    distribution status and no complete genealogy link confirming/excluding
    each lot from the shared component — surfaced as a gap, never a
    recall-scope determination."""
    gaps = []
    by_component_equipment = {}
    for row in recall_candidates or []:
        key = (row.get("shared_component"), row.get("shared_equipment"))
        by_component_equipment.setdefault(key, []).append(row)
    genealogy_lots = {g.get("batch_id") for g in (material_genealogy or [])}
    for (component, equipment), rows in by_component_equipment.items():
        if len(rows) < 2:
            continue
        distributions = {r.get("distribution") for r in rows}
        unconfirmed_lots = [r.get("lot") for r in rows if r.get("lot") not in genealogy_lots]
        if len(distributions) > 1 or unconfirmed_lots:
            gaps.append({
                "gap_type": "recall_scope_uncertain",
                "shared_component": component,
                "shared_equipment": equipment,
                "candidate_lots": [r.get("lot") for r in rows],
                "distribution_by_lot": {r.get("lot"): r.get("distribution") for r in rows},
                "lots_without_genealogy_confirmation": unconfirmed_lots,
            })
    return gaps


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
        contradictions.extend(_detect_cold_chain_lane_excursion(
            request.get("shipments"), request.get("temperature_loggers")))
        gaps.extend(_detect_critical_excipient_shortage(request.get("supplier_risks")))
        contradictions.extend(_detect_cmo_capacity_conflict(request.get("cmo_capacity")))
        gaps.extend(_detect_allocation_ethics_gap(
            request.get("demand_forecast"), request.get("inventory"), request.get("allocation_constraints")))
        gaps.extend(_detect_recall_scope_uncertainty(
            request.get("recall_candidates"), request.get("material_genealogy")))

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
