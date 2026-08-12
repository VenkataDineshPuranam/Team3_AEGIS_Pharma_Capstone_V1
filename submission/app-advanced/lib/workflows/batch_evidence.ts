// Workflow A: Batch Evidence (INV-01, POL-03). Ported from
// submission/app/app.js assembleBatchResponse / BATCH_SCENARIOS.
// Never issues a batch disposition (no release/reject/reprocess/relabel/recall field).
import { Authorization, EvidenceRef, checkAuthorization } from "./common";

export interface LabStates {
  lims_state: string;
  stats_state: string;
  notebook_state: string;
}

export interface BatchScenario {
  batch_id: string;
  evidence: EvidenceRef[];
  lab_states: LabStates | null;
}

export const BATCH_SCENARIOS: Record<string, BatchScenario> = {
  conflicted: {
    batch_id: "NCB204-B24071",
    evidence: [{ source: "data/oos_investigations.csv", record_id: "OOS-1" }],
    lab_states: { lims_state: "OOS", stats_state: "in_spec", notebook_state: "invalid" },
  },
  noEvidence: { batch_id: "NCB204-B24071", evidence: [], lab_states: null },
  clean: {
    batch_id: "NCB204-B24071",
    evidence: [
      { source: "data/genealogy.csv", record_id: "GEN-1" },
      { source: "data/lab_results.csv", record_id: "LAB-1" },
    ],
    lab_states: { lims_state: "in_spec", stats_state: "in_spec", notebook_state: "in_spec" },
  },
};

export interface Contradiction {
  type: string;
  [k: string]: unknown;
}

function surfaceContradiction(states: LabStates) {
  const values = new Set(
    [states.lims_state, states.stats_state, states.notebook_state].filter(Boolean),
  );
  const isConflicted = values.size > 1;
  const entries: Contradiction[] = isConflicted
    ? [{ type: "lab_state_disagreement", ...states }]
    : [];
  return { isConflicted, entries };
}

export interface BatchResponse {
  workflow: "batch_evidence";
  batch_id: string;
  authorization: Authorization;
  evidence: EvidenceRef[];
  contradictions: Contradiction[];
  gaps: { gap_type: string }[];
  abstentions: unknown[];
  human_review: { required: true; role: string };
  execution_status: "not_executed";
  readiness_state: string;
}

export function assembleBatchResponse(scenarioKey: string): BatchResponse {
  const s = BATCH_SCENARIOS[scenarioKey];
  const authorization = checkAuthorization("batch_review");
  const contradictions: Contradiction[] = [];
  const gaps: { gap_type: string }[] = [];

  if (s.lab_states) {
    const c = surfaceContradiction(s.lab_states);
    if (c.isConflicted) contradictions.push(...c.entries);
  }

  let readiness_state: string;
  if (contradictions.length) readiness_state = "conflicted_evidence";
  else if (!s.evidence.length) {
    readiness_state = "insufficient_evidence";
    gaps.push({ gap_type: "no_evidence_provided" });
  } else readiness_state = "ready_for_authorized_review";

  return {
    workflow: "batch_evidence",
    batch_id: s.batch_id,
    authorization,
    evidence: s.evidence,
    contradictions,
    gaps,
    abstentions: [],
    human_review: { required: true, role: "EU Qualified Person" },
    execution_status: "not_executed",
    readiness_state,
  };
}
