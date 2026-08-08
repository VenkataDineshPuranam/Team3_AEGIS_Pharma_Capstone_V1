# SCQA & Minto Pyramid — Frame (Prompt 02)

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

## 0. Narrative class

- **Narrative class:** `decision-ready` — matches Prompt 01's declared framing mode (`evidence_register.md` §10: Evidence and Stakeholder needs Strong, User workflow Partial but non-blocking).
- **Evidence boundary:** this narrative may claim what is directly evidenced in `case/`, `data/`, and the Discovery register/DMAIC lens/waste registers. It may **not** claim a current-state lead-time baseline, a proven ROI, or a specific architecture — those remain Unknown/PROVISIONAL per Discovery.
- **Top blocking acquisition items:** none block framing itself (Discovery concluded `decision-ready`). Items 1–6 in `evidence_acquisition_backlog.md` remain open and must be resolved before Prompt 04 (DDD) locks bounded contexts.

## A. SCQA narrative

### Situation

**FACT**: NovaCura Therapeutics Group (NTG) operates a fragmented, multi-system pharmaceutical estate (discovery, clinical, manufacturing, laboratory, quality, safety, regulatory, supply, AI platform — `case/SOURCE_SYSTEM_FACT_PACK.md`) with a portfolio spanning small-molecule, biologic, sterile-injectable and gene-therapy modalities at different risk profiles (`portfolio_products.csv`). The board has set a −14% end-to-end release-lead-time target, explicitly without changing registered specifications or Quality authority, due 2026-11-30 (`board_requests.csv` BR-01).

### Complication

**FACT**, compound across dimensions:
- **Operational**: four function-level KPIs (schedule adherence, right-first-time, expedited-on-time, DB lock) are independently optimized and conflict (`kpi_conflicts.csv`, INJ-002).
- **Technical/data**: identity, unit, terminology and temporal inconsistencies are already-occurred, not hypothetical — unit mismatch (INJ-024), MedDRA version mismatch (INJ-039), compound identity collision (INJ-008), validation-state disagreement across three inventories (INJ-031).
- **Financial**: the visible cost model omits human quality/medical review entirely ($0-booked, INJ-077), understating true cost-to-serve.
- **Regulatory/GxP**: three decisions (batch certification, ICSR reportability, stock allocation) are human-only or draft-only by explicit design (`decision_rights.csv`) — any intervention that erodes this is out of bounds by definition, not by later policy choice.
- **Security**: adversarial conditions are already seeded in the estate, not projected — a poisoned supplier-deviation document (INJ-065) and a poisoned tool manifest (INJ-066) already exist in `knowledge/` and `data/`.
- **Human/organizational**: five stakeholder incentive conflicts are named and unresolved by design (`STAKEHOLDER_PACK.md`), and automation bias is a documented risk, not a theoretical one (INJ-071).
- **Root cause (Analyze, `01-discovery/dmaic_lens.md` §3)**: the leading candidate is the absence of an object-scoped, authority-aware evidence-resolution layer — no system was ever mandated authoritative across business objects — not a deficiency in any one system, and not evidently a model-capability problem (`waste_register_ai_specific.md` closing section).

### Question

**One bounded question**: *Should NTG build a bounded, evidence-reconciliation-first capability across the three mandated workflows (batch, PV, supply) that measurably reduces evidence-assembly waiting and rework — and if so, what capability-level design guarantees it cannot perform the prohibited terminal action (batch disposition, final PV decision, or stock allocation/shipment/recall) regardless of implementation choice?*

### Answer (decision-ready — capability level, no architecture/vendor/model lock-in)

**DECISION**: Yes — build a shared, **deterministic-first evidence-reconciliation capability** (identity/authority resolution, unit/terminology/temporal conflict surfacing, integrity-hash verification) as the foundation underneath all three workflows. Layer constrained, grounded AI capability on top **only where justified** against the non-AI baselines already in evidence (`no_ai_baselines.csv`: `rules_workflow` 27%/6wk, `master_data_repair` 38%/10wk, vs. `genai_assist` 51%/14wk) — AI is additive, not foundational, and every workflow response must carry `execution_status: not_executed` with full provenance, never a disposition, decision, or side effect.

**Desired outcomes / "good" looks like**: reduced evidence-assembly Waiting/Motion (per `waste_register_downtime.md`); zero prohibited-action capability, provable by negative test, not just by policy statement; preserved human accountability (EU QP, Safety Physician, Supply Governance Board unchanged); a defensible, evidenced no-AI comparison on record before any AI component is built.

**Audience, decision horizon, evidence/authority boundary**: audience is the board (BR-01 owner) and the three accountable roles (`decision_rights.csv`); decision horizon is Track A (G1–G8, 40h official / ~55–70h realistic) with Track B (G9, production-ready claim) explicitly optional and not assumed; evidence boundary is `case/`, `data/`, `knowledge/` as supplied — no external claim of universal regulatory applicability (`REGULATORY_BOUNDARY_PACK.md`).

