// Workflow E: Discovery/Translational Science (INV-14..18). Ported from
// submission/app/app.js assembleDiscoveryResponse / DISCOVERY_SCENARIOS.
// ADDITIONAL, OPTIONAL SCOPE. Never renders assay_disposition, model_approval,
// image_authenticity, model_status_change or target_validation_conclusion.
import { Authorization, EvidenceRef, checkAuthorization } from "./common";

export interface InstrumentInfo {
  instrument_id: string;
  firmware: string;
  qualified_firmware: string;
  qualification_status: string;
}

export interface ReagentLotInfo {
  reagent_lot: string;
  coa_status: string;
  expiry: string;
}

export interface AssayResult {
  assay_id: string;
  compound_code: string;
  instrument_info: InstrumentInfo;
  reagent_lot_info: ReagentLotInfo;
}

export interface ModelPerformanceSlice {
  model_id: string;
  slices: { slice: string; metric: string; value: number }[];
}

export interface ModelRegistryEntry {
  model_id: string;
  intended_use: string;
  status: string;
}

export interface DiscoveryScenario {
  subject_ref: string;
  evidence: EvidenceRef[];
  assay_results: AssayResult[];
  model_performance_slices: ModelPerformanceSlice[];
  model_registry_entries: ModelRegistryEntry[];
}

export const DISCOVERY_SCENARIOS: Record<string, DiscoveryScenario> = {
  assayAndSubgroup: {
    subject_ref: "BX-17",
    evidence: [
      { source: "data/assay_results.csv", record_id: "AS-101" },
      { source: "data/model_performance.csv", record_id: "TRN-OMICS-2" },
    ],
    assay_results: [
      {
        assay_id: "AS-101",
        compound_code: "BX-17",
        instrument_info: { instrument_id: "INS-03", firmware: "4.8.1", qualified_firmware: "4.7.9", qualification_status: "conditional" },
        reagent_lot_info: { reagent_lot: "RG-78", coa_status: "transcribed_only", expiry: "2026-10-31" },
      },
    ],
    model_performance_slices: [
      { model_id: "TRN-OMICS-2", slices: [{ slice: "Group-A", metric: "AUROC", value: 0.86 }, { slice: "Group-B", metric: "AUROC", value: 0.61 }] },
    ],
    model_registry_entries: [],
  },
  unqualifiedModel: {
    subject_ref: "TRN-OMICS-2",
    evidence: [{ source: "data/model_registry.csv", record_id: "TRN-OMICS-2" }],
    assay_results: [],
    model_performance_slices: [],
    model_registry_entries: [{ model_id: "TRN-OMICS-2", intended_use: "portfolio ranking", status: "research_unqualified" }],
  },
  clean: { subject_ref: "", evidence: [], assay_results: [], model_performance_slices: [], model_registry_entries: [] },
};

export interface DiscoveryResponse {
  workflow: "discovery_translational_science";
  authorization: Authorization;
  subject_ref: string;
  evidence: EvidenceRef[];
  contradictions: Record<string, unknown>[];
  gaps: { gap_type: string; model_id?: string; status?: string; intended_use?: string; subject_ref?: string }[];
  abstentions: unknown[];
  assay_quality_flags: { assay_id: string; compound_code: string; instrument: string; reagent_lot: string; reasons: string[] }[];
  required_reviews: string[];
  human_review: { required: true; role: string };
  execution_status: "not_executed";
}

export function assembleDiscoveryResponse(scenarioKey: string): DiscoveryResponse {
  const s = DISCOVERY_SCENARIOS[scenarioKey];
  const authorization = checkAuthorization("discovery_translational_science");
  const contradictions: Record<string, unknown>[] = [];
  const gaps: DiscoveryResponse["gaps"] = [];
  const assay_quality_flags: DiscoveryResponse["assay_quality_flags"] = [];
  const required_reviews: string[] = [];

  // INV-14: firmware/CoA/expiry qualification conflicts surfaced, never accepted/rejected.
  for (const result of s.assay_results) {
    const instrument = result.instrument_info || ({} as InstrumentInfo);
    const reagent = result.reagent_lot_info || ({} as ReagentLotInfo);
    const reasons: string[] = [];
    if (instrument.firmware != null && instrument.qualified_firmware != null && instrument.firmware !== instrument.qualified_firmware) {
      reasons.push("instrument_firmware_not_qualified_firmware");
    }
    if (instrument.qualification_status != null && instrument.qualification_status !== "qualified") {
      reasons.push(`instrument_qualification_status=${instrument.qualification_status}`);
    }
    if (reagent.coa_status != null && reagent.coa_status !== "verified") {
      reasons.push(`reagent_coa_status=${reagent.coa_status}`);
    }
    if (reasons.length) {
      assay_quality_flags.push({
        assay_id: result.assay_id,
        compound_code: result.compound_code,
        instrument: instrument.instrument_id,
        reagent_lot: reagent.reagent_lot,
        reasons,
      });
      contradictions.push({ type: "assay_result_qualification_conflict", assay_id: result.assay_id, reasons });
      required_reviews.push(`assay_qualification_review:${result.assay_id}`);
    }
  }

  // INV-15: subgroup performance disparity surfaced, never silently averaged away.
  for (const perf of s.model_performance_slices) {
    const values: Record<string, number> = {};
    for (const sl of perf.slices) if (sl.value != null) values[sl.slice] = sl.value;
    const vals = Object.values(values);
    if (vals.length > 1) {
      const spread = Math.max(...vals) - Math.min(...vals);
      if (spread >= 0.1) {
        contradictions.push({
          type: "model_performance_subgroup_disparity",
          model_id: perf.model_id,
          metric: perf.slices[0] && perf.slices[0].metric,
          values_by_slice: values,
          spread: Math.round(spread * 10000) / 10000,
        });
        required_reviews.push(`subgroup_fairness_review:${perf.model_id}`);
      }
    }
  }

  // INV-17: research-unqualified registry entries surfaced as a gap, never promoted.
  for (const entry of s.model_registry_entries) {
    if (entry.status != null && !["qualified", "approved", "production"].includes(entry.status)) {
      gaps.push({ gap_type: "model_not_decision_grade", model_id: entry.model_id, status: entry.status, intended_use: entry.intended_use });
      required_reviews.push(`model_qualification_review:${entry.model_id}`);
    }
  }

  if (!s.assay_results.length && !s.model_performance_slices.length && !s.model_registry_entries.length && !s.evidence.length) {
    gaps.push({ gap_type: "no_evidence_provided", subject_ref: s.subject_ref });
  }

  return {
    workflow: "discovery_translational_science",
    authorization,
    subject_ref: s.subject_ref,
    evidence: s.evidence,
    contradictions,
    gaps,
    abstentions: [],
    assay_quality_flags,
    required_reviews,
    human_review: { required: true, role: "Translational Science Lead / Discovery QA" },
    execution_status: "not_executed",
  };
}
