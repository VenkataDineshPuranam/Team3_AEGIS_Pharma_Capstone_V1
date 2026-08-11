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

// ---- Wiring -----------------------------------------------------------------

function switchTab(panelId) {
  for (const btn of document.querySelectorAll(".tab-btn")) {
    btn.setAttribute("aria-selected", String(btn.dataset.panel === panelId));
  }
  for (const panel of document.querySelectorAll("section.panel")) {
    panel.classList.toggle("active", panel.id === `panel-${panelId}`);
  }
}

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.panel));
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

// Initial state.
switchTab("batch");
renderBatch(assembleBatchResponse("conflicted"));
renderPv(assemblePvResponse("highSimilarity"));
renderSupply(assembleSupplyResponse("withQuarantine"));
