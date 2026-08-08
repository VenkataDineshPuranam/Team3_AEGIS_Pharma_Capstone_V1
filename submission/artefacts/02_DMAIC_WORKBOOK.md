# DMAIC Workbook

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice · ABSTAIN = unresolved until evidence/as-of/auth present.

**Stage note:** per the updated `prompts/01_discovery.md`, Discovery is now a designated **full-DMAIC stage** (with Frame/02, DDD/04, C4/06, ADR/07) — all five phases are run now, not deferred to Prompt 09. Improve and Control below are labeled **PROVISIONAL**: they are candidate directions, not architecture-validated decisions, since no design exists yet. Prompt 09 (Phase P6/G6) still runs — its job is cross-stage *reconciliation* across all five full-DMAIC stages plus the thin lenses from 03/05/08, not the first full pass.

## Document control

| Field | Entry |
|---|---|
| Team / owner | AEGIS-PHARMA delivery team (FDE1 Product/Value Lead primary; FDE2 Domain/Evidence Lead co-owner) |
| Version / date | v0.1 — 2026-08-06 |
| Reviewers | FDE4, FDE5 |
| Status | Draft — Define/Measure only |
| Related requirements / ADRs | `requirements/ASSESSMENT_RUBRIC.csv` RUB-01…03 |

## Purpose

Establish the Define and Measure baseline for the AEGIS-PHARMA intervention before any Improve/Control commitment is made. Scope: the three mandatory workflows. Accountable owner: FDE1, with FDE2 co-ownership on measurement definitions. Complete (for this stage) when Define and Measure are evidenced and the Analyse/Improve/Control deferral is explicit and traceable.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `data/board_requests.csv` (BR-01) | Board request, due 2026-11-30 | −14% release lead time target | No baseline value supplied |
| E-002 | `data/kpi_conflicts.csv` | Current KPI targets | Four conflicting function KPIs | Snapshot only |
| E-003 | `data/no_ai_baselines.csv` | Internal estimate | Three improvement-option estimates (value %, duration) | Estimated, not measured |
| E-004 | `data/cost_model.csv`, `data/staff_rates.csv` | Current snapshot | Inference/observability cost real; human review cost $0-booked | Known gap, INJ-077 |
| E-005 | `submission/artefacts/01-discovery/dmaic_lens.md` | This engagement, 2026-08-06 | Thin-lens Measure/Define findings | Feeds this workbook directly |

## 1. Define

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What problem are we defining? | **FACT**: reduce end-to-end release lead time by 14% without changing registered specifications or Quality authority (E-001), across a fragmented multi-system estate (`case/SOURCE_SYSTEM_FACT_PACK.md`) | FDE1 | E-001 |
| What is explicitly out of the problem's scope? | **FACT**: any change to specifications, clinical eligibility, safety-case disposition, batch release, or recall authority (`data/ai_use_boundaries.csv`) | FDE4 veto | `data/ai_use_boundaries.csv` |
| Who is the customer of this improvement? | **INTERPRETATION**: the accountable decision-makers (EU QP, Safety Physician, Supply Governance Board — `data/decision_rights.csv`) are the direct customers; they receive faster, better-cited evidence, not a faster decision imposed on them | FDE1 | `data/decision_rights.csv` |
| What is the project charter boundary? | **DECISION**: three workflows only, per `case/INTEGRATED_CASE.md` §4; all work under `submission/`; challenge evidence immutable | Team, ratified at G1 | `PACKAGE_SCOPE_AND_ASSUMPTIONS.md` |

## 2. Measure

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What can already be measured from supplied evidence? | **FACT**: target metric (release lead time, −14%), current KPI targets (E-002), estimated (not measured) value/duration for three improvement options (E-003), partial cost model (E-004) — full detail in `submission/artefacts/01-discovery/dmaic_lens.md` §1 | FDE2 | E-005 |
| What baselines are Unknown? | **FACT**: current-state release lead time, PV case cycle time, supply-option turnaround time, true fully-loaded review cost, and mismatch/defect rate are all **Unknown** — none are in the supplied evidence | FDE2, added to evidence-acquisition backlog | `submission/artefacts/01-discovery/dmaic_lens.md` §2; `submission/artefacts/01-discovery/evidence_acquisition_backlog.md` item 1 |
| What waste was observed (not yet measured)? | **FACT**: full 8-category DOWNTIME register + full 8-category AI-specific register completed — 6 of 8 DOWNTIME categories observed with named evidence, 2 hypothesized (Non-utilised talent, Motion); all 8 AI-specific categories hypothesized (no system built yet) but each grounded in an already-present condition | FDE2 | `submission/artefacts/01-discovery/waste_register_downtime.md`, `waste_register_ai_specific.md` |
| What must the full Prompt 09 workshop measure before scaling automation? | **FACT** (carried forward, not answered here): real current-state lead time per workflow; real fully-loaded cost; defect rate attributable to identity/unit/terminology/temporal mismatches; PV duplicate rate; actual AI-outage incident history once live | FDE2, executed at Prompt 09 | `submission/artefacts/01-discovery/dmaic_lens.md` §4 |

