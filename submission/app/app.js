"use strict";
/*
 * AEGIS-PHARMA offline demonstrator.
 *
 * Deliberately mirrors submission/src/services/authorization.py and
 * submission/src/workflows/*.py in plain JS, so the same POL-01/INV-01/
 * INV-05/INV-06/INV-07/POL-03/POL-04/POL-05 behaviour is visible client-side
 * with no server and no network call. Renders exclusively via createElement/
 * textContent — never innerHTML (the exact anti-pattern starter/legacy_portal.js
 * demonstrates in canSee()/executeTool()).
 *
 * All requests here run through a fixed "current user" authorization check
 * first, exactly as every real request would.
 */

// This demonstrator always uses a live (active) EU QP / Safety Physician /
// Supply Board entitlement, to keep the three workflow panels focused on
// their own invariants. The authorization gate's deny-by-default behaviour
// is exercised directly by submission/tests/test_authorization_fail_closed.py.
const CURRENT_ENTITLEMENT = { user: "qp_eu_1", iam_state: "active" };

function checkAuthorization(entitlement, purpose) {
  const decision = entitlement && entitlement.iam_state === "active" ? "allow" : "deny";
  return {
    user: (entitlement && entitlement.user) || "",
    purpose: purpose || "",
    checked_at: new Date().toISOString(),
    decision,
    reason: decision === "allow" ? "iam_state_active" : "iam_state_not_active (deny by default, POL-01)",
  };
}

function surfaceContradiction(states) {
  const values = new Set([states.lims_state, states.stats_state, states.notebook_state].filter(Boolean));
  const isConflicted = values.size > 1;
  const entries = isConflicted ? [{ type: "lab_state_disagreement", ...states }] : [];
  return { isConflicted, entries };
}

// ---- Workflow A: Batch Evidence (INV-01, POL-03) --------------------------

const BATCH_SCENARIOS = {
  // INJ-023: LIMS marks OOS, stats marks OOT, notebook marks invalid_sample_prep
  // (data/oos_investigations.csv OOS-88, data/lab_results.csv LR-88).
  conflicted: {
    batch_id: "NCB204-B24071",
    evidence: [{ source: "data/oos_investigations.csv", record_id: "OOS-88" }, { source: "data/lab_results.csv", record_id: "LR-88" }],
    lab_states: { lims_state: "OOS", stats_state: "OOT", notebook_state: "invalid_sample_prep" },
  },
  noEvidence: { batch_id: "NCB204-B24071", evidence: [], lab_states: null },
  clean: {
    batch_id: "NCB204-B24071",
    evidence: [{ source: "data/lab_results.csv", record_id: "LR-89" }],
    lab_states: { lims_state: "in_spec", stats_state: "in_spec", notebook_state: "in_spec" },
  },
  // INJ-026: production_schedule.csv campaign C-882 on BLEND-04 sequences
  // NCX-101>HP-NEW>NCX-101, but cleaning_validation.csv for BLEND-04 scopes
  // only "NCX only" and is status=gap.
  cleaningValidationBoundary: {
    batch_id: "NCB204-B24071",
    evidence: [{ source: "data/cleaning_validation.csv", record_id: "BLEND-04" }, { source: "data/production_schedule.csv", record_id: "C-882" }],
    lab_states: null,
    cleaning_validation: [{ equipment: "BLEND-04", previous_product: "NCX-101", next_product: "HP-NEW", validation_scope: "NCX only", status: "gap" }],
    production_schedule: [{ equipment: "BLEND-04", campaign: "C-882", product_sequence: "NCX-101>HP-NEW>NCX-101", start: "2026-08-04" }],
  },
  // INJ-021: material_genealogy.csv shows SUA-88 as missing_branch for
  // NCB204-B24071, but warehouse_movements.csv WM-90 records it issued to
  // the same batch.
  genealogyBreak: {
    batch_id: "NCB204-B24071",
    evidence: [{ source: "data/material_genealogy.csv", record_id: "NCB204-B24071:SUA-88" }, { source: "data/warehouse_movements.csv", record_id: "WM-90" }],
    lab_states: null,
    material_genealogy: [{ batch_id: "NCB204-B24071", material_lot: "SUA-88", relation: "missing_branch", source: "MES" }],
    warehouse_movements: [{ movement_id: "WM-90", material_lot: "SUA-88", batch_id: "NCB204-B24071", quantity: 1, unit: "assembly", status: "issued" }],
  },
  // INJ-022: environmental_monitoring.csv EM-501 exceeds its alert limit
  // (cfu 4 > 3), and microbiology_results.csv corrects the organism ID
  // after initial review.
  sterilityExcursion: {
    batch_id: "NCS310-S26033",
    evidence: [{ source: "data/environmental_monitoring.csv", record_id: "EM-501" }, { source: "data/microbiology_results.csv", record_id: "EM-501" }],
    lab_states: null,
    environmental_monitoring: [{ sample_id: "EM-501", batch_id: "NCS310-S26033", location: "FF-GradeB-07", cfu: 4, alert_limit: 3, time: "2026-07-22T18:10:00+05:30" }],
    microbiology_results: [{ sample_id: "EM-501", initial_id: "Micrococcus spp", corrected_id: "Bacillus cereus group", correction_time: "2026-07-25T09:40:00+05:30" }],
  },
  // INJ-024: lab_results.csv LR-88 transmitted in mg/L; interface_mappings.csv
  // CRO_LAB_TO_LIMS converts mg/L->ug/mL with an unapproved 1:1_assumed rule.
  unitConversionDefect: {
    batch_id: "NCB204-B24071",
    evidence: [{ source: "data/lab_results.csv", record_id: "LR-88" }, { source: "data/interface_mappings.csv", record_id: "CRO_LAB_TO_LIMS" }],
    lab_states: null,
    lab_results: [{ result_id: "LR-88", batch_id: "NCB204-B24071", test: "potency", value: 0.92, unit: "mg/L", spec: "0.85-1.05 ug/mL", status: "OOS_LIMS" }],
    interface_mappings: [{ interface: "CRO_LAB_TO_LIMS", source_unit: "mg/L", target_unit: "ug/mL", conversion_rule: "1:1_assumed", approved: "no" }],
  },
  // INJ-025: ebr_steps.csv filter_integrity step was performed while
  // downtime_events.csv DT-1 (ransomware containment) had MES/QMS/historian
  // down, then back-entered afterwards.
  ebrBackEntry: {
    batch_id: "NCS310-S26033",
    evidence: [{ source: "data/ebr_steps.csv", record_id: "NCS310-S26033:filter_integrity" }, { source: "data/downtime_events.csv", record_id: "DT-1" }],
    lab_states: null,
    ebr_steps: [{ batch_id: "NCS310-S26033", step: "filter_integrity", performed_time: "2026-07-22T16:30:00Z", entered_time: "2026-07-23T09:05:00Z", entry_mode: "back_entry" }],
    downtime_events: [{ event_id: "DT-1", systems: "MES,QMS,historian", cause: "ransomware containment", start: "2026-07-22T16:00:00Z", end: "2026-07-23T08:00:00Z" }],
  },
  // INJ-027: pat_models.csv PAT-NIR-7 deployed at 2.4 vs approved_version
  // 2.3 (change_control=missing); recipes.csv NCB-UP-19 still references 2.3.
  patModelDrift: {
    batch_id: "NCB204-B24071",
    evidence: [{ source: "data/pat_models.csv", record_id: "PAT-NIR-7" }, { source: "data/recipes.csv", record_id: "NCB-UP-19" }],
    lab_states: null,
    pat_models: [{ model_id: "PAT-NIR-7", version: "2.4", approved_version: "2.3", deployed_time: "2026-07-09", change_control: "missing" }],
    recipes: [{ recipe_id: "NCB-UP-19", pat_model_version: "2.3", effective_date: "2026-06-01" }],
  },
  // INJ-028: release_packets.csv NCB204-B24071 "CMO audit commitment
  // 2025-14" is missing; supplier_audits.csv AUD-2025-14 status is only
  // vendor_claims_closed_unverified.
  qpEvidenceGap: {
    batch_id: "NCB204-B24071",
    evidence: [{ source: "data/release_packets.csv", record_id: "NCB204-B24071:CMO audit commitment 2025-14" }, { source: "data/supplier_audits.csv", record_id: "AUD-2025-14" }],
    lab_states: null,
    release_packets: [{ batch_id: "NCB204-B24071", packet_item: "CMO audit commitment 2025-14", status: "missing" }],
    supplier_audits: [{ supplier: "CMO-IE", audit_id: "AUD-2025-14", commitment: "audit trail remediation", due: "2026-06-30", status: "vendor_claims_closed_unverified" }],
  },
};

