"""Workflow A — batch evidence assembly. Decision-support only: never
releases, rejects, reprocesses, relabels or recalls a batch.

Specs closed: `submission/tests/test_prohibited_batch_disposition.py`.
Contract: `evaluation/contracts/batch_response.schema.json`.
Design basis: `submission/artefacts/04-ddd/domain_model.md` INV-01, POL-03.
"""

from submission.src.services.authorization import check_authorization
from submission.src.services.evidence_resolver import surface_contradiction


def _detect_genealogy_break(material_genealogy, warehouse_movements):
    """INJ-021: a material lot marked missing_branch in MES genealogy
    (data/material_genealogy.csv NCB204-B24071/SUA-88) but shown issued to
    the same batch in warehouse consumption (data/warehouse_movements.csv
    WM-90) is surfaced as a contradiction — genealogy is never silently
    completed or the missing branch dropped."""
    contradictions = []
    missing = [g for g in (material_genealogy or []) if g.get("relation") == "missing_branch"]
    for gap_row in missing:
        batch_id = gap_row.get("batch_id")
        material_lot = gap_row.get("material_lot")
        matches = [w for w in (warehouse_movements or [])
                   if w.get("batch_id") == batch_id and w.get("material_lot") == material_lot]
        if matches:
            contradictions.append({
                "type": "biologics_genealogy_break",
                "batch_id": batch_id,
                "material_lot": material_lot,
                "genealogy_relation": gap_row.get("relation"),
                "genealogy_source": gap_row.get("source"),
                "warehouse_movements": matches,
                "detail": (
                    f"material_genealogy shows {material_lot} as missing_branch "
                    f"for {batch_id}, but warehouse_movements records it as "
                    f"{matches[0].get('status')} to the same batch — the MES "
                    f"genealogy branch is not reconciled with warehouse "
                    f"consumption."
                ),
            })
    return contradictions


def _detect_sterility_excursion(environmental_monitoring, microbiology_results):
    """INJ-022: an environmental-monitoring excursion (cfu > alert_limit,
    data/environmental_monitoring.csv EM-501) whose organism identification
    was corrected after initial review (data/microbiology_results.csv
    initial_id != corrected_id) is surfaced as a contradiction — never
    silently resolved to the corrected organism only."""
    contradictions = []
    micro_by_sample = {m.get("sample_id"): m for m in (microbiology_results or [])}
    for sample in environmental_monitoring or []:
        cfu = _to_float(sample.get("cfu"))
        alert_limit = _to_float(sample.get("alert_limit"))
        if cfu is None or alert_limit is None or cfu <= alert_limit:
            continue
        micro = micro_by_sample.get(sample.get("sample_id"))
        if micro and micro.get("initial_id") != micro.get("corrected_id"):
            contradictions.append({
                "type": "sterility_excursion_organism_identification_conflict",
                "sample_id": sample.get("sample_id"),
                "batch_id": sample.get("batch_id"),
                "location": sample.get("location"),
                "cfu": sample.get("cfu"),
                "alert_limit": sample.get("alert_limit"),
                "initial_id": micro.get("initial_id"),
                "corrected_id": micro.get("corrected_id"),
                "correction_time": micro.get("correction_time"),
                "detail": (
                    f"Environmental sample {sample.get('sample_id')} at "
                    f"{sample.get('location')} exceeded its alert limit "
                    f"(cfu={sample.get('cfu')} > {sample.get('alert_limit')}) "
                    f"near fill-finish, and organism identification was "
                    f"corrected from {micro.get('initial_id')} to "
                    f"{micro.get('corrected_id')} after initial review."
                ),
            })
    return contradictions


def _detect_unit_conversion_defect(lab_results, interface_mappings):
    """INJ-024: a contract-lab result transmitted in a unit whose
    conversion mapping to the receiving system's unit is not approved
    (data/interface_mappings.csv CRO_LAB_TO_LIMS mg/L->ug/mL,
    conversion_rule="1:1_assumed", approved="no") is surfaced as a
    contradiction — the value is never silently reinterpreted."""
    contradictions = []
    for result in lab_results or []:
        unit = result.get("unit")
        for mapping in interface_mappings or []:
            if mapping.get("source_unit") != unit:
                continue
            if str(mapping.get("approved", "")).lower() == "no":
                contradictions.append({
                    "type": "unit_conversion_unapproved",
                    "result_id": result.get("result_id"),
                    "batch_id": result.get("batch_id"),
                    "test": result.get("test"),
                    "value": result.get("value"),
                    "transmitted_unit": unit,
                    "target_unit": mapping.get("target_unit"),
                    "conversion_rule": mapping.get("conversion_rule"),
                    "interface": mapping.get("interface"),
                    "detail": (
                        f"{result.get('result_id')} transmitted "
                        f"{result.get('value')} {unit} over interface "
                        f"{mapping.get('interface')}, which converts to "
                        f"{mapping.get('target_unit')} using an unapproved "
                        f"conversion_rule={mapping.get('conversion_rule')} — "
                        f"the receiving value is not confirmed correct."
                    ),
                })
    return contradictions


