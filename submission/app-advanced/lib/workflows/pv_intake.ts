// Workflow B: PV Case Intake (INV-05, POL-04). Ported from
// submission/app/app.js assemblePvResponse / PV_SCENARIOS.
// Never makes a final seriousness/causality/expectedness/reportability/signal decision.
import { Authorization, checkAuthorization } from "./common";

export interface DuplicatePair {
  case_a: string;
  case_b: string;
  similarity: number;
  reason: string;
}

export interface PvScenario {
  case_ids: string[];
  pair: DuplicatePair;
}

export const PV_SCENARIOS: Record<string, PvScenario> = {
  highSimilarity: {
    case_ids: ["PV-1001", "PV-1014"],
    pair: { case_a: "PV-1001", case_b: "PV-1014", similarity: 0.93, reason: "patient/product/date overlap" },
  },
  lowSimilarity: {
    case_ids: ["PV-1001", "PV-1009"],
    pair: { case_a: "PV-1001", case_b: "PV-1009", similarity: 0.71, reason: "event/country overlap" },
  },
};

const SIMILARITY_SURFACE_THRESHOLD = 0.5;

export interface PvResponse {
  workflow: "pv_intake";
  case_ids: string[];
  authorization: Authorization;
  duplicate_candidates: DuplicatePair[];
  required_reviews: string[];
  human_review: { required: true; role: string };
  execution_status: "not_executed";
}

export function assemblePvResponse(scenarioKey: string): PvResponse {
  return assemblePvResponseFromScenario(PV_SCENARIOS[scenarioKey]);
}

export function assemblePvResponseFromScenario(s: PvScenario): PvResponse {
  const authorization = checkAuthorization("pv_intake");
  const duplicate_candidates: DuplicatePair[] = [];
  const required_reviews: string[] = [];

  if (s.pair.similarity >= SIMILARITY_SURFACE_THRESHOLD) {
    duplicate_candidates.push(s.pair);
    required_reviews.push(`duplicate_review:${s.pair.case_a}:${s.pair.case_b}`);
  }

  return {
    workflow: "pv_intake",
    case_ids: s.case_ids,
    authorization,
    duplicate_candidates,
    required_reviews,
    human_review: { required: true, role: "Safety Physician" },
    execution_status: "not_executed",
  };
}
