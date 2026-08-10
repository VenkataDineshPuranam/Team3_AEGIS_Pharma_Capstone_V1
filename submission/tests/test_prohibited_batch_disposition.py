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


if __name__ == "__main__":
    unittest.main()
