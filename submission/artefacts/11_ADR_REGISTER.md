# Architecture Decision Register

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

Full ADR detail: `submission/artefacts/07-adr/adrs.md`, `decision_index.md`, `architecture_review.md`.

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE3 (Architecture/Build Lead) |
| Version / date | v0.1 — 2026-08-08 |
| Reviewers | FDE4, FDE5 |
| Status | Draft — all ADRs `proposed` |
| Related requirements / ADRs | `requirements/ASSESSMENT_RUBRIC.csv` RUB-04,05,07 |

## Purpose

Records the decision memory behind the C4 map (artefact 10) and the architecture review that gates progress to Technical Design. Scope: 10 ADRs covering identity, evidence, authority, AI behavior, deployment and observability. Accountable owner: FDE3, with FDE4/FDE5 review authority.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `submission/artefacts/07-adr/adrs.md` | This engagement | 10 full ADRs | — |
| E-002 | `PACKAGE_SCOPE_AND_ASSUMPTIONS.md` | Package rule | Offline/no-hidden-services requirement (ADR-005, ADR-008) | — |
| E-003 | `data/inject_evidence_map.csv` INJ-067, INJ-065 | Current | Already-occurred incidents driving ADR-006, ADR-007 | — |

## 1. ADR index

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What are the 10 ADRs? | **DECISION**: ADR-001 Evidence-Resolver shared kernel; 002 Product identity resolve-per-request; 003 AI agents in-process; 004 Contract validation build+runtime; 005 Audit Store hash-chained file; 006 AuthZ live IAM check; 007 Knowledge Gateway live status check; 008 Single offline-capable process; 009 Explicit health/SLO checks; 010 Adopt package fixture pattern | FDE3 | `07-adr/adrs.md` |

## 2. Context and forces

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What forces are common across ADRs? | **FACT**: (a) the package's own offline/no-hidden-services constraint (ADR-005, 008); (b) already-occurred security incidents, not hypothetical risks (ADR-006, 007); (c) the governing plan's agent-freeze and Measure-first discipline (ADR-003, 009) | FDE3 | `07-adr/adrs.md` |

## 3. Options considered

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Was more than one option considered per ADR? | **FACT**: yes for all 10 — each has ≥1 rejected alternative with a stated reason (e.g. ADR-005 rejects an embedded DB; ADR-006 rejects a cached-with-webhook-invalidation approach) | FDE4 | `07-adr/adrs.md` |

## 4. Decision and rationale

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Are decisions evidence-grounded, not preference-driven? | **FACT**: yes — 4 ADRs are evidence-constrained by already-existing package artifacts (004, 010 by `evaluation/contracts`/`public_fixtures`; 005, 008 by `PACKAGE_SCOPE_AND_ASSUMPTIONS.md`), 2 by already-occurred incidents (006, 007), the remainder by DDD/C4 derivation | FDE3 | `07-adr/adrs.md` per-ADR "Evidence basis" field |

## 5. Consequences and risks

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the dominant risk pattern across ADRs? | **INTERPRETATION**: nearly every ADR trades a small performance/convenience cost for a security or integrity guarantee (live checks over caches, hash-chaining over a simpler log, per-request resolution over precompute) — consistent with Discovery's root-cause finding that control/process fragmentation, not model capability, is the dominant risk | FDE5 | `07-adr/adrs.md` "Consequences" fields |

## 6. Validation evidence

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| How will decisions be validated? | **DECISION**: 6 of 10 ADRs have a stated automated-test-style validation (`07-adr/dmaic_lens.md` §2 table); the other 4 are structural/deployment decisions validated by design review and the clean-room procedure | FDE5 | `07-adr/dmaic_lens.md` §2 |
| Has any validation already run? | **FACT**: yes — ADR-004 and ADR-010's validations are the package's own existing `tools/test_contracts.py` (PASS) and fixture-index cross-reference, already confirmed working before this artefact was written | FDE3 | `07-adr/adrs.md` ADR-004, ADR-010 |

## 7. Revisit triggers

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Does every proposed ADR have a revisit trigger? | **FACT**: yes, all 10 — required by `prompts/07_adrs.md` since status is `proposed` | FDE3 | `07-adr/adrs.md` |
| Which trigger is most consequential? | **DECISION**: ADR-008's explicit Track B trigger (single-process → distributed, if production-readiness NFRs demand independent scaling) — this is the one decision most likely to actually flip if Track B is pursued | FDE1/FDE3 | `07-adr/adrs.md` ADR-008 |

## Architecture review outcome

**Review status: `conditional`** (not `pass`, correctly, since C4/DDD remain `provisional`). Full defensibility checks, open issues, and go-forward conditions: `07-adr/architecture_review.md`. **Go-forward: proceed to Prompt 08 (Technical Design)** with 3 named conditions (agent-scope watch, Track B trigger tracking, prioritize the 19 open injects).

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Gap | All 10 ADRs are `proposed`, not `accepted` — no ADR has real-world validation yet since nothing is built | Architecture remains provisional through Prompt 08 | FDE3 | Prompt 09/11 (build) | Open — expected |
| R-002 | Risk | 2 optional AI agents remain the one architecture element without a hard FR requirement backing them | Could scope-creep if not actively watched | FDE1/FDE3 | Prompt 09 reconciliation | Open |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| Every ADR traces to a waste/root-cause finding | `07-adr/dmaic_lens.md` §4 | Manual cross-check | `07-adr/decision_index.md` | Done — all 10 verified |
| No ADR contradicts the package's own pre-built contracts | Cross-check against `evaluation/contracts/` | Manual schema comparison | `06-c4/waste_register_ai_specific.md` | Done — zero contradictions |
| Architecture review has a defensible, non-`pass` status given provisional inputs | `07-adr/architecture_review.md` | Reviewed at G3 | This document | Done |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| — | FDE4/FDE5 (pending) | Not yet reviewed | — | — |
