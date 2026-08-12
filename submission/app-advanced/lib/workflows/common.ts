/**
 * AEGIS-PHARMA advanced companion — shared workflow primitives.
 *
 * Ported line-for-line in spirit from submission/app/app.js (the compliant
 * static demonstrator's JS mirror of submission/src/workflows/*.py and
 * submission/src/services/authorization.py), so this Next.js companion
 * produces the SAME field names, SAME invariant discipline, and the SAME
 * fixed authorization entitlement. This file does not introduce any new
 * decision logic — it only re-hosts the existing one in TypeScript.
 */

export interface Authorization {
  user: string;
  purpose: string;
  checked_at: string;
  decision: "allow" | "deny";
  reason: string;
}

export interface HumanReview {
  required: true;
  role: string;
}

// Fixed, always-active entitlement — mirrors app/app.js's CURRENT_ENTITLEMENT.
// The deny-by-default path (POL-01) is exercised by
// submission/tests/test_authorization_fail_closed.py, not by this UI.
const CURRENT_ENTITLEMENT = { user: "qp_eu_1", iam_state: "active" as const };

export function checkAuthorization(purpose: string): Authorization {
  const decision: "allow" | "deny" =
    CURRENT_ENTITLEMENT.iam_state === "active" ? "allow" : "deny";
  return {
    user: CURRENT_ENTITLEMENT.user,
    purpose,
    checked_at: new Date().toISOString(),
    decision,
    reason:
      decision === "allow"
        ? "iam_state_active"
        : "iam_state_not_active (deny by default, POL-01)",
  };
}

export interface EvidenceRef {
  source: string;
  record_id: string;
}
