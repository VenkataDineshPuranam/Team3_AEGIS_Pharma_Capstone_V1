"""Prohibited-action / fail-closed spec for Workflow B (PV case intake).

Specs: INV-05, POL-04 (`submission/artefacts/04-ddd/domain_model.md` SS4).
Gate: G4.

STATUS: RED by design. `submission.src.workflows.pv_intake` does not exist
yet (P5 POC build). Must keep failing until Phase 5 implements it.

Stdlib-only, offline, deterministic. Run: python3 -m unittest
submission.tests.test_prohibited_pv_auto_merge -v
"""
import unittest

try:
    from submission.src.workflows.pv_intake import assemble_pv_response
    IMPLEMENTATION_AVAILABLE = True
except ModuleNotFoundError:
    IMPLEMENTATION_AVAILABLE = False

RED_MESSAGE = (
    "RED (expected at G4): submission.src.workflows.pv_intake is not "
    "implemented yet — implement in P5 POC build"
)

# data/duplicate_candidates.csv: "PV-1001,PV-1014,0.93,patient/product/date overlap"
# — a real, high-similarity pair (same patient_key P-7X in icsr_cases.csv).
HIGH_SIMILARITY_PAIR = {"case_a": "PV-1001", "case_b": "PV-1014", "similarity": 0.93,
                         "reason": "patient/product/date overlap"}


class TestINV05NoSilentMerge(unittest.TestCase):
    """INV-05: duplicate_candidate status must never be silently promoted to
    a merge without qualified human confirmation."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail(RED_MESSAGE)

    def test_high_similarity_pair_is_flagged_not_merged(self):
        request = {"request_id": "REQ-PV-1", "case_ids": ["PV-1001", "PV-1014"],
                    "duplicate_pairs": [HIGH_SIMILARITY_PAIR]}
        response = assemble_pv_response(request)
        # Both cases must still exist independently in the response — never
        # collapsed into a single merged record.
        self.assertIn("PV-1001", response["case_ids"])
        self.assertIn("PV-1014", response["case_ids"])
        self.assertEqual(response["execution_status"], "not_executed")

    def test_no_merge_action_field_exists_anywhere_in_response(self):
        request = {"request_id": "REQ-PV-2", "case_ids": ["PV-1001", "PV-1014"],
                    "duplicate_pairs": [HIGH_SIMILARITY_PAIR]}
        response = assemble_pv_response(request)
        self.assertNotIn("merge_action", response)
        self.assertNotIn("merged_case_id", response)


class TestPOL04RequiredReviewOnDuplicateCandidate(unittest.TestCase):
    """POL-04: when two PV cases exceed a similarity threshold, both must be
    surfaced as duplicate_candidates with a required human review."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail(RED_MESSAGE)

    def test_similarity_above_threshold_populates_required_reviews(self):
        request = {"request_id": "REQ-PV-3", "case_ids": ["PV-1001", "PV-1014"],
                    "duplicate_pairs": [HIGH_SIMILARITY_PAIR]}
        response = assemble_pv_response(request)
        self.assertTrue(len(response["required_reviews"]) >= 1)
        self.assertTrue(len(response["duplicate_candidates"]) >= 1)

    def test_lower_similarity_pair_071_still_surfaced_not_dropped(self):
        # data/duplicate_candidates.csv also has PV-1001/PV-1009 at 0.71 —
        # below the 0.93 pair but still a disclosed candidate; POL-04 requires
        # it be surfaced, not silently dropped below some undocumented cutoff.
        lower_pair = {"case_a": "PV-1001", "case_b": "PV-1009", "similarity": 0.71,
                      "reason": "event/country overlap"}
        request = {"request_id": "REQ-PV-4", "case_ids": ["PV-1001", "PV-1009"],
                    "duplicate_pairs": [lower_pair]}
        response = assemble_pv_response(request)
        surfaced_pairs = {(c.get("case_a"), c.get("case_b")) for c in response["duplicate_candidates"]}
        self.assertIn(("PV-1001", "PV-1009"), surfaced_pairs)


if __name__ == "__main__":
    unittest.main()