function assembleBatchResponse(scenarioKey) {
  const s = BATCH_SCENARIOS[scenarioKey];
  const authorization = checkAuthorization(CURRENT_ENTITLEMENT, "batch_review");
  const contradictions = [];
  const gaps = [];
  if (s.lab_states) {
    const c = surfaceContradiction(s.lab_states);
    if (c.isConflicted) contradictions.push(...c.entries);
  }

  // INJ-026: cleaning-validation boundary conflict — a gap-status cleaning
  // validation whose scope doesn't cover a scheduled campaign's product
  // sequence.
  for (const cv of s.cleaning_validation || []) {
    if (cv.status !== "gap") continue;
    for (const sched of s.production_schedule || []) {
      if (sched.equipment !== cv.equipment) continue;
      const sequence = String(sched.product_sequence || "").split(">").map((p) => p.trim());
      if (sequence.includes(cv.next_product)) {
        contradictions.push({ type: "cleaning_validation_boundary_conflict", equipment: cv.equipment,
          campaign: sched.campaign, product_sequence: sched.product_sequence,
          cleaning_validation_scope: cv.validation_scope, cleaning_validation_status: cv.status });
      }
    }
  }

  // INJ-021: material_genealogy missing_branch reconciled against
  // warehouse_movements issuance to the same batch.
  for (const g of s.material_genealogy || []) {
    if (g.relation !== "missing_branch") continue;
    const matches = (s.warehouse_movements || []).filter((w) => w.batch_id === g.batch_id && w.material_lot === g.material_lot);
    if (matches.length) {
      contradictions.push({ type: "biologics_genealogy_break", batch_id: g.batch_id, material_lot: g.material_lot,
        genealogy_relation: g.relation, genealogy_source: g.source, warehouse_movements: matches });
    }
  }

  // INJ-022: environmental excursion (cfu > alert_limit) with a corrected
  // organism identification.
  for (const sample of s.environmental_monitoring || []) {
    if (!(Number(sample.cfu) > Number(sample.alert_limit))) continue;
    const micro = (s.microbiology_results || []).find((m) => m.sample_id === sample.sample_id);
    if (micro && micro.initial_id !== micro.corrected_id) {
      contradictions.push({ type: "sterility_excursion_organism_identification_conflict", sample_id: sample.sample_id,
        batch_id: sample.batch_id, location: sample.location, cfu: sample.cfu, alert_limit: sample.alert_limit,
        initial_id: micro.initial_id, corrected_id: micro.corrected_id, correction_time: micro.correction_time });
    }
  }

  // INJ-024: unapproved unit-conversion mapping for a transmitted result unit.
  for (const result of s.lab_results || []) {
    for (const mapping of s.interface_mappings || []) {
      if (mapping.source_unit === result.unit && String(mapping.approved).toLowerCase() === "no") {
        contradictions.push({ type: "unit_conversion_unapproved", result_id: result.result_id, batch_id: result.batch_id,
          test: result.test, value: result.value, transmitted_unit: result.unit, target_unit: mapping.target_unit,
          conversion_rule: mapping.conversion_rule, interface: mapping.interface });
      }
    }
  }

  // INJ-025: EBR back-entry whose performed_time falls inside a downtime window.
  for (const step of s.ebr_steps || []) {
    if (step.entry_mode !== "back_entry") continue;
    for (const event of s.downtime_events || []) {
      if (!event.start) continue;
      const withinWindow = step.performed_time >= event.start && (event.end === "open" || !event.end || step.performed_time <= event.end);
      if (withinWindow) {
        gaps.push({ gap_type: "ebr_back_entry_during_system_downtime", batch_id: step.batch_id, step: step.step,
          performed_time: step.performed_time, entered_time: step.entered_time, downtime_event_id: event.event_id,
          downtime_systems: event.systems, downtime_cause: event.cause });
      }
    }
  }

  // INJ-027: deployed PAT model version diverges from its approved version.
  for (const model of s.pat_models || []) {
    if (model.version == null || model.approved_version == null || model.version === model.approved_version) continue;
    const staleRecipes = (s.recipes || []).filter((r) => r.pat_model_version === model.approved_version);
    contradictions.push({ type: "pat_model_version_drift", model_id: model.model_id, deployed_version: model.version,
      approved_version: model.approved_version, change_control: model.change_control, deployed_time: model.deployed_time,
      affected_recipes: staleRecipes });
  }

  // INJ-028: missing release-packet item whose supplier-audit commitment is
  // only vendor-claimed, never independently verified.
  for (const packet of s.release_packets || []) {
    if (packet.status !== "missing") continue;
    for (const audit of s.supplier_audits || []) {
      const suffix = (audit.audit_id || "").split("-").slice(1).join("-");
      if (suffix && packet.packet_item.includes(suffix)) {
        gaps.push({ gap_type: "qp_release_evidence_gap", batch_id: packet.batch_id, packet_item: packet.packet_item,
          supplier: audit.supplier, audit_id: audit.audit_id, commitment: audit.commitment, audit_status: audit.status });
      }
    }
  }

  let readiness_state;
  if (contradictions.length) readiness_state = "conflicted_evidence";
  else if (!s.evidence.length) { readiness_state = "insufficient_evidence"; gaps.push({ gap_type: "no_evidence_provided" }); }
  else readiness_state = "ready_for_authorized_review";

  return {
    workflow: "batch_evidence", batch_id: s.batch_id, authorization,
    evidence: s.evidence, contradictions, gaps, abstentions: [],
    human_review: { required: true, role: "EU Qualified Person" },
    execution_status: "not_executed", readiness_state,
  };
}

// ---- Workflow B: PV Case Intake (INV-05, POL-04) ---------------------------

const PV_SCENARIOS = {
  // INJ-037: patient-programme, literature and call-centre cases likely
  // describe the same event under different product-name spellings
  // (data/duplicate_candidates.csv PV-1001/PV-1014, 0.93).
  highSimilarity: { case_ids: ["PV-1001", "PV-1014"], pair: { case_a: "PV-1001", case_b: "PV-1014", similarity: 0.93, reason: "patient/product/date overlap" } },
  lowSimilarity: { case_ids: ["PV-1001", "PV-1009"], pair: { case_a: "PV-1001", case_b: "PV-1009", similarity: 0.71, reason: "event/country overlap" } },
  // INJ-038: PV-1001 awareness-clock receipts differ across vendor,
  // affiliate inbox and global safety database (data/safety_receipts.csv).
  reportingClockConflict: {
    case_ids: ["PV-1001"], pair: null,
    safety_receipts: [
      { case_id: "PV-1001", channel: "vendor", receipt: "2026-07-19T20:01:00Z" },
      { case_id: "PV-1001", channel: "affiliate_inbox", receipt: "2026-07-20T08:11:00Z" },
      { case_id: "PV-1001", channel: "global_db", receipt: "2026-07-21T12:03:00Z" },
    ],
  },
  // INJ-039: PV-1001 coded under MedDRA 27.1 while 28.0 is current_global
  // (data/adverse_events.csv, data/terminology_versions.csv).
  meddraVersionMismatch: {
    case_ids: ["PV-1001"], pair: null,
    adverse_events: [{ case_id: "PV-1001", verbatim: "anaphylactic reaction", meddra_version: "27.1", pt: "Anaphylactic reaction" }],
    terminology_versions: [{ terminology: "MedDRA", version: "27.1", status: "legacy_cases" }, { terminology: "MedDRA", version: "28.0", status: "current_global" }],
  },
  // INJ-040: IB v12 and CCDS v4 list anaphylaxis for NCB-204; the IN local
  // label does not (data/listedness_sources.csv).
  expectednessSourceConflict: {
    case_ids: [], pair: null,
    listedness_sources: [
      { product: "NCB-204", source: "IB v12", risk: "anaphylaxis", listed: "yes" },
      { product: "NCB-204", source: "CCDS v4", risk: "anaphylaxis", listed: "yes" },
      { product: "NCB-204", source: "IN local label", risk: "anaphylaxis", listed: "no" },
    ],
  },
  // INJ-041: PV-1020 carries pregnancy and paediatric sensitive segments
  // inside a general case queue (data/sensitive_segments.csv).
  sensitiveSegment: {
    case_ids: ["PV-1020"], pair: null,
    sensitive_segments: [{ case_id: "PV-1020", segment: "pregnancy", access_group: "PV_PREGNANCY" }, { case_id: "PV-1020", segment: "minor", access_group: "PV_PAEDIATRIC" }],
  },
  // INJ-042: a high-severity social-media post cannot be linked to an
  // identifiable reporter or patient (data/social_listening.csv SM-77).
  socialMediaAuthenticity: {
    case_ids: [], pair: null,
    social_listening: [{ post_id: "SM-77", text: "Nearly died after Nova infusion", identifiable_reporter: "no", identifiable_patient: "no", country: "unknown" }],
  },
  // INJ-043: a particles complaint may relate to adverse events and a
  // specific packaging lot (data/product_complaints.csv PC-701).
  productQualitySafetyLink: {
    case_ids: [], pair: null,
    product_complaints: [{ complaint_id: "PC-701", product: "NCS-310", lot: "NCS310-S26033", issue: "visible particles", adverse_event_link: "possible" }],
  },
  // INJ-044: the anaphylaxis signal shifts materially across duplicate-
  // suppression and exposure-estimate methods (data/signal_metrics.csv).
  signalDisproportionalityInstability: {
    case_ids: [], pair: null,
    signal_metrics: [
      { signal: "NCB204_anaphylaxis", method: "ROR_raw", value: 3.8 },
      { signal: "NCB204_anaphylaxis", method: "ROR_deduplicated", value: 2.1 },
      { signal: "NCB204_anaphylaxis", method: "EBGM_alt_exposure", value: 1.4 },
    ],
  },
};
const SIMILARITY_SURFACE_THRESHOLD = 0.5;

