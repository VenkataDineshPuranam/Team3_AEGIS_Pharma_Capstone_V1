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


def _to_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _detect_reporting_clock_conflict(safety_receipts):
    """INJ-038: awareness-clock receipts differ across vendor, affiliate
    inbox and global safety database for the same case
    (data/safety_receipts.csv PV-1001) — surfaced as a contradiction, the
    earliest/latest clock is never silently chosen."""
    contradictions = []
    by_case = {}
    for r in safety_receipts or []:
        by_case.setdefault(r.get("case_id"), []).append(r)
    for case_id, receipts in by_case.items():
        by_channel = {r.get("channel"): r.get("receipt") for r in receipts}
        if len(set(by_channel.values())) > 1:
            contradictions.append({
                "type": "reporting_clock_conflict",
                "case_id": case_id,
                "receipts_by_channel": by_channel,
            })
    return contradictions


def _detect_meddra_version_mismatch(adverse_events, terminology_versions):
    """INJ-039: a case coded under a MedDRA version other than the
    current_global version (data/adverse_events.csv PV-1001 v27.1 vs
    data/terminology_versions.csv 28.0=current_global) is surfaced as a
    contradiction — the preferred term is never silently recoded."""
    contradictions = []
    current_versions = {t.get("version") for t in (terminology_versions or []) if t.get("status") == "current_global"}
    for event in adverse_events or []:
        version = event.get("meddra_version")
        if version is not None and current_versions and version not in current_versions:
            contradictions.append({
                "type": "meddra_version_mismatch",
                "case_id": event.get("case_id"),
                "coded_version": version,
                "current_global_version": sorted(current_versions),
                "pt": event.get("pt"),
                "verbatim": event.get("verbatim"),
            })
    return contradictions


def _detect_expectedness_source_conflict(listedness_sources):
    """INJ-040: sources disagree on whether a risk is listed for a product
    (data/listedness_sources.csv NCB-204/anaphylaxis: IB v12=yes, CCDS
    v4=yes, IN local label=no) — surfaced as a contradiction, expectedness
    is never resolved to a single source."""
    contradictions = []
    by_key = {}
    for row in listedness_sources or []:
        by_key.setdefault((row.get("product"), row.get("risk")), []).append(row)
    for (product, risk), rows in by_key.items():
        if len({r.get("listed") for r in rows}) > 1:
            contradictions.append({
                "type": "expectedness_source_conflict",
                "product": product,
                "risk": risk,
                "sources": rows,
            })
    return contradictions


def _detect_sensitive_segment_gap(sensitive_segments, case_ids):
    """INJ-041: a case carrying pregnancy/paediatric sensitive segments
    (data/sensitive_segments.csv PV-1020) present in a general case queue
    is surfaced as a gap requiring restricted handling — never processed
    as an ordinary case."""
    gaps = []
    case_id_set = set(case_ids or [])
    for seg in sensitive_segments or []:
        if seg.get("case_id") in case_id_set:
            gaps.append({
                "gap_type": "sensitive_segment_in_general_queue",
                "case_id": seg.get("case_id"),
                "segment": seg.get("segment"),
                "access_group": seg.get("access_group"),
            })
    return gaps


def _detect_social_media_authenticity_gap(social_listening):
    """INJ-042: a social-listening post with neither an identifiable
    reporter nor an identifiable patient (data/social_listening.csv SM-77)
    is surfaced as a gap — authenticity is never assumed either way."""
    gaps = []
    for post in social_listening or []:
        if post.get("identifiable_reporter") == "no" and post.get("identifiable_patient") == "no":
            gaps.append({
                "gap_type": "social_media_authenticity_unconfirmed",
                "post_id": post.get("post_id"),
                "country": post.get("country"),
                "text": post.get("text"),
            })
    return gaps


def _detect_product_quality_safety_link(product_complaints, case_ids):
    """INJ-043: a product complaint whose adverse-event link is only
    "possible" (data/product_complaints.csv PC-701, NCS310-S26033 visible
    particles) is surfaced as a contradiction linking quality and safety
    evidence — never resolved to confirmed or unrelated."""
    contradictions = []
    for complaint in product_complaints or []:
        if complaint.get("adverse_event_link") == "possible":
            contradictions.append({
                "type": "product_quality_safety_link_unresolved",
                "complaint_id": complaint.get("complaint_id"),
                "product": complaint.get("product"),
                "lot": complaint.get("lot"),
                "issue": complaint.get("issue"),
                "candidate_case_ids": list(case_ids or []),
            })
    return contradictions


def _detect_signal_disproportionality_instability(signal_metrics):
    """INJ-044: a signal's disproportionality value changes materially
    across methods (data/signal_metrics.csv NCB204_anaphylaxis ROR_raw=3.8,
    ROR_deduplicated=2.1, EBGM_alt_exposure=1.4) — surfaced as a
    contradiction, never collapsed to a single stable value."""
    contradictions = []
    by_signal = {}
    for row in signal_metrics or []:
        by_signal.setdefault(row.get("signal"), []).append(row)
    for signal, rows in by_signal.items():
        values = [v for v in (_to_float(r.get("value")) for r in rows) if v is not None]
        if len(values) > 1 and (max(values) - min(values)) >= 1.0:
            contradictions.append({
                "type": "signal_disproportionality_instability",
                "signal": signal,
                "values_by_method": {r.get("method"): r.get("value") for r in rows},
                "spread": round(max(values) - min(values), 4),
            })
    return contradictions


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

    contradictions = list(request.get("contradictions", []))
    gaps = list(request.get("gaps", []))
    contradictions.extend(_detect_reporting_clock_conflict(request.get("safety_receipts")))
    contradictions.extend(_detect_meddra_version_mismatch(
        request.get("adverse_events"), request.get("terminology_versions")))
    contradictions.extend(_detect_expectedness_source_conflict(request.get("listedness_sources")))
    gaps.extend(_detect_sensitive_segment_gap(request.get("sensitive_segments"), case_ids))
    gaps.extend(_detect_social_media_authenticity_gap(request.get("social_listening")))
    contradictions.extend(_detect_product_quality_safety_link(request.get("product_complaints"), case_ids))
    contradictions.extend(_detect_signal_disproportionality_instability(request.get("signal_metrics")))

    return {
        "request_id": request_id,
        "workflow": "pv_intake",
        "as_of": as_of,
        "authorization": authorization,
        "evidence": list(request.get("evidence", [])),
        "contradictions": contradictions,
        "gaps": gaps,
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
