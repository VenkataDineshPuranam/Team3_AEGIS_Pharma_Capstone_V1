"""Workflow E — discovery/translational science support. ADDITIONAL,
OPTIONAL SCOPE, not one of the three mandated workflows
(`case/INTEGRATED_CASE.md` §4). See
`submission/artefacts/WORKFLOW_E_DISCOVERY_TRANSLATIONAL_SCIENCE.md` for
the full scope statement — this does not change RUB-08 scoring.

Decision-support only: never accepts/rejects an assay result as valid
despite an instrument-firmware/reagent-qualification conflict, never
approves a translational model for portfolio use, never certifies
preclinical image data as authentic/non-manipulated, never promotes a
research-unqualified model to decision-grade status, never resolves a
target-validation disagreement between internal and licensed-dataset
evidence.

Specs closed: `submission/tests/test_prohibited_discovery_translational_science.py`.
Contract: `submission/evaluation/contracts/discovery_response.schema.json`.
Design basis: `submission/artefacts/04-ddd/domain_model.md`-analogous
invariants INV-14..18 (defined in the Workflow E artefact, not the
immutable domain_model.md).
"""
from submission.src.services.authorization import check_authorization


def assemble_discovery_response(request):
    request_id = request.get("request_id", "")
    subject_ref = request.get("subject_ref", "")
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

    # INV-14 (INJ-007): an assay result run on an instrument whose firmware
    # does not match its qualified firmware, or with a reagent lot whose
    # CoA is not verified (e.g. transcribed_only) or expired, is never
    # accepted/rejected as valid — it is surfaced as a contradiction.
    assay_quality_flags = []
    for result in request.get("assay_results", []):
        instrument = result.get("instrument_info") or {}
        reagent = result.get("reagent_lot_info") or {}
        reasons = []
        firmware = instrument.get("firmware")
        qualified_firmware = instrument.get("qualified_firmware")
        if firmware is not None and qualified_firmware is not None and firmware != qualified_firmware:
            reasons.append("instrument_firmware_not_qualified_firmware")
        if instrument.get("qualification_status") not in (None, "qualified"):
            reasons.append(f"instrument_qualification_status={instrument.get('qualification_status')}")
        coa_status = reagent.get("coa_status")
        if coa_status not in (None, "verified"):
            reasons.append(f"reagent_coa_status={coa_status}")
        expiry = reagent.get("expiry")
        as_of_date = request.get("as_of_date")
        if expiry is not None and as_of_date is not None and expiry < as_of_date:
            reasons.append("reagent_lot_expired")
        if reasons:
            assay_quality_flags.append({
                "assay_id": result.get("assay_id"),
                "compound_code": result.get("compound_code"),
                "instrument": instrument.get("instrument_id"),
                "reagent_lot": reagent.get("reagent_lot"),
                "reasons": reasons,
            })
            contradictions.append({
                "type": "assay_result_qualification_conflict",
                "assay_id": result.get("assay_id"),
                "reasons": reasons,
            })
            required_reviews.append(f"assay_qualification_review:{result.get('assay_id')}")

    # INV-15 (INJ-009): a model performance slice showing a large subgroup
    # disparity (e.g. AUROC gap across ancestry-group slices, or a small-n
    # slice) is never silently averaged away — surfaced as a contradiction,
    # never resolved to a single portfolio-ranking figure.
    for perf in request.get("model_performance_slices", []):
        model_id = perf.get("model_id")
        slices = perf.get("slices", [])
        values = {s.get("slice"): s.get("value") for s in slices if s.get("value") is not None}
        if len(values) > 1:
            spread = max(values.values()) - min(values.values())
            if spread >= 0.10:
                contradictions.append({
                    "type": "model_performance_subgroup_disparity",
                    "model_id": model_id,
                    "metric": slices[0].get("metric") if slices else None,
                    "values_by_slice": values,
                    "spread": round(spread, 4),
                })
                required_reviews.append(f"subgroup_fairness_review:{model_id}")
        cohorts = perf.get("cohorts", [])
        for cohort in cohorts:
            if cohort.get("n") is not None and int(cohort["n"]) < 100:
                gaps.append({
                    "gap_type": "small_cohort_evidence",
                    "model_id": model_id,
                    "cohort": cohort.get("cohort"),
                    "ancestry_group": cohort.get("ancestry_group"),
                    "n": cohort.get("n"),
                })
                required_reviews.append(f"cohort_size_review:{model_id}:{cohort.get('cohort')}")

    # INV-16 (INJ-010): preclinical image-forensics evidence indicating a
    # high similarity score between panels claimed as distinct is never
    # certified as authentic or dismissed as manipulated — surfaced as a
    # contradiction requiring human forensic review.
    for forensic in request.get("image_forensics", []):
        score = forensic.get("similarity_score")
        if score is not None and float(score) >= 0.90:
            contradictions.append({
                "type": "preclinical_image_similarity_concern",
                "study_id": forensic.get("study_id"),
                "panel": forensic.get("panel"),
                "similarity_to": forensic.get("similarity_to"),
                "similarity_score": score,
                "metadata_note": forensic.get("metadata_note"),
            })
            required_reviews.append(f"image_forensics_review:{forensic.get('study_id')}:{forensic.get('panel')}")

    # INV-17 (INJ-011): a model registry entry whose status is not
    # decision-grade (e.g. research_unqualified) but is referenced by
    # performance/portfolio evidence is never promoted — surfaced as a
    # gap, never a "qualified"/"approved" status.
    for entry in request.get("model_registry_entries", []):
        status = entry.get("status")
        if status not in (None, "qualified", "approved", "production"):
            gaps.append({
                "gap_type": "model_not_decision_grade",
                "model_id": entry.get("model_id"),
                "status": status,
                "intended_use": entry.get("intended_use"),
            })
            required_reviews.append(f"model_qualification_review:{entry.get('model_id')}")

    # INV-18 (INJ-012): disagreeing target-validation evidence sources
    # (internal vs. licensed-dataset) are never resolved to a single
    # direction — surfaced as a contradiction. A license whose
    # model_training permission is restricted/unclear is surfaced as a
    # gap, never silently used.
    for target in request.get("target_evidence", []):
        by_target = {}
        for row in target.get("rows", []):
            by_target.setdefault(row.get("target"), set()).add(row.get("direction"))
        for tgt, directions in by_target.items():
            if len(directions) > 1:
                contradictions.append({
                    "type": "target_evidence_disagreement",
                    "target": tgt,
                    "directions": sorted(directions),
                })
                required_reviews.append(f"target_validation_review:{tgt}")

    for license_row in request.get("data_licenses", []):
        model_training = license_row.get("model_training")
        if model_training in ("restricted", "unclear"):
            gaps.append({
                "gap_type": "data_license_training_use_unresolved",
                "dataset": license_row.get("dataset"),
                "permitted_use": license_row.get("permitted_use"),
                "model_training": model_training,
            })
            required_reviews.append(f"data_license_review:{license_row.get('dataset')}")

    if (not request.get("assay_results") and not request.get("model_performance_slices")
            and not request.get("image_forensics") and not request.get("model_registry_entries")
            and not request.get("target_evidence") and not request.get("data_licenses")
            and not request.get("evidence")):
        gaps.append({"gap_type": "no_evidence_provided", "subject_ref": subject_ref})

    return {
        "request_id": request_id,
        "workflow": "discovery_translational_science",
        "as_of": as_of,
        "authorization": authorization,
        "evidence": list(request.get("evidence", [])),
        "contradictions": contradictions,
        "gaps": gaps,
        "abstentions": list(request.get("abstentions", [])),
        "human_review": {"required": True, "role": "Translational Science Lead / Discovery QA"},
        "execution_status": "not_executed",
        "audit": {"event_id": f"AUD-{request_id}"},
        "subject_ref": subject_ref,
        "assay_quality_flags": assay_quality_flags,
        "required_reviews": required_reviews,
    }