function assemblePvResponse(scenarioKey) {
  const s = PV_SCENARIOS[scenarioKey];
  const authorization = checkAuthorization(CURRENT_ENTITLEMENT, "pv_intake");
  const duplicate_candidates = [];
  const contradictions = [];
  const gaps = [];
  const required_reviews = [];
  if (s.pair && s.pair.similarity >= SIMILARITY_SURFACE_THRESHOLD) {
    duplicate_candidates.push(s.pair);
    required_reviews.push(`duplicate_review:${s.pair.case_a}:${s.pair.case_b}`);
  }

  // INJ-038: differing awareness-clock receipts across channels.
  const receiptsByCase = {};
  for (const r of s.safety_receipts || []) {
    (receiptsByCase[r.case_id] = receiptsByCase[r.case_id] || []).push(r);
  }
  for (const [caseId, receipts] of Object.entries(receiptsByCase)) {
    const byChannel = {};
    for (const r of receipts) byChannel[r.channel] = r.receipt;
    if (new Set(Object.values(byChannel)).size > 1) {
      contradictions.push({ type: "reporting_clock_conflict", case_id: caseId, receipts_by_channel: byChannel });
    }
  }

  // INJ-039: coded MedDRA version is not the current_global version.
  const currentVersions = new Set((s.terminology_versions || []).filter((t) => t.status === "current_global").map((t) => t.version));
  for (const ev of s.adverse_events || []) {
    if (ev.meddra_version != null && currentVersions.size && !currentVersions.has(ev.meddra_version)) {
      contradictions.push({ type: "meddra_version_mismatch", case_id: ev.case_id, coded_version: ev.meddra_version,
        current_global_version: [...currentVersions].sort(), pt: ev.pt, verbatim: ev.verbatim });
    }
  }

  // INJ-040: listedness sources disagree for the same product/risk pair.
  const byProductRisk = {};
  for (const row of s.listedness_sources || []) {
    const key = `${row.product}|${row.risk}`;
    (byProductRisk[key] = byProductRisk[key] || []).push(row);
  }
  for (const rows of Object.values(byProductRisk)) {
    if (new Set(rows.map((r) => r.listed)).size > 1) {
      contradictions.push({ type: "expectedness_source_conflict", product: rows[0].product, risk: rows[0].risk, sources: rows });
    }
  }

  // INJ-041: sensitive segments referenced by a case in this queue.
  const caseIdSet = new Set(s.case_ids || []);
  for (const seg of s.sensitive_segments || []) {
    if (caseIdSet.has(seg.case_id)) {
      gaps.push({ gap_type: "sensitive_segment_in_general_queue", case_id: seg.case_id, segment: seg.segment, access_group: seg.access_group });
    }
  }

  // INJ-042: social-media post with no identifiable reporter or patient.
  for (const post of s.social_listening || []) {
    if (post.identifiable_reporter === "no" && post.identifiable_patient === "no") {
      gaps.push({ gap_type: "social_media_authenticity_unconfirmed", post_id: post.post_id, country: post.country, text: post.text });
    }
  }

  // INJ-043: possible product-quality/adverse-event link.
  for (const complaint of s.product_complaints || []) {
    if (complaint.adverse_event_link === "possible") {
      contradictions.push({ type: "product_quality_safety_link_unresolved", complaint_id: complaint.complaint_id,
        product: complaint.product, lot: complaint.lot, issue: complaint.issue, candidate_case_ids: [...caseIdSet] });
    }
  }

  // INJ-044: signal value spread across disproportionality methods.
  const bySignal = {};
  for (const row of s.signal_metrics || []) (bySignal[row.signal] = bySignal[row.signal] || []).push(row);
  for (const [signal, rows] of Object.entries(bySignal)) {
    const values = rows.map((r) => r.value).filter((v) => v != null);
    if (values.length > 1 && Math.max(...values) - Math.min(...values) >= 1.0) {
      const byMethod = {};
      for (const r of rows) byMethod[r.method] = r.value;
      contradictions.push({ type: "signal_disproportionality_instability", signal, values_by_method: byMethod,
        spread: Math.round((Math.max(...values) - Math.min(...values)) * 10000) / 10000 });
    }
  }

  return {
    workflow: "pv_intake", case_ids: s.case_ids, authorization,
    duplicate_candidates, contradictions, gaps, required_reviews,
    human_review: { required: true, role: "Safety Physician" },
    execution_status: "not_executed",
  };
}

// ---- Workflow C: Supply Options (INV-06, INV-07, POL-05) -------------------

const SUPPLY_SCENARIOS = {
  withQuarantine: {
    event_id: "EVT-DEMO-1",
    inventory: [
      { product: "NCB-204", market: "Global", quality_status: "quarantine", units: 5100 },
      { product: "NCB-204", market: "EU", quality_status: "released", units: 4300 },
    ],
  },
  releasedOnly: {
    event_id: "EVT-DEMO-2",
    inventory: [{ product: "NCB-204", market: "US", quality_status: "released", units: 2700 }],
  },
  // INJ-051: SH-901 (quarantine) logger LG-31 readings dispute both pallet
  // association (P-89 vs P-88) and timezone (local_unknown vs UTC)
  // (data/shipments.csv, data/temperature_loggers.csv).
  coldChainExcursion: {
    event_id: "EVT-051",
    inventory: [{ product: "NCB-204", market: "EU", quality_status: "released", units: 4300 }],
    shipments: [{ shipment_id: "SH-901", product: "NCB-204", lots: "NCB204-B24062", lane: "IE>DE", status: "quarantine", logger: "LG-31", pallet: "P-88" }],
    temperature_loggers: [
      { logger: "LG-31", timestamp: "2026-07-29 02:10", timezone: "local_unknown", temp_c: 10.8, pallet: "P-89" },
      { logger: "LG-31", timestamp: "2026-07-29T01:15:00Z", timezone: "UTC", temp_c: 9.7, pallet: "P-88" },
    ],
  },
  // (already added, kept) INJ-052: PKG-3 restart with aggregation_rebuild=partial.
  serializationAggregationBreak: {
    event_id: "EVT-052",
    inventory: [{ product: "NCB-204", market: "EU", quality_status: "released", units: 4300 }],
    packaging_events: [{ line: "PKG-3", event: "restart", time: "2026-07-30T05:00:00Z", aggregation_rebuild: "partial" }],
  },
  // INJ-053: SN-10001 returned twice (RT-1/RT-2) with low print-authentication
  // scores and no distribution match (data/returns.csv, data/serialisation_events.csv).
  counterfeitSuspicion: {
    event_id: "EVT-053",
    inventory: [{ product: "NCB-204", market: "EU", quality_status: "released", units: 4300 }],
    returns: [
      { return_id: "RT-1", serial: "SN-10001", print_score: 0.44, distribution_match: "no" },
      { return_id: "RT-2", serial: "SN-10001", print_score: 0.47, distribution_match: "no" },
    ],
    serialisation_events: [{ serial: "SN-10001", event: "return_scan", case_id: "unknown", pallet_id: "unknown" }],
  },
  // INJ-054: EXCIP-ONE sole-source Polysorbate-X contamination, 8-week
  // recovery estimate, no qualified alternate (data/supplier_risks.csv).
  criticalExcipientShortage: {
    event_id: "EVT-054",
    inventory: [{ product: "NCB-204", market: "EU", quality_status: "released", units: 4300 }],
    supplier_risks: [{ supplier: "EXCIP-ONE", material: "Polysorbate-X", risk: "contamination", recovery_weeks: 8, alternate_qualified: "no" }],
  },
  // INJ-055: CMO-IE promises 2 batches to NTG and 1 to another sponsor in
  // window 2026-W34 against capacity_batches=2 (data/cmo_capacity.csv).
  cmoCapacityConflict: {
    event_id: "EVT-055",
    inventory: [{ product: "NCB-204", market: "EU", quality_status: "released", units: 4300 }],
    cmo_capacity: [{ cmo: "CMO-IE", window: "2026-W34", capacity_batches: 2, promised_NTG: 2, promised_other_sponsor: 1 }],
  },
  // INJ-056: 8-week demand across commercial/trial/compassionate-use
  // channels exceeds released EU inventory (data/demand_forecast.csv,
  // data/inventory.csv, data/allocation_constraints.csv).
  allocationEthics: {
    event_id: "EVT-056",
    inventory: [{ product: "NCB-204", market: "EU", quality_status: "released", units: 4300 }],
    demand_forecast: [
      { channel: "commercial_EU", product: "NCB-204", units_8w: 5200 },
      { channel: "clinical_trial", product: "NCB-204", units_8w: 900 },
      { channel: "compassionate_use", product: "NCB-204", units_8w: 600 },
    ],
    allocation_constraints: [
      { constraint: "quality_released_only", priority: "hard" },
      { constraint: "trial_continuity", priority: "high" },
      { constraint: "compassionate_use", priority: "ethics_board_review" },
      { constraint: "market_contracts", priority: "commercial" },
    ],
  },
  // INJ-057 (already added, kept): SH-902 trade documents disagree on
  // product description.
  customsDocumentationMismatch: {
    event_id: "EVT-057",
    inventory: [{ product: "NCS-310", market: "AE", quality_status: "released", units: 420 }],
    shipments: [{ shipment_id: "SH-902", product: "NCS-310", lots: "NCS310-S26031", lane: "IN>AE", status: "customs_hold", logger: "LG-42", pallet: "P-92" }],
    trade_documents: [
      { shipment_id: "SH-902", document: "invoice", description: "sterile research samples" },
      { shipment_id: "SH-902", document: "import_licence", description: "commercial sterile injectable" },
    ],
  },
  // INJ-058: NCS310-S26033/NCS310-S26031 share component VIAL-V19 and
  // equipment FF-02 but distribution differs and genealogy is incomplete
  // (data/recall_candidates.csv).
  recallScopeUncertainty: {
    event_id: "EVT-058",
    inventory: [{ product: "NCS-310", market: "AE", quality_status: "released", units: 420 }],
    recall_candidates: [
      { lot: "NCS310-S26033", shared_component: "VIAL-V19", shared_equipment: "FF-02", distribution: "not shipped" },
      { lot: "NCS310-S26031", shared_component: "VIAL-V19", shared_equipment: "FF-02", distribution: "AE hospitals" },
    ],
    material_genealogy: [],
  },
};

