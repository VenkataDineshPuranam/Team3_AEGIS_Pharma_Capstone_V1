# Product and Service Blueprint

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice · ABSTAIN = unresolved until evidence/as-of/auth present.

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE1 (Product/Value Lead) primary, FDE3 (Architecture/Build) co-owner for frontstage/backstage design |
| Version / date | v0.1 — 2026-08-06 |
| Reviewers | FDE4, FDE5 |
| Status | Draft |
| Related requirements / ADRs | `requirements/ASSESSMENT_RUBRIC.csv` RUB-01…03; feeds artefact 10 (C4), artefact 18 (Responsible AI/Human Factors) |

## Purpose

Defines who uses the three workflows, what they are and are not permitted to do, and how the human stays in control at every touchpoint — including failure. Scope: the three mandatory workflows' user-facing surface (`submission/app`) and its human-review points. Accountable owner: FDE1, with FDE4 holding veto over any touchpoint that could blur the human-only boundary on batch certification or PV decisions. Complete when personas, intended/prohibited uses, frontstage/backstage flow, human-review touchpoints, failure/recovery journey, accessibility and success measures are each evidenced.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `case/INTEGRATED_CASE.md` §4 | Case mandate, current | Definitions and prohibited actions for Workflows A/B/C | Fixed scope, not open to redesign |
| E-002 | `data/decision_rights.csv` | Current | Accountable roles and `ai_authority` per decision | 3 decisions enumerated |
| E-003 | `case/STAKEHOLDER_PACK.md` | Current | Persona source (15 stakeholders with concerns) | Narrative, not a literal UI persona doc |
| E-004 | `case/INTEGRATED_CASE.md` D11 injects (INJ-071…074) | Current | Automation bias, language inequity, accessibility failure, role conflict | Named conditions, not hypothetical UX risks |
| E-005 | `data/continuity_requirements.csv` | Current | Max AI outage per workflow (14d / 0h / 14d) and mandatory manual runbook | Drives failure/recovery journey design |
| E-006 | `case/INTEGRATED_CASE.md` §5 | Current | Required operating properties (abstention, human review, kill switch, degraded mode, auditability, AI-disabled continuity, etc.) | Applies to all three workflows uniformly |

## 1. Personas and jobs-to-be-done

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Who are the primary users (not stakeholders in general — the people who open the tool)? | **INTERPRETATION**, derived from `STAKEHOLDER_PACK.md` decision-authority column: **EU Qualified Person / delegate reviewer** (Workflow A — job: "assemble and judge whether release evidence is complete and consistent before I certify"); **PV case processor / Safety Physician's delegate** (Workflow B — job: "intake and triage a case with correct duplicates, clock and terminology before a physician makes the safety call"); **Supply planner / Supply Governance Board delegate** (Workflow C — job: "see traceable, non-committed options for a shortage or cold-chain event before the Board approves an action") | FDE1, confirmed at G1 | E-002, E-003 |
| What is each persona's job-to-be-done, precisely? | **DECISION**: each persona's job is "get evidence I can trust and act on," never "get a decision made for me" — this framing is load-bearing for scope (§2) and must be reflected in UI copy, not just backend behaviour | FDE1/FDE3 | E-001 |

## 2. Intended and prohibited uses

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is each workflow's intended use? | **FACT** (`data/ai_use_boundaries.csv`): Batch evidence → "reconcile, cite, flag, abstain." PV intake → "extract, normalize, cluster, cite." Supply planning → "generate options" | — | E-002 |
| What is explicitly prohibited, per workflow? | **FACT**: Batch → release/reject/reprocess/recall. PV → final causality/seriousness/reportability. Supply → reserve/allocate/ship | FDE4 veto on any UI affordance that implies otherwise | E-002 |
| How is this boundary made visible to the user, not just enforced in the backend? | **ASSUMPTION** (design intent, not yet built): every workflow response surface must visually and structurally distinguish "evidence/options presented" from "decision," e.g. a persistent `execution_status: not_executed` indicator and no button labelled to imply a regulated action — this is a UI requirement to be locked in artefact 10 (C4) / artefact 18, not yet implemented (`submission/app` has 0 substantive files) | FDE1/FDE3, before P5 POC build phase | Backlog |

## 3. Frontstage/backstage workflow

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What does the user see (frontstage)? | **ASSUMPTION** (not yet built): a request form (object ID / case / event, purpose, as-of time) → a structured evidence view (cited facts, contradictions, gaps, abstentions) → an explicit human-review action, never an auto-advanced "approve" | FDE3, design locked at Prompt 05 (Feature Specs) | Backlog |
| What happens backstage (not user-visible)? | **DECISION** (governing plan §11.3, §13): a shared evidence-resolver computes real SHA-256 integrity hashes, stamps `source_preserved`, checks `knowledge_catalog` authority/status, and validates `RELATIONSHIP_MODEL` foreign keys — reused by all three workflows rather than three bespoke reconciliation engines | FDE3 | `submission/artefacts/ProjectPlan/AEGIS_PROJECT_PLAN_FINAL.md` §11.3, §13 |
| Where does authorization get checked? | **FACT/DECISION**: at execution time, not at session start — current user, purpose, object and role authorization must be checked per request; stale or ambiguous authorization denies by default (`CLAUDE.md` guardrails, derived from `.cursor/rules/pharma-fde.mdc`); this directly addresses INJ-067 (entitlement revoked in IAM but cached in the AI gateway) | FDE5 | `CLAUDE.md` §Guardrails; INJ-067 |

