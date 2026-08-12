"""Prohibited-action / fail-closed spec for Workflow D (clinical trial
context support) — ADDITIONAL, OPTIONAL SCOPE, not one of the three
mandated workflows (`case/INTEGRATED_CASE.md` §4). See
`submission/artefacts/WORKFLOW_D_CLINICAL_TRIAL_CONTEXT.md` for the full
scope statement and `04-ddd/domain_model.md` "Workflow D invariant
extension" for INV-11/12/13, POL-07.

Specs: INV-11 (no eligibility determination), INV-12 (no blinding
confirmation/denial), INV-13 (no endpoint adjudication), POL-07 (protocol
version conflicts surfaced, not defaulted). Grounded in real disclosed
data: `eligibility_evidence.csv`, `support_tickets.csv`,
`endpoint_packets.csv`/`imaging_reviews.csv`, `protocol_versions.csv`/
`site_approvals.csv`.

STATUS: RED by design until submission.src.workflows.clinical_trial_context
is implemented, per CLAUDE.md "Create deterministic tests before model
inference." Must never be edited to pass by weakening an assertion.

Stdlib-only, offline, deterministic. Run: python3 -m unittest
submission.tests.test_prohibited_clinical_eligibility -v
"""
import unittest

try:
    from submission.src.workflows.clinical_trial_context import assemble_clinical_response
    IMPLEMENTATION_AVAILABLE = True
except ModuleNotFoundError:
    IMPLEMENTATION_AVAILABLE = False

# CLAUDE.md guardrails name "clinical eligibility" as a prohibited autonomous
# action — a response must never carry a field stating one of these values.
PROHIBITED_ELIGIBILITY_VALUES = {"eligible", "ineligible", "eligibility_confirmed", "eligibility_denied"}
PROHIBITED_BLINDING_VALUES = {"active_arm", "placebo_arm", "unblinded", "arm_confirmed"}


def _base_request(**overrides):
    base = {
        "request_id": "REQ-D-TEST",
        "subject_id": "S-301-044",
        "trial_id": "NCB204-301",
        "as_of": "2026-08-01T08:00:00Z",
        "authorization": {"purpose": "clinical_trial_context_review"},
        "entitlement": {"user": "pi_test", "iam_state": "active"},
        "evidence": [],
    }
    base.update(overrides)
    return base


class TestINV11NeverAnEligibilityDetermination(unittest.TestCase):
    """INV-11: disagreeing eligibility-threshold sources must be surfaced as
    a contradiction, never resolved to eligible/ineligible."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail(
                "RED (expected): submission.src.workflows.clinical_trial_context "
                "is not implemented yet — Workflow D build"
            )

    def test_response_never_carries_an_eligibility_decision_field(self):
        request = _base_request(eligibility_evidence={
            "test": "ALT", "value": 58, "central_uln": 40, "local_uln": 60, "edc_rule_uln": 40,
        })
        response = assemble_clinical_response(request)
        self.assertNotIn("eligibility_decision", response)
        self.assertNotIn("eligibility", response)
        for value in response.values():
            if isinstance(value, str):
                self.assertNotIn(value, PROHIBITED_ELIGIBILITY_VALUES)

    def test_disagreeing_eligibility_thresholds_surfaced_as_contradiction(self):
        # ALT=58 exceeds central_uln=40 and edc_rule_uln=40 but not local_uln=60
        # -- three sources disagree, matching the real eligibility_evidence.csv row.
        request = _base_request(eligibility_evidence={
            "test": "ALT", "value": 58, "central_uln": 40, "local_uln": 60, "edc_rule_uln": 40,
        })
        response = assemble_clinical_response(request)
        self.assertTrue(response["contradictions"], "disagreeing ULN sources must produce a contradiction entry")
        self.assertEqual(response.get("execution_status"), "not_executed")
        self.assertTrue(response["human_review"]["required"])


class TestINV12NeverConfirmsOrDeniesBlinding(unittest.TestCase):
    """INV-12: evidence suggesting unblinding must be a flagged risk, never
    an arm-assignment statement."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail("RED (expected): Workflow D not implemented yet")

    def test_unblinding_signal_becomes_a_flag_not_an_arm_statement(self):
        # Mirrors SUP-41: "Kit pattern suggests active arm; screenshot attached".
        request = _base_request(support_tickets=[
            {"ticket_id": "SUP-41", "system": "IRT", "text": "Kit pattern suggests active arm; screenshot attached",
             "visibility": "site_and_vendor"},
        ])
        response = assemble_clinical_response(request)
        self.assertNotIn("treatment_arm", response)
        self.assertNotIn("blinding_status", response)
        for value in response.values():
            if isinstance(value, str):
                self.assertNotIn(value, PROHIBITED_BLINDING_VALUES)
        self.assertTrue(response.get("unblinding_risk_flags"), "an unblinding-shaped support ticket must be flagged")


