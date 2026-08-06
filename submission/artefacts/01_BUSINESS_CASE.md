# Business Case

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice · ABSTAIN = unresolved until evidence/as-of/auth present.

## Document control

| Field | Entry |
|---|---|
| Team / owner | AEGIS-PHARMA delivery team (seats FDE1–FDE5; names TBD at kickoff per `submission/artefacts/ProjectPlan/AEGIS_PROJECT_PLAN_FINAL.md` §6.1) |
| Version / date | v0.1 — 2026-08-06 |
| Reviewers | FDE4 (GxP/Quality), FDE5 (Security/Eval) |
| Status | Draft |
| Related requirements / ADRs | `requirements/ASSESSMENT_RUBRIC.csv` RUB-01…03; Discovery register `submission/artefacts/01-discovery/evidence_register.md` |

## Purpose

This artefact supports the **go/narrow-scope/pivot decision** on whether an AI-assisted evidence-reconciliation intervention is justified for NovaCura Therapeutics Group (NTG), and if so, what its bounded scope, no-AI comparison, and stop/pivot criteria are. Scope is the three mandatory workflows only (batch evidence reconciliation, PV intake/signal support, supply/cold-chain option planning) — not a general-purpose GxP AI platform. Accountable owner: FDE1 (Product/Value Lead), with FDE4/FDE5 review authority over any claim touching GxP boundaries or security posture. Complete when board target, baseline, no-AI comparison, value hypothesis, scope, stop/pivot criteria and benefits-realisation plan are each evidenced and traceable to package data.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `data/board_requests.csv` (BR-01) | Board request, due 2026-11-30 | −14% end-to-end release lead time, no spec/Quality-authority change | Target only; current-state baseline number not in evidence |
| E-002 | `data/kpi_conflicts.csv` | Function-level KPI targets, effective as stated | Mfg 98% schedule adherence; Quality 96% right-first-time; Safety 100% expedited-on-time; Clinical DB lock 2026-09-15 | Snapshot targets; no historical trend supplied |
| E-003 | `data/no_ai_baselines.csv` | Internal process-excellence estimate | master_data_repair 38%/10wk; rules_workflow 27%/6wk; genai_assist 51%/14wk | Estimated value %, not measured; INJ-003 frames this as a deliberate challenge to AI-first framing |
| E-004 | `data/ai_use_boundaries.csv` | Executive prohibition, current | Prohibited: batch release/reject/reprocess/recall; final PV causality/seriousness/reportability; stock reserve/allocate/ship | Binding constraint on scope, not negotiable by this artefact |
| E-005 | `data/cost_model.csv` | Current cost model snapshot | Inference $184,000/mo; observability $31,000/mo; human_quality_review and medical_review booked at **$0/mo** | The $0 lines are a known omission (INJ-077), corrected in §4 below |
| E-006 | `data/staff_rates.csv` | Current loaded rates | Quality reviewer $92/hr; Safety physician $165/hr; Regulatory strategist $148/hr | Used to reconstruct the missing human-review cost line |
| E-007 | `data/portfolio_products.csv` | Portfolio snapshot | NCX-101 loses exclusivity in 19 months (patent-cliff pressure, INJ-004); NCB-204 in Phase III scale-up; NCS-310 marketed-shortage; NCR-415 research-stage with genomic-privacy risk | Confirms multi-modality, multi-risk portfolio — scope must generalize, not be single-product |
| E-008 | `case/INTEGRATED_CASE.md` §2–4 | Case narrative | Convergent crisis (trial amendment, disputed batch, safety signals, sterile excursion, cold-chain failure, excipient shortage, ransomware, inspection request) during the capstone window | Synthetic scenario; establishes urgency and multi-workflow interdependence |

## 1. Problem statement and affected decisions

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the measurable problem? | **FACT**: the board wants a **14% reduction in end-to-end release lead time**, explicitly *without* changing registered specifications or weakening independent Quality authority (E-001). **INTERPRETATION**: given the enterprise is fragmented across LIMS/MES/eBR/QMS/RIM/EDC/safety/serialization/spreadsheets with inconsistent IDs, timestamps, terminology, access and authority (`case/SOURCE_SYSTEM_FACT_PACK.md`), the lead-time problem is plausibly dominated by **evidence-assembly and reconciliation time**, not by the certification judgement itself | FDE1 owns problem framing; FDE4 must confirm no Quality-authority erosion is implied | `submission/artefacts/01-discovery/evidence_register.md` §§1,4,6 |
| Which decisions are affected? | **FACT** (`data/decision_rights.csv`): batch certification (EU QP, `ai_authority=none`), ICSR reportability (Safety Physician, `ai_authority=none`), stock allocation (Supply Governance Board, `ai_authority=draft only`). The AI intervention supports these decisions; it does not make them | FDE1/FDE4 jointly own the boundary statement | `data/decision_rights.csv`; `case/INTEGRATED_CASE.md` §4 |
| Is the problem the same across all three workflows? | **INTERPRETATION**: no — Workflow A (batch) and C (supply) share a "reconcile fragmented evidence, then a human decides" shape; Workflow B (PV) additionally carries a **zero-outage-tolerance** continuity constraint (`data/continuity_requirements.csv`: `pv_intake` max_ai_outage_hours=0) that the others do not, implying PV cannot rely on AI as anything but an accelerant, never a dependency | FDE2 (Domain/Evidence Lead) to confirm at Prompt 04 (DDD) | `data/continuity_requirements.csv` |