## 4. Human review touchpoints

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Where must a human explicitly act before anything downstream happens? | **FACT** (`case/INTEGRATED_CASE.md` §5): every workflow must demonstrate abstention and human review as required operating properties — not optional UI affordances | FDE1/FDE4 | E-006 |
| What does the system do when it cannot resolve identity/unit/time/authority? | **DECISION** (`CLAUDE.md` guardrails): abstain and record the assumption rather than silently resolving; this is the direct answer to INJ-024 (unit mismatch), INJ-031 (validation-state ambiguity), INJ-038 (reporting-clock conflict) | FDE2/FDE4 | `CLAUDE.md` §Guardrails |
| What is the known risk of over-trusting the review touchpoint? | **FACT**: automation bias is already named — reviewers accepted an AI summary despite an omitted critical deviation (INJ-071) | FDE1/FDE4, mitigation design owed to artefact 18 | E-004 |

## 5. Failure and recovery journey

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What happens when the AI service is unavailable? | **FACT** (`data/continuity_requirements.csv`): batch_review and supply_planning tolerate up to **14 days** AI outage with a mandatory manual runbook; pv_intake tolerates **0 hours** — the manual runbook must be usable immediately, not as a 14-day fallback | FDE5/FDE1 (runbooks: SETUP/OPERATIONS/INCIDENT/AI_DISABLED), owed by G5–G7 | E-005 |
| Is this asymmetry (14 days vs. 0 hours) reflected in the product design? | **INTERPRETATION**: yes it must be — PV's UI/process should default to manual-capable operation with AI as an accelerant layered on top, not a dependency; batch/supply can tolerate a longer AI-disabled window before the manual runbook becomes the sole path | FDE1/FDE3 | E-005 |
| What does recovery look like after an outage or checkpoint failure? | **FACT**: known failure mode already named — an agent resuming a supply-recovery plan from stale state duplicated draft reservations (INJ-080); recovery design must include idempotency keys and checkpoint validation, not blind resume | FDE3/FDE5 | `case/INTEGRATED_CASE.md` INJ-080 |

## 6. Accessibility and multilingual experience

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What accessibility failures are already named in evidence? | **FACT**: the proposed interface (as evidenced by `usability_findings.csv`, INJ-073) cannot be operated fully by keyboard and uses colour-only warnings | FDE4/FDE1, mitigation owed by artefact 28 (Production Readiness) accessibility smoke test | `case/INTEGRATED_CASE.md` INJ-073 |
| What language-quality gaps are already named? | **FACT**: Arabic and Hindi safety-narrative extraction quality is lower than English/German (INJ-072, `model_performance.csv; icsr_cases.csv`) | FDE5, tracked in evaluation suite 10 (subgroup/language/accessibility) | `case/INTEGRATED_CASE.md` INJ-072 |
| What is the design commitment? | **DECISION**: subgroup evaluation (suite 10, governing plan §11.4) must include language and accessibility breakdowns before any release-readiness claim; a missing subgroup evidence result is itself a named release gate (§11.5 of the plan) | FDE5 | Plan §11.4–11.5 |

## 7. Success measures

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| How is product success measured, distinct from business-case value (artefact 01)? | **DECISION**: at the product level — evidence-citation accuracy, abstention correctness (does it abstain when it should, not just when convenient), human-review completion rate, and accessibility/subgroup parity — not lead-time alone, which is a business outcome several steps downstream | FDE1/FDE5 | Artefact 22 (Evaluation Scorecard), not yet built |
| Is there a defined threshold for "good enough to ship"? | **ABSTAIN** — thresholds are not yet committed; governing plan requires thresholds be locked **before** results are seen (§11.4), so this is deferred to Prompt 09/artefact 22, not decided here | FDE5, before P6 TEVV phase | Plan §11.4 |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Gap | No UI/UX artefact exists yet (`submission/app` has 0 substantive files) — §§2–3 above are design intent, not built product | Cannot verify the "boundary is visible to the user" claim until built | FDE3 | P5 POC build phase (governing plan) | Open |
| R-002 | Risk | Automation bias (INJ-071) has no mitigation design committed yet | Reviewers could rubber-stamp AI-assisted summaries | FDE1/FDE4 | Before artefact 18 | Open |
| R-003 | Risk | Accessibility (INJ-073) and language-quality (INJ-072) gaps are named but unmitigated | Non-compliant or inequitable UX at release | FDE4/FDE5 | Before artefact 28 | Open |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| No UI affordance implies a prohibited action | `execution_status: not_executed` contract field; UI review | Negative contract samples + manual UX review | `evaluation/contract_samples/negative_*` | Pending — app not yet built |
| PV maintains 0-hour manual-capable operation | Runbook `AI_DISABLED` + PV workflow design | Continuity drill (governing plan M7) | `submission/runbooks/` (not yet built) | Pending |
| Subgroup/accessibility parity measured before release claim | Evaluation suite 10 | Subgroup test results | `submission/evaluation/reports/` (not yet built) | Pending |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| — | FDE4/FDE5 (pending) | Not yet reviewed | — | — |