## 3. Analyse

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the leading root-cause candidate? | **INTERPRETATION** (not yet confirmed — Measure baselines are mostly Unknown, §2): fishbone analysis points to a **process/data cause** — the absence of an object-scoped, authority-aware evidence-resolution layer, since no system was ever mandated authoritative across business objects (`SOURCE_SYSTEM_FACT_PACK.md`; INJ-005). 5-Whys trace: high lead time → manual multi-system evidence assembly → no shared trusted evidence view → systems built/acquired independently → no shared identity/authority model → root cause | FDE2, confirmed at Prompt 09 | `submission/artefacts/01-discovery/dmaic_lens.md` §3 |
| Which DOWNTIME/AI wastes are implicated? | **FACT**: full 8-category DOWNTIME register and full 8-category AI-specific register completed this stage — Waiting and Motion (multi-system reconciliation before human judgement) are the Pareto-leading candidates; every AI-specific waste is currently hypothesized since no system is built, but each is grounded in an already-present condition (e.g. INJ-065 poisoned document, INJ-066 poisoned tool manifest) | FDE2/FDE5 | `submission/artefacts/01-discovery/waste_register_downtime.md`, `waste_register_ai_specific.md` |
| Is model accuracy the dominant bottleneck? | **INTERPRETATION**: evidence so far points *against* it — every named AI-specific risk is a control/integration/process failure mode (poisoned input, stale authorization, unsigned tool, missing eval harness), not a case of a well-controlled model reasoning incorrectly. Provisional; retest once a system exists | FDE5, retested at Prompt 09/12 | `waste_register_ai_specific.md` closing section |

## 4. Improve

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What treatment classes follow from Analyse? | **PROVISIONAL** (candidate, not architecture-validated): (1) a deterministic evidence-resolver — integrity hashing, knowledge-document authority/status check, identity/relationship validation, surfacing contradictions rather than resolving them silently; (2) risk-tiered human review — route clean, corroborated evidence faster, route conflicted evidence for deeper review; (3) constrained/grounded AI only after the deterministic layer, and only if justified against `rules_workflow`/`master_data_repair` non-AI baselines at Prompt 02/03 | FDE1/FDE3, locked at Prompt 04 (DDD) at the earliest | `dmaic_lens.md` §4 |
| What is explicitly NOT recommended yet? | **DECISION**: no agentic/autonomous component — insufficient evidence that model accuracy is the dominant problem vs. control/integration failures | FDE5 veto until evidence changes | `waste_register_ai_specific.md` |

## 5. Control

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What would prove the root cause was actually addressed? | **PROVISIONAL**: candidate metric is evidence-assembly time per object (batch/case/shortage event), once instrumented — currently Unknown, so this is a Measure commitment, not a result | FDE2 | `evidence_acquisition_backlog.md` item 1 |
| Who owns Control once built? | **PROVISIONAL**: shared ownership across FDE3 (build) and FDE4 (GxP), per governing-plan RACI §6.4 | Team, ratified at Prompt 09/12 | `submission/artefacts/ProjectPlan/AEGIS_PROJECT_PLAN_FINAL.md` §6.4 |
| What re-triggers a revisit of this Analyse conclusion? | **DECISION**: if Measure baselines, once acquired, show Waiting/Motion is not in fact the dominant waste, this Analyse section must be reopened before Improve proceeds further | FDE2, gate at Prompt 09 | — |

## 6. Failure modes and verification

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What failure modes are already known from evidence, ahead of formal Analyse? | **FACT**: identity-collision (INJ-008, INJ-021, INJ-045), unit/terminology mismatch (INJ-024, INJ-039), authority ambiguity (INJ-031, `knowledge/` status conflicts), and adversarial input (INJ-065 prompt injection, INJ-066 tool-manifest poisoning) are all *already-occurred* conditions in the evidence, not projected | FDE5, verified via negative test suite at G4 | `case/INTEGRATED_CASE.md` §7 |
| How will these be verified once implemented? | **DECISION**: prohibited-action and fail-closed tests must exist and fail for the correct reason *before* workflow implementation code is written (governing plan constraint 4, Track A non-negotiable) | FDE5 (Test Engineer agent, `.claude/agents/test-engineer.md`) | `submission/tests/` (not yet built) |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Gap | No current-state baseline for any of the three workflows' cycle time | Analyse root-cause ranking and Improve treatment classes are provisional until Measure baselines exist | FDE2 | Before Prompt 09 reconciliation | Open |
| R-002 | Risk | Improve/Control content (§§4–5) was written before any architecture exists, since Discovery is now a full-DMAIC stage | Provisional labeling mitigates but does not eliminate the risk of anchoring too early on one treatment class | FDE1 | Revisit at Prompt 04 (DDD) and every gate review | Open |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| Full DMAIC (Define/Measure/Analyse/Improve/Control) run at Discovery per updated methodology | `prompts/01_discovery.md` (full-DMAIC stage); `prompts/09_lean_dmaic.md` (reconciliation, not first pass) | Reviewed at G1; reconciled at Prompt 09 | This document §§1–5 | Done — Improve/Control explicitly labeled provisional |
| Waste registers traced to real evidence, not invented | `submission/artefacts/01-discovery/waste_register_downtime.md`, `waste_register_ai_specific.md` | Cross-check against `case/INTEGRATED_CASE.md` inject IDs | This document §3 | Done — all citations verified against source injects |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| — | FDE4/FDE5 (pending) | Not yet reviewed | — | — |