## 2. Baseline and evidence

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is today's release lead time (the baseline the −14% applies to)? | **ABSTAIN** — not present in supplied evidence. `board_requests.csv` states the target, not the current value | FDE2 to add to evidence-acquisition backlog; do not fabricate a baseline number | `submission/artefacts/01-discovery/evidence_acquisition_backlog.md` item 1 |
| What functional KPIs currently govern behaviour, and do they conflict? | **FACT**: yes — Manufacturing (schedule adherence), Quality (right-first-time), Safety (expedited-on-time) and Clinical (DB lock date) are each optimized independently with no shared metric (E-002); this is INJ-002, named explicitly as a conflicting-incentive condition, not an assumption | FDE1 to reconcile into a single north-star metric tree in §4 | `data/kpi_conflicts.csv`; `case/INTEGRATED_CASE.md` INJ-002 |
| What evidence exists that fragmentation is real, not assumed? | **FACT**: 84 disclosed injects span 13 dimensions with named evidence files each; e.g. INJ-021 (genealogy break), INJ-024 (unit mismatch), INJ-037 (duplicate PV cluster), INJ-051 (disputed cold-chain excursion) are concrete, evidence-linked occurrences, not hypotheticals | — | `case/INTEGRATED_CASE.md` §7; `data/inject_evidence_map.csv` |

## 3. No-AI alternative

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What do non-AI options offer? | **FACT** (`no_ai_baselines.csv`): `master_data_repair` = 38% estimated value / 10 weeks; `rules_workflow` = 27% / 6 weeks; `genai_assist` = 51% / 14 weeks | — | E-003 |
| Which option should be pursued first? | **INTERPRETATION**: GenAI has the highest estimated value but the longest duration; `rules_workflow` is fastest but lowest value. **DECISION** (carried from the governing project plan §3.3): do not commit to an LLM-first stack before Stage 1 explicitly compares these three against `data/ai_use_boundaries.csv` and INJ-006 (prohibited-optimization constraint) — keep the deterministic/rules path as the AI-disabled continuity spine regardless of which option is chosen for the primary build | FDE1 + FDE3, ratified at G1 | `submission/artefacts/ProjectPlan/AEGIS_PROJECT_PLAN_FINAL.md` §3.3 |
| Is "no AI at all" a defensible outcome of this artefact? | **INTERPRETATION**: participants may conclude a workflow does not need AI, per the case's own participant mandate (`case/INTEGRATED_CASE.md` §3: *"Participants may conclude that a workflow, knowledge graph or AI component is unjustified, but must prove the decision"*). This artefact does not yet make that determination — it is deferred to Prompt 02 (Frame) and revisited at G1 | FDE1 | `case/INTEGRATED_CASE.md` §3 |

## 4. Value hypothesis and metric tree

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the value hypothesis? | **ASSUMPTION**: AI-assisted evidence reconciliation (not decision automation) can reduce release lead time toward the −14% target by cutting evidence-search, cross-system-reconciliation and rework time, *without* reducing review depth or shifting accountable authority. This is an assumption, not yet proven — must be tested via Stage 1 DMAIC (artefact 02) against `cost_model.csv` and `staff_rates.csv` | FDE1, tested at Prompt 09 full DMAIC | `submission/artefacts/01-discovery/dmaic_lens.md` §4 |
| What does the current cost model actually capture? | **FACT**: `cost_model.csv` books inference at $184,000/mo and observability at $31,000/mo, but **human_quality_review and medical_review are booked at $0/mo** — this is INJ-077 ("hidden human-review cost"), a deliberate business-case gap the team must correct, not accept | FDE1, corrected before any ROI claim | E-005, E-006; INJ-077 |
| What is the corrected cost floor? | **INTERPRETATION**: using `staff_rates.csv` loaded rates (Quality reviewer $92/hr, Safety physician $165/hr, Regulatory strategist $148/hr), any credible value hypothesis must add an estimated human-review hour count × rate before claiming net savings — this calculation is not yet performed (blocked on baseline review-hour data, see backlog item 1) | FDE1, before artefact 23 (Token/FinOps) is finalized | E-006; backlog item 1 |
| What is the metric tree (top-level)? | **DECISION**: North-star = end-to-end release lead time (−14% target). Contributing metrics (proposed, to be ratified at G1): evidence-assembly time per batch/case/shortage event; reconciliation rework rate (unit/terminology/identity mismatches); reviewer hours per decision; AI-assisted vs. manual accuracy on evidence citation (not on the prohibited decision itself) | FDE1, ratified at G1 | — |

