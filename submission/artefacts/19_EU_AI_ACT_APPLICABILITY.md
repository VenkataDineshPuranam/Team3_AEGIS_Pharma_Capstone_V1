# EU AI Act Applicability

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

**Hard rule (per `.claude/skills/trust-risk-security.md`)**: this artefact is awareness-level delivery analysis, not a legal classification. It does not certify, self-classify definitively, or substitute for Legal/Regulatory Affairs sign-off — it names the questions those functions must answer and states the engagement's provisional working assumption.

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE4 (GxP/Quality/ISO/Assurance Lead) |
| Version / date | v0.1 — 2026-08-10 |
| Reviewers | FDE5, FDE1 |
| Status | Draft |
| Related requirements / ADRs | `case/REGULATORY_BOUNDARY_PACK.md` line 15; `01_BUSINESS_CASE.md` §5 (prohibited actions) |

## Purpose

Works through the EU AI Act's own boundary questions (intended purpose, actor role, risk tier) against AEGIS-PHARMA's actual scope, to produce a defensible provisional working assumption and an explicit escalation list for Legal/Regulatory Affairs. Accountable owner: FDE4.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `case/REGULATORY_BOUNDARY_PACK.md` | Package, "research anchors, not legal conclusions" | Line 15: GDPR/EU AI Act analysis required "where the intended use falls within scope"; line 3: "Participants must determine applicability" | Explicitly non-binding by the package's own framing |
| E-002 | `01_BUSINESS_CASE.md` §5 | This engagement | The three workflows' scope and prohibited-action boundary (never disposition/final PV decision/allocate-ship-recall) | — |
| E-003 | `04-ddd/gen_ai_boundaries.md` | This engagement | Only 2 of 7+ bounded contexts have any AI-agent edge; both are read-only, human-reviewed | — |
| E-004 | `.claude/skills/trust-risk-security.md` | Portable delivery-design skill | "Awareness only... know whether the use case looks like prohibited/high-risk Annex III-style/GPAI/lower risk, then escalate to legal/compliance" | Not a legal source; internal delivery discipline only |

## 1. Intended purpose and actor role

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the system's intended purpose? | **FACT**: decision-support only, across three GxP/PV/supply advisory workflows, explicitly barred from the terminal action in each (`CLAUDE.md` "What this repository is") | FDE4 | `CLAUDE.md`; `01_BUSINESS_CASE.md` §5 |
| What actor role would NovaCura (the fictional deploying org) hold? | **INTERPRETATION**: on the facts as scoped, NovaCura is building and using this system in-house for its own regulated operations — this looks like a **deployer** role, and plausibly also a **provider** role if NovaCura authors the system itself rather than procuring it (the package does not specify a third-party AI vendor for the summarization/scoring agents, only a generic "AI Model Endpoint") | FDE4 | `06-c4/c4_context.md` (Model Endpoint drawn as external/optional, vendor unspecified) |
| Is the actor-role question resolved? | **DECISION**: no — flagged for Legal escalation (R-001), since provider vs deployer obligations differ materially under the Act and the package deliberately leaves the model-vendor relationship unspecified | FDE1/FDE4 | §Risks below |

## 2. System and component boundary

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is "the AI system" for classification purposes? | **DECISION**: the two optional agents specifically (Evidence Summarizer, Duplicate-Similarity Scorer) — not the deterministic rules/lookup components, which are conventional software, not an "AI system" under the Act's definition (no machine learning/inference involved) | FDE3/FDE4 | `04-ddd/gen_ai_boundaries.md` §1 ("rules vs AI" split) |
| Does the deterministic majority reduce classification risk? | **INTERPRETATION**: it reduces the *surface area* subject to classification (most of the system is plain code with no Article 6 exposure at all), but does not change the classification analysis for the two components that remain genuinely AI — a system cannot "average down" its risk tier by being mostly non-AI | FDE4 | `06-c4/c4_components.md` (Model Endpoint edge on exactly 2 components) |
| Is Supply Governance (Workflow C) in scope for this analysis? | **FACT**: no AI-agent edge exists for Workflow C at all (`06-c4/c4_containers.md` §"Gen AI runtime sketch" — "Supply has no agent candidate at this stage") — this artefact's classification analysis applies only to Workflows A and B | FDE4 | `06-c4/c4_containers.md` |

