# Quality Risk Management

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

ICH Q9-style quality risk management applied to the AEGIS-PHARMA system itself (not to the underlying manufacturing/PV/supply processes it advises on).

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE4 (GxP/Quality Lead) |
| Version / date | v0.1 — 2026-08-08 |
| Reviewers | FDE5, FDE1 |
| Status | Draft |
| Related requirements / ADRs | `04-ddd/domain_model.md` INV-*/POL-*; `requirements/ASSESSMENT_RUBRIC.csv` RUB-09 |

## Purpose

Identifies hazards, failure chains, controls, and residual risk for the AEGIS-PHARMA system's own operation — distinct from artefact 16 (Threat & Abuse Model, which covers adversarial/security risk specifically). Scope: quality risks arising from the system's design and use, not from malicious actors. Accountable owner: FDE4.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `04-ddd/domain_model.md` §4 | This engagement | 10 invariants, 6 policies as the control basis | — |
| E-002 | `case/INTEGRATED_CASE.md` §7 | Package | 84 injects as the hazard source | — |
| E-003 | `data/candidate_outputs.csv`, `reviewer_feedback.csv` | Current | Real automation-bias incident (INJ-071) | Governs §2 top hazard |

## 1. Risk question and scope

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the risk question? | **DECISION**: "What could cause this advisory system to produce an unsafe, misleading, or boundary-violating output that a human then acts on?" — scoped to the system's own failure modes, not the underlying business risks it helps manage | FDE4 | — |

## 2. Hazard analysis

Top 5 hazards, each traced to a real inject (not hypothesized):

| Hazard ID | Hazard | Source inject | Severity (patient/product/regulatory impact) | Probability basis |
|---|---|---|---|---|
| HAZ-01 | System implies a disposition (release/reject/final PV/allocate) | INJ-006 (prohibited optimization) | Critical — direct GxP/patient-safety violation if acted on | Structurally prevented by contract (`execution_status: not_executed`) — residual probability is a schema/code defect, not a design gap |
| HAZ-02 | Reviewer over-trusts a system summary and misses a critical omitted fact | INJ-071 (automation bias — already occurred with a real omitted sterility excursion) | Critical — direct patient-safety consequence if the omission concerns a real safety issue | **Already observed once** in the evidence (`candidate_outputs.csv`/`reviewer_feedback.csv`) — not hypothetical |
| HAZ-03 | System cites a poisoned/untrusted document as if authoritative | INJ-065 | Critical — could induce a prohibited-action-adjacent recommendation | Poisoned document already exists in the estate (`knowledge_catalog.csv` K-998/999) |
| HAZ-04 | System resolves a product/substance identity ambiguity silently, citing the wrong product | INJ-045, INJ-008 | Critical — wrong-product safety/regulatory consequence | Ambiguity already declared in `idmp_mappings.csv` |
| HAZ-05 | System acts on stale authorization, serving a response to a de-entitled user | INJ-067 | High — access-control/confidentiality consequence | Already occurred (IAM revoked, gateway cache stale) |

## 3. Failure chains

One chain per top hazard (cause → propagation → effect):

| Hazard | Failure chain |
|---|---|
| HAZ-01 | Code defect bypasses schema validation → `readiness_state`-equivalent field is misused as a disposition → human reviewer, trusting the system, treats it as authorized → GxP violation |
| HAZ-02 | System correctly surfaces all evidence, but summary UI de-emphasizes a critical contradiction → reviewer's attention is on the summary, not the full evidence → critical fact missed → unsafe decision made on incomplete information |
| HAZ-03 | Retrieval layer has a gap in the status-check (e.g. a race condition between catalog update and citation) → untrusted document cited as if approved → its content (potentially adversarial) shapes the system's output → misleading recommendation reaches a human |
| HAZ-04 | Product & Substance ACL has an edge case not covered by its test suite → ambiguous mapping resolved to a default instead of flagged → wrong product's evidence cited in a response → human acts on evidence for the wrong product |
| HAZ-05 | Authorization Service has a latency/failure edge case → falls back to a cached or default-allow state instead of failing closed → de-entitled user receives a response they should not have access to |

## 4. Risk controls

