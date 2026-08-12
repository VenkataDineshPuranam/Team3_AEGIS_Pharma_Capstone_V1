"""Workflow D — clinical trial context support. ADDITIONAL, OPTIONAL SCOPE,
not one of the three mandated workflows (`case/INTEGRATED_CASE.md` §4).
See `submission/artefacts/WORKFLOW_D_CLINICAL_TRIAL_CONTEXT.md` for the
full scope statement — this does not change RUB-08 scoring.

Decision-support only: never determines subject eligibility, never
confirms or denies treatment-arm/blinding status, never adjudicates an
endpoint conflict, never defaults a protocol-version conflict to one
version.

Specs closed: `submission/tests/test_prohibited_clinical_eligibility.py`.
Contract: `submission/evaluation/contracts/clinical_response.schema.json`.
Design basis: `submission/artefacts/04-ddd/domain_model.md` INV-11/12/13, POL-07.
"""
from submission.src.services.authorization import check_authorization


def _detect_econsent_withdrawal_mismatch(consents, specimens, processing_events):
    """INJ-017: a subject's consent was withdrawn for biomarker processing
    (data/consents.csv C-044 S-301-044 status=withdrawn_biomarker) but a
    downstream processing event for that subject's specimen continued
    against a cached (not re-verified) consent check
    (data/processing_events.csv PE-9 consent_check=cached_active).
    Surfaced as a contradiction — never silently halted or continued."""
    contradictions = []
    withdrawn = [c for c in (consents or []) if "withdrawn" in str(c.get("status", ""))]
    specimens_by_subject = {}
    for sp in specimens or []:
        specimens_by_subject.setdefault(sp.get("subject_id"), []).append(sp)
    for consent in withdrawn:
        subject_id = consent.get("subject_id")
        for specimen in specimens_by_subject.get(subject_id, []):
            for event in processing_events or []:
                if event.get("specimen_id") != specimen.get("specimen_id"):
                    continue
                if event.get("status") == "completed" and event.get("consent_check") != "verified_current":
                    contradictions.append({
                        "type": "econsent_withdrawal_processing_mismatch",
                        "subject_id": subject_id,
                        "consent_id": consent.get("consent_id"),
                        "consent_status": consent.get("status"),
                        "consent_effective_time": consent.get("effective_time"),
                        "specimen_id": specimen.get("specimen_id"),
                        "processing_event_id": event.get("event_id"),
                        "processing_status": event.get("status"),
                        "consent_check": event.get("consent_check"),
                    })
    return contradictions


def _detect_device_clock_skew(wearable_readings):
    """INJ-018: wearable-device readings for the same subject/device carry
    mixed local/UTC timezone labels around a daylight-saving transition
    (data/wearable_readings.csv S-301-118/WR-11: local_unknown vs UTC).
    Surfaced as a gap — readings are never silently normalized to one
    clock."""
    gaps = []
    by_device = {}
    for row in wearable_readings or []:
        by_device.setdefault((row.get("subject_id"), row.get("device_id")), []).append(row)
    for (subject_id, device_id), rows in by_device.items():
        timezones = {r.get("timezone") for r in rows}
        if len(timezones) > 1:
            gaps.append({
                "gap_type": "device_clock_skew_evidence",
                "subject_id": subject_id,
                "device_id": device_id,
                "readings": rows,
                "timezones_observed": sorted(t for t in timezones if t),
            })
    return gaps