## 3. Risk classification analysis

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Is this "prohibited" under the Act? | **INTERPRETATION**: no plausible reading — the system does not perform social scoring, manipulation, biometric categorization, or any of the Article 5 prohibited-practice patterns | FDE4 | — |
| Is this "high-risk Annex III-style"? | **INTERPRETATION**: this is the genuinely open question, not resolvable at awareness level. Arguments for: the PV agent's output (duplicate-similarity scoring on adverse-event cases) touches patient-safety-relevant signal detection, and Annex III's health/safety-adjacent categories are exactly the kind of use EU regulators have flagged for scrutiny even when a human retains final authority. Arguments against: `decision_rights.csv` confirms `ai_authority: none` for both batch certification and ICSR reportability — human oversight is not a bolt-on but the system's entire design premise, which is itself one of the Act's *required mitigations* for high-risk systems (Article 14), not a reason the classification doesn't apply | FDE4/FDE1 | `data/decision_rights.csv`; Article 14-style human-oversight framing (awareness only) |
| What is the engagement's provisional working assumption? | **DECISION**: treat Workflows A and B's AI-agent components as **high-risk-adjacent, pending Legal confirmation** — i.e. build and document as if Annex III-style obligations (risk management, data governance, technical documentation, human oversight, logging, transparency) apply, rather than assume they do not. This is the conservative default per `.claude/skills/trust-risk-security.md` ("escalate to legal/compliance owners... do not self-classify silently") | FDE1/FDE4 | This document §5 |

## 4. Prohibited/high-risk/transparency considerations

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Does the architecture already satisfy high-risk-style obligations, if they apply? | **FACT**, cross-checked against the provisional assumption in §3: risk management → `15_QUALITY_RISK_MANAGEMENT.md`; data governance → `06_DATA_GOVERNANCE_INTEGRITY.md`; technical documentation → this artefact series (10-21) plus `07-adr/adrs.md`; human oversight → INV-01/05/06 + `03_STAKEHOLDER_DECISION_RIGHTS.md`; logging → Audit Store (ADR-005); transparency to the human reviewer → `18_RESPONSIBLE_AI_HUMAN_FACTORS.md` §1-3 | FDE4 | Cross-references as listed |
| What transparency obligation is still open? | **DECISION**: end-users (EU QP, Safety Physician) must be told they are interacting with an AI-assisted system and which specific fields are AI-drafted vs sourced-evidence — `18_RESPONSIBLE_AI_HUMAN_FACTORS.md` §1's inline accountable-owner labeling partially covers this, but an explicit "AI-drafted" badge is not yet a named UI requirement; flagged R-002 | FDE1 | §Risks below |
| Does GDPR interact here? | **FACT**: yes, materially — `17_PRIVACY_ETHICS.md` already covers the GDPR-adjacent personal-data questions (consent, cross-border, retention/erasure); this artefact does not duplicate that analysis, only cross-references it, since EU AI Act and GDPR obligations are legally distinct but operationally overlapping for any system processing PV case data | FDE4/FDE5 | `17_PRIVACY_ETHICS.md` |

## 5. Provider/deployer obligations

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What obligations follow if NovaCura is a provider? | **INTERPRETATION**: conformity assessment, technical documentation, quality management system, registration — heavier obligations, closer to (and in practice likely overlapping with) NovaCura's existing GxP quality system per `13_GXP_LIFECYCLE_VALIDATION.md`/`14_COMPUTER_SOFTWARE_ASSURANCE.md` | FDE4 | `13_GXP_LIFECYCLE_VALIDATION.md` |
| What obligations follow if NovaCura is only a deployer? | **INTERPRETATION**: lighter but still real — human oversight assignment, input-data relevance monitoring, incident reporting, use within intended purpose. All of these are already designed into this engagement regardless of which role applies (§4), meaning the deployer-only obligations are already satisfied by design; the provider-only obligations (conformity assessment, registration) are not, and are the ones needing legal escalation | FDE4/FDE1 | §4 above |
| Is this artefact recommending which role applies? | **DECISION**: no — it is deliberately not resolved here; the engagement proceeds on the conservative assumption (§3) that covers both roles' human-oversight/documentation obligations, while flagging the provider-specific obligations (conformity assessment, registration) as unresolved and requiring Legal, not this team, to close | FDE1/FDE4 | §Risks R-001 |

