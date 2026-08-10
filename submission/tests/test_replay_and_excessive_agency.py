"""Prohibited-action / fail-closed spec for replay and excessive-agency abuse.

Named explicitly in `DEFINITION_OF_DONE.md` SS4: "Prompt injection, poisoning,
tool abuse, stale authorization, replay, exfiltration, excessive agency,
supply-chain compromise and denial-of-wallet are tested." The other 7 files in
this directory cover injection/poisoning/tool-abuse/stale-authorization/
exfiltration/supply-chain-compromise; this file closes the two remaining named
categories: replay and excessive agency.

Control basis: idempotency keys (`CLAUDE.md` guardrails; `knowledge/
ZERO_TRUST_AI_TOOLS.md` K-032 "idempotency, approval and audit controls for
any side-effect-capable tool") for replay; `04-ddd/gen_ai_boundaries.md` SS3
agent authority-limit table for excessive agency.
Gate: G4.

STATUS: RED by design. `submission.src.services.tool_gateway` does not exist
yet (P5 POC build).

Stdlib-only, offline, deterministic. Run: python3 -m unittest
submission.tests.test_replay_and_excessive_agency -v
"""
import unittest

try:
    from submission.src.services.tool_gateway import invoke_tool
    IMPLEMENTATION_AVAILABLE = True
except ModuleNotFoundError:
    IMPLEMENTATION_AVAILABLE = False

RED_MESSAGE = (
    "RED (expected at G4): submission.src.services.tool_gateway is not "
    "implemented yet — implement in P5 POC build"
)

APPROVED_DRAFT_ONLY_TOOL = {
    "tool_id": "draft_supply_option",
    "approved": "yes",
    "manifest": {"tool": "draft_supply_option", "permissions": ["supply:draft_create"]},
}


class TestReplayIsRejectedByIdempotencyKey(unittest.TestCase):
    """A tool call replayed with the same idempotency key must not cause a
    second execution — the second call must be recognised and refused/no-op,
    not silently repeated (K-032)."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail(RED_MESSAGE)

    def test_first_call_with_idempotency_key_is_accepted(self):
        call = dict(APPROVED_DRAFT_ONLY_TOOL, idempotency_key="IDEMP-001",
                    payload={"event_id": "EVT-9"})
        result = invoke_tool(call)
        self.assertEqual(result["decision"], "allow")

    def test_replayed_call_with_same_idempotency_key_is_not_re_executed(self):
        call = dict(APPROVED_DRAFT_ONLY_TOOL, idempotency_key="IDEMP-001",
                    payload={"event_id": "EVT-9"})
        first = invoke_tool(call)
        second = invoke_tool(call)  # exact replay
        self.assertEqual(second["decision"], "allow")
        self.assertTrue(second.get("replay_detected"))
        self.assertEqual(second.get("execution_count"), first.get("execution_count"))


class TestExcessiveAgencyIsDenied(unittest.TestCase):
    """An agent must never act outside its declared authority limit
    (`gen_ai_boundaries.md` SS3), even via a nominally-approved tool."""

    def setUp(self):
        if not IMPLEMENTATION_AVAILABLE:
            self.fail(RED_MESSAGE)

    def test_evidence_summarizer_agent_cannot_set_readiness_state(self):
        # Evidence-summarizer's authority limit is explicitly "read-only; may
        # not... set readiness_state" (gen_ai_boundaries.md SS3 table).
        call = {
            "tool_id": "batch_status_read",
            "approved": "yes",
            "requested_by_agent": "evidence-summarizer",
            "manifest": {"tool": "batch_status_read", "permissions": ["batch:read"]},
            "requested_action": "set_readiness_state",
        }
        result = invoke_tool(call)
        self.assertEqual(result["decision"], "deny")
        self.assertIn("authority_limit", result.get("reason", ""))

    def test_duplicate_similarity_scorer_cannot_merge_a_case(self):
        # Duplicate-similarity scorer's authority limit: "read-only; may not
        # merge or close a case" (gen_ai_boundaries.md SS3 table).
        call = {
            "tool_id": "pv_case_read",
            "approved": "yes",
            "requested_by_agent": "duplicate-similarity-scorer",
            "manifest": {"tool": "pv_case_read", "permissions": ["pv:read"]},
            "requested_action": "merge_case",
        }
        result = invoke_tool(call)
        self.assertEqual(result["decision"], "deny")
        self.assertIn("authority_limit", result.get("reason", ""))


if __name__ == "__main__":
    unittest.main()