def assemble_clinical_response(request):
    request_id = request.get("request_id", "")
    subject_id = request.get("subject_id", "")
    trial_id = request.get("trial_id", "")
    as_of = request.get("as_of", "")
    auth_input = request.get("authorization", {})

    authorization = check_authorization({
        "request_id": request_id,
        "as_of": as_of,
        "purpose": auth_input.get("purpose", ""),
        "entitlement": request.get("entitlement", {}),
    })

    contradictions = []
    gaps = []
    required_reviews = []

    # INV-11: disagreeing eligibility-threshold sources are surfaced as a
    # contradiction, never resolved to eligible/ineligible.
    elig = request.get("eligibility_evidence")
    if elig:
        value = elig.get("value")
        thresholds = {
            "central_uln": elig.get("central_uln"),
            "local_uln": elig.get("local_uln"),
            "edc_rule_uln": elig.get("edc_rule_uln"),
        }
        exceeds = {name: (value is not None and uln is not None and value > uln) for name, uln in thresholds.items()}
        if len(set(exceeds.values())) > 1:
            contradictions.append({
                "type": "eligibility_threshold_disagreement",
                "test": elig.get("test"),
                "value": value,
                "thresholds": thresholds,
                "exceeds_by_source": exceeds,
            })
            required_reviews.append(f"eligibility_review:{subject_id}")

    # INV-12: evidence suggesting unblinding becomes a flagged risk, never
    # an arm-assignment statement.
    unblinding_risk_flags = []
    UNBLINDING_SIGNAL_TERMS = ("active arm", "placebo arm", "kit pattern", "unblind")
    for ticket in request.get("support_tickets", []):
        text = str(ticket.get("text", "")).lower()
        if any(term in text for term in UNBLINDING_SIGNAL_TERMS):
            unblinding_risk_flags.append({
                "ticket_id": ticket.get("ticket_id"),
                "system": ticket.get("system"),
                "visibility": ticket.get("visibility"),
                "reason": "support ticket text matches an unblinding-risk signal term",
            })
            required_reviews.append(f"unblinding_review:{ticket.get('ticket_id')}")

    # INV-13: dual-reviewer endpoint disagreement surfaced, never resolved.
    endpoint_reviews = request.get("endpoint_reviews", [])
    by_packet = {}
    for review in endpoint_reviews:
        by_packet.setdefault(review.get("packet_id"), set()).add(review.get("conclusion"))
    for packet_id, conclusions in by_packet.items():
        if len(conclusions) > 1:
            contradictions.append({
                "type": "endpoint_adjudication_disagreement",
                "packet_id": packet_id,
                "conclusions": sorted(conclusions),
            })
            required_reviews.append(f"endpoint_adjudication_review:{packet_id}")

    # POL-07: site-approved protocol version vs. global-current, both surfaced.
    protocol_conflicts = []
    proto = request.get("protocol_context")
    if proto:
        site_v = proto.get("site_approved_version")
        global_v = proto.get("global_current_version")
        if site_v is not None and global_v is not None and site_v != global_v:
            protocol_conflicts.append({
                "trial_id": trial_id,
                "site_approved_version": site_v,
                "global_current_version": global_v,
            })
            required_reviews.append(f"protocol_applicability_review:{trial_id}")

    # INJ-015: a non-automated (manual/downtime-log) randomization event is
    # surfaced as a gap, never silently treated as an equivalent allocation.
    for event in request.get("randomization_events", []):
        if event.get("method") and event.get("method") != "irt_automated":
            gaps.append({
                "gap_type": "randomization_service_outage_evidence",
                "event_id": event.get("event_id"),
                "subject_id": event.get("subject_id"),
                "method": event.get("method"),
            })
            required_reviews.append(f"randomization_integrity_review:{event.get('event_id')}")

    # INJ-020: site data-quality risk indicators become a flagged risk,
    # never a site-status or inspection-outcome decision.
    site_inspection_risk_flags = []
    site_metrics = request.get("site_metrics")
    if site_metrics:
        reasons = []
        late_source_pct = site_metrics.get("late_source_pct")
        if late_source_pct is not None and float(late_source_pct) >= 20:
            reasons.append("late_source_pct>=20")
        if site_metrics.get("digit_preference_flag"):
            reasons.append("digit_preference_flag")
        if site_metrics.get("credential_sharing_flag"):
            reasons.append("credential_sharing_flag")
        if reasons:
            site_inspection_risk_flags.append({
                "site_id": site_metrics.get("site_id"),
                "reasons": reasons,
            })
            required_reviews.append(f"site_inspection_review:{site_metrics.get('site_id')}")

    contradictions.extend(_detect_econsent_withdrawal_mismatch(
        request.get("consents"), request.get("specimens"), request.get("processing_events")))
    gaps.extend(_detect_device_clock_skew(request.get("wearable_readings")))

    if (not elig and not request.get("support_tickets") and not endpoint_reviews and not proto
            and not request.get("evidence") and not request.get("randomization_events") and not site_metrics
            and not request.get("consents") and not request.get("wearable_readings")):
        gaps.append({"gap_type": "no_evidence_provided", "subject_id": subject_id})

    return {
        "request_id": request_id,
        "workflow": "clinical_trial_context",
        "as_of": as_of,
        "authorization": authorization,
        "evidence": list(request.get("evidence", [])),
        "contradictions": contradictions,
        "gaps": gaps,
        "abstentions": list(request.get("abstentions", [])),
        "human_review": {"required": True, "role": "Principal Investigator / Medical Monitor"},
        "execution_status": "not_executed",
        "audit": {"event_id": f"AUD-{request_id}"},
        "subject_id": subject_id,
        "trial_id": trial_id,
        "protocol_conflicts": protocol_conflicts,
        "unblinding_risk_flags": unblinding_risk_flags,
        "site_inspection_risk_flags": site_inspection_risk_flags,
        "required_reviews": required_reviews,
    }
