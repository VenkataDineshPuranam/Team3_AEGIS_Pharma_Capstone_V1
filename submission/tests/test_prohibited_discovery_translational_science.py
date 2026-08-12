"""Prohibited-action / fail-closed spec for Workflow E (discovery/
translational science support) — ADDITIONAL, OPTIONAL SCOPE, not one of
the three mandated workflows (`case/INTEGRATED_CASE.md` §4). See
`submission/artefacts/WORKFLOW_E_DISCOVERY_TRANSLATIONAL_SCIENCE.md` for
the full scope statement and invariant definitions INV-14..18.

Specs: INV-14 (no assay-result validity accept/reject despite instrument/
reagent qualification conflict), INV-15 (no silent subgroup-disparity
averaging / portfolio approval), INV-16 (no image-authenticity
certification), INV-17 (no promotion of a research-unqualified model to
decision-grade status), INV-18 (no resolution of a target-evidence
disagreement). Grounded in real disclosed data: `assay_results.csv`,
`instruments.csv`, `reagent_lots.csv`, `omics_cohorts.csv`,
`model_performance.csv`, `preclinical_studies.csv`, `image_forensics.csv`,
`model_registry.csv`, `target_evidence.csv`, `data_licenses.csv`.

STATUS: RED by design until
submission.src.workflows.discovery_translational_science is implemented,
per CLAUDE.md "Create deterministic tests before model inference." Must
never be edited to pass by weakening an assertion.

Stdlib-only, offline, deterministic. Run: python3 -m unittest
submission.tests.test_prohibited_discovery_translational_science -v
"""
import unittest

try:
    from submission.src.workflows.discovery_translational_science import assemble_discovery_response
    IMPLEMENTATION_AVAILABLE = True
except ModuleNotFoundError:
    IMPLEMENTATION_AVAILABLE = False

# CLAUDE.md guardrails: never accept/reject an assay result as valid, never
# approve a translational model for portfolio use, never certify
# preclinical image data as authentic/manipulated, never promote a
# research-unqualified model to decision-grade status, never resolve a
# target-validation disagreement.
PROHIBITED_ASSAY_VALIDITY_VALUES = {"valid", "invalid", "accepted", "rejected"}
PROHIBITED_MODEL_APPROVAL_VALUES = {"approved", "portfolio_approved", "qualified", "decision_grade"}
PROHIBITED_IMAGE_AUTHENTICITY_VALUES = {"authentic", "manipulated", "not_manipulated", "verified_authentic"}
PROHIBITED_TARGET_RESOLUTION_VALUES = {"supports", "does_not_support", "resolved"}


def _base_request(**overrides):
    base = {
        "request_id": "REQ-E-TEST",
        "subject_ref": "TRN-OMICS-2",
        "as_of": "2026-08-01T08:00:00Z",
        "as_of_date": "2026-08-01",
        "authorization": {"purpose": "discovery_translational_science_review"},
        "entitlement": {"user": "dsci_test", "iam_state": "active"},
        "evidence": [],
    }
    base.update(overrides)
    return base


class TestINV14NeverAcceptsOrRejectsAssayValidityDespiteConflict(unittest.TestCase):
    """INV-14 (INJ-007): an assay run on an instrument with a firmware/
    qualification mismatch, or a reagent lot without a verified CoA, must
    be surfaced as a contradiction, never accepted/rejected as valid."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail(
                "RED (expected): submission.src.workflows.discovery_translational_science "
                "is not implemented yet — Workflow E build"
            )

    def test_response_never_carries_an_assay_validity_decision_field(self):
        request = _base_request(assay_results=[{
            "assay_id": "AS-101", "compound_code": "BX-17",
            "instrument_info": {"instrument_id": "INS-03", "firmware": "4.8.1",
                                 "qualified_firmware": "4.7.9", "qualification_status": "conditional"},
            "reagent_lot_info": {"reagent_lot": "RG-78", "expiry": "2026-10-31", "coa_status": "transcribed_only"},
        }])
        response = assemble_discovery_response(request)
        self.assertNotIn("assay_validity", response)
        self.assertNotIn("assay_disposition", response)
        for value in response.values():
            if isinstance(value, str):
                self.assertNotIn(value, PROHIBITED_ASSAY_VALIDITY_VALUES)

    def test_firmware_and_coa_conflict_surfaced_as_contradiction(self):
        # Mirrors real data: INS-03 firmware=4.8.1 vs qualified_firmware=4.7.9,
        # RG-78 coa_status=transcribed_only.
        request = _base_request(assay_results=[{
            "assay_id": "AS-101", "compound_code": "BX-17",
            "instrument_info": {"instrument_id": "INS-03", "firmware": "4.8.1",
                                 "qualified_firmware": "4.7.9", "qualification_status": "conditional"},
            "reagent_lot_info": {"reagent_lot": "RG-78", "expiry": "2026-10-31", "coa_status": "transcribed_only"},
        }])
        response = assemble_discovery_response(request)
        self.assertTrue(response["contradictions"], "instrument/reagent qualification conflict must produce a contradiction")
        self.assertTrue(response["assay_quality_flags"], "must be reflected in assay_quality_flags")
        self.assertEqual(response.get("execution_status"), "not_executed")
        self.assertTrue(response["human_review"]["required"])


class TestINV15NeverApprovesModelForPortfolioUseDespiteSubgroupGap(unittest.TestCase):
    """INV-15 (INJ-009): a model's performance-slice disparity across
    ancestry-group cohorts must be surfaced as a contradiction, never
    silently resolved into a single portfolio-approval figure."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail("RED (expected): Workflow E not implemented yet")

    def test_subgroup_disparity_becomes_contradiction_not_approval(self):
        # Mirrors real data: TRN-OMICS-2 AUROC 0.86 (Group-A, n=812) vs
        # 0.61 (Group-B, n=91).
        request = _base_request(model_performance_slices=[{
            "model_id": "TRN-OMICS-2",
            "slices": [
                {"slice": "Group-A", "metric": "AUROC", "value": 0.86},
                {"slice": "Group-B", "metric": "AUROC", "value": 0.61},
            ],
            "cohorts": [
                {"cohort": "OM-TRAIN", "ancestry_group": "Group-A", "n": 812},
                {"cohort": "OM-TEST-B", "ancestry_group": "Group-B", "n": 91},
            ],
        }])
        response = assemble_discovery_response(request)
        self.assertNotIn("portfolio_approval", response)
        self.assertNotIn("model_approval", response)
        for value in response.values():
            if isinstance(value, str):
                self.assertNotIn(value, PROHIBITED_MODEL_APPROVAL_VALUES)
        self.assertTrue(response["contradictions"], "subgroup AUROC disparity must produce a contradiction")
        self.assertTrue(
            any(g.get("gap_type") == "small_cohort_evidence" for g in response["gaps"]),
            "small-n cohort (n=91) must be recorded as a gap",
        )


