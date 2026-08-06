# Stakeholder and Decision Rights

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice · ABSTAIN = unresolved until evidence/as-of/auth present.

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE2 (Domain/Evidence Lead) primary, FDE4 (GxP/Quality Lead) co-owner |
| Version / date | v0.1 — 2026-08-06 |
| Reviewers | FDE1, FDE4 |
| Status | Draft |
| Related requirements / ADRs | `requirements/ASSESSMENT_RUBRIC.csv` RUB-01…03; feeds artefact 16 (Threat & Abuse Model) escalation design |

## Purpose

Establishes who has mandate, incentive, concern and decision authority over the three workflows, and how conflicts between stakeholders are surfaced and escalated rather than silently resolved by the system. Scope: all 15 stakeholders named in the case, mapped to the three workflows and to the delivery team's own seats. Accountable owner: FDE2, with FDE4 holding veto on any RACI entry that would give AI authority over a GxP-accountable decision. Complete when every stakeholder has a decision-authority statement, every named conflict has an owner, and escalation paths are explicit.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `case/STAKEHOLDER_PACK.md` | Case evidence pack, current | 15 stakeholders with mandate/incentive/concern/decision-authority; 5 named deliberate conflicts | Synthetic, but explicit and complete for the 15 listed roles |
| E-002 | `data/decision_rights.csv` | Current, per-decision | 3 decisions with accountable role and explicit `ai_authority` value | Only 3 decisions enumerated; workflow C decisions beyond "stock allocation" not itemized |
| E-003 | `data/stakeholders.csv` | Current | 3 stakeholder IDs with region and priority (EU QP=evidence completeness; Manufacturing VP=supply continuity; Global Safety Head=reporting timeliness) | Smaller/structured subset of the fuller `STAKEHOLDER_PACK.md` narrative table |
| E-004 | `submission/artefacts/ProjectPlan/AEGIS_PROJECT_PLAN_FINAL.md` §6 | This engagement's plan, 2026-08-04 | Team seat model (FDE1–FDE5), RACI per workflow, stakeholder-to-seat mapping | Plan-level decision, not case evidence — marked DECISION below |

## 1. Stakeholder map

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Who are the stakeholders and what do they hold? | **FACT** — full 15-row table from `case/STAKEHOLDER_PACK.md`, reproduced here for traceability: | | |

| Stakeholder | Mandate | Incentive | Concern | Decision authority |
|---|---|---|---|---|
| Chief Medical Officer | Benefit-risk and clinical strategy | Protect participants and product value | AI overreach into medical judgement | Clinical governance and escalation |
| Chief Quality Officer | Pharmaceutical quality system | Inspection readiness and product quality | Loss of independent Quality authority | Quality-system policy and risk acceptance |
| EU Qualified Person | EU batch certification | Complete, reliable release evidence | Missing CMO and audit commitments | **Final certification remains human-only** |
| Global Head of Pharmacovigilance | Safety-system performance | Timely, complete, consistent case handling | Duplicate, multilingual, clock errors | **Final safety decisions remain human-only** |
| Head of Clinical Operations | Trial delivery | Recruitment, clean data, DB lock | Site burden, protocol divergence | Operational trial decisions within protocol |
| Regulatory Affairs VP | Global registrations | Accurate, timely submissions | Label/IDMP inconsistencies | Submission strategy, authority interactions |
| Manufacturing VP | Reliable supply | Throughput, schedule adherence | Excessive holds, manual review | Operations, **never** independent batch release |
| Supply Chain VP | Service continuity | Avoid shortages | Quality status, allocation constraints | Planning; regulated execution needs approvals |
| Data Protection Officer | Lawful data processing | Minimise legal/trust risk | Secondary use, re-identification | Privacy risk acceptance, escalation |
| CISO | Cyber and resilience | Containment, recoverability | Tool poisoning, supply-chain compromise | Security controls, incident response |
| Head of Biostatistics | Trial inference integrity | Prespecified, reproducible analysis | Adaptive AI changing analysis populations | Statistical methodology, validation |
| Patient Safety Representative | Patient/participant voice | Transparency, contestability | Inaccessible interfaces, hidden errors | Advisory veto via safety governance |
| Site Investigator Council | Site feasibility | Reduce documentation burden | Central automation ignoring local facts | Source-data and clinical confirmation |
| Works Council / Employee Forum | Workforce rights | Fair monitoring, role clarity | Performance surveillance via AI telemetry | Consultation rights, applicable regions |
| Procurement | Commercial assurance | Sustainable vendor terms | Concentration, weak exit rights | Contracting with business/control owners |

## 2. RACI/RAPID decision matrix

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Who is Accountable/Responsible per workflow? | **FACT** (`data/decision_rights.csv`): Batch certification — Accountable: **EU Qualified Person**, `ai_authority=none`. ICSR reportability — Accountable: **Safety Physician**, `ai_authority=none`. Stock allocation — Accountable: **Supply Governance Board**, `ai_authority=draft only` | FDE4 confirms no entry ever assigns AI as Accountable | E-002 |
| Who builds and reviews each workflow (delivery-team RACI)? | **DECISION** (plan §6.4): Workflow A — Domain FDE4, Builder FDE3, Security FDE5, Sign-off FDE4. Workflow B — Domain FDE2, Builder FDE3, Security FDE5, Sign-off **FDE2+FDE4**. Workflow C — Domain FDE1, Builder FDE3, Security FDE5, Sign-off **FDE1+FDE4**. Shared authZ/contracts/evidence-resolver — Builder FDE3, Security FDE5, Sign-off FDE5+FDE4 | Team, ratified at kickoff | E-004 |
| How do case stakeholders map to delivery-team seats? | **DECISION** (plan §6.3): EU QP/CQO → FDE4 (Workflow A boundary); Global Head of PV → FDE2+FDE4 dual (Workflow B boundary); Supply Chain VP → FDE1 (Workflow C boundary); Manufacturing VP → reinforces A (operations ≠ independent release); DPO/CISO → FDE5; Head of Biostatistics → FDE3 (no adaptive undeclared transforms); Patient Safety Representative → adversarial pre-defence roleplay | Team | E-004 |