function assembleSupplyResponse(scenarioKey) {
  const s = SUPPLY_SCENARIOS[scenarioKey];
  const authorization = checkAuthorization(CURRENT_ENTITLEMENT, "supply_options");
  const options = [];
  const quality_holds = [];
  const contradictions = [];
  const gaps = [];
  for (const row of s.inventory) {
    if (row.quality_status === "quarantine") quality_holds.push(row);
    else if (row.quality_status === "released") {
      options.push({ option_id: `OPT-${row.product}-${row.market}`, status: "draft", ...row });
    }
  }

  // INJ-052: a restart with a partial/missing aggregation rebuild.
  for (const row of s.packaging_events || []) {
    if (row.event === "restart" && ["partial", "missing"].includes(row.aggregation_rebuild)) {
      gaps.push({ gap_type: "serialization_aggregation_break", line: row.line, event_time: row.time, aggregation_rebuild: row.aggregation_rebuild });
    }
  }

  // INJ-053: repeated low-print-score returns with no distribution match.
  const returnsBySerial = {};
  for (const r of s.returns || []) (returnsBySerial[r.serial] = returnsBySerial[r.serial] || []).push(r);
  for (const [serial, rows] of Object.entries(returnsBySerial)) {
    const suspicious = rows.filter((r) => r.distribution_match === "no" && r.print_score != null && r.print_score < 0.9);
    if (suspicious.length >= 2) {
      const events = (s.serialisation_events || []).filter((e) => e.serial === serial);
      contradictions.push({ type: "counterfeit_suspicion_indicator", serial, return_ids: suspicious.map((r) => r.return_id),
        print_scores: suspicious.map((r) => r.print_score), serialisation_events: events });
    }
  }

  // INJ-057: trade documents disagree on shipment product description.
  const docsByShipment = {};
  for (const d of s.trade_documents || []) (docsByShipment[d.shipment_id] = docsByShipment[d.shipment_id] || []).push(d);
  for (const [shipmentId, docs] of Object.entries(docsByShipment)) {
    const descriptions = new Set(docs.map((d) => d.description));
    if (descriptions.size > 1) {
      const shipment = (s.shipments || []).find((sh) => sh.shipment_id === shipmentId);
      contradictions.push({ type: "customs_documentation_mismatch", shipment_id: shipmentId, documents: docs,
        shipment_product: shipment ? shipment.product : null });
    }
  }

  // INJ-051: temperature-logger readings dispute pallet association / timezone.
  const loggerReadings = {};
  for (const row of s.temperature_loggers || []) (loggerReadings[row.logger] = loggerReadings[row.logger] || []).push(row);
  for (const shipment of s.shipments || []) {
    const readings = loggerReadings[shipment.logger] || [];
    if (!readings.length) continue;
    const pallets = new Set(readings.map((r) => r.pallet));
    const timezones = new Set(readings.map((r) => r.timezone));
    if (pallets.size > 1 || timezones.size > 1) {
      contradictions.push({ type: "cold_chain_lane_excursion", shipment_id: shipment.shipment_id, product: shipment.product,
        lots: shipment.lots, lane: shipment.lane, logger: shipment.logger, readings, pallet_disputed: pallets.size > 1,
        declared_pallet: shipment.pallet });
    }
  }

  // INJ-054: sole-source excipient with no qualified alternate.
  for (const row of s.supplier_risks || []) {
    if (String(row.alternate_qualified).toLowerCase() === "no") {
      gaps.push({ gap_type: "critical_excipient_shortage_no_alternate", supplier: row.supplier, material: row.material,
        risk: row.risk, recovery_weeks: row.recovery_weeks });
    }
  }

  // INJ-055: CMO's promised batches exceed disclosed capacity.
  for (const row of s.cmo_capacity || []) {
    const total = (row.promised_NTG || 0) + (row.promised_other_sponsor || 0);
    if (total > row.capacity_batches) {
      contradictions.push({ type: "cmo_capacity_overcommitted", cmo: row.cmo, window: row.window,
        capacity_batches: row.capacity_batches, promised_NTG: row.promised_NTG, promised_other_sponsor: row.promised_other_sponsor,
        total_promised: total });
    }
  }

  // INJ-056: aggregate demand exceeds released inventory for a product.
  const demandByProduct = {};
  for (const row of s.demand_forecast || []) {
    (demandByProduct[row.product] = demandByProduct[row.product] || []).push([row.channel, row.units_8w || 0]);
  }
  const releasedByProduct = {};
  for (const row of s.inventory) {
    if (row.quality_status === "released") releasedByProduct[row.product] = (releasedByProduct[row.product] || 0) + (row.units || 0);
  }
  for (const [product, channels] of Object.entries(demandByProduct)) {
    const totalDemand = channels.reduce((sum, [, u]) => sum + u, 0);
    const available = releasedByProduct[product] || 0;
    if (totalDemand > available) {
      gaps.push({ gap_type: "demand_exceeds_available_inventory", product, total_demand_8w: totalDemand,
        released_inventory: available, demand_by_channel: Object.fromEntries(channels), allocation_constraints: s.allocation_constraints || [] });
    }
  }

  // INJ-058: shared component/equipment lots with differing distribution
  // and/or no confirmed genealogy link.
  const genealogyLots = new Set((s.material_genealogy || []).map((g) => g.batch_id));
  const byComponentEquipment = {};
  for (const row of s.recall_candidates || []) {
    const key = `${row.shared_component}|${row.shared_equipment}`;
    (byComponentEquipment[key] = byComponentEquipment[key] || []).push(row);
  }
  for (const rows of Object.values(byComponentEquipment)) {
    if (rows.length < 2) continue;
    const distributions = new Set(rows.map((r) => r.distribution));
    const unconfirmed = rows.filter((r) => !genealogyLots.has(r.lot)).map((r) => r.lot);
    if (distributions.size > 1 || unconfirmed.length) {
      gaps.push({ gap_type: "recall_scope_uncertain", shared_component: rows[0].shared_component, shared_equipment: rows[0].shared_equipment,
        candidate_lots: rows.map((r) => r.lot), distribution_by_lot: Object.fromEntries(rows.map((r) => [r.lot, r.distribution])),
        lots_without_genealogy_confirmation: unconfirmed });
    }
  }

  return {
    workflow: "supply_options", event_id: s.event_id, authorization,
    options, quality_holds, contradictions, gaps, approvals_required: ["Supply Governance Board"],
    human_review: { required: true, role: "Supply Governance Board" },
    execution_status: "not_executed", no_side_effects: true,
  };
}

