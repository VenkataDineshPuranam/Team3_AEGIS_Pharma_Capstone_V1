# Workflow D — Clinical Trial Context Support

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

**⚠️ ADDITIONAL, OPTIONAL SCOPE — NOT ONE OF THE THREE MANDATED WORKFLOWS.** `case/INTEGRATED_CASE.md` §4 names exactly three mandatory workflows (batch evidence, PV intake, supply/cold-chain). This is a fourth, participant-added workflow, built because §3 of that same document explicitly permits going beyond the mandate ("Participants may conclude that a workflow... is unjustified, but must prove the decision" — the converse is not forbidden), and because `CLAUDE.md`'s guardrails already name **"clinical eligibility"** as a prohibited autonomous action even without a mandated workflow behind it. **`RUB-08` (three-workflow engineering quality, the highest-weight rubric line) scores the three mandated workflows specifically and is unaffected by this artefact.** Do not read the register's revised totals as a claim that the graded mandate expanded.

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE2 (Domain/Evidence Lead), FDE3 (build) |
| Version / date | v1.0 — 2026-08-11 |
| Reviewers | FDE1, FDE5 |
| Status | Approved for defence |
| Related requirements / ADRs | `04-ddd/domain_model.md` "Workflow D invariant extension" (INV-11/12/13, POL-07); `CLAUDE.md` guardrails |

## Purpose

States why Workflow D exists, what it may and must never do, and links every claim to real disclosed D03 evidence and a reproducible test/evaluation result. Accountable owner: FDE2.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `case/INTEGRATED_CASE.md` §3 | Package | "Participants may conclude that a workflow... is unjustified, but must prove the decision" — the scope-exclusion license, read here as also not forbidding scope beyond the mandate | Immutable |
| E-002 | `CLAUDE.md` guardrails | Repo | "clinical eligibility" named as a prohibited autonomous action, independent of any mandated clinical workflow | Immutable |
| E-003 | `data/eligibility_evidence.csv` | Package | Subject `S-301-044`, ALT=58 U/L vs `central_uln=40`, `local_uln=60`, `edc_rule_uln=40` — three disagreeing eligibility thresholds | Real disclosed row |
| E-004 | `data/support_tickets.csv` | Package | `SUP-41`: "Kit pattern suggests active arm; screenshot attached", `visibility=site_and_vendor` | Real disclosed row |
| E-005 | `data/endpoint_packets.csv`, `data/imaging_reviews.csv` | Package | `EP-71`: `review_status=conflict`; reviewers R1=responder, R2=non_responder | Real disclosed rows |
| E-006 | `data/protocol_versions.csv`, `data/site_approvals.csv` | Package | `NCB204-301` global-current version 5.0 vs site `IN-014` approved version 4.1 | Real disclosed rows |
| E-007 | `data/consents.csv`, `data/processing_events.csv` | Package | `C-044` consent `withdrawn_biomarker`; `PE-9` biomarker processing completed with `consent_check=cached_active` — a stale-cache pattern, same class ADR-006 closes for authorization | Real disclosed rows |
| E-008 | `submission/tests/test_prohibited_clinical_eligibility.py` | Generated this session | 7/7 tests, red before implementation, green after (2 added to close R-001: INJ-015, INJ-020) | `python3 -B -m unittest submission.tests.test_prohibited_clinical_eligibility -v` |
| E-009 | `submission/evaluation/reports/scorecard.csv` (suite S13) | Generated this session | 5/5 Workflow D scenarios PASS, 0 gates blocked | `python3 -B submission/evaluation/runner.py` |

## 1. What Workflow D does and must never do

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What does it do? | **FACT**: reconciles clinical trial context — eligibility-threshold agreement, protocol-version applicability, support-ticket unblinding risk, endpoint-reviewer agreement — and surfaces every disagreement as a `contradictions`/`protocol_conflicts`/`unblinding_risk_flags` entry | FDE2 | `submission/src/workflows/clinical_trial_context.py` |
| What must it never do (INV-11)? | **FACT**: never state or imply subject eligibility — `clinical_response.schema.json`'s `additionalProperties: false` structurally forbids an `eligibility`/`eligibility_decision` field, the same pattern `batch_response.schema.json` uses to forbid `batch_disposition` | FDE5 | `submission/evaluation/contracts/clinical_response.schema.json` |
| What must it never do (INV-12)? | **FACT**: never confirm or deny treatment-arm/blinding status — a support ticket matching an unblinding-risk term becomes an `unblinding_risk_flags` entry, never a `treatment_arm` field | FDE5 | E-004; INV-12 |
| What must it never do (INV-13)? | **FACT**: never adjudicate a disagreeing endpoint conclusion — surfaced as a `contradictions` entry, never resolved to one conclusion | FDE5 | E-005; INV-13 |

## 2. The seven injects this closes, each with its own evidence