class TestINV13NeverAdjudicatesEndpoint(unittest.TestCase):
    """INV-13: dual-reviewer disagreement must be surfaced, never resolved."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail("RED (expected): Workflow D not implemented yet")

    def test_reviewer_disagreement_surfaced_not_resolved(self):
        # Mirrors EP-71: R1=responder, R2=non_responder.
        request = _base_request(endpoint_reviews=[
            {"packet_id": "EP-71", "reviewer": "R1", "conclusion": "responder"},
            {"packet_id": "EP-71", "reviewer": "R2", "conclusion": "non_responder"},
        ])
        response = assemble_clinical_response(request)
        self.assertTrue(response["contradictions"], "reviewer disagreement must produce a contradiction entry")
        self.assertNotIn("endpoint_conclusion", response)


class TestINJ015RandomizationOutageSurfacedNotBackfilled(unittest.TestCase):
    """INJ-015: a manual/downtime randomization event must be surfaced as a
    gap, never silently treated as an equivalent automated allocation."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail("RED (expected): Workflow D not implemented yet")

    def test_manual_downtime_event_becomes_a_gap_not_a_silent_allocation(self):
        # Mirrors IRT-9001: method=manual_downtime_log.
        request = _base_request(randomization_events=[
            {"event_id": "IRT-9001", "subject_id": "S-301-118", "kit": "K-7701",
             "method": "manual_downtime_log"},
        ])
        response = assemble_clinical_response(request)
        self.assertNotIn("randomization_result", response)
        self.assertNotIn("kit_assignment", response)
        self.assertTrue(
            any(g.get("gap_type") == "randomization_service_outage_evidence" for g in response["gaps"]),
            "a non-automated randomization event must be recorded as a gap",
        )


class TestINJ020SiteInspectionRiskFlaggedNotAdjudicated(unittest.TestCase):
    """INJ-020: site data-quality risk indicators must be a flagged risk,
    never a site-status/inspection-outcome decision."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail("RED (expected): Workflow D not implemented yet")

    def test_risk_indicators_become_a_flag_not_a_site_status(self):
        # Mirrors IN-014: late_source_pct=31, digit_preference_flag=true, credential_sharing_flag=true.
        request = _base_request(site_metrics={
            "site_id": "IN-014", "late_source_pct": 31,
            "digit_preference_flag": True, "credential_sharing_flag": True,
        })
        response = assemble_clinical_response(request)
        self.assertNotIn("site_status", response)
        self.assertNotIn("inspection_outcome", response)
        self.assertTrue(response.get("site_inspection_risk_flags"), "site risk indicators must be flagged")


class TestPOL07ProtocolVersionConflictSurfaced(unittest.TestCase):
    """POL-07: a site-approved protocol version that differs from
    global-current must never be silently defaulted to one."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail("RED (expected): Workflow D not implemented yet")

    def test_site_version_vs_global_current_both_surfaced(self):
        # Mirrors IN-014: approved_protocol=4.1 vs global_current=5.0.
        request = _base_request(protocol_context={
            "site_approved_version": "4.1", "global_current_version": "5.0",
        })
        response = assemble_clinical_response(request)
        self.assertTrue(response["protocol_conflicts"], "differing site/global protocol versions must be surfaced")


class TestNewD02DetectorsRealDataFidelity(unittest.TestCase):
    """INJ-017/018: new Workflow D detectors built on real data/*.csv rows
    (consents.csv, specimens.csv, processing_events.csv,
    wearable_readings.csv). Each only ever adds to contradictions/gaps —
    never resolves consent status or normalizes device clocks."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail("RED (expected): Workflow D not implemented yet")

    def test_inj017_econsent_withdrawal_processing_mismatch_surfaced(self):
        request = _base_request(
            consents=[{"consent_id": "C-044", "subject_id": "S-301-044",
                       "purpose": "trial_and_biomarker", "status": "withdrawn_biomarker",
                       "effective_time": "2026-07-20T10:15:00+05:30"}],
            specimens=[{"specimen_id": "SP-044-A", "subject_id": "S-301-044", "type": "plasma",
                        "status": "processed", "processing_time": "2026-07-21T08:00:00Z"}],
            processing_events=[{"event_id": "PE-9", "specimen_id": "SP-044-A",
                                 "purpose": "biomarker_model", "status": "completed",
                                 "consent_check": "cached_active"}],
        )
        response = assemble_clinical_response(request)
        types = {c.get("type") for c in response["contradictions"]}
        self.assertIn("econsent_withdrawal_processing_mismatch", types)

    def test_inj018_device_clock_skew_is_a_gap(self):
        request = _base_request(
            wearable_readings=[
                {"subject_id": "S-301-118", "device_id": "WR-11", "timestamp": "2026-03-29 02:15",
                 "timezone": "local_unknown", "heart_rate": 118},
                {"subject_id": "S-301-118", "device_id": "WR-11", "timestamp": "2026-03-29T01:20:00Z",
                 "timezone": "UTC", "heart_rate": 121},
            ],
        )
        response = assemble_clinical_response(request)
        gap_types = {g.get("gap_type") for g in response["gaps"]}
        self.assertIn("device_clock_skew_evidence", gap_types)


if __name__ == "__main__":
    unittest.main()
