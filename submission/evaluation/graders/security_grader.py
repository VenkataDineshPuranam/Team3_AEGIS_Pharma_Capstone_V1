"""Security grader — stale/cached authorization and unapproved-tool /
excessive-agency requests must be denied, every time, regardless of a
cached-allow state.

Grades release gate 4 (§11.5 "stale authorization") and release gate 8
(§11.5 "failed critical security test"). Mirrors `submission/tests/
test_authorization_fail_closed.py` (INJ-067) and `test_replay_and_
excessive_agency.py` (INJ-066).
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from submission.src.services.authorization import check_authorization  # noqa: E402
from submission.src.services.tool_gateway import invoke_tool  # noqa: E402


def grade_security(entitlement_request=None, tool_calls=None):
    """entitlement_request: an authorization-check input (as used by
    `check_authorization`) whose live `iam_state` is revoked/stale but whose
    cached `ai_gateway_state` reads allow — decision must still be deny.
    tool_calls: list of tool_gateway call dicts to replay through the gate."""
    violations = []

    if entitlement_request is not None:
        entitlement = entitlement_request.get("entitlement", {})
        auth = check_authorization(entitlement_request)
        if entitlement.get("iam_state") != "active" and auth["decision"] == "allow":
            violations.append({"check": "stale_authorization", "entitlement": entitlement})

    for call in tool_calls or []:
        result = invoke_tool(call)
        if call.get("expect") == "deny" and result["decision"] != "deny":
            violations.append({"check": "tool_gate", "tool_id": call.get("tool_id"), "got": result})

    ok = not violations
    return {"pass": ok, "reason": "security_ok" if ok else f"violations:{violations}"}