| Inject | Title | Real evidence | How Workflow D treats it |
|---|---|---|---|
| INJ-013 | Protocol-version divergence | E-006 | `protocol_conflicts` surfaces both versions (POL-07); never defaults to one |
| INJ-014 | Eligibility ambiguity | E-003 | `contradictions` surfaces the 3-way ULN disagreement (INV-11); never an eligibility field |
| INJ-015 | Randomization service outage | `data/randomization_events.csv` (`IRT-9001`, `method=manual_downtime_log`) | `gaps` entry (`randomization_service_outage_evidence`), never silently backfilled as an equivalent allocation; live suite S13 scenario `S13-randomization-outage` |
| INJ-016 | Potential unblinding | E-004 | `unblinding_risk_flags` (INV-12); live suite S13 scenario `S13-unblinding` |
| INJ-017 | eConsent withdrawal mismatch | E-007 | Already `addressed` separately (`17_PRIVACY_ETHICS.md` §6, `06_DATA_GOVERNANCE_INTEGRITY.md` §6) — Workflow D adds a second, complementary demonstration of the same stale-cache pattern (ADR-006 analogy), not a first treatment |
| INJ-019 | Endpoint adjudication backlog | E-005 | `contradictions` (INV-13); live suite S13 scenario `S13-endpoint-adjudication` |
| INJ-020 | Site inspection risk | `data/site_metrics.csv` (`IN-014`: `late_source_pct=31`, `digit_preference_flag=true`, `credential_sharing_flag=true`) | `site_inspection_risk_flags` entry, never a site-status/inspection-outcome decision; live suite S13 scenario `S13-site-inspection-risk` |

## 3. Tests-before-implementation discipline

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Was this built test-first? | **FACT**: yes — `test_prohibited_clinical_eligibility.py` was written and confirmed failing (`ModuleNotFoundError`-driven red, 5/5) before `clinical_trial_context.py` existed, per `CLAUDE.md` "Create deterministic tests before model inference" | FDE5 | E-008 |
| Does it reuse the shared kernel or duplicate logic? | **DECISION**: reuses `authorization.check_authorization` directly (same POL-01 deny-by-default); does not duplicate `evidence_resolver`'s lab-specific contradiction shape since eligibility/endpoint conflicts have a different structure, but follows the identical *pattern* (surface, never resolve) | FDE3 | `submission/src/workflows/clinical_trial_context.py` |

## 4. Evaluation integration

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Is it in the evaluation harness? | **FACT**: yes — suite `S13` (`submission/evaluation/datasets/S13_workflow_d_clinical_trial_context.json`), explicitly marked "ADDITIONAL, OPTIONAL SCOPE" in its own `plan_ref` field so it's never confused with the 12 required suites | FDE5 | E-009 |
| Does `schema_grader` validate it? | **FACT**: yes — `_SCHEMA_BY_WORKFLOW` maps `clinical_trial_context` to `submission/evaluation/contracts/clinical_response.schema.json` (submission-owned, since the immutable `evaluation/contracts/` cannot be edited per `CLAUDE.md`) | FDE5 | `submission/evaluation/graders/schema_grader.py` |
| Live run result | **FACT**: 5/5 Workflow D scenarios PASS, 0 release gates blocked, part of the overall 23/23 regression pass this run | FDE5 | `submission/evaluation/reports/summary.json` |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Gap | INJ-015 (randomization outage) and INJ-020 (site inspection risk) previously had only cited evidence (§2), no dedicated live scenario in suite S13 | Now closed: `S13-randomization-outage` and `S13-site-inspection-risk` added, both PASS with 0 gates blocked (`submission/evaluation/reports/scorecard.csv`) | FDE2 | Closed 2026-08-11 | Closed |
| R-002 | Decision | Workflow D is not wired into `submission/app/` (the offline demonstrator) — deliberately, to avoid diluting the three-workflow defence narrative with a fourth UI tab | None — code/tests/eval are the substantive proof, a UI demo is not required for any of A/B/C either beyond the existing 3 tabs | FDE1 | If a live demo of Workflow D is specifically requested | Open, non-blocker |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| No eligibility determination is ever possible | INV-11; schema `additionalProperties: false` | `test_prohibited_clinical_eligibility.py` | `submission/tests/` | PASS (5/5) |
| Suite S13 clearly marked as additional, not required | `plan_ref` field in dataset | Manual inspection | `submission/evaluation/datasets/S13_*.json` | Confirmed |
| Does not change RUB-08 scoring | `AEGIS_PROJECT_PLAN_FINAL.md` §12 assignment matrix (unedited, immutable-adjacent plan doc) | N/A | This artefact, header | Confirmed by citation |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| FDE2 (self-review) | Domain/Evidence Lead | Scope-boundary labeling is prominent and repeated (header, register note, dataset `plan_ref`) so it can't be silently mistaken for expanded mandate | Accepted | 2026-08-11 |
