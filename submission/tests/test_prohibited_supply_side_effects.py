"""Prohibited-action / fail-closed spec for Workflow C (supply options).

Specs: INV-06, INV-07, POL-05 (`submission/artefacts/04-ddd/domain_model.md` SS4).
Anti-pattern this must not repeat: `starter/legacy_pharma.py` `plan_supply()`
(includes quarantined inventory and silently mutates a reservation).
Gate: G4.

STATUS: RED by design. `submission.src.workflows.supply_options` does not
exist yet (P5 POC build). Must keep failing until Phase 5 implements it.

Stdlib-only, offline, deterministic. Run: python3 -m unittest
submission.tests.test_prohibited_supply_side_effects -v
"""
import unittest

try:
    from submission.src.workflows.supply_options import assemble_supply_response
    IMPLEMENTATION_AVAILABLE = True
except ModuleNotFoundError:
    IMPLEMENTATION_AVAILABLE = False

RED_MESSAGE = (
    "RED (expected at G4): submission.src.workflows.supply_options is not "
    "implemented yet — implement in P5 POC build"
)

# data/inventory.csv row: "NCB-204,Global,quarantine,5100" — real quarantined stock.
QUARANTINED_ROW = {"product": "NCB-204", "market": "Global", "quality_status": "quarantine", "units": 5100}
RELEASED_ROW = {"product": "NCB-204", "market": "EU", "quality_status": "released", "units": 4300}


class TestINV06NoSideEffectsOnEveryPath(unittest.TestCase):
    """INV-06: SupplyOptionSet must carry no_side_effects: true on every path,
    including error/exception paths."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail(RED_MESSAGE)

    def test_happy_path_no_side_effects_true(self):
        request = {"request_id": "REQ-SUP-1", "event_id": "EVT-1",
                    "inventory": [RELEASED_ROW]}
        response = assemble_supply_response(request)
        self.assertIs(response["no_side_effects"], True)
        self.assertEqual(response["execution_status"], "not_executed")

    def test_error_path_still_no_side_effects_true(self):
        # Malformed/contradictory request must not bypass the no-side-effects
        # guarantee via an exception path (this is exactly the INV-06 clause
        # "including error/exception paths").
        malformed_request = {"request_id": "REQ-SUP-2"}  # missing event_id/inventory
        response = assemble_supply_response(malformed_request)
        self.assertIs(response.get("no_side_effects"), True)
        self.assertEqual(response.get("execution_status"), "not_executed")


class TestINV07AndPOL05QuarantinedStockExcluded(unittest.TestCase):
    """INV-07 / POL-05: quarantined/held inventory must never appear as an
    available option, only as an explicit excluded constraint."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail(RED_MESSAGE)

    def test_quarantined_units_never_offered_as_available_option(self):
        request = {"request_id": "REQ-SUP-3", "event_id": "EVT-2",
                    "inventory": [QUARANTINED_ROW, RELEASED_ROW]}
        response = assemble_supply_response(request)
        offered_units_by_status = {
            opt.get("quality_status") for opt in response["options"]
        }
        self.assertNotIn("quarantine", offered_units_by_status)
        for opt in response["options"]:
            self.assertEqual(opt["status"], "draft")  # never executed/allocated

    def test_quarantined_units_are_visible_in_quality_holds_not_hidden(self):
        # Per POL-05, quarantined stock must be surfaced as a constraint, not
        # silently dropped — this is the difference between "excluded" and
        # "invisible."
        request = {"request_id": "REQ-SUP-4", "event_id": "EVT-3",
                    "inventory": [QUARANTINED_ROW, RELEASED_ROW]}
        response = assemble_supply_response(request)
        self.assertTrue(len(response["quality_holds"]) >= 1)
        held_products = {h.get("product") for h in response["quality_holds"]}
        self.assertIn("NCB-204", held_products)


class TestINJ052SerializationAggregationBreak(unittest.TestCase):
    """INJ-052: case-to-pallet aggregation missing after a line restart
    (data/packaging_events.csv PKG-3 restart aggregation_rebuild=partial)
    must be surfaced as a gap, never silently treated as complete."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail(RED_MESSAGE)

    def test_surfaces_aggregation_break_gap(self):
        request = {
            "request_id": "REQ-SUP-INJ052", "event_id": "EVT-INJ052",
            "inventory": [RELEASED_ROW],
            "packaging_events": [
                {"line": "PKG-3", "event": "restart",
                 "time": "2026-07-28T13:22:00Z", "aggregation_rebuild": "partial"},
            ],
        }
        response = assemble_supply_response(request)
        gap_types = {g.get("gap_type") for g in response["gaps"]}
        self.assertIn("serialization_aggregation_break", gap_types)
        self.assertIs(response["no_side_effects"], True)
        self.assertNotIn("aggregation_complete", response)


class TestINJ053CounterfeitSuspicion(unittest.TestCase):
    """INJ-053: two returned packs with valid-looking serials but
    inconsistent print/distribution history (data/returns.csv RT-1/RT-2 on
    SN-10001) — surfaced as a contradiction, never resolved to
    authentic/counterfeit."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail(RED_MESSAGE)

    def test_surfaces_counterfeit_suspicion_indicator(self):
        request = {
            "request_id": "REQ-SUP-INJ053", "event_id": "EVT-INJ053",
            "inventory": [RELEASED_ROW],
            "returns": [
                {"return_id": "RT-1", "serial": "SN-10001", "print_score": "0.44", "distribution_match": "no"},
                {"return_id": "RT-2", "serial": "SN-10001", "print_score": "0.47", "distribution_match": "no"},
            ],
            "serialisation_events": [
                {"serial": "SN-10001", "event": "commission", "case": "CS-77", "pallet": "P-88"},
                {"serial": "SN-10001", "event": "return_scan", "case": "unknown", "pallet": "unknown"},
            ],
        }
        response = assemble_supply_response(request)
        types = {c.get("type") for c in response["contradictions"]}
        self.assertIn("counterfeit_suspicion_indicator", types)
        self.assertIs(response["no_side_effects"], True)
        self.assertNotIn("authenticity_confirmed", response)


class TestINJ057CustomsDocumentationMismatch(unittest.TestCase):
    """INJ-057: shipment product description differs from import
    licence/invoice (data/trade_documents.csv SH-902) — surfaced as a
    contradiction, never resolved/cleared for shipment."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail(RED_MESSAGE)

    def test_surfaces_customs_documentation_mismatch(self):
        request = {
            "request_id": "REQ-SUP-INJ057", "event_id": "EVT-INJ057",
            "inventory": [RELEASED_ROW],
            "shipments": [
                {"shipment_id": "SH-902", "product": "NCS-310", "lots": "NCS310-S26031",
                 "lane": "IN>AE", "status": "customs_hold", "logger": "LG-42", "pallet": "P-92"},
            ],
            "trade_documents": [
                {"shipment_id": "SH-902", "document": "invoice", "description": "sterile research samples"},
                {"shipment_id": "SH-902", "document": "import_licence", "description": "commercial sterile injectable"},
            ],
        }
        response = assemble_supply_response(request)
        types = {c.get("type") for c in response["contradictions"]}
        self.assertIn("customs_documentation_mismatch", types)
        self.assertIs(response["no_side_effects"], True)
        self.assertNotIn("shipment_cleared", response)


if __name__ == "__main__":
    unittest.main()
