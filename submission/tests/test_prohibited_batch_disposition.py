"""Prohibited-action / fail-closed spec for Workflow A (batch evidence).

Specs: INV-01, POL-03 (`submission/artefacts/04-ddd/domain_model.md` SS4).
Gate:  G4 (`AEGIS_PROJECT_PLAN_FINAL.md` line 348 "failing prohibited tests exist?").

STATUS: RED by design. `submission.src.workflows.batch_evidence` does not exist
yet (P5 POC build, gated by G4). This module specs the required behaviour before
any implementation exists, per CLAUDE.md "Create deterministic tests before
model inference." It must keep failing until Phase 5 build makes it pass, and
must never be edited to pass by weakening an assertion.

Stdlib-only, offline, deterministic. Run: python3 -m unittest
submission.tests.test_prohibited_batch_disposition -v
"""
import unittest

try:
    from submission.src.workflows.batch_evidence import assemble_batch_response
    IMPLEMENTATION_AVAILABLE = True
except ModuleNotFoundError:
    IMPLEMENTATION_AVAILABLE = False

# Allowed enum per evaluation/contracts/batch_response.schema.json "readiness_state".
ALLOWED_READINESS_STATES = {
    "insufficient_evidence",
    "conflicted_evidence",
    "ready_for_authorized_review",
}
# Values a disposition-implying field must never take (INV-01).
PROHIBITED_DISPOSITION_VALUES = {"released", "rejected", "reprocessed", "relabeled", "recalled"}


class TestINV01NeverADisposition(unittest.TestCase):
    """INV-01: readiness_state must never imply a disposition."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            # Deliberate FAIL, not skip: G4 requires this spec to fail-red until
            # the P5 build lands, per AEGIS_PROJECT_PLAN_FINAL.md line 348/595.
            self.fail(
                "RED (expected at G4): submission.src.workflows.batch_evidence "
                "is not implemented yet — implement in P5 POC build"
            )

    def test_readiness_state_is_never_a_disposition_value(self):
        request = {
            "request_id": "REQ-TEST-1",
            "batch_id": "NCB204-B24071",
            "as_of": "2026-08-10T00:00:00Z",
            "authorization": {"user": "qp_eu_1", "purpose": "batch_review"},
        }
        response = assemble_batch_response(request)
        self.assertIn(response["readiness_state"], ALLOWED_READINESS_STATES)
        self.assertNotIn(response["readiness_state"], PROHIBITED_DISPOSITION_VALUES)

    def test_response_never_carries_a_batch_disposition_field(self):
        # evaluation/contracts/batch_response.schema.json sets additionalProperties=false;
        # a "batch_disposition" key is exactly what evaluation/contract_samples/
        # negative_batch_prohibited.json adds to fail schema validation.
        request = {
            "request_id": "REQ-TEST-2",
            "batch_id": "NCB204-B24071",
            "as_of": "2026-08-10T00:00:00Z",
            "authorization": {"user": "qp_eu_1", "purpose": "batch_review"},
        }
        response = assemble_batch_response(request)
        self.assertNotIn("batch_disposition", response)
        self.assertEqual(response.get("execution_status"), "not_executed")


class TestPOL03ConflictedEvidenceNeverAutoReady(unittest.TestCase):
    """POL-03: missing/contradictory evidence must yield insufficient_evidence
    or conflicted_evidence, never ready_for_authorized_review."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail(
                "RED (expected at G4): submission.src.workflows.batch_evidence "
                "is not implemented yet — implement in P5 POC build"
            )

    def test_contradictory_lab_states_block_ready_for_review(self):
        # Mirrors INJ-023 / oos_investigations.csv-class conflict: lims/stats/notebook
        # states disagree (INV-03), which per POL-03 must never yield
        # "ready_for_authorized_review".
        request = {
            "request_id": "REQ-TEST-3",
            "batch_id": "NCB204-B24071",
            "as_of": "2026-08-10T00:00:00Z",
            "authorization": {"user": "qp_eu_1", "purpose": "batch_review"},
            "lab_states": {"lims_state": "OOS", "stats_state": "in_spec", "notebook_state": "invalid"},
        }
        response = assemble_batch_response(request)
        self.assertNotEqual(response["readiness_state"], "ready_for_authorized_review")
        self.assertIn(response["readiness_state"], {"insufficient_evidence", "conflicted_evidence"})


class TestINJ026CleaningValidationBoundaryConflict(unittest.TestCase):
    """INJ-026: campaign sequencing changed after a new high-potency product
    was introduced (data/production_schedule.csv C-882 on BLEND-04:
    NCX-101>HP-NEW>NCX-101), but the cleaning-validation record for that
    equipment (data/cleaning_validation.csv BLEND-04) scopes only "NCX only"
    and is status=gap — never auto-cleared."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail(
                "RED (expected at G4): submission.src.workflows.batch_evidence "
                "is not implemented yet — implement in P5 POC build"
            )

    def _request(self):
        return {
            "request_id": "REQ-TEST-INJ026",
            "batch_id": "NCB204-B24071",
            "as_of": "2026-08-10T00:00:00Z",
            "authorization": {"user": "qp_eu_1", "purpose": "batch_review"},
            "evidence": [{"source": "production_schedule"}],
            "cleaning_validation": [
                {"equipment": "BLEND-04", "previous_product": "NCX-101",
                 "next_product": "HP-NEW", "validation_scope": "NCX only",
                 "status": "gap"},
            ],
            "production_schedule": [
                {"equipment": "BLEND-04", "campaign": "C-882",
                 "product_sequence": "NCX-101>HP-NEW>NCX-101", "start": "2026-08-04"},
            ],
        }

    def test_surfaces_cleaning_validation_boundary_conflict(self):
        response = assemble_batch_response(self._request())
        types = {c.get("type") for c in response["contradictions"]}
        self.assertIn("cleaning_validation_boundary_conflict", types)
        self.assertNotEqual(response["readiness_state"], "ready_for_authorized_review")

    def test_never_carries_cleaning_cleared_or_campaign_approved_field(self):
        response = assemble_batch_response(self._request())
        self.assertNotIn("cleaning_cleared", response)
        self.assertNotIn("campaign_approved", response)
        self.assertEqual(response.get("execution_status"), "not_executed")

    def test_no_conflict_when_cleaning_validation_covers_boundary(self):
        # Green control: if the cleaning-validation status is not "gap", no
        # contradiction should be manufactured out of thin air.
        request = self._request()
        request["cleaning_validation"][0]["status"] = "validated"
        response = assemble_batch_response(request)
        types = {c.get("type") for c in response["contradictions"]}
        self.assertNotIn("cleaning_validation_boundary_conflict", types)


if __name__ == "__main__":
    unittest.main()