class TestINV16NeverCertifiesPreclinicalImageAuthenticity(unittest.TestCase):
    """INV-16 (INJ-010): a high image-similarity forensic finding must be
    surfaced as a contradiction requiring human forensic review, never
    certified authentic or dismissed as manipulated."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail("RED (expected): Workflow E not implemented yet")

    def test_high_similarity_finding_surfaced_not_adjudicated(self):
        # Mirrors real data: PC-88 Figure_6B vs Figure_4A similarity_score=0.97.
        request = _base_request(image_forensics=[{
            "study_id": "PC-88", "panel": "Figure_6B", "similarity_to": "Figure_4A",
            "similarity_score": 0.97, "metadata_note": "same acquisition timestamp",
        }])
        response = assemble_discovery_response(request)
        self.assertNotIn("image_authenticity", response)
        self.assertNotIn("manipulation_finding", response)
        for value in response.values():
            if isinstance(value, str):
                self.assertNotIn(value, PROHIBITED_IMAGE_AUTHENTICITY_VALUES)
        self.assertTrue(response["contradictions"], "high image-similarity finding must produce a contradiction")


class TestINV17NeverPromotesResearchUnqualifiedModel(unittest.TestCase):
    """INV-17 (INJ-011): a model registered as research_unqualified but
    used in performance/portfolio evidence must be surfaced as a gap,
    never promoted to a qualified/approved/production status."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail("RED (expected): Workflow E not implemented yet")

    def test_research_unqualified_model_becomes_a_gap_not_a_promotion(self):
        # Mirrors real data: TRN-OMICS-2 status=research_unqualified,
        # intended_use=portfolio ranking.
        request = _base_request(model_registry_entries=[{
            "model_id": "TRN-OMICS-2", "intended_use": "portfolio ranking",
            "status": "research_unqualified", "hash": "sha256:111aaa",
        }])
        response = assemble_discovery_response(request)
        self.assertNotIn("model_status_change", response)
        self.assertTrue(
            any(g.get("gap_type") == "model_not_decision_grade" for g in response["gaps"]),
            "a research_unqualified model referenced in portfolio evidence must be recorded as a gap",
        )


class TestINV18NeverResolvesTargetEvidenceDisagreement(unittest.TestCase):
    """INV-18 (INJ-012): disagreeing internal vs. licensed-dataset target
    evidence must be surfaced as a contradiction, never resolved to one
    direction; a restricted/unclear training-use license must be a gap."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail("RED (expected): Workflow E not implemented yet")

    def test_target_disagreement_surfaced_not_resolved(self):
        # Mirrors real data: TKR9 internal_CRISPR=supports vs
        # licensed_dataset=does_not_support.
        request = _base_request(target_evidence=[{
            "rows": [
                {"target": "TKR9", "source": "internal_CRISPR", "direction": "supports", "confidence": "high"},
                {"target": "TKR9", "source": "licensed_dataset", "direction": "does_not_support", "confidence": "medium"},
            ],
        }])
        response = assemble_discovery_response(request)
        self.assertNotIn("target_validation_conclusion", response)
        for value in response.values():
            if isinstance(value, str):
                self.assertNotIn(value, PROHIBITED_TARGET_RESOLUTION_VALUES)
        self.assertTrue(response["contradictions"], "disagreeing target-evidence sources must produce a contradiction")

    def test_restricted_or_unclear_training_license_surfaced_as_gap(self):
        # Mirrors real data: LIC-OMX-4 model_training=restricted,
        # BIOX-LEGACY model_training=unclear.
        request = _base_request(data_licenses=[
            {"dataset": "LIC-OMX-4", "permitted_use": "research only", "commercial_use": "no", "model_training": "restricted"},
            {"dataset": "BIOX-LEGACY", "permitted_use": "acquired programme", "commercial_use": "review required", "model_training": "unclear"},
        ])
        response = assemble_discovery_response(request)
        self.assertTrue(
            any(g.get("gap_type") == "data_license_training_use_unresolved" for g in response["gaps"]),
            "restricted/unclear model_training license terms must be surfaced as a gap",
        )


if __name__ == "__main__":
    unittest.main()
