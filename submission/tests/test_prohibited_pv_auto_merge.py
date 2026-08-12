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


class TestNewB02DetectorsRealDataFidelity(unittest.TestCase):
    """INJ-038/039/040/041/042/043/044: new Workflow B detectors built on
    real data/*.csv rows (safety_receipts.csv, adverse_events.csv,
    terminology_versions.csv, listedness_sources.csv, sensitive_segments.csv,
    social_listening.csv, product_complaints.csv, signal_metrics.csv). Each
    only ever adds to contradictions/gaps — never a seriousness/causality/
    expectedness/reportability/signal decision."""

    def test_inj038_reporting_clock_conflict_surfaced(self):
        request = {"request_id": "REQ-B02-038", "case_ids": ["PV-1001"],
                   "safety_receipts": [
                       {"case_id": "PV-1001", "channel": "vendor", "receipt": "2026-07-19T20:01:00Z"},
                       {"case_id": "PV-1001", "channel": "affiliate_inbox", "receipt": "2026-07-20T08:11:00Z"},
                       {"case_id": "PV-1001", "channel": "global_db", "receipt": "2026-07-21T12:03:00Z"},
                   ]}
        response = assemble_pv_response(request)
        types = {c.get("type") for c in response["contradictions"]}
        self.assertIn("reporting_clock_conflict", types)

    def test_inj039_meddra_version_mismatch_surfaced(self):
        request = {"request_id": "REQ-B02-039", "case_ids": ["PV-1001"],
                   "adverse_events": [{"case_id": "PV-1001", "verbatim": "anaphylactic reaction",
                                        "meddra_version": "27.1", "pt": "Anaphylactic reaction"}],
                   "terminology_versions": [{"terminology": "MedDRA", "version": "27.1", "status": "legacy_cases"},
                                             {"terminology": "MedDRA", "version": "28.0", "status": "current_global"}]}
        response = assemble_pv_response(request)
        types = {c.get("type") for c in response["contradictions"]}
        self.assertIn("meddra_version_mismatch", types)

    def test_inj040_expectedness_source_conflict_surfaced(self):
        request = {"request_id": "REQ-B02-040", "case_ids": [],
                   "listedness_sources": [
                       {"product": "NCB-204", "source": "IB v12", "risk": "anaphylaxis", "listed": "yes"},
                       {"product": "NCB-204", "source": "CCDS v4", "risk": "anaphylaxis", "listed": "yes"},
                       {"product": "NCB-204", "source": "IN local label", "risk": "anaphylaxis", "listed": "no"},
                   ]}
        response = assemble_pv_response(request)
        types = {c.get("type") for c in response["contradictions"]}
        self.assertIn("expectedness_source_conflict", types)

    def test_inj041_sensitive_segment_in_general_queue_is_a_gap(self):
        request = {"request_id": "REQ-B02-041", "case_ids": ["PV-1020"],
                   "sensitive_segments": [{"case_id": "PV-1020", "segment": "pregnancy", "access_group": "PV_PREGNANCY"},
                                           {"case_id": "PV-1020", "segment": "minor", "access_group": "PV_PAEDIATRIC"}]}
        response = assemble_pv_response(request)
        gap_types = {g.get("gap_type") for g in response["gaps"]}
        self.assertIn("sensitive_segment_in_general_queue", gap_types)

    def test_inj042_social_media_authenticity_unconfirmed_is_a_gap(self):
        request = {"request_id": "REQ-B02-042", "case_ids": [],
                   "social_listening": [{"post_id": "SM-77", "text": "Nearly died after Nova infusion",
                                          "identifiable_reporter": "no", "identifiable_patient": "no",
                                          "country": "unknown"}]}
        response = assemble_pv_response(request)
        gap_types = {g.get("gap_type") for g in response["gaps"]}
        self.assertIn("social_media_authenticity_unconfirmed", gap_types)

    def test_inj043_product_quality_safety_link_surfaced(self):
        request = {"request_id": "REQ-B02-043", "case_ids": [],
                   "product_complaints": [{"complaint_id": "PC-701", "product": "NCS-310",
                                            "lot": "NCS310-S26033", "issue": "visible particles",
                                            "adverse_event_link": "possible"}]}
        response = assemble_pv_response(request)
        types = {c.get("type") for c in response["contradictions"]}
        self.assertIn("product_quality_safety_link_unresolved", types)

    def test_inj044_signal_disproportionality_instability_surfaced(self):
        request = {"request_id": "REQ-B02-044", "case_ids": [],
                   "signal_metrics": [
                       {"signal": "NCB204_anaphylaxis", "method": "ROR_raw", "value": 3.8},
                       {"signal": "NCB204_anaphylaxis", "method": "ROR_deduplicated", "value": 2.1},
                       {"signal": "NCB204_anaphylaxis", "method": "EBGM_alt_exposure", "value": 1.4},
                   ]}
        response = assemble_pv_response(request)
        types = {c.get("type") for c in response["contradictions"]}
        self.assertIn("signal_disproportionality_instability", types)


if __name__ == "__main__":
    unittest.main()
