"""Prohibited-action / fail-closed spec for the Authorization Service.

Specs: POL-01 (`submission/artefacts/04-ddd/domain_model.md` SS4).
Inject: INJ-067 (entitlement revocation lag) — named explicitly at G4
milestone M4 (`AEGIS_PROJECT_PLAN_FINAL.md` line 595: "INJ-065/066/067 specs
fail first").
Gate: G4.

STATUS: RED by design. `submission.src.services.authorization` does not
exist yet (P5 POC build).

Stdlib-only, offline, deterministic. Run: python3 -m unittest
submission.tests.test_authorization_fail_closed -v
"""
import unittest

try:
    from submission.src.services.authorization import check_authorization
    IMPLEMENTATION_AVAILABLE = True
except ModuleNotFoundError:
    IMPLEMENTATION_AVAILABLE = False

RED_MESSAGE = (
    "RED (expected at G4): submission.src.services.authorization is not "
    "implemented yet — implement in P5 POC build"
)

# data/users_entitlements.csv + data/access_cache.csv (INJ-067):
# contractor_77: iam_state=revoked, ai_gateway_state=active_cached
# cached_until=2026-08-03T10:00:00Z, revoked_at=2026-08-01T05:00:00Z
CONTRACTOR_REVOKED_BUT_CACHED = {
    "user": "contractor_77",
    "role": "supplier_quality_viewer",
    "iam_state": "revoked",
    "ai_gateway_state": "active_cached",
    "cached_until": "2026-08-03T10:00:00Z",
    "revoked_at": "2026-08-01T05:00:00Z",
}
QP_ACTIVE = {"user": "qp_eu_1", "role": "qualified_person", "iam_state": "active",
             "ai_gateway_state": "active"}


class TestPOL01DenyOnStaleOrAmbiguousAuthorization(unittest.TestCase):
    """POL-01: when authorization state is stale or ambiguous, deny by
    default. The live IAM state must win over a stale cache (ADR-006)."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail(RED_MESSAGE)

    def test_revoked_iam_state_denies_even_though_gateway_cache_is_still_active(self):
        # This is the exact INJ-067 scenario: cache says "active_cached" until
        # 2026-08-03, but IAM already revoked on 2026-08-01. A request "now"
        # (any time after revocation) must be denied — the cache must never
        # be trusted over a live IAM check.
        request = {"request_id": "REQ-AUTH-1", "as_of": "2026-08-02T09:00:00Z",
                   "entitlement": CONTRACTOR_REVOKED_BUT_CACHED}
        result = check_authorization(request)
        self.assertEqual(result["decision"], "deny")

    def test_active_iam_state_allows(self):
        request = {"request_id": "REQ-AUTH-2", "as_of": "2026-08-02T09:00:00Z",
                   "entitlement": QP_ACTIVE}
        result = check_authorization(request)
        self.assertEqual(result["decision"], "allow")

    def test_ambiguous_entitlement_state_denies_by_default(self):
        # Neither confirmed active nor confirmed revoked (e.g. IAM lookup
        # timed out / returned unknown) — POL-01 requires deny-by-default,
        # not a permissive fallback.
        ambiguous_entitlement = {"user": "unknown_user_9", "role": "unknown",
                                  "iam_state": "unknown", "ai_gateway_state": "unknown"}
        request = {"request_id": "REQ-AUTH-3", "as_of": "2026-08-02T09:00:00Z",
                   "entitlement": ambiguous_entitlement}
        result = check_authorization(request)
        self.assertEqual(result["decision"], "deny")

    def test_authorization_decision_is_always_logged(self):
        # evaluation/contracts/*.schema.json "authorization" object requires
        # user/purpose/checked_at/decision on every response, always.
        request = {"request_id": "REQ-AUTH-4", "as_of": "2026-08-02T09:00:00Z",
                   "entitlement": CONTRACTOR_REVOKED_BUT_CACHED}
        result = check_authorization(request)
        for field in ("user", "purpose", "checked_at", "decision"):
            self.assertIn(field, result)


if __name__ == "__main__":
    unittest.main()
