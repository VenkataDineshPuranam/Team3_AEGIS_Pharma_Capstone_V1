"""Authorization Service — POL-01 (deny by default on stale/ambiguous
authorization), ADR-006 (live IAM state wins over a cached gateway state).

Specs closed by this module: `submission/tests/test_authorization_fail_closed.py`.
Design basis: `submission/artefacts/04-ddd/domain_model.md` POL-01;
`submission/artefacts/11_ADR_REGISTER.md` ADR-006;
`submission/artefacts/16_THREAT_ABUSE_MODEL.md` §4 (INJ-067).
"""

ALLOW_STATES = {"active"}


def check_authorization(request):
    """Deny by default. Only an explicitly `active` live IAM state allows.

    A stale gateway cache (`ai_gateway_state`) is never consulted — POL-01 and
    ADR-006 both require the live `iam_state`, precisely because the cache is
    what let INJ-067 (entitlement revocation lag) happen.
    """
    entitlement = request.get("entitlement") or {}
    iam_state = entitlement.get("iam_state")
    user = entitlement.get("user", request.get("user", ""))
    purpose = request.get("purpose", "")
    checked_at = request.get("as_of", "")

    if iam_state in ALLOW_STATES:
        decision = "allow"
        reason = "iam_state_active"
    else:
        decision = "deny"
        reason = f"iam_state={iam_state!r} not in {sorted(ALLOW_STATES)} (deny by default, POL-01)"

    return {
        "user": user,
        "purpose": purpose,
        "checked_at": checked_at,
        "decision": decision,
        "reason": reason,
    }
