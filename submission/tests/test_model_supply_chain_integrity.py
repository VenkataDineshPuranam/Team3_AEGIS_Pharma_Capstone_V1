"""Prohibited-action / fail-closed spec for the model supply chain.

Inject: INJ-070 (model supply-chain compromise) — `16_THREAT_ABUSE_MODEL.md`
SS6. Control basis: `knowledge/AI_MODEL_CHANGE_CONTROL.md` (K-005, approved),
extending INV-08's hash-integrity discipline to model artifacts.
Gate: G4.

STATUS: RED by design. `submission.src.services.model_registry` does not
exist yet (P5 POC build).

Stdlib-only, offline, deterministic. Run: python3 -m unittest
submission.tests.test_model_supply_chain_integrity -v
"""
import unittest

try:
    from submission.src.services.model_registry import verify_model_integrity
    IMPLEMENTATION_AVAILABLE = True
except ModuleNotFoundError:
    IMPLEMENTATION_AVAILABLE = False

RED_MESSAGE = (
    "RED (expected at G4): submission.src.services.model_registry is not "
    "implemented yet — implement in P5 POC build"
)

# data/model_registry.csv: GXP-SUM-1,batch evidence summarisation,pilot,sha256:222bbb
# data/model_artifacts.csv: GXP-SUM-1,sha256:222BAD,sha256:222bbb,missing
COMPROMISED_MODEL = {
    "model_id": "GXP-SUM-1",
    "registry_hash": "sha256:222bbb",
    "deployed_hash": "sha256:222BAD",
    "signature": "missing",
    "status": "pilot",
}
CLEAN_MODEL = {
    "model_id": "PV-NER-4",
    "registry_hash": "sha256:333ccc",
    "deployed_hash": "sha256:333ccc",
    "signature": "present",
    "status": "validated_scope_en_de",
}


class TestModelHashAndSignatureGate(unittest.TestCase):
    """A model whose deployed hash does not match its registry hash, or
    whose signature is missing, must be blocked from serving — not merely
    logged (16_THREAT_ABUSE_MODEL.md SS6)."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail(RED_MESSAGE)

    def test_hash_mismatch_blocks_serving(self):
        result = verify_model_integrity(COMPROMISED_MODEL)
        self.assertFalse(result["may_serve"])
        self.assertEqual(result["reason_code"], "hash_mismatch")

    def test_missing_signature_blocks_serving_even_if_hash_matched(self):
        model_with_matching_hash_but_no_signature = dict(
            COMPROMISED_MODEL, deployed_hash="sha256:222bbb"
        )
        result = verify_model_integrity(model_with_matching_hash_but_no_signature)
        self.assertFalse(result["may_serve"])
        self.assertEqual(result["reason_code"], "missing_signature")

    def test_matching_hash_and_present_signature_may_serve(self):
        result = verify_model_integrity(CLEAN_MODEL)
        self.assertTrue(result["may_serve"])

    def test_pilot_state_model_is_labeled_not_validated_even_when_it_may_serve(self):
        # 20_ISO42001_GOVERNANCE.md SS4: a pilot-state model must be visibly
        # labeled to the reviewer, distinct from a blocked/compromised one.
        clean_but_pilot_model = dict(CLEAN_MODEL, status="pilot")
        result = verify_model_integrity(clean_but_pilot_model)
        self.assertTrue(result["may_serve"])
        self.assertEqual(result["lifecycle_label"], "pilot")


if __name__ == "__main__":
    unittest.main()