| Hazard | Primary control | Control type |
|---|---|---|
| HAZ-01 | INV-01/INV-06 + schema `const`/`enum` constraints, tested at build AND runtime (ADR-004) | Preventive, structural |
| HAZ-02 | `04-ddd/gen_ai_boundaries.md` §3 agent stop condition ("any omitted material fact detected in review halts and flags") + UI design requiring contradiction/gap surfacing, not just a clean summary | Preventive, design |
| HAZ-03 | INV-09/POL-02 live status check (ADR-007) | Preventive, structural |
| HAZ-04 | INV-10 + Product & Substance ACL (ADR-002) — ambiguity surfaced, never defaulted | Preventive, structural |
| HAZ-05 | POL-01 + Authorization Service live IAM check, fail-closed on failure (ADR-006, ADR-009 health check) | Preventive + detective |

**Pattern**: every top hazard's primary control is preventive (built into the invariant/policy/contract design), with detective controls (health checks, audit trail) as a second layer — consistent with the "defence in depth" principle already visible in `AEGIS_PROJECT_PLAN_FINAL.md`'s guardrail language.

## 5. Residual risk and uncertainty

| Hazard | Residual risk after controls | Uncertainty |
|---|---|---|
| HAZ-01 | Low — would require simultaneous schema-validation bypass and human failure to notice; both are independently tested | Low — well-bounded by two independent layers |
| HAZ-02 | **Medium** — the control depends on UI design quality, which is not yet built or tested (`submission/app` = 0 files) | **High** — this is the least structurally-enforceable hazard; the DDD-stage choice of universal HITL (accepting Non-utilised-talent waste, `04-ddd/domain_model.md` §9) is directly a hedge against this hazard, not fully closing it |
| HAZ-03 | Low — status check is structural, but the race-condition edge case (catalog update vs. citation timing) is not yet stress-tested | Medium |
| HAZ-04 | Low — ACL design is sound, but its test coverage against the full space of possible ambiguity patterns is unproven (only the one known case, INJ-045, has been reasoned through) | Medium |
| HAZ-05 | Low — fail-closed design is explicit (ADR-006, ADR-009), residual risk is limited to an undiscovered edge case in the health-check logic itself | Low-Medium |

**Honest headline finding**: HAZ-02 (automation bias) is the hazard with the weakest structural control and the highest uncertainty — it is fundamentally a human-factors risk that code alone cannot fully close, which is exactly why it is flagged again in artefact 18 (Responsible AI/Human Factors), not considered resolved here.

## 6. Risk acceptance

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Which residual risks are accepted for Track A, and by whom? | **DECISION**: HAZ-01, 03, 04, 05 residual risk accepted at Low/Medium by FDE4, contingent on the pending per-invariant scripted tests (artefact 14 §4) actually being built and passing before G7. HAZ-02 is **not** fully accepted — it is carried forward as an open, actively-managed risk requiring UI-level mitigation (artefact 04 §4, artefact 18) before any Track B claim | FDE4, with FDE1/FDE5 co-sign | `14_COMPUTER_SOFTWARE_ASSURANCE.md` §6 |

## 7. Review triggers

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What re-triggers this risk analysis? | **DECISION**: (a) any of the 10 ADR revisit triggers firing; (b) any new inject or finding surfacing a hazard not in this top-5; (c) the automation-bias hazard (HAZ-02) specifically re-reviewed once `submission/app` exists and can be usability-tested, not just designed | FDE4 | `11_ADR_REGISTER.md` §7 |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Risk | HAZ-02 (automation bias) has the weakest structural control of the top 5 hazards | Could allow a real unsafe decision if UI design is inadequate | FDE1/FDE4 | Before `submission/app` build, and again after | Open |
| R-002 | Gap | Hazard analysis (§2) covers the top 5, not an exhaustive FMEA across all 84 injects | Lower-probability hazards not individually chained | FDE4 | Ongoing, as `04-ddd/inject_register_84.md` open items close | Open |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| Every top hazard has a primary preventive control | §4 | Cross-checked against ADR/invariant register | `04-ddd/domain_model.md` §4; `11_ADR_REGISTER.md` | Done |
| Residual risk is honestly stated, not minimized | §5 | Reviewed at G3 | This document | Done — HAZ-02 explicitly flagged as weakest |
| Risk acceptance has a named accountable owner | §6 | Reviewed at G3 | This document | Done |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| — | FDE5/FDE1 (pending) | Not yet reviewed | — | — |
