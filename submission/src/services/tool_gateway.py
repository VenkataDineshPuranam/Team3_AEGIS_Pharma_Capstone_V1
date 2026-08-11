"""Tool Gateway — POL-06 (unapproved tool denied), INV-01 (disposition write
always prohibited regardless of approval), Zero Trust idempotency (K-032),
agent authority limits (excessive-agency control).

Specs closed by this module:
`submission/tests/test_knowledge_authority_gate.py` (POL-06 half),
`submission/tests/test_replay_and_excessive_agency.py`.
Design basis: `submission/artefacts/04-ddd/domain_model.md` POL-06;
`submission/artefacts/04-ddd/gen_ai_boundaries.md` §3 (agent authority-limit table);
`submission/artefacts/16_THREAT_ABUSE_MODEL.md` §4 (INJ-066).
"""

# gen_ai_boundaries.md §3: each agent's authority limit, as a set of actions
# it must never be granted regardless of tool approval status.
AGENT_AUTHORITY_LIMITS = {
    "evidence-summarizer": {"set_readiness_state", "modify_evidence"},
    "duplicate-similarity-scorer": {"merge_case", "close_case"},
}

# Process-lifetime idempotency cache (K-032: idempotency/approval/audit on
# every side-effect-capable tool call). A real deployment would back this
# with the Audit Store (ADR-005); in-process dict is sufficient here since
# the tests exercise a single process.
_REPLAY_CACHE = {}


def invoke_tool(call):
    tool_id = call.get("tool_id", "")
    approved = call.get("approved") == "yes"
    manifest = call.get("manifest", {})
    permissions = manifest.get("permissions", [])
    post_action = str(manifest.get("postAction", "")).replace(" ", "")
    requested_by_agent = call.get("requested_by_agent")
    requested_action = call.get("requested_action")
    idempotency_key = call.get("idempotency_key")

    if not approved:
        return {"decision": "deny", "reason": f"tool_not_approved: {tool_id}"}

    # INV-01 is independent of tool-approval status — a disposition-write
    # permission or postAction is always denied, even on an approved tool.
    has_disposition_permission = any("disposition:write" in p for p in permissions)
    sets_disposition = "disposition=" in post_action
    if has_disposition_permission or sets_disposition:
        return {"decision": "deny", "reason": "disposition_write_prohibited (INV-01), independent of tool approval"}

    if requested_by_agent and requested_action:
        forbidden = AGENT_AUTHORITY_LIMITS.get(requested_by_agent, set())
        if requested_action in forbidden:
            return {
                "decision": "deny",
                "reason": f"authority_limit exceeded: {requested_by_agent} may not {requested_action}",
            }

    if idempotency_key:
        cached = _REPLAY_CACHE.get(idempotency_key)
        if cached is None:
            _REPLAY_CACHE[idempotency_key] = {"execution_count": 1}
            return {"decision": "allow", "replay_detected": False, "execution_count": 1}
        return {"decision": "allow", "replay_detected": True, "execution_count": cached["execution_count"]}

    return {"decision": "allow"}