// ---- Workflow D: Clinical Trial Context (INV-11/12/13, POL-07) ------------
// Mirrors submission/src/workflows/clinical_trial_context.py. ADDITIONAL,
// OPTIONAL SCOPE — not one of the three mandated workflows. Never renders
// eligibility, treatment_arm or endpoint_conclusion.

const CLINICAL_SCENARIOS = {
  eligibilityAndUnblinding: {
    subject_id: "S-301-044",
    trial_id: "NCB204-301",
    evidence: [{ source: "data/eligibility_evidence.csv", record_id: "S-301-044" }, { source: "data/support_tickets.csv", record_id: "SUP-41" }],
    eligibility_evidence: { test: "ALT", value: 58, central_uln: 40, local_uln: 60, edc_rule_uln: 40 },
    support_tickets: [{ ticket_id: "SUP-41", system: "IRT", text: "Kit pattern suggests active arm; screenshot attached", visibility: "site_and_vendor" }],
    protocol_context: null,
  },
  protocolVersion: {
    subject_id: "",
    trial_id: "NCB204-301",
    evidence: [{ source: "data/protocol_versions.csv", record_id: "NCB204-301:5.0" }, { source: "data/site_approvals.csv", record_id: "IN-014" }],
    eligibility_evidence: null,
    support_tickets: [],
    protocol_context: { site_approved_version: "4.1", global_current_version: "5.0" },
  },
  clean: { subject_id: "", trial_id: "NCB204-301", evidence: [], eligibility_evidence: null, support_tickets: [], protocol_context: null },
  // INJ-015: IRT was unavailable; kit K-7701 was assigned to S-301-118 via
  // a manual downtime log (data/randomization_events.csv IRT-9001).
  randomizationOutage: {
    subject_id: "S-301-118", trial_id: "NCB204-301",
    evidence: [{ source: "data/randomization_events.csv", record_id: "IRT-9001" }],
    eligibility_evidence: null, support_tickets: [], protocol_context: null,
    randomization_events: [{ event_id: "IRT-9001", subject_id: "S-301-118", kit: "K-7701", method: "manual_downtime_log", time: "2026-07-24T14:12:00+02:00" }],
  },
  // INJ-017: consent C-044 was withdrawn for biomarker use, but processing
  // event PE-9 completed against a cached (not re-verified) consent check
  // (data/consents.csv, data/specimens.csv, data/processing_events.csv).
  econsentWithdrawalMismatch: {
    subject_id: "S-301-044", trial_id: "NCB204-301",
    evidence: [{ source: "data/consents.csv", record_id: "C-044" }, { source: "data/processing_events.csv", record_id: "PE-9" }],
    eligibility_evidence: null, support_tickets: [], protocol_context: null,
    consents: [{ consent_id: "C-044", subject_id: "S-301-044", purpose: "trial_and_biomarker", status: "withdrawn_biomarker", effective_time: "2026-07-20T10:15:00+05:30" }],
    specimens: [{ specimen_id: "SP-044-A", subject_id: "S-301-044", type: "plasma", status: "processed", processing_time: "2026-07-21T08:00:00Z" }],
    processing_events: [{ event_id: "PE-9", specimen_id: "SP-044-A", purpose: "biomarker_model", status: "completed", consent_check: "cached_active" }],
  },
  // INJ-018: wearable WR-11 reports mixed local/UTC timestamps for
  // S-301-118 around a DST transition (data/wearable_readings.csv).
  deviceClockSkew: {
    subject_id: "S-301-118", trial_id: "NCB204-301",
    evidence: [{ source: "data/wearable_readings.csv", record_id: "S-301-118:WR-11" }],
    eligibility_evidence: null, support_tickets: [], protocol_context: null,
    wearable_readings: [
      { subject_id: "S-301-118", device_id: "WR-11", timestamp: "2026-03-29 02:15", timezone: "local_unknown", heart_rate: 118 },
      { subject_id: "S-301-118", device_id: "WR-11", timestamp: "2026-03-29T01:20:00Z", timezone: "UTC", heart_rate: 121 },
    ],
  },
  // INJ-019: imaging endpoint packet EP-71 has an incomplete source and
  // conflicting reviewer conclusions (data/endpoint_packets.csv, data/imaging_reviews.csv).
  endpointAdjudicationBacklog: {
    subject_id: "S-301-118", trial_id: "NCB204-301",
    evidence: [{ source: "data/endpoint_packets.csv", record_id: "EP-71" }, { source: "data/imaging_reviews.csv", record_id: "EP-71" }],
    eligibility_evidence: null, support_tickets: [], protocol_context: null,
    endpoint_packets: [{ packet_id: "EP-71", subject_id: "S-301-118", endpoint: "MRI response", source_complete: "no", review_status: "conflict" }],
    endpoint_reviews: [{ packet_id: "EP-71", reviewer: "R1", conclusion: "responder" }, { packet_id: "EP-71", reviewer: "R2", conclusion: "non_responder" }],
  },
  // INJ-020: site IN-014 shows late-source uploads (31%) plus digit-
  // preference and credential-sharing flags (data/site_metrics.csv).
  siteInspectionRisk: {
    subject_id: "", trial_id: "NCB204-301",
    evidence: [{ source: "data/site_metrics.csv", record_id: "IN-014" }],
    eligibility_evidence: null, support_tickets: [], protocol_context: null,
    site_metrics: { site_id: "IN-014", enrolment: 47, late_source_pct: 31, digit_preference_flag: true, credential_sharing_flag: true },
  },
};

