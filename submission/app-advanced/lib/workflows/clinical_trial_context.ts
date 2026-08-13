// Workflow D: Clinical Trial Context (INV-11/12/13, POL-07). Ported from
// submission/app/app.js assembleClinicalResponse / CLINICAL_SCENARIOS.
// ADDITIONAL, OPTIONAL SCOPE — not one of the three mandated workflows.
// Never renders eligibility, treatment_arm or endpoint_conclusion.
import { Authorization, EvidenceRef, checkAuthorization } from "./common";

export interface EligibilityEvidence {
  test: string;
  value: number;
  central_uln: number;
  local_uln: number;
  edc_rule_uln: number;
}

export interface SupportTicket {
  ticket_id: string;
  system: string;
  text: string;
  visibility: string;
}

export interface ProtocolContext {
  site_approved_version: string;
  global_current_version: string;
}

export interface ClinicalScenario {
  subject_id: string;
  trial_id: string;
  evidence: EvidenceRef[];
  eligibility_evidence: EligibilityEvidence | null;
  support_tickets: SupportTicket[];
  protocol_context: ProtocolContext | null;
}

export const CLINICAL_SCENARIOS: Record<string, ClinicalScenario> = {
  eligibilityAndUnblinding: {
    subject_id: "S-301-044",
    trial_id: "NCB204-301",
    evidence: [
      { source: "data/eligibility_evidence.csv", record_id: "S-301-044" },
      { source: "data/support_tickets.csv", record_id: "SUP-41" },
    ],
    eligibility_evidence: { test: "ALT", value: 58, central_uln: 40, local_uln: 60, edc_rule_uln: 40 },
    support_tickets: [
      { ticket_id: "SUP-41", system: "IRT", text: "Kit pattern suggests active arm; screenshot attached", visibility: "site_and_vendor" },
    ],
    protocol_context: null,
  },
  protocolVersion: {
    subject_id: "",
    trial_id: "NCB204-301",
    evidence: [
      { source: "data/protocol_versions.csv", record_id: "NCB204-301:5.0" },
      { source: "data/site_approvals.csv", record_id: "IN-014" },
    ],
    eligibility_evidence: null,
    support_tickets: [],
    protocol_context: { site_approved_version: "4.1", global_current_version: "5.0" },
  },
  clean: {
    subject_id: "",
    trial_id: "NCB204-301",
    evidence: [],
    eligibility_evidence: null,
    support_tickets: [],
    protocol_context: null,
  },
};

export interface ClinicalResponse {
  workflow: "clinical_trial_context";
  authorization: Authorization;
  subject_id: string;
  trial_id: string;
  evidence: EvidenceRef[];
  contradictions: Record<string, unknown>[];
  gaps: { gap_type: string; subject_id?: string }[];
  abstentions: unknown[];
  protocol_conflicts: (ProtocolContext & { trial_id: string })[];
  unblinding_risk_flags: { ticket_id: string; system: string; visibility: string; reason: string }[];
  site_inspection_risk_flags: unknown[];
  required_reviews: string[];
  human_review: { required: true; role: string };
  execution_status: "not_executed";
}

const UNBLINDING_SIGNAL_TERMS = ["active arm", "placebo arm", "kit pattern", "unblind"];

export function assembleClinicalResponse(scenarioKey: string): ClinicalResponse {
  return assembleClinicalResponseFromScenario(CLINICAL_SCENARIOS[scenarioKey]);
}

export function assembleClinicalResponseFromScenario(s: ClinicalScenario): ClinicalResponse {
  const authorization = checkAuthorization("clinical_trial_context");
  const contradictions: Record<string, unknown>[] = [];
  const gaps: { gap_type: string; subject_id?: string }[] = [];
  const unblinding_risk_flags: ClinicalResponse["unblinding_risk_flags"] = [];
  const protocol_conflicts: ClinicalResponse["protocol_conflicts"] = [];
  const required_reviews: string[] = [];

  // INV-11: disagreeing eligibility-threshold sources surfaced, never resolved.
  const elig = s.eligibility_evidence;
  if (elig) {
    const thresholds = { central_uln: elig.central_uln, local_uln: elig.local_uln, edc_rule_uln: elig.edc_rule_uln };
    const exceeds: Record<string, boolean> = {};
    for (const [name, uln] of Object.entries(thresholds)) {
      exceeds[name] = elig.value != null && uln != null && elig.value > uln;
    }
    if (new Set(Object.values(exceeds)).size > 1) {
      contradictions.push({
        type: "eligibility_threshold_disagreement",
        test: elig.test,
        value: elig.value,
        thresholds,
        exceeds_by_source: exceeds,
      });
      required_reviews.push(`eligibility_review:${s.subject_id}`);
    }
  }

  // INV-12: unblinding-risk signal terms flagged, never an arm-assignment statement.
  for (const ticket of s.support_tickets) {
    const text = String(ticket.text || "").toLowerCase();
    if (UNBLINDING_SIGNAL_TERMS.some((term) => text.includes(term))) {
      unblinding_risk_flags.push({
        ticket_id: ticket.ticket_id,
        system: ticket.system,
        visibility: ticket.visibility,
        reason: "support ticket text matches an unblinding-risk signal term",
      });
      required_reviews.push(`unblinding_review:${ticket.ticket_id}`);
    }
  }

  // POL-07: site-approved protocol version vs. global-current, both surfaced.
  if (s.protocol_context) {
    const { site_approved_version, global_current_version } = s.protocol_context;
    if (site_approved_version != null && global_current_version != null && site_approved_version !== global_current_version) {
      protocol_conflicts.push({ trial_id: s.trial_id, site_approved_version, global_current_version });
      required_reviews.push(`protocol_applicability_review:${s.trial_id}`);
    }
  }

  if (!elig && !s.support_tickets.length && !s.protocol_context && !s.evidence.length) {
    gaps.push({ gap_type: "no_evidence_provided", subject_id: s.subject_id });
  }

  return {
    workflow: "clinical_trial_context",
    authorization,
    subject_id: s.subject_id,
    trial_id: s.trial_id,
    evidence: s.evidence,
    contradictions,
    gaps,
    abstentions: [],
    protocol_conflicts,
    unblinding_risk_flags,
    site_inspection_risk_flags: [],
    required_reviews,
    human_review: { required: true, role: "Principal Investigator / Medical Monitor" },
    execution_status: "not_executed",
  };
}
