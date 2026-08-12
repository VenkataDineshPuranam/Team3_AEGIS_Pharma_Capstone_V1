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
  conflicted: {
    batch_id: "NCB204-B24071",
    evidence: [{ source: "data/oos_investigations.csv", record_id: "OOS-1" }],
    lab_states: { lims_state: "OOS", stats_state: "in_spec", notebook_state: "invalid" },
  },
  noEvidence: { batch_id: "NCB204-B24071", evidence: [], lab_states: null },
  clean: {
    batch_id: "NCB204-B24071",
    evidence: [{ source: "data/genealogy.csv", record_id: "GEN-1" }, { source: "data/lab_results.csv", record_id: "LAB-1" }],
    lab_states: { lims_state: "in_spec", stats_state: "in_spec", notebook_state: "in_spec" },
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
  highSimilarity: { case_ids: ["PV-1001", "PV-1014"], pair: { case_a: "PV-1001", case_b: "PV-1014", similarity: 0.93, reason: "patient/product/date overlap" } },
  lowSimilarity: { case_ids: ["PV-1001", "PV-1009"], pair: { case_a: "PV-1001", case_b: "PV-1009", similarity: 0.71, reason: "event/country overlap" } },
};
const SIMILARITY_SURFACE_THRESHOLD = 0.5;

function assemblePvResponse(scenarioKey) {
  const s = PV_SCENARIOS[scenarioKey];
  const authorization = checkAuthorization(CURRENT_ENTITLEMENT, "pv_intake");
  const duplicate_candidates = [];
  const required_reviews = [];
  if (s.pair.similarity >= SIMILARITY_SURFACE_THRESHOLD) {
    duplicate_candidates.push(s.pair);
    required_reviews.push(`duplicate_review:${s.pair.case_a}:${s.pair.case_b}`);
  }
  return {
    workflow: "pv_intake", case_ids: s.case_ids, authorization,
    duplicate_candidates, required_reviews,
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
};

function assembleSupplyResponse(scenarioKey) {
  const s = SUPPLY_SCENARIOS[scenarioKey];
  const authorization = checkAuthorization(CURRENT_ENTITLEMENT, "supply_options");
  const options = [];
  const quality_holds = [];
  for (const row of s.inventory) {
    if (row.quality_status === "quarantine") quality_holds.push(row);
    else if (row.quality_status === "released") {
      options.push({ option_id: `OPT-${row.product}-${row.market}`, status: "draft", ...row });
    }
  }
  return {
    workflow: "supply_options", event_id: s.event_id, authorization,
    options, quality_holds, approvals_required: ["Supply Governance Board"],
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

  if (!elig && !s.support_tickets.length && !s.protocol_context && !s.evidence.length) {
    gaps.push({ gap_type: "no_evidence_provided", subject_id: s.subject_id });
  }

  return {
    workflow: "clinical_trial_context", authorization, subject_id: s.subject_id, trial_id: s.trial_id,
    evidence: s.evidence, contradictions, gaps, abstentions: [],
    protocol_conflicts, unblinding_risk_flags, site_inspection_risk_flags: [], required_reviews,
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

  if (!s.assay_results.length && !s.model_performance_slices.length && !s.model_registry_entries.length && !s.evidence.length) {
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
      ul.appendChild(el("li", { className: "contradiction",
        text: `lims=${c.lims_state} vs stats=${c.stats_state} vs notebook=${c.notebook_state}` }));
    }
    out.appendChild(ul);
  }
  if (response.gaps.length) {
    out.appendChild(el("div", { className: "field-label", text: "Gaps" }));
    const ul = el("ul", { className: "evidence-list" });
    for (const g of response.gaps) ul.appendChild(el("li", { className: "gap", text: g.gap_type }));
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
  if (response.gaps.length) {
    out.appendChild(el("div", { className: "field-label", text: "Gaps" }));
    const ul = el("ul", { className: "evidence-list" });
    for (const g of response.gaps) ul.appendChild(el("li", { className: "gap", text: g.gap_type }));
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
