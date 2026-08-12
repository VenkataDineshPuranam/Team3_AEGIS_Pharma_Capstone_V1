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


class TestNewA02DetectorsRealDataFidelity(unittest.TestCase):
    """INJ-021/022/024/025/027/028: new Workflow A detectors built on real
    data/*.csv rows (data/material_genealogy.csv, warehouse_movements.csv,
    environmental_monitoring.csv, microbiology_results.csv, lab_results.csv,
    interface_mappings.csv, ebr_steps.csv, downtime_events.csv,
    pat_models.csv, recipes.csv, release_packets.csv, supplier_audits.csv).
    Each only ever adds to contradictions/gaps — never a disposition field."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail("RED (expected at G4): implementation not yet available")

    def _base(self, **overrides):
        request = {
            "request_id": "REQ-TEST-A02",
            "batch_id": "NCB204-B24071",
            "as_of": "2026-08-10T00:00:00Z",
            "authorization": {"user": "qp_eu_1", "purpose": "batch_review"},
            "evidence": [{"source": "data/lab_results.csv"}],
        }
        request.update(overrides)
        return request

    def test_inj021_genealogy_break_surfaced(self):
        response = assemble_batch_response(self._base(
            material_genealogy=[{"batch_id": "NCB204-B24071", "material_lot": "SUA-88",
                                  "relation": "missing_branch", "source": "MES"}],
            warehouse_movements=[{"movement_id": "WM-90", "material_lot": "SUA-88",
                                   "batch_id": "NCB204-B24071", "quantity": 1,
                                   "unit": "assembly", "status": "issued"}],
        ))
        types = {c.get("type") for c in response["contradictions"]}
        self.assertIn("biologics_genealogy_break", types)

    def test_inj022_sterility_excursion_surfaced(self):
        response = assemble_batch_response(self._base(
            environmental_monitoring=[{"sample_id": "EM-501", "batch_id": "NCS310-S26033",
                                        "location": "FF-GradeB-07", "cfu": 4, "alert_limit": 3,
                                        "time": "2026-07-22T18:10:00+05:30"}],
            microbiology_results=[{"sample_id": "EM-501", "initial_id": "Micrococcus spp",
                                    "corrected_id": "Bacillus cereus group",
                                    "correction_time": "2026-07-25T09:40:00+05:30"}],
        ))
        types = {c.get("type") for c in response["contradictions"]}
        self.assertIn("sterility_excursion_organism_identification_conflict", types)

    def test_inj024_unit_conversion_defect_surfaced(self):
        response = assemble_batch_response(self._base(
            lab_results=[{"result_id": "LR-88", "batch_id": "NCB204-B24071", "test": "potency",
                          "value": 0.92, "unit": "mg/L", "spec": "0.85-1.05 ug/mL", "status": "OOS_LIMS"}],
            interface_mappings=[{"interface": "CRO_LAB_TO_LIMS", "source_unit": "mg/L",
                                  "target_unit": "ug/mL", "conversion_rule": "1:1_assumed",
                                  "approved": "no"}],
        ))
        types = {c.get("type") for c in response["contradictions"]}
        self.assertIn("unit_conversion_unapproved", types)

    def test_inj025_ebr_back_entry_during_downtime_is_a_gap(self):
        response = assemble_batch_response(self._base(
            ebr_steps=[{"batch_id": "NCS310-S26033", "step": "filter_integrity",
                        "performed_time": "2026-07-22T16:30:00Z", "entered_time": "2026-07-23T09:05:00Z",
                        "entry_mode": "back_entry"}],
            downtime_events=[{"event_id": "DT-1", "systems": "MES,QMS,historian",
                               "cause": "ransomware containment",
                               "start": "2026-07-22T16:00:00Z", "end": "2026-07-23T08:00:00Z"}],
        ))
        gap_types = {g.get("gap_type") for g in response["gaps"]}
        self.assertIn("ebr_back_entry_during_system_downtime", gap_types)

    def test_inj027_pat_model_drift_surfaced(self):
        response = assemble_batch_response(self._base(
            pat_models=[{"model_id": "PAT-NIR-7", "version": "2.4", "approved_version": "2.3",
                         "deployed_time": "2026-07-09", "change_control": "missing"}],
            recipes=[{"recipe_id": "NCB-UP-19", "pat_model_version": "2.3", "effective_date": "2026-06-01"}],
        ))
        types = {c.get("type") for c in response["contradictions"]}
        self.assertIn("pat_model_version_drift", types)

    def test_inj028_qp_evidence_gap_surfaced(self):
        response = assemble_batch_response(self._base(
            release_packets=[{"batch_id": "NCB204-B24071",
                               "packet_item": "CMO audit commitment 2025-14", "status": "missing"}],
            supplier_audits=[{"supplier": "CMO-IE", "audit_id": "AUD-2025-14",
                               "commitment": "audit trail remediation", "due": "2026-06-30",
                               "status": "vendor_claims_closed_unverified"}],
        ))
        gap_types = {g.get("gap_type") for g in response["gaps"]}
        self.assertIn("qp_release_evidence_gap", gap_types)
        self.assertEqual(response["execution_status"], "not_executed")


if __name__ == "__main__":
    unittest.main()
