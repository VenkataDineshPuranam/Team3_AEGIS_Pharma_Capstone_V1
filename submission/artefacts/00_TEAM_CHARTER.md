# Team Charter

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

## Document control

| Field | Entry |
|---|---|
| Team / owner | AEGIS-PHARMA delivery team (seats FDE1–FDE5) |
| Version / date | v1.0 — 2026-08-11 |
| Reviewers | Whole team (self-certified at Stage 0 exit) |
| Status | Approved — Stage 0 exit evidence |
| Related requirements / ADRs | `WORKSHOP_DEPLOYMENT_PLAN.md` Stage 0 row ("Preflight report, team charter, working agreements"); `submission/artefacts/ProjectPlan/AEGIS_PROJECT_PLAN_FINAL.md` §6 (seat model); `requirements/ASSESSMENT_RUBRIC.csv` |

## Purpose

Records why this team exists, what it is accountable for, and who holds decision rights before any Discovery work starts — the Stage 0 exit evidence named alongside the preflight report and working agreements. This is not a rubric-scored artefact on its own; it is the load-bearing context that makes the numbered artefacts' repeated "Team / owner: FDE1…FDE5" attributions traceable to an actual charter rather than an assumed convention. Accountable owner: whole team, no single seat.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `WORKSHOP_DEPLOYMENT_PLAN.md` Stage 0 row | Package | Exit evidence for Stage 0 is "Preflight report, team charter, working agreements" | Immutable |
| E-002 | `submission/artefacts/ProjectPlan/AEGIS_PROJECT_PLAN_FINAL.md` §6 | This engagement | Five-seat delivery model (FDE1–FDE5), already used as the "Team / owner" field across every numbered artefact | Real, already-adopted convention — this charter names it explicitly for the first time rather than assuming it |
| E-003 | `case/STAKEHOLDER_PACK.md` | Package | 15 stakeholders with declared conflicting incentives that the team, not any one seat, is accountable for reconciling | Immutable |
| E-004 | `requirements/ASSESSMENT_RUBRIC.csv` | Package | 17 criteria, 180 points — the shared scoring target every seat is accountable to | Immutable |
| E-005 | `run_capstone.sh` / `run_capstone.py --check` | Package | Preflight (`verify_package.py`, `baseline_diagnostics.py`, scaffold check) — run at kickoff and documented as the companion Stage-0 exit item to this charter | Reproducible: `python3 run_capstone.py --check` |

## 1. Why this team exists and what it owns

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the team accountable for? | **FACT**: a defensible intervention across the three mandated workflows (batch evidence reconciliation, PV intake/signal support, supply/cold-chain option planning), never the prohibited terminal action in any of them — `case/INTEGRATED_CASE.md` §4 | Whole team | `01_BUSINESS_CASE.md`; `DEFINITION_OF_DONE.md` |
| Who is *not* on the hook? | **FACT**: no participant designs a golden architecture — there is no reference solution or answer key (`README.md`); disagreement among stakeholders is expected and must be reconciled, not resolved away | Whole team | `case/STAKEHOLDER_PACK.md` |

## 2. Seats and decision rights

| Seat | Primary accountability | Review authority over |
|---|---|---|
| FDE1 — Product/Value Lead | Business case, value hypothesis, scope, TOM, roadmap | Any claim about board target, no-AI baseline, or benefits realisation |
| FDE2 — Domain/Evidence Lead | Bounded contexts, evidence lineage, requirements traceability, data governance | Any claim about source authority, effective time, or evidence completeness |
| FDE3 — Architecture/Build Lead | C4, ADRs, integration contracts, working code | Any architecture or implementation decision |
| FDE4 — GxP/Quality Lead | Lifecycle validation, CSA, QRM, batch-disposition boundary | Any claim touching GxP boundaries, release gates, or Workflow A prohibited action |
| FDE5 — Security/Eval Lead | Threat/abuse model, privacy, evaluation harness, security controls | Any claim touching security posture, prompt-injection resistance, or the evaluation scorecard |

**DECISION**: seats carry primary accountability, not sole authorship — every numbered artefact already names a co-owner or reviewer seat, consistent with this table (e.g. `03_STAKEHOLDER_DECISION_RIGHTS.md`: FDE2 primary, FDE4 co-owner). Cross-cutting claims (e.g. Workflow B's zero-outage continuity constraint) are explicitly routed to the seat with domain authority, not the artefact's nominal owner, per `01_BUSINESS_CASE.md` §"Is the problem the same across all three workflows?".

## 3. Shared definition of done

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What does "done" mean for any artefact? | **DECISION**: every material requirement traces to a test and evidence artefact; every claim is labeled FACT/INTERPRETATION/ASSUMPTION/DECISION/ABSTAIN; nothing regulated is fabricated, overwritten, or silently normalized | Whole team | `DEFINITION_OF_DONE.md`; `CLAUDE.md` guardrails |
| What overrides individual seat judgement? | **FACT**: the guardrails in `CLAUDE.md` (never implement the prohibited terminal actions; deny-by-default on stale/ambiguous state) — no seat, including FDE1 (Product), can waive these for scope or schedule pressure | Whole team | `CLAUDE.md` |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Assumption | Individual participant names behind FDE1–FDE5 are not disclosed in this charter (single-participant capstone delivery represented as a 5-seat model for traceability) — consistent with `01_BUSINESS_CASE.md`'s "names TBD at kickoff" note | None for grading — seat accountability is what's scored, not headcount | Whole team | N/A | Accepted, non-blocker |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| Stage 0 exit evidence (team charter) exists | `WORKSHOP_DEPLOYMENT_PLAN.md` Stage 0 row | Manual inspection | This document | Done |
| Seat model matches what every other artefact already assumes | Cross-check against `01_BUSINESS_CASE.md`–`30_ELEVATOR_PITCH.md` "Team / owner" fields | Manual grep for `FDE[1-5]` across `submission/artefacts/*.md` | This document §2 | Confirmed — no contradiction found |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| Self-review | Whole team | Charter written after the fact (post-build) rather than literally at Stage 0 kickoff, since it was a flagged gap found during peer audit, not a pre-planned artefact | Accepted — content is accurate to how the team seats were actually used throughout; backdating the artefact would misrepresent when it was authored, so it is dated to when it was written | 2026-08-11 |
