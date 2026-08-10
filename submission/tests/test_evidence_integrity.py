"""Prohibited-action / fail-closed spec for the Evidence-Resolver shared
kernel (ADR-001).

Specs: INV-02, INV-03, INV-04, INV-08, INV-10
(`submission/artefacts/04-ddd/domain_model.md` SS4).
Gate: G4.

STATUS: RED by design. `submission.src.services.evidence_resolver` does not
exist yet (P5 POC build).

Stdlib-only, offline, deterministic. Run: python3 -m unittest
submission.tests.test_evidence_integrity -v
"""
import unittest

try:
    from submission.src.services.evidence_resolver import (
        verify_integrity,
        check_unit_conversion,
        surface_contradiction,
        resolve_identity,
    )
    IMPLEMENTATION_AVAILABLE = True
except ModuleNotFoundError:
    IMPLEMENTATION_AVAILABLE = False

RED_MESSAGE = (
    "RED (expected at G4): submission.src.services.evidence_resolver is not "
    "implemented yet — implement in P5 POC build"
)


class TestINV08HashIntegrity(unittest.TestCase):
    """INV-08: every EvidenceItem must carry a real SHA-256 integrity hash
    and source_preserved: true."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail(RED_MESSAGE)

    def test_missing_hash_is_rejected(self):
        item = {"source": "data/example.csv", "record_id": "R-1",
                 "integrity": {"sha256": "", "source_preserved": True}}
        result = verify_integrity(item)
        self.assertFalse(result["valid"])

    def test_source_preserved_false_is_rejected(self):
        item = {"source": "data/example.csv", "record_id": "R-1",
                 "integrity": {"sha256": "a" * 64, "source_preserved": False}}
        result = verify_integrity(item)
        self.assertFalse(result["valid"])

    def test_well_formed_hash_and_preserved_flag_accepted(self):
        item = {"source": "data/example.csv", "record_id": "R-1",
                 "integrity": {"sha256": "0" * 64, "source_preserved": True}}
        result = verify_integrity(item)
        self.assertTrue(result["valid"])


class TestINV02NoSilentUnitConversion(unittest.TestCase):
    """INV-02: a unit value must never be silently converted between
    reported and target units."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail(RED_MESSAGE)

    def test_unapproved_conversion_rule_flags_mismatch_not_converts(self):
        # data/interface_mappings.csv: CRO_LAB_TO_LIMS,mg/L,ug/mL,1:1_assumed,no
        mapping = {"interface": "CRO_LAB_TO_LIMS", "source_unit": "mg/L",
                    "target_unit": "ug/mL", "conversion_rule": "1:1_assumed",
                    "approved": "no"}
        result = check_unit_conversion(mapping)
        self.assertEqual(result["action"], "flag_mismatch")
        self.assertNotEqual(result["action"], "convert")


class TestINV03ConflictedStatesSurfaced(unittest.TestCase):
    """INV-03: a lab result with disagreeing lims/stats/notebook state must
    be surfaced as conflicted_evidence, never auto-resolved."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail(RED_MESSAGE)

    def test_disagreeing_states_produce_a_contradiction_entry(self):
        states = {"lims_state": "OOS", "stats_state": "in_spec", "notebook_state": "invalid"}
        result = surface_contradiction(states)
        self.assertTrue(result["is_conflicted"])
        self.assertGreaterEqual(len(result["contradiction_entries"]), 1)

    def test_agreeing_states_produce_no_contradiction(self):
        states = {"lims_state": "in_spec", "stats_state": "in_spec", "notebook_state": "in_spec"}
        result = surface_contradiction(states)
        self.assertFalse(result["is_conflicted"])


class TestINV10IdentityAmbiguitySurfaced(unittest.TestCase):
    """INV-10: a product/substance identity conflict must be surfaced, never
    silently defaulted to one candidate."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail(RED_MESSAGE)

    def test_ambiguous_strength_presentation_is_surfaced_as_a_gap(self):
        # data/idmp_mappings.csv: NCB204-DE,NCB-204,ambiguous_strength_presentation
        mapping = {"local_product": "NCB204-DE", "idmp_product": "NCB-204",
                    "mapping_status": "ambiguous_strength_presentation"}
        result = resolve_identity(mapping)
        self.assertTrue(result["is_ambiguous"])
        self.assertIsNone(result.get("resolved_product"))  # never silently defaulted


if __name__ == "__main__":
    unittest.main()