**Measurable outcomes**: release lead time (target −14%, baseline **Unknown**), evidence-assembly time per object (**Unknown**, to be instrumented), PV duplicate rate (**Unknown**), fully-loaded cost including corrected human-review line (**Unknown**, corrected from $0). All flagged Unknown, not estimated, per Discovery Measure discipline.

**Explicit exclusions**: no batch release/reject/reprocess/recall; no final PV seriousness/causality/expectedness/reportability/signal decision; no stock reservation/allocation/shipment/recall initiation; no claim of "production-ready" without Track B / G9.

## B. Minto Pyramid view of the Answer

**1. Governing answer**: build the deterministic-first evidence-reconciliation capability now; add constrained AI only where evidenced as additive; structurally prevent the prohibited terminal action in every workflow, independent of which implementation is chosen.

**2. MECE key supporting points**:

1. **Fragmentation is evidenced, not assumed.** Nine system domains, 84 disclosed injects, and an explicit case statement that "no system is universally authoritative" (`SOURCE_SYSTEM_FACT_PACK.md`) — this is the problem's factual floor.
2. **Non-AI options already show meaningful value.** `rules_workflow` and `master_data_repair` reach 27–38% estimated value at 6–10 weeks, without any model risk — AI must be justified against these, not assumed superior (`no_ai_baselines.csv`; INJ-003 explicitly frames this as a required challenge).
3. **The prohibited-action boundary is structural, not a later policy layer.** Three decisions are human-only/draft-only by explicit design (`decision_rights.csv`); this must be enforced in the contract/architecture (e.g. `execution_status: not_executed`), not merely documented.
4. **Adversarial conditions already exist in the estate.** A poisoned document and a poisoned tool manifest are already present (INJ-065/066) — any AI layer must treat retrieval and tools as untrusted by default from its first version, not after a later hardening pass.
5. **Root cause is control/process fragmentation, not model capability.** Every named AI-specific risk in Discovery's waste register is a control/integration failure mode, not a case of a well-controlled model reasoning incorrectly — reinforcing that the deterministic layer is foundational, not optional scaffolding.

**3. Support under each point**: cited inline above; each point traces to Prompt 01 facts/derivations in `01-discovery/evidence_register.md`, `waste_register_downtime.md`, or `waste_register_ai_specific.md`. No unlabeled assumptions.

## C. Framing handoff pack

- **Decision question locked for PRD (03) / DDD (04)**: the bounded question in §A above — design a deterministic-first, structurally-bounded evidence-reconciliation capability for the three workflows.
- **Success metrics for later PRD and DMAIC Measure/Control**: release lead time (−14% target, baseline Unknown), evidence-assembly time per object (Unknown), PV duplicate rate (Unknown), fully-loaded cost with corrected human-review line (Unknown). All must be instrumented, not estimated, before any value claim.
- **Open questions that block design** (from `evidence_acquisition_backlog.md`): explicit current-state process map (item 1); validation-state conflict rule for the evidence-resolver (item 2); which `knowledge/` documents are citable by default (item 3); team seat assignment (item 4); per-claim jurisdiction/purpose/role/system-boundary statement (item 5); KG-vs-simpler-alternative decision (item 6).
- **Later artifacts marked provisional**: PRD (03) through ADR (07) must carry forward the PROVISIONAL label on Improve/Control content until DDD/C4/ADR lock in an actual design — consistent with Discovery's DMAIC lens.

### Lean / DMAIC lens (full — Frame stage)

**Label key** as above.

1. **Define** — restated at Frame level: the improvement problem is reducing evidence-assembly Waiting/Motion while structurally preventing the prohibited terminal action — this is now the Frame-level Define, sharper than Discovery's business-level Define.
2. **Measure** — Frame did not add new measurable metrics beyond Discovery's list (§ above); it confirmed which are Measure targets for the Answer to be judged against (release lead time, evidence-assembly time, PV duplicate rate, fully-loaded cost) — all still Unknown, carried forward, not newly estimated.
3. **Analyze** — Frame's Complication confirms rather than corrects Discovery's Analyze conclusion (control/process fragmentation, not model capability); no new root cause surfaced at Frame level.
4. **Improve** — the Answer itself IS this stage's Improve candidate: deterministic-first evidence-reconciliation + constrained AI only where justified. Rejected alternative: an AI-first or agentic-first approach — rejected because Discovery's AI-specific waste register shows every named risk is a control/integration failure, not a model-capability gap, so an AI-first approach would not address the root cause and would add new (token/retrieval/model) waste on top of unresolved control gaps.
5. **Control** — provisional: what must be monitored for the Answer to be judged as working is the same Measure set above, checked post-decision; Control ownership is not yet assigned (deferred to Prompt 09/12, per governing plan RACI).

Waste registers: no new waste categories surfaced at Frame level beyond Discovery's full registers (`waste_register_downtime.md`, `waste_register_ai_specific.md`, both carried forward unchanged from Prompt 01 — see `submission/artefacts/02-frame/waste_register_downtime.md` / `waste_register_ai_specific.md` for the copy-forward with a Frame-stage confirmation note).