## 6. Evidence and assumptions

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What does this analysis rest on that is fact vs assumption? | **FACT** basis: the workflows' advisory-only scope (`01_BUSINESS_CASE.md`), the human-oversight design (`decision_rights.csv`, INV-01/05/06), the two-agent AI boundary (`gen_ai_boundaries.md`). **ASSUMPTION** basis: that "NovaCura Therapeutics" (fictional) would in reality be subject to EU AI Act territorial scope at all — the package does not state where the system is deployed/marketed, only that EU regulatory anchors (EMA, EU GMP, ICH) are relevant reference points alongside FDA/CDSCO | FDE4 | `case/REGULATORY_BOUNDARY_PACK.md` |
| Is the territorial-scope assumption safe? | **DECISION**: yes for engagement purposes — `REGULATORY_BOUNDARY_PACK.md` explicitly lists EU GMP/EMA/GDPR/EU AI Act as anchors to consider, and `LOCAL_WORK_INSTRUCTION_DE.md` (K-016, jurisdiction `DE`) plus multiple German PV cases (`icsr_cases.csv`) confirm real EU-jurisdiction operations exist in this scenario, so applying EU AI Act awareness-level analysis is proportionate even without a definitive territorial-scope legal finding | FDE4 | `data/icsr_cases.csv`; `knowledge/LOCAL_WORK_INSTRUCTION_DE.md` |

## 7. Change triggers

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What re-triggers this analysis? | **DECISION**: (a) Legal/Regulatory Affairs issuing an actual classification (supersedes §3's provisional assumption entirely); (b) any new AI-agent component added beyond the current 2 (`gen_ai_boundaries.md` §3's agent-count limit, already a Phase 3 watch item carried into this artefact); (c) any change to the human-oversight design (`decision_rights.csv`) that reduces the "never a disposition" guarantee; (d) EU AI Act phased-applicability dates (2025-2028) reaching a milestone relevant to this system's component classes | FDE1/FDE4 | `04-ddd/gen_ai_boundaries.md` §3; `.claude/skills/trust-risk-security.md` |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Gap | Provider vs deployer role is not resolved (§1, §5) — the package does not specify the model-vendor relationship | Conformity-assessment/registration obligations cannot be scoped until this is answered by Legal | FDE1/FDE4 | Before any real Track B production claim | Open — explicitly a Legal escalation, not a team decision |
| R-002 | Gap | No named "AI-drafted content" transparency UI requirement yet (§4) | Could fall short of Article 13-style transparency obligations if the provisional high-risk-adjacent assumption is confirmed | FDE1 | P5 build (`submission/app`) | Open |
| R-003 | Assumption | Territorial scope (EU AI Act applies at all) is inferred from EU-jurisdiction evidence in the case, not a stated fact | If wrong, this entire artefact's provisional assumption is over-conservative (not unsafe, but possibly disproportionate effort) | FDE4 | Legal confirmation | Open, low-risk direction (erring conservative) |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| Classification analysis follows the package's own boundary questions, not an invented framework | §1–§5 | Cross-check against `case/REGULATORY_BOUNDARY_PACK.md` | This document | Done |
| No definitive legal classification is asserted | Throughout | Reviewed at G4 | This document (Document control "Hard rule") | Done |
| Human-oversight obligations (if high-risk applies) are already satisfied by existing architecture | §4 | Cross-check against INV-01/05/06, ADR-005 | `04-ddd/domain_model.md`; `11_ADR_REGISTER.md` | Done |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| — | FDE5/FDE1 (pending) | Not yet reviewed | — | — |
