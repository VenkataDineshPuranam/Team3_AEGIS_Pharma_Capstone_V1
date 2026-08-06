# DMAIC Workbook

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice · ABSTAIN = unresolved until evidence/as-of/auth present.

**Stage note:** per `prompts/01_discovery.md` and `prompts/09_lean_dmaic.md` (governing plan §11.8/methodology), only a **thin Define/Measure lens** is run during Discovery (P1/G1). Analyse, Improve and Control are explicitly deferred to the full Prompt 09 Lean workshop (Phase P6/G6 per the governing plan). Filling them in now would violate the methodology's own constraint against running the full workshop early — those sections are marked **PENDING (Prompt 09)** rather than fabricated.

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
| What early waste signals were observed (not yet measured)? | **FACT**: 6 waste signals identified, 5 observed / 1 hypothesized — manual multi-system evidence assembly, unit/terminology rework, cross-system-reconciliation waiting, retrieval/token waste risk, mis-costed value (human review $0), duplicate PV case handling | FDE2 | `submission/artefacts/01-discovery/early_waste_signals.md` |
| What must the full Prompt 09 workshop measure before scaling automation? | **FACT** (carried forward, not answered here): real current-state lead time per workflow; real fully-loaded cost; defect rate attributable to identity/unit/terminology/temporal mismatches; PV duplicate rate; actual AI-outage incident history once live | FDE2, executed at Prompt 09 | `submission/artefacts/01-discovery/dmaic_lens.md` §4 |

## 3. Analyse

**PENDING (Prompt 09 full Lean workshop, Phase P6/G6).** Running root-cause analysis before Measure has established real baselines (§2, all Unknown) would produce unsupported conclusions. Do not treat the "top ten investigation hypotheses" in `submission/artefacts/01-discovery/evidence_register.md` §9 as Analyse-stage findings — they are Discovery-stage hypotheses to be tested, not root causes yet confirmed.

## 4. Improve

**PENDING (Prompt 09 full Lean workshop, Phase P6/G6).** No improvement design is committed until Analyse confirms root causes against measured (not estimated) baselines.

## 5. Control

**PENDING (Prompt 09 full Lean workshop, Phase P6/G6).** Control-phase artefacts (SPC-equivalent monitoring, control plan, ownership handoff) depend on an implemented, measured system that does not yet exist (`submission/src` currently has 0 substantive files).

## 6. Failure modes and verification

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What failure modes are already known from evidence, ahead of formal Analyse? | **FACT**: identity-collision (INJ-008, INJ-021, INJ-045), unit/terminology mismatch (INJ-024, INJ-039), authority ambiguity (INJ-031, `knowledge/` status conflicts), and adversarial input (INJ-065 prompt injection, INJ-066 tool-manifest poisoning) are all *already-occurred* conditions in the evidence, not projected | FDE5, verified via negative test suite at G4 | `case/INTEGRATED_CASE.md` §7 |
| How will these be verified once implemented? | **DECISION**: prohibited-action and fail-closed tests must exist and fail for the correct reason *before* workflow implementation code is written (governing plan constraint 4, Track A non-negotiable) | FDE5 (Test Engineer agent, `.claude/agents/test-engineer.md`) | `submission/tests/` (not yet built) |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Gap | No current-state baseline for any of the three workflows' cycle time | Analyse/Improve cannot start with real numbers | FDE2 | Before Prompt 09 | Open |
| R-002 | Risk | Team may be tempted to skip straight to Improve without a measured baseline, given time pressure (40h Track A budget) | Undermines DMAIC discipline; plan explicitly forbids this ("Do not run full DMAIC or redesign here") | FDE1 | Every gate review | Open |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| Define/Measure only run at Discovery; Analyse/Improve/Control deferred | `prompts/01_discovery.md` constraints; `prompts/09_lean_dmaic.md` | Reviewed at G1; enforced at Prompt 09 | This document §§3–5 | Pending Prompt 09 |
| Waste signals traced to real evidence, not invented | `submission/artefacts/01-discovery/early_waste_signals.md` | Cross-check against `case/INTEGRATED_CASE.md` inject IDs | This document §2 | Done — all citations verified against source injects |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| — | FDE4/FDE5 (pending) | Not yet reviewed | — | — |