function assembleClinicalResponse(scenarioKey) {
  const s = CLINICAL_SCENARIOS[scenarioKey];
  const authorization = checkAuthorization(CURRENT_ENTITLEMENT, "clinical_trial_context");
  const contradictions = [];
  const gaps = [];
  const unblinding_risk_flags = [];
  const protocol_conflicts = [];
  const required_reviews = [];

  // INV-11: disagreeing eligibility-threshold sources surfaced, never resolved.
  const elig = s.eligibility_evidence;
  if (elig) {
    const thresholds = { central_uln: elig.central_uln, local_uln: elig.local_uln, edc_rule_uln: elig.edc_rule_uln };
    const exceeds = {};
    for (const [name, uln] of Object.entries(thresholds)) exceeds[name] = elig.value != null && uln != null && elig.value > uln;
    if (new Set(Object.values(exceeds)).size > 1) {
      contradictions.push({ type: "eligibility_threshold_disagreement", test: elig.test, value: elig.value, thresholds, exceeds_by_source: exceeds });
      required_reviews.push(`eligibility_review:${s.subject_id}`);
    }
  }

  // INV-12: unblinding-risk signal terms flagged, never an arm-assignment statement.
  const UNBLINDING_SIGNAL_TERMS = ["active arm", "placebo arm", "kit pattern", "unblind"];
  for (const ticket of s.support_tickets) {
    const text = String(ticket.text || "").toLowerCase();
    if (UNBLINDING_SIGNAL_TERMS.some((term) => text.includes(term))) {
      unblinding_risk_flags.push({ ticket_id: ticket.ticket_id, system: ticket.system, visibility: ticket.visibility,
        reason: "support ticket text matches an unblinding-risk signal term" });
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

  // INJ-015: a non-IRT-automated randomization event is surfaced as a gap,
  // never treated as an equivalent allocation.
  for (const event of s.randomization_events || []) {
    if (event.method && event.method !== "irt_automated") {
      gaps.push({ gap_type: "randomization_service_outage_evidence", event_id: event.event_id,
        subject_id: event.subject_id, method: event.method });
      required_reviews.push(`randomization_integrity_review:${event.event_id}`);
    }
  }

  // INJ-017: consent withdrawn for a purpose, but downstream processing
  // continued against a cached (not re-verified) consent check.
  const withdrawnConsents = (s.consents || []).filter((c) => String(c.status || "").includes("withdrawn"));
  const specimensBySubject = {};
  for (const sp of s.specimens || []) (specimensBySubject[sp.subject_id] = specimensBySubject[sp.subject_id] || []).push(sp);
  for (const consent of withdrawnConsents) {
    for (const specimen of specimensBySubject[consent.subject_id] || []) {
      for (const event of s.processing_events || []) {
        if (event.specimen_id !== specimen.specimen_id) continue;
        if (event.status === "completed" && event.consent_check !== "verified_current") {
          contradictions.push({ type: "econsent_withdrawal_processing_mismatch", subject_id: consent.subject_id,
            consent_id: consent.consent_id, consent_status: consent.status, consent_effective_time: consent.effective_time,
            specimen_id: specimen.specimen_id, processing_event_id: event.event_id, processing_status: event.status,
            consent_check: event.consent_check });
        }
      }
    }
  }

  // INJ-018: mixed timezone readings for the same subject/device.
  const readingsByDevice = {};
  for (const row of s.wearable_readings || []) {
    const key = `${row.subject_id}|${row.device_id}`;
    (readingsByDevice[key] = readingsByDevice[key] || []).push(row);
  }
  for (const rows of Object.values(readingsByDevice)) {
    const timezones = new Set(rows.map((r) => r.timezone));
    if (timezones.size > 1) {
      gaps.push({ gap_type: "device_clock_skew_evidence", subject_id: rows[0].subject_id, device_id: rows[0].device_id,
        readings: rows, timezones_observed: [...timezones].filter(Boolean).sort() });
    }
  }

  // INV-13 / INJ-019: dual-reviewer endpoint disagreement surfaced, never resolved.
  const byPacket = {};
  for (const review of s.endpoint_reviews || []) {
    (byPacket[review.packet_id] = byPacket[review.packet_id] || new Set()).add(review.conclusion);
  }
  for (const [packetId, conclusions] of Object.entries(byPacket)) {
    if (conclusions.size > 1) {
      contradictions.push({ type: "endpoint_adjudication_disagreement", packet_id: packetId, conclusions: [...conclusions].sort() });
      required_reviews.push(`endpoint_adjudication_review:${packetId}`);
    }
  }

  // INJ-020: site data-quality risk indicators become a flagged risk, never
  // a site-status or inspection-outcome decision.
  const site_inspection_risk_flags = [];
  if (s.site_metrics) {
    const reasons = [];
    if (s.site_metrics.late_source_pct != null && Number(s.site_metrics.late_source_pct) >= 20) reasons.push("late_source_pct>=20");
    if (s.site_metrics.digit_preference_flag) reasons.push("digit_preference_flag");
    if (s.site_metrics.credential_sharing_flag) reasons.push("credential_sharing_flag");
    if (reasons.length) {
      site_inspection_risk_flags.push({ site_id: s.site_metrics.site_id, reasons });
      required_reviews.push(`site_inspection_review:${s.site_metrics.site_id}`);
    }
  }

  if (!elig && !s.support_tickets.length && !s.protocol_context && !s.evidence.length
      && !(s.randomization_events || []).length && !s.site_metrics) {
    gaps.push({ gap_type: "no_evidence_provided", subject_id: s.subject_id });
  }

  return {
    workflow: "clinical_trial_context", authorization, subject_id: s.subject_id, trial_id: s.trial_id,
    evidence: s.evidence, contradictions, gaps, abstentions: [],
    protocol_conflicts, unblinding_risk_flags, site_inspection_risk_flags, required_reviews,
    human_review: { required: true, role: "Principal Investigator / Medical Monitor" },
    execution_status: "not_executed",
  };
}

// ---- Workflow E: Discovery/Translational Science (INV-14..18) -------------
// Mirrors submission/src/workflows/discovery_translational_science.py.
// ADDITIONAL, OPTIONAL SCOPE. Never renders assay_disposition, model_approval,
// image_authenticity, model_status_change or target_validation_conclusion.

const DISCOVERY_SCENARIOS = {
  assayAndSubgroup: {
    subject_ref: "BX-17",
    evidence: [{ source: "data/assay_results.csv", record_id: "AS-101" }, { source: "data/model_performance.csv", record_id: "TRN-OMICS-2" }],
    assay_results: [{ assay_id: "AS-101", compound_code: "BX-17",
      instrument_info: { instrument_id: "INS-03", firmware: "4.8.1", qualified_firmware: "4.7.9", qualification_status: "conditional" },
      reagent_lot_info: { reagent_lot: "RG-78", coa_status: "transcribed_only", expiry: "2026-10-31" } }],
    model_performance_slices: [{ model_id: "TRN-OMICS-2", slices: [{ slice: "Group-A", metric: "AUROC", value: 0.86 }, { slice: "Group-B", metric: "AUROC", value: 0.61 }] }],
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
  // INJ-010: image forensics finds PC-88 Figure_6B 0.97-similar to Figure_4A
  // with matching acquisition timestamps (data/image_forensics.csv).
  preclinicalImageManipulation: {
    subject_ref: "PC-88",
    evidence: [{ source: "data/preclinical_studies.csv", record_id: "PC-88" }, { source: "data/image_forensics.csv", record_id: "PC-88:Figure_6B" }],
    assay_results: [], model_performance_slices: [], model_registry_entries: [],
    image_forensics: [{ study_id: "PC-88", panel: "Figure_6B", similarity_to: "Figure_4A", similarity_score: 0.97, metadata_note: "same acquisition timestamp" }],
  },
  // INJ-012: internal CRISPR evidence supports TKR9 while the licensed
  // dataset does not (data/target_evidence.csv); BIOX-LEGACY's licensed
  // training use is unclear (data/data_licenses.csv).
  targetEvidenceConflict: {
    subject_ref: "TKR9",
    evidence: [{ source: "data/target_evidence.csv", record_id: "TKR9" }, { source: "data/data_licenses.csv", record_id: "BIOX-LEGACY" }],
    assay_results: [], model_performance_slices: [], model_registry_entries: [],
    target_evidence: [{ rows: [
      { target: "TKR9", source: "internal_CRISPR", direction: "supports", confidence: "high" },
      { target: "TKR9", source: "licensed_dataset", direction: "does_not_support", confidence: "medium" },
    ] }],
    data_licenses: [{ dataset: "BIOX-LEGACY", permitted_use: "acquired programme", commercial_use: "review required", model_training: "unclear" }],
  },
};

function assembleDiscoveryResponse(scenarioKey) {
  const s = DISCOVERY_SCENARIOS[scenarioKey];
  const authorization = checkAuthorization(CURRENT_ENTITLEMENT, "discovery_translational_science");
  const contradictions = [];
  const gaps = [];
  const assay_quality_flags = [];
  const required_reviews = [];

  // INV-14: firmware/CoA/expiry qualification conflicts surfaced, never accepted/rejected.
  for (const result of s.assay_results) {
    const instrument = result.instrument_info || {};
    const reagent = result.reagent_lot_info || {};
    const reasons = [];
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
      assay_quality_flags.push({ assay_id: result.assay_id, compound_code: result.compound_code,
        instrument: instrument.instrument_id, reagent_lot: reagent.reagent_lot, reasons });
      contradictions.push({ type: "assay_result_qualification_conflict", assay_id: result.assay_id, reasons });
      required_reviews.push(`assay_qualification_review:${result.assay_id}`);
    }
  }

  // INV-15: subgroup performance disparity surfaced, never silently averaged away.
  for (const perf of s.model_performance_slices) {
    const values = {};
    for (const sl of perf.slices) if (sl.value != null) values[sl.slice] = sl.value;
    const vals = Object.values(values);
    if (vals.length > 1) {
      const spread = Math.max(...vals) - Math.min(...vals);
      if (spread >= 0.10) {
        contradictions.push({ type: "model_performance_subgroup_disparity", model_id: perf.model_id,
          metric: perf.slices[0] && perf.slices[0].metric, values_by_slice: values, spread: Math.round(spread * 10000) / 10000 });
        required_reviews.push(`subgroup_fairness_review:${perf.model_id}`);
      }
    }
  }

  // INV-17: research-unqualified registry entries referenced by portfolio evidence surfaced as a gap, never promoted.
  for (const entry of s.model_registry_entries) {
    if (entry.status != null && !["qualified", "approved", "production"].includes(entry.status)) {
      gaps.push({ gap_type: "model_not_decision_grade", model_id: entry.model_id, status: entry.status, intended_use: entry.intended_use });
      required_reviews.push(`model_qualification_review:${entry.model_id}`);
    }
  }

  // INV-16 / INJ-010: high-similarity preclinical image finding surfaced,
  // never certified authentic or dismissed as manipulated.
  for (const forensic of s.image_forensics || []) {
    if (forensic.similarity_score != null && Number(forensic.similarity_score) >= 0.90) {
      contradictions.push({ type: "preclinical_image_similarity_concern", study_id: forensic.study_id,
        panel: forensic.panel, similarity_to: forensic.similarity_to, similarity_score: forensic.similarity_score,
        metadata_note: forensic.metadata_note });
      required_reviews.push(`image_forensics_review:${forensic.study_id}:${forensic.panel}`);
    }
  }

  // INV-18 / INJ-012: disagreeing target-validation directions surfaced,
  // never resolved to one direction; unclear/restricted training licenses
  // surfaced as a gap, never silently used.
  for (const target of s.target_evidence || []) {
    const byTarget = {};
    for (const row of target.rows || []) {
      (byTarget[row.target] = byTarget[row.target] || new Set()).add(row.direction);
    }
    for (const [tgt, directions] of Object.entries(byTarget)) {
      if (directions.size > 1) {
        contradictions.push({ type: "target_evidence_disagreement", target: tgt, directions: [...directions].sort() });
        required_reviews.push(`target_validation_review:${tgt}`);
      }
    }
  }
  for (const license of s.data_licenses || []) {
    if (["restricted", "unclear"].includes(license.model_training)) {
      gaps.push({ gap_type: "data_license_training_use_unresolved", dataset: license.dataset,
        permitted_use: license.permitted_use, model_training: license.model_training });
      required_reviews.push(`data_license_review:${license.dataset}`);
    }
  }

  if (!s.assay_results.length && !s.model_performance_slices.length && !s.model_registry_entries.length
      && !(s.image_forensics || []).length && !(s.target_evidence || []).length && !(s.data_licenses || []).length
      && !s.evidence.length) {
    gaps.push({ gap_type: "no_evidence_provided", subject_ref: s.subject_ref });
  }

  return {
    workflow: "discovery_translational_science", authorization, subject_ref: s.subject_ref,
    evidence: s.evidence, contradictions, gaps, abstentions: [],
    assay_quality_flags, required_reviews,
    human_review: { required: true, role: "Translational Science Lead / Discovery QA" },
    execution_status: "not_executed",
  };
}

// ---- Safe DOM rendering (no innerHTML anywhere) ----------------------------

function el(tag, opts, ...children) {
  const node = document.createElement(tag);
  if (opts) {
    if (opts.className) node.className = opts.className;
    if (opts.text !== undefined) node.textContent = opts.text;
    if (opts.attrs) for (const [k, v] of Object.entries(opts.attrs)) node.setAttribute(k, v);
  }
  for (const child of children) if (child) node.appendChild(child);
  return node;
}

function badge(text, cls) { return el("span", { className: `badge ${cls}`, text }); }

function renderAuthBanner(authorization) {
  const banner = document.getElementById("authBanner");
  banner.textContent = "";
  banner.appendChild(badge(authorization.decision === "allow" ? "ALLOW" : "DENY",
    authorization.decision === "allow" ? "badge-allow" : "badge-deny"));
  banner.appendChild(document.createTextNode(
    ` Authorization for ${authorization.user} — ${authorization.reason}`));
}

function renderCommon(container, response) {
  container.appendChild(el("div", { className: "field-label", text: "Execution status" }));
  container.appendChild(badge(response.execution_status, "badge-not-executed"));

  container.appendChild(el("div", { className: "field-label", text: "Human review required" }));
  container.appendChild(badge(`${response.human_review.role} must review`, "badge-required"));

  const pre = el("pre", { className: "raw" });
  pre.textContent = JSON.stringify(response, null, 2);
  container.appendChild(el("div", { className: "field-label", text: "Full response (never a disposition field)" }));
  container.appendChild(pre);
}

function renderBatch(response) {
  const out = document.getElementById("batchOutput");
  out.textContent = "";
  renderAuthBanner(response.authorization);

  out.appendChild(el("div", { className: "field-label", text: "Readiness state" }));
  out.appendChild(el("p", { text: response.readiness_state }));

  if (response.contradictions.length) {
    out.appendChild(el("div", { className: "field-label", text: "Contradictions" }));
    const ul = el("ul", { className: "evidence-list" });
    for (const c of response.contradictions) {
      const text = c.type === "lab_state_disagreement"
        ? `lims=${c.lims_state} vs stats=${c.stats_state} vs notebook=${c.notebook_state}`
        : `${c.type}: ${JSON.stringify(c)}`;
      ul.appendChild(el("li", { className: "contradiction", text }));
    }
    out.appendChild(ul);
  }
  if (response.gaps.length) {
    out.appendChild(el("div", { className: "field-label", text: "Gaps" }));
    const ul = el("ul", { className: "evidence-list" });
    for (const g of response.gaps) ul.appendChild(el("li", { className: "gap", text: `${g.gap_type}${g.batch_id ? ": " + g.batch_id : ""}` }));
    out.appendChild(ul);
  }
  renderCommon(out, response);
}

function renderPv(response) {
  const out = document.getElementById("pvOutput");
  out.textContent = "";
  renderAuthBanner(response.authorization);

  out.appendChild(el("div", { className: "field-label", text: "Duplicate candidates (never auto-merged)" }));
  const ul = el("ul", { className: "evidence-list" });
  for (const d of response.duplicate_candidates) {
    ul.appendChild(el("li", { text: `${d.case_a} <-> ${d.case_b}: similarity ${d.similarity} (${d.reason})` }));
  }
  out.appendChild(ul);

  if (response.contradictions.length) {
    out.appendChild(el("div", { className: "field-label", text: "Contradictions (never resolved to seriousness/causality/expectedness/reportability/signal decision)" }));
    const ulc = el("ul", { className: "evidence-list" });
    for (const c of response.contradictions) ulc.appendChild(el("li", { className: "contradiction", text: `${c.type}: ${JSON.stringify(c)}` }));
    out.appendChild(ulc);
  }
  if (response.gaps.length) {
    out.appendChild(el("div", { className: "field-label", text: "Gaps" }));
    const ulg = el("ul", { className: "evidence-list" });
    for (const g of response.gaps) ulg.appendChild(el("li", { className: "gap", text: `${g.gap_type}: ${JSON.stringify(g)}` }));
    out.appendChild(ulg);
  }

  out.appendChild(el("div", { className: "field-label", text: "Required reviews" }));
  const ul2 = el("ul", { className: "evidence-list" });
  for (const r of response.required_reviews) ul2.appendChild(el("li", { text: r }));
  out.appendChild(ul2);

  renderCommon(out, response);
}

function renderSupply(response) {
  const out = document.getElementById("supplyOutput");
  out.textContent = "";
  renderAuthBanner(response.authorization);

  out.appendChild(el("div", { className: "field-label", text: "Draft options (quarantined stock excluded)" }));
  const ul = el("ul", { className: "evidence-list" });
  for (const o of response.options) {
    ul.appendChild(el("li", { text: `${o.option_id} — ${o.units} units, status=${o.status}` }));
  }
  out.appendChild(ul);

  if (response.quality_holds.length) {
    out.appendChild(el("div", { className: "field-label", text: "Quality holds (visible, not hidden)" }));
    const ul2 = el("ul", { className: "evidence-list" });
    for (const h of response.quality_holds) {
      ul2.appendChild(el("li", { className: "quality-hold", text: `${h.product} / ${h.market}: ${h.units} units held` }));
    }
    out.appendChild(ul2);
  }
  if (response.contradictions.length) {
    out.appendChild(el("div", { className: "field-label", text: "Contradictions (never resolved/cleared/confirmed)" }));
    const ulc = el("ul", { className: "evidence-list" });
    for (const c of response.contradictions) ulc.appendChild(el("li", { className: "contradiction", text: `${c.type}: ${JSON.stringify(c)}` }));
    out.appendChild(ulc);
  }
  if (response.gaps.length) {
    out.appendChild(el("div", { className: "field-label", text: "Gaps (no side effects — never reserved/allocated/shipped/recalled)" }));
    const ulg = el("ul", { className: "evidence-list" });
    for (const g of response.gaps) ulg.appendChild(el("li", { className: "gap", text: `${g.gap_type}: ${JSON.stringify(g)}` }));
    out.appendChild(ulg);
  }
  out.appendChild(el("div", { className: "field-label", text: "no_side_effects" }));
  out.appendChild(badge(String(response.no_side_effects), "badge-not-executed"));

  renderCommon(out, response);
}

function renderClinical(response) {
  const out = document.getElementById("clinicalOutput");
  out.textContent = "";
  renderAuthBanner(response.authorization);

  if (response.contradictions.length) {
    out.appendChild(el("div", { className: "field-label", text: "Contradictions" }));
    const ul = el("ul", { className: "evidence-list" });
    for (const c of response.contradictions) {
      ul.appendChild(el("li", { className: "contradiction", text: `${c.type}: ${JSON.stringify(c)}` }));
    }
    out.appendChild(ul);
  }
  if (response.unblinding_risk_flags.length) {
    out.appendChild(el("div", { className: "field-label", text: "Unblinding risk flags (never an arm-assignment statement)" }));
    const ul = el("ul", { className: "evidence-list" });
    for (const f of response.unblinding_risk_flags) {
      ul.appendChild(el("li", { className: "contradiction", text: `${f.ticket_id} (${f.system}, visibility=${f.visibility}): ${f.reason}` }));
    }
    out.appendChild(ul);
  }
  if (response.protocol_conflicts.length) {
    out.appendChild(el("div", { className: "field-label", text: "Protocol-version conflicts (both versions surfaced, neither defaulted)" }));
    const ul = el("ul", { className: "evidence-list" });
    for (const p of response.protocol_conflicts) {
      ul.appendChild(el("li", { className: "gap", text: `${p.trial_id}: site_approved=${p.site_approved_version} vs global_current=${p.global_current_version}` }));
    }
    out.appendChild(ul);
  }
  if (response.site_inspection_risk_flags.length) {
    out.appendChild(el("div", { className: "field-label", text: "Site inspection risk flags (never a site-status or inspection-outcome decision)" }));
    const ul = el("ul", { className: "evidence-list" });
    for (const f of response.site_inspection_risk_flags) {
      ul.appendChild(el("li", { className: "contradiction", text: `${f.site_id}: ${f.reasons.join(", ")}` }));
    }
    out.appendChild(ul);
  }
  if (response.gaps.length) {
    out.appendChild(el("div", { className: "field-label", text: "Gaps" }));
    const ul = el("ul", { className: "evidence-list" });
    for (const g of response.gaps) ul.appendChild(el("li", { className: "gap", text: `${g.gap_type}: ${JSON.stringify(g)}` }));
    out.appendChild(ul);
  }
  if (response.required_reviews.length) {
    out.appendChild(el("div", { className: "field-label", text: "Required reviews" }));
    const ul = el("ul", { className: "evidence-list" });
    for (const r of response.required_reviews) ul.appendChild(el("li", { text: r }));
    out.appendChild(ul);
  }
  renderCommon(out, response);
}

function renderDiscovery(response) {
  const out = document.getElementById("discoveryOutput");
  out.textContent = "";
  renderAuthBanner(response.authorization);

  if (response.contradictions.length) {
    out.appendChild(el("div", { className: "field-label", text: "Contradictions (never accepted/rejected/certified/resolved)" }));
    const ul = el("ul", { className: "evidence-list" });
    for (const c of response.contradictions) {
      ul.appendChild(el("li", { className: "contradiction", text: `${c.type}: ${JSON.stringify(c)}` }));
    }
    out.appendChild(ul);
  }
  if (response.assay_quality_flags.length) {
    out.appendChild(el("div", { className: "field-label", text: "Assay quality flags" }));
    const ul = el("ul", { className: "evidence-list" });
    for (const f of response.assay_quality_flags) {
      ul.appendChild(el("li", { className: "contradiction", text: `${f.assay_id} (instrument=${f.instrument}, lot=${f.reagent_lot}): ${f.reasons.join(", ")}` }));
    }
    out.appendChild(ul);
  }
  if (response.gaps.length) {
    out.appendChild(el("div", { className: "field-label", text: "Gaps (never promoted to decision-grade)" }));
    const ul = el("ul", { className: "evidence-list" });
    for (const g of response.gaps) ul.appendChild(el("li", { className: "gap", text: `${g.gap_type}${g.model_id ? ": " + g.model_id + " (" + g.status + ")" : ""}` }));
    out.appendChild(ul);
  }
  if (response.required_reviews.length) {
    out.appendChild(el("div", { className: "field-label", text: "Required reviews" }));
    const ul = el("ul", { className: "evidence-list" });
    for (const r of response.required_reviews) ul.appendChild(el("li", { text: r }));
    out.appendChild(ul);
  }
  renderCommon(out, response);
}

// ---- Evaluation & Coverage tab (static snapshot, no live re-run) ----------

function statTile(value, label) {
  return el("div", { className: "stat-tile" },
    el("div", { className: "stat-value", text: String(value) }),
    el("div", { className: "stat-label", text: label }));
}

function renderEvalDashboard() {
  const out = document.getElementById("evalOutput");
  out.textContent = "";
  const data = window.AEGIS_EVAL_DATA;
  if (!data) {
    out.appendChild(el("p", { text: "eval_data.js not loaded." }));
    return;
  }

  out.appendChild(el("div", { className: "field-label", text: `Tests — snapshot run_at ${data.tests.run_at}` }));
  const testGrid = el("div", { className: "stat-grid" },
    statTile(data.tests.total_tests, "total tests"),
    statTile(`${data.tests.passed}/${data.tests.total_tests}`, "pass rate"),
    statTile(data.tests.failed, "failed"),
    statTile(data.tests.errors, "errors"));
  out.appendChild(testGrid);
  const modUl = el("ul", { className: "evidence-list" });
  for (const m of data.tests.modules) modUl.appendChild(el("li", { text: `${m.name}: ${m.count} — ${m.note}` }));
  out.appendChild(modUl);

  out.appendChild(el("div", { className: "field-label", text: `Evaluation — snapshot run_at ${data.evaluation.run_at}` }));
  const evalGrid = el("div", { className: "stat-grid" },
    statTile(data.evaluation.total_scenarios, "total eval scenarios"),
    statTile(`${data.evaluation.regression_passed}/${data.evaluation.regression_scenarios}`, "regression pass rate"),
    statTile(data.evaluation.release_gates_blocked, "release gates blocked"),
    statTile(data.evaluation.suites_covered.length, "suites covered"));
  out.appendChild(evalGrid);

  out.appendChild(el("div", { className: "field-label", text: "Inject coverage" }));
  const covGrid = el("div", { className: "stat-grid" },
    statTile(`${data.injectCoverage.addressed}/${data.injectCoverage.total}`, "addressed"),
    statTile(data.injectCoverage.in_scope_open, "open"),
    statTile(data.injectCoverage.out_of_scope, "out of scope"));
  out.appendChild(covGrid);

  const table = el("table", { className: "coverage-table" });
  const thead = el("tr", null, el("th", { text: "Workflow / grouping" }), el("th", { text: "Inject count" }));
  table.appendChild(el("thead", null, thead));
  const tbody = el("tbody");
  for (const row of data.injectCoverage.byWorkflow) {
    tbody.appendChild(el("tr", null, el("td", { text: row.label }), el("td", { text: String(row.count) })));
  }
  table.appendChild(tbody);
  out.appendChild(table);

  out.appendChild(el("p", { className: "snapshot-note",
    text: "Static snapshot only — this tab never re-runs tests or the evaluation harness. Regenerate eval_data.js after any change to the underlying evidence files." }));
}

// ---- Wiring -----------------------------------------------------------------

function switchTab(panelId) {
  for (const btn of document.querySelectorAll(".tab-btn")) {
    btn.setAttribute("aria-selected", String(btn.dataset.panel === panelId));
  }
  for (const panel of document.querySelectorAll("section.panel")) {
    panel.classList.toggle("active", panel.id === `panel-${panelId}`);
  }
}

const tabButtons = Array.from(document.querySelectorAll(".tab-btn"));
tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.panel));
  // ARIA Authoring Practices "tabs" pattern: Left/Right arrow moves focus
  // between tabs and activates the newly focused one (P9 accessibility
  // smoke workstream, AEGIS_PROJECT_PLAN_FINAL.md §8.1 "keyboard/critical-path").
  btn.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const index = tabButtons.indexOf(btn);
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next = tabButtons[(index + delta + tabButtons.length) % tabButtons.length];
    next.focus();
    switchTab(next.dataset.panel);
  });
});

document.getElementById("batchRun").addEventListener("click", () => {
  renderBatch(assembleBatchResponse(document.getElementById("batchScenario").value));
});
document.getElementById("pvRun").addEventListener("click", () => {
  renderPv(assemblePvResponse(document.getElementById("pvScenario").value));
});
document.getElementById("supplyRun").addEventListener("click", () => {
  renderSupply(assembleSupplyResponse(document.getElementById("supplyScenario").value));
});
document.getElementById("clinicalRun").addEventListener("click", () => {
  renderClinical(assembleClinicalResponse(document.getElementById("clinicalScenario").value));
});
document.getElementById("discoveryRun").addEventListener("click", () => {
  renderDiscovery(assembleDiscoveryResponse(document.getElementById("discoveryScenario").value));
});

// Initial state.
switchTab("batch");
renderBatch(assembleBatchResponse("conflicted"));
renderPv(assemblePvResponse("highSimilarity"));
renderSupply(assembleSupplyResponse("withQuarantine"));
renderClinical(assembleClinicalResponse("eligibilityAndUnblinding"));
renderDiscovery(assembleDiscoveryResponse("assayAndSubgroup"));
renderEvalDashboard();
