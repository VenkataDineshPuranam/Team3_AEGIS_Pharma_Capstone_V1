# Computer Software Assurance

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

CSA principle applied throughout: critical thinking and risk-based testing depth, not maximal scripted testing of every path regardless of risk.

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE4 (GxP/Quality Lead) primary, FDE5 (Security/Eval) co-owner |
| Version / date | v0.1 — 2026-08-08 |
| Reviewers | FDE3, FDE1 |
| Status | Draft |
| Related requirements / ADRs | ADR-004, ADR-009; `requirements/ASSESSMENT_RUBRIC.csv` RUB-09 |

## Purpose

Applies risk-based Computer Software Assurance to determine where rigorous scripted testing is warranted versus where lighter, unscripted critical-thinking-based verification suffices. Scope: the three workflows' invariants/policies and supporting containers. Accountable owner: FDE4, with FDE5 owning the adversarial/negative-test depth.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `data/audit_findings.csv` | Current | AF-1 (shared accounts/missing originals), AF-2 (unclear validated state/vendor change controls) — real, already-open findings | Governs §2 high-risk-function identification |
| E-002 | `04-ddd/domain_model.md` §4 | This engagement | 10 invariants, 6 policies — the risk basis for test depth allocation | — |
| E-003 | `evaluation/contract_samples/` | Package, immutable | 3 positive + 3 negative samples already exist and pass | Governs §4 |

## 1. Critical thinking and risk basis

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What determines testing depth per function? | **DECISION**: depth is proportional to GxP/safety consequence of failure — INV-01/06 (prohibited-action boundaries) get the deepest, most adversarial testing; ADR-002/ADR-008 (identity-resolution timing, deployment topology) get design review and lighter functional testing, since their failure mode is a quality/cost issue, not a prohibited-action risk | FDE4 | E-002 |
| Is this consistent with existing package findings? | **FACT**: yes — `audit_findings.csv` AF-2 ("unclear validated state and vendor change controls") is exactly the kind of ambiguity risk-based CSA is designed to close by being explicit about classification (artefact 13 §2) rather than leaving it contested | FDE4 | E-001 |

## 2. High-risk functions

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Which functions are highest risk? | **DECISION**, ranked: (1) prohibited-action boundary enforcement (INV-01, INV-06, INV-07 — direct GxP/regulatory consequence if violated); (2) authorization/authentication (POL-01 — INJ-067 already-occurred incident); (3) knowledge-document trust gating (POL-02/INV-09 — INJ-065 already-occurred incident); (4) identity resolution (INV-10 — wrong-product risk) | FDE4/FDE5 | `04-ddd/domain_model.md` §4 |
| Which functions are lower risk? | **DECISION**: deployment topology (ADR-008), health-check cadence (ADR-009) — failure here degrades availability/observability, not GxP correctness directly | FDE4 | ADR register |

## 3. Assurance methods

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What method applies to high-risk functions? | **DECISION**: scripted, adversarial negative testing — e.g. the INJ-067 stale-authorization scenario must be reproduced exactly and confirmed to deny, not just reviewed by inspection | FDE5 | ADR-006 Validation field |
| What method applies to lower-risk functions? | **DECISION**: unscripted, exploratory critical-thinking review — e.g. deployment topology is validated by the clean-room procedure (governing plan §18) running successfully twice, not a scripted test suite | FDE4 | `AEGIS_PROJECT_PLAN_FINAL.md` §18 |

## 4. Unscripted and scripted evidence

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What scripted evidence already exists? | **FACT**: the package's own 6 contract samples (3 positive, 3 negative) already constitute scripted assurance evidence for the response-contract shape, confirmed PASS by `tools/test_contracts.py` this session | FDE5 | E-003 |
| What is still needed? | **DECISION**: scripted negative tests for each of the 10 invariants/6 policies specifically (not just the generic contract shape) — e.g. a dedicated INV-07 test with quarantined stock in the input data, confirming it never appears in `SupplyOptionSet` output | FDE5 | Backlog → Prompt 09/11 (build) |

## 5. Defect handling

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| How will defects be classified once found? | **DECISION**, by risk tier: a defect violating a hard-gate invariant (INV-01/06/07) is a **Blocker** (per governing plan's MoSCoW "Must" tier); a defect in a lower-risk function is a standard Risk/Assumption/Gap entry, tracked but not release-blocking | FDE4 | `AEGIS_PROJECT_PLAN_FINAL.md` §16 MoSCoW |
| Is there a real precedent for defect handling in this domain? | **FACT**: yes — `deviations.csv`/`capa_records.csv` show a real precedent (INJ-033: a deviation reappeared after CAPA closure under a different taxonomy code) — this system's own defect tracking must avoid the same failure (closing a defect without confirming the taxonomy/root-cause match) | FDE4 | `data/deviations.csv`, `capa_records.csv`; INJ-033 |

## 6. Release decision evidence

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What evidence is required before a release decision (not a GxP release — a software release)? | **DECISION**: all hard-gate invariant tests passing (Blocker-tier), `tools/check_submission_structure.py --final` PASS, `tools/test_contracts.py` PASS, and clean-room reproduction — mirrors the governing plan's own G7/G8 gate requirements | FDE4/FDE3 | `AEGIS_PROJECT_PLAN_FINAL.md` §4.2, §19 |
| Who signs off? | **FACT/DECISION**: FDE4 (GxP) + FDE5 (Security) jointly — neither alone, per the plan's "Author ≠ sole approver" rule | FDE1 | `03_STAKEHOLDER_DECISION_RIGHTS.md` §4 |

## 7. Continuous assurance

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| How is assurance maintained after initial release? | **DECISION**: every ADR revisit trigger (artefact 11 §7) is itself a continuous-assurance checkpoint — a trigger firing requires re-running the relevant scripted tests, not just a documentation update | FDE4 | `11_ADR_REGISTER.md` §7 |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Gap | Dedicated per-invariant scripted tests (§4) do not exist yet — only the generic contract-shape tests exist | Cannot claim full CSA closure until Prompt 09/11 build | FDE5 | Prompt 11 | Open — expected |
| R-002 | Risk | Risk-tiering (§2) is a team judgement call, not independently validated by an external reviewer yet | Could be second-guessed at defence if not well justified | FDE4 | G8 defence prep | Open |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| Testing depth is risk-proportionate, not uniform | §§1–2 | Reviewed at G3 | This document | Done |
| Hard-gate invariants get scripted adversarial tests | §§3–4 | Contract tests (generic level) already PASS; per-invariant tests pending | `evaluation/contract_samples/` | Partial |
| Defect handling avoids the known CAPA-taxonomy-mismatch failure mode | §5 | Manual review | `data/deviations.csv` cross-check | Done — pattern identified |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| — | FDE3/FDE1 (pending) | Not yet reviewed | — | — |