## 3. Incentive conflicts

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What conflicts are named in evidence (not invented)? | **FACT** — 5 deliberate conflicts, `case/STAKEHOLDER_PACK.md`: (1) Quality vs. Manufacturing on whether speed or evidence completeness binds; (2) global standardization vs. local jurisdictional variance; (3) privacy minimization vs. Legal/GxP defensible preservation; (4) Procurement's bundled-vendor preference vs. Architecture/CISO substitutability; (5) Clinical Operations automation appetite vs. Biostatistics/investigator need for prespecified, explainable transformations | — | E-001 |
| Who owns resolving (not eliminating) each conflict? | **DECISION** (plan §6.3, "Five declared conflicts — owners"): (1) → FDE4 (feeds artefacts 02, 15); (2) → FDE1 (artefact 26); (3) → FDE5 (artefact 17; ties to INJ-035 retention conflict); (4) → FDE3+FDE5 (artefacts 11, 27); (5) → FDE3 (build constraints) | Team | E-004 |
| Does the system resolve these conflicts, or surface them? | **DECISION**: the system surfaces contradictions and abstains; it never silently resolves a stakeholder conflict on the system's own authority — consistent with the case's "deliberate ambiguity" clause (`PACKAGE_SCOPE_AND_ASSUMPTIONS.md`) | FDE4/FDE5 | `PACKAGE_SCOPE_AND_ASSUMPTIONS.md` §"Deliberate ambiguity" |

## 4. Independent review and segregation of duties

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Is the artefact author also its sole approver? | **DECISION** (plan §6.1): no — "Author ≠ sole approver. FDE4 + FDE5 may veto go-live/defence on hard-gate failure" | Team | E-004 |
| What is the review pairing per work type? | **DECISION** (plan §6.2): Problem/value/pitch/roadmap/Workflow C → primary FDE1, must-review FDE4 or FDE5. Evidence/DDD/data/ontology/Workflow B → primary FDE2, must-review FDE3 or FDE4. Code/C4/ADR/contracts/app/scripts → primary FDE3, must-review FDE5 (+FDE4 if GxP claim). GxP/QRM/ISO/assurance/Workflow A → primary FDE4, must-review FDE5 or FDE1. Threat/privacy/TEVV/FinOps/observability → primary FDE5, must-review FDE4 or FDE3 | Team | E-004 |
| Does any single role combine build and safety sign-off for a GxP-relevant workflow? | **FACT check**: no — Workflow A build is FDE3, sign-off is FDE4 (separate individuals by seat design) | FDE4 | E-004 |

## 5. Escalation and override

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What triggers escalation? | **FACT**: any workflow output approaching a prohibited action boundary (`data/ai_use_boundaries.csv`); any unresolved identity/unit/time/authority conflict presented as resolved (governing plan §3.4 ABSTAIN trigger) | FDE4/FDE5 | `data/ai_use_boundaries.csv`; plan §3.4 |
| Who has override/veto authority? | **FACT/DECISION**: EU QP and Safety Physician retain final human-only authority by case design (E-001); within the delivery team, FDE4+FDE5 hold veto over go-live/defence on hard-gate failure (E-004) | — | E-001, E-004 |
| What is the gate-failure escalation process? | **DECISION** (plan §17): gate failure >1 hour triggers full-team MoSCoW decision and a manifest gap entry — no silent slip | Team | Plan §17 |

## 6. Training and adoption

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What adoption risk is already named in evidence? | **FACT**: automation bias — reviewers accept an AI summary despite an omitted critical deviation (INJ-071, `candidate_outputs.csv; reviewer_feedback.csv`); language inequity — Arabic/Hindi safety-narrative extraction quality lower than English/German (INJ-072); accessibility failure — keyboard/colour-only warning gaps (INJ-073) | FDE1 (artefact 26 TOM), FDE4/FDE1 (artefact 28 accessibility smoke) | `case/INTEGRATED_CASE.md` D11 injects |
| Who owns training/change-management design? | **ABSTAIN** — not yet decided; deferred to artefact 26 (Target Operating Model) | FDE1 | Backlog |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Gap | Team seat names not yet filled (only role labels FDE1–FDE5 exist) | RACI is structurally complete but not operationally assigned | Team | Kickoff | Open |
| R-002 | Risk | Automation bias (INJ-071) is a named risk with no mitigation design yet | Reviewers could over-trust AI-assisted evidence summaries | FDE1/FDE4 | Before artefact 18 (Responsible AI/Human Factors) | Open |
| R-003 | Assumption | Stakeholder-to-seat mapping (§2) assumes one delivery-team seat can adequately represent multiple real-world stakeholder concerns (e.g., FDE4 covering both CQO and EU QP concerns) | Could under-represent a stakeholder's specific concern in design reviews | FDE1 | Review at G1 | Open |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| No RACI entry assigns AI as Accountable for a regulated decision | `data/decision_rights.csv` cross-check | Contract schema `authorization{decision}` field never `"ai"` | `evaluation/contracts/*.schema.json` | Pending — contracts not yet drafted |
| Five named conflicts each have an owner | §3 above | Reviewed at G1 | This document §3 | Done |
| Author ≠ sole approver enforced | §4 above | Review-pairing table applied to every artefact | Plan §6.2 | Pending — enforcement starts at first artefact review cycle |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| — | FDE1/FDE4 (pending) | Not yet reviewed | — | — |
