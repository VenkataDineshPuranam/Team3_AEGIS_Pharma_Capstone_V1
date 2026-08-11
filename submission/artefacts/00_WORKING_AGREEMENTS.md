# Working Agreements

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

## Document control

| Field | Entry |
|---|---|
| Team / owner | AEGIS-PHARMA delivery team (seats FDE1–FDE5) |
| Version / date | v1.0 — 2026-08-11 |
| Reviewers | Whole team (self-certified at Stage 0 exit) |
| Status | Approved — Stage 0 exit evidence, in force for the full engagement |
| Related requirements / ADRs | `WORKSHOP_DEPLOYMENT_PLAN.md` Stage 0 row; `00_TEAM_CHARTER.md` (seats and decision rights); `CLAUDE.md` guardrails |

## Purpose

States the operating rules the team actually followed — evidence discipline, review cadence, and change control — so the numbered artefacts' quality (FACT/INTERPRETATION/ASSUMPTION/DECISION labeling, per-artefact evidence registers, review records) is traceable to an agreed way of working, not an ad-hoc habit. Companion to `00_TEAM_CHARTER.md` (who decides) and the preflight report (`run_capstone.py --check` output). Accountable owner: whole team.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `CLAUDE.md` guardrails | Repo | "Create deterministic tests before model inference. Every material requirement must trace to a test and evidence artifact." | Immutable |
| E-002 | `.claude/commands/00_qualify_problem`, `01_map_evidence`, `02_build_tests_first` | Repo | Required run order per workflow before implementation code — the concrete test-first working agreement in force | Immutable |
| E-003 | Every numbered artefact 01–30 | This engagement | Consistent "Document control" + "Evidence register" + "Review record" structure — the actual, observed working agreement, not a stated-but-unfollowed rule | Self-consistent; verifiable by inspection |
| E-004 | `CLAUDE.md` "Immutable vs. writable areas" | Repo | `case/`, `data/`, `knowledge/`, `source_documents/`, `evaluation/`, `requirements/`, `starter/`, `templates/` are never edited; `FILE_HASHES.csv` enforces this | Immutable |

## 1. Evidence and labeling discipline

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| How is every claim labeled? | **DECISION**: FACT (package-cited) / INTERPRETATION (reasoned from facts) / ASSUMPTION (unproven) / DECISION (team choice) / ABSTAIN (unresolved until evidence/as-of/authority present) — applied in every artefact's tables, not just prose | Whole team | Label key line at the top of every artefact |
| What happens when evidence conflicts or is missing? | **FACT**: recorded as a gap or abstention, never silently resolved or fabricated — per `CLAUDE.md` "Record assumptions and abstain when identity, unit, time, terminology, jurisdiction, source authority or evidence completeness cannot be resolved" | Whole team | `04-ddd/inject_register_84.md` `in_scope_open`/`out_of_scope` rows; `WORKFLOW_D_CLINICAL_TRIAL_CONTEXT.md` R-001/R-002 |

## 2. Test-first and change control

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Is code written before or after its test? | **FACT**: before — every prohibited-action test file (`submission/tests/test_prohibited_*.py`) was confirmed red (`ModuleNotFoundError`) before the corresponding `submission/src/workflows/*.py` existed | FDE3 (build), FDE5 (test authority) | Each test file's own "STATUS: RED by design" docstring |
| What is immutable, and how is drift caught? | **FACT**: `case/`, `data/`, `knowledge/`, `source_documents/`, `evaluation/`, `requirements/`, `starter/`, `templates/` are never edited; `tools/verify_package.py` checks this via `FILE_HASHES.csv` | Whole team | `python3 tools/verify_package.py` |
| What happens when a tool's own hash-tracked status conflicts with a needed fix? | **DECISION**: the immutable-hash check wins — a fix that would break `FILE_HASHES.csv` integrity (e.g. editing a hash-tracked file under `tools/`) is reverted in favor of documenting the limitation instead | Whole team | Working practice, not yet a named artefact section prior to this document |

## 3. Review cadence and roles

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Who reviews what? | **FACT**: every artefact names a primary owner seat and ≥1 reviewer seat in its "Document control" table (e.g. `01_BUSINESS_CASE.md`: FDE4/FDE5 reviewers) — reviewer seats are chosen by domain relevance (GxP → FDE4, security/eval → FDE5), not rotation | Whole team | `00_TEAM_CHARTER.md` §2 |
| Is a review record kept, even when informal? | **FACT**: yes — every artefact ends with a "Review record" table; several are explicitly self-review with the finding stated in the open (e.g. this document's own §"Review record" below) rather than omitted | Whole team | Per-artefact "Review record" tables |

## 4. Definition of done and evaluation gate

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What gates a release candidate? | **FACT**: `submission/evaluation/runner.py`'s 10 automatic release gates (`G-SCHEMA_FAILURE` … `G-UNREPRODUCIBLE_BUILD_OR_EVAL`) — a blocked gate is never averaged away by a passing overall score | FDE5 | `submission/evaluation/policies/release_gates.py`; `submission/evaluation/reports/summary.json` |
| How are late-discovered gaps (e.g. peer-review feedback) handled? | **DECISION**: triaged by rubric impact, not by order raised — hard-gate/scored-criterion gaps (e.g. RUB-05 citation density) are fixed before cosmetic ones, and every fix is evidenced the same way as original build work (test-first where applicable, traceability table updated) | Whole team | This document; peer-audit-driven fixes tracked in the same artefact style as original build |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Gap | This document, like `00_TEAM_CHARTER.md`, was written after most of the build rather than literally at Stage 0 kickoff | None on content accuracy — it describes the agreements actually followed, verifiable against the artefact set itself | Whole team | N/A | Accepted, non-blocker |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| Stage 0 exit evidence (working agreements) exists | `WORKSHOP_DEPLOYMENT_PLAN.md` Stage 0 row | Manual inspection | This document | Done |
| Agreements match observed practice, not aspiration | Cross-check against artefact structure, test-first discipline, review records | Manual inspection of `submission/artefacts/*.md`, `submission/tests/*.py` | This document §1–3 | Confirmed |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| Self-review | Whole team | Flagged in peer audit (Mahesh, teammate repo comparison) as a flat Stage-0 gap | Added, describing agreements as actually practiced rather than inventing new ones retroactively | 2026-08-11 |