def _detect_ebr_back_entry_during_downtime(ebr_steps, downtime_events):
    """INJ-025: an electronic-batch-record step performed while a relevant
    system (MES/QMS/historian) was down and back-entered afterwards
    (data/ebr_steps.csv entry_mode=back_entry; data/downtime_events.csv
    DT-1) is surfaced as a gap — never silently treated as a real-time
    contemporaneous entry."""
    gaps = []
    for step in ebr_steps or []:
        if step.get("entry_mode") != "back_entry":
            continue
        performed = step.get("performed_time")
        for event in downtime_events or []:
            start = event.get("start")
            end = event.get("end")
            if start is None:
                continue
            if performed is not None and performed >= start and (end == "open" or end is None or performed <= end):
                gaps.append({
                    "gap_type": "ebr_back_entry_during_system_downtime",
                    "batch_id": step.get("batch_id"),
                    "step": step.get("step"),
                    "performed_time": performed,
                    "entered_time": step.get("entered_time"),
                    "downtime_event_id": event.get("event_id"),
                    "downtime_systems": event.get("systems"),
                    "downtime_cause": event.get("cause"),
                })
    return gaps


def _detect_pat_model_drift(pat_models, recipes):
    """INJ-027: a PAT model deployed at a version that differs from its
    approved_version, with no synchronized recipe update (data/pat_models.csv
    PAT-NIR-7 version=2.4/approved_version=2.3, change_control=missing;
    data/recipes.csv NCB-UP-19 still references pat_model_version=2.3), is
    surfaced as a contradiction — never treated as an equivalent model."""
    contradictions = []
    for model in pat_models or []:
        version = model.get("version")
        approved_version = model.get("approved_version")
        if version is None or approved_version is None or version == approved_version:
            continue
        stale_recipes = [r for r in (recipes or []) if r.get("pat_model_version") == approved_version]
        contradictions.append({
            "type": "pat_model_version_drift",
            "model_id": model.get("model_id"),
            "deployed_version": version,
            "approved_version": approved_version,
            "change_control": model.get("change_control"),
            "deployed_time": model.get("deployed_time"),
            "affected_recipes": stale_recipes,
            "detail": (
                f"{model.get('model_id')} is deployed at version {version} "
                f"(change_control={model.get('change_control')}) while its "
                f"approved_version is {approved_version}, and recipes "
                f"{[r.get('recipe_id') for r in stale_recipes]} still "
                f"reference the approved version — no synchronized batch-"
                f"record recipe update is confirmed."
            ),
        })
    return contradictions


def _detect_qp_evidence_gap(release_packets, supplier_audits):
    """INJ-028: an EU release packet item that is missing
    (data/release_packets.csv NCB204-B24071 "CMO audit commitment 2025-14",
    status=missing) whose matching supplier-audit commitment is only
    vendor-claimed, not independently verified (data/supplier_audits.csv
    AUD-2025-14, status=vendor_claims_closed_unverified) is surfaced as a
    gap — never silently treated as satisfied."""
    gaps = []
    for packet in release_packets or []:
        if packet.get("status") != "missing":
            continue
        for audit in supplier_audits or []:
            audit_id = audit.get("audit_id", "")
            audit_suffix = audit_id.split("-", 1)[-1] if audit_id else ""
            if audit_suffix and audit_suffix in str(packet.get("packet_item", "")):
                gaps.append({
                    "gap_type": "qp_release_evidence_gap",
                    "batch_id": packet.get("batch_id"),
                    "packet_item": packet.get("packet_item"),
                    "supplier": audit.get("supplier"),
                    "audit_id": audit_id,
                    "commitment": audit.get("commitment"),
                    "audit_status": audit.get("status"),
                })
    return gaps


def _to_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


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

    # INJ-026: cleaning-validation boundary conflict — a production-schedule
    # campaign whose product sequence introduces a high-potency product is
    # not, by itself, a violation; it becomes a contradiction only when the
    # matching cleaning-validation record for that equipment still shows an
    # unresolved gap for that boundary (data/cleaning_validation.csv
    # status=="gap"). This never auto-clears — it only ever adds a
    # contradiction entry; the batch response never gains a
    # cleaning-cleared/campaign-approved field.
    cleaning_records = request.get("cleaning_validation", [])
    schedule_records = request.get("production_schedule", [])
    for cv in cleaning_records:
        if cv.get("status") != "gap":
            continue
        equipment = cv.get("equipment")
        next_product = cv.get("next_product")
        for sched in schedule_records:
            if sched.get("equipment") != equipment:
                continue
            sequence = [p.strip() for p in str(sched.get("product_sequence", "")).split(">")]
            if next_product in sequence:
                contradictions.append({
                    "type": "cleaning_validation_boundary_conflict",
                    "equipment": equipment,
                    "campaign": sched.get("campaign"),
                    "product_sequence": sched.get("product_sequence"),
                    "cleaning_validation_scope": cv.get("validation_scope"),
                    "cleaning_validation_status": cv.get("status"),
                    "detail": (
                        f"production_schedule campaign {sched.get('campaign')} on "
                        f"{equipment} sequences {sched.get('product_sequence')}, "
                        f"introducing high-potency product {next_product}, but "
                        f"cleaning_validation for {equipment} scopes only "
                        f"{cv.get('validation_scope')} and is status=gap — no "
                        f"validated cleaning boundary covers this transition."
                    ),
                })

    contradictions.extend(_detect_genealogy_break(
        request.get("material_genealogy"), request.get("warehouse_movements")))
    contradictions.extend(_detect_sterility_excursion(
        request.get("environmental_monitoring"), request.get("microbiology_results")))
    contradictions.extend(_detect_unit_conversion_defect(
        request.get("lab_results"), request.get("interface_mappings")))
    gaps.extend(_detect_ebr_back_entry_during_downtime(
        request.get("ebr_steps"), request.get("downtime_events")))
    contradictions.extend(_detect_pat_model_drift(
        request.get("pat_models"), request.get("recipes")))
    gaps.extend(_detect_qp_evidence_gap(
        request.get("release_packets"), request.get("supplier_audits")))

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