## 5. Scope and exclusions

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is in scope? | **FACT** (`case/INTEGRATED_CASE.md` §4): exactly three workflows — A (GxP batch evidence reconciliation), B (PV case intake and signal support), C (bounded supply-shortage/cold-chain recovery planner) | Fixed by the case; not open to redesign | `case/INTEGRATED_CASE.md` §4 |
| What is explicitly excluded? | **FACT**: any autonomous batch disposition, final PV decision, clinical eligibility determination, stock reservation/allocation/shipment, quality-status change, or recall initiation (`ai_use_boundaries.csv`; `case/INTEGRATED_CASE.md` §4) | Hard boundary — violation is a stop condition | E-004 |
| Is scope narrower than the business problem? | **INTERPRETATION**: yes, deliberately — the business problem (fragmented, multi-decision estate) is broader than the three advisory workflows chosen. This is consistent with `DEFINITION_OF_DONE.md` §1: *"The chosen intervention is narrower than the business problem and does not automate prohibited accountability"* | FDE1 | `DEFINITION_OF_DONE.md` §1 |

## 6. Assumptions, stop/pivot criteria

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What triggers STOP or PIVOT? | **DECISION** (carried from governing plan §3.4): STOP/PIVOT if design requires AI to release/reject a batch, make a final PV decision, or allocate/ship/recall (hard gate; INJ-006); STOP on silent unit conversion or irreversible case merge (INJ-024/INJ-037); PAUSE if no offline/AI-disabled path exists (INJ-082); ABSTAIN + gate fail if unresolved identity/unit/time/authority is presented as resolved | FDE4 + FDE5 veto authority | `submission/artefacts/ProjectPlan/AEGIS_PROJECT_PLAN_FINAL.md` §3.4 |
| What are the open assumptions this business case rests on? | Listed in Risks table below | FDE1 | — |

## 7. Benefits-realisation plan

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| How will benefit be demonstrated, not just claimed? | **DECISION**: benefit is demonstrated only via the 12 evaluation suites and 84-inject test-coverage mirror under `submission/evaluation/` (not yet built), each result citing evidence path, reviewer role and gate outcome — not via narrative claims in this document | FDE5 (Eval Lead), at G6 | `submission/artefacts/ProjectPlan/AEGIS_PROJECT_PLAN_FINAL.md` §11.4 |
| What is the reporting cadence? | **DECISION**: daily standup + decision log per governing plan §17; gate reviews at G1–G9 | Team | Plan §17 |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Gap | Current-state release-lead-time baseline is not in evidence | Cannot verify −14% is achievable or attributable to this intervention | FDE2 | Before artefact 02 Measure phase closes | Open |
| R-002 | Assumption | Value hypothesis (evidence reconciliation reduces lead time without reducing review depth) is unproven | Business case could overstate benefit | FDE1 | Test at Prompt 09 DMAIC | Open |
| R-003 | Risk | Team may under-price true cost (human review at $0) if INJ-077 gap is not corrected before ROI claims | Business case defensibility at G8 defence | FDE1 | Before artefact 23 (Token/FinOps) | Open |
| R-004 | Risk | −14% target pressure could create incentive to narrow evidence review depth in practice, contradicting the board's own "no Quality-authority change" constraint | Contradicts board mandate; GxP exposure | FDE4 | Every gate review | Open |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| Intervention scope excludes prohibited actions (RUB hard gate) | Contract `execution_status="not_executed"` on all three workflow schemas | Negative contract samples (`evaluation/contract_samples/negative_*`) | `submission/tests/` (not yet built) | Pending |
| No-AI alternative genuinely compared | §3 above | DMAIC Analyse phase (Prompt 09) | `submission/artefacts/02_DMAIC_WORKBOOK.md` | Pending |
| Value hypothesis tested, not asserted | §4 above | 12 evaluation suites, FinOps metrics | `submission/evaluation/`, artefact 23 | Pending |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| — | FDE4/FDE5 (pending) | Not yet reviewed | — | — |
