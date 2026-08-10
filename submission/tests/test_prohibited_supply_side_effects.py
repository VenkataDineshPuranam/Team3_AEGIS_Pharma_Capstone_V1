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


if __name__ == "__main__":
    unittest.main()
