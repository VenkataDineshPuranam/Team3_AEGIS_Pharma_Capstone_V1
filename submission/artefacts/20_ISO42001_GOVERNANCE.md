# ISO/IEC 42001-Aligned Governance

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

Awareness-level AI Management System (AIMS) mapping per `.claude/skills/trust-risk-security.md` — organizational alignment, not a certification claim.

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE4 (GxP/Quality/ISO/Assurance Lead) |
| Version / date | v0.1 — 2026-08-10 |
| Reviewers | FDE5, FDE1 |
| Status | Draft |
| Related requirements / ADRs | `data/audit_findings.csv` AF-2; `knowledge/AI_MODEL_CHANGE_CONTROL.md` (K-005) |

## Purpose

Maps AEGIS-PHARMA's AI components, risk controls, lifecycle and supplier governance into an ISO/IEC 42001-aligned structure (inventory, risk classification, impact assessment, audit logs, incident response), closing the specific gap named in `audit_findings.csv` AF-2 ("unclear validated state and vendor change controls"). Accountable owner: FDE4.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `data/audit_findings.csv` AF-2 | Current, open finding | "AI governance: unclear validated state and vendor change controls" — the exact gap this artefact must close | Real, already-open finding, not hypothesized |
| E-002 | `data/model_registry.csv` | Current | 3 models: `TRN-OMICS-2` (research_unqualified), `GXP-SUM-1` (pilot), `PV-NER-4` (validated_scope_en_de) — different lifecycle states in one registry | Governs §2 AI inventory |
| E-003 | `data/vendor_dependencies.csv`, `data/vendor_contracts.csv` | Current | All 4 AI-adjacent capabilities (hosting, vector store, evaluation, observability) are single-vendor (`AIVENDOR-X`); exit clause is 120 days, data export is "prompts only" | Governs §5 supplier governance |
| E-004 | `knowledge/AI_MODEL_CHANGE_CONTROL.md` (K-005, approved) | NovaCura Global Policy, 2026-05-12 | Mandatory: version model/prompt/retrieval/schema/tool/evaluator/runtime; classify changes by risk; require regression evidence before controlled release | — |
| E-005 | `knowledge/AI_INCIDENT_RESPONSE.md` (K-004, approved) | NovaCura Global Policy, 2026-05-17 | Mandatory: contain, preserve evidence, assess rollback/notification/CAPA/revalidation | — |

## 1. AI policy and objectives

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Does an AI policy already exist in the estate? | **FACT**: yes — `knowledge/AI_GXP_BOUNDARY.md` (K-003, approved) is the closest existing artefact to an AI policy, already used as the grounding for INV-01/POL-03 (`04-ddd/domain_model.md`); K-001 (Agent Budget/Stop), K-002 (AI-Disabled Continuity), K-004 (Incident Response), K-005 (Model Change Control) and K-032 (Zero Trust) form the surrounding policy set | FDE4 | `knowledge/AI_GXP_BOUNDARY.md`; K-001/002/004/005/032 |
| What are this engagement's AI objectives? | **DECISION**: (1) never cross the prohibited-action boundary (all 3 workflows); (2) keep AI usage to the smallest defensible surface (2 optional agents, `gen_ai_boundaries.md` §3); (3) fail closed/degrade to a documented manual path rather than degrade silently (K-002) | FDE1/FDE4 | `04-ddd/gen_ai_boundaries.md` §3 |

## 2. Use-case inventory and ownership

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the AI inventory? | **FACT**: `data/model_registry.csv` lists 3 models, each at a different lifecycle stage: `TRN-OMICS-2` (portfolio ranking, `research_unqualified`), `GXP-SUM-1` (batch evidence summarisation, `pilot`), `PV-NER-4` (case entity extraction, `validated_scope_en_de`) | FDE4 | E-002 |
| Does AEGIS use all 3? | **INTERPRETATION**: `gen_ai_boundaries.md` §3 names exactly 2 agent candidates (Evidence Summarizer for Batch, Duplicate-Similarity Scorer for PV) — these map to `GXP-SUM-1` and (by function) a PV-scoring model; `TRN-OMICS-2` (`research_unqualified`, portfolio ranking) does not map to any of the three mandatory workflows and must **not** be used by AEGIS in its current lifecycle state | FDE3/FDE4 | `04-ddd/gen_ai_boundaries.md` §3 |
| Is ownership named per use case? | **DECISION**: `GXP-SUM-1` → FDE3 (build) + FDE4 (GxP validation, since it touches batch evidence); PV entity-extraction model → FDE3 + FDE4, with the language-scope gate from `18_RESPONSIBLE_AI_HUMAN_FACTORS.md` §4 as a standing condition of use | FDE3/FDE4 | `18_RESPONSIBLE_AI_HUMAN_FACTORS.md` §4 |

## 3. Risk and impact assessment

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Is a risk/impact assessment already done? | **FACT**: yes, by cross-reference rather than duplication — `15_QUALITY_RISK_MANAGEMENT.md` (system hazards), `16_THREAT_ABUSE_MODEL.md` (adversarial risk) and `19_EU_AI_ACT_APPLICABILITY.md` §3 (regulatory risk tier) together constitute the impact assessment ISO 42001 expects; this artefact does not repeat that analysis, it indexes it | FDE4 | `15_QUALITY_RISK_MANAGEMENT.md`; `16_THREAT_ABUSE_MODEL.md`; `19_EU_AI_ACT_APPLICABILITY.md` |
| What is the AF-2 finding, specifically? | **FACT**: `audit_findings.csv` `AF-2,AI governance,"unclear validated state and vendor change controls",open` — the registry (E-002) shows the validated-state ambiguity concretely: one model is `pilot`, not `validated`, and is still proposed for use (`GXP-SUM-1`) | FDE4 | E-001; E-002 |
| Does this artefact close AF-2? | **DECISION**: partially — §4 (Lifecycle controls) and §5 (Supplier governance) below give AF-2 a named control for the first time in this engagement; full closure requires `GXP-SUM-1` to reach a `validated` registry state before Track A production use, which is a P5/P7 build-and-validate action, not a documentation action this artefact can complete alone | FDE3/FDE4 | §4, §5 below |

## 4. Lifecycle controls

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What does K-005 require? | **FACT**: version every model/prompt/retrieval-corpus/schema/tool/evaluator/runtime dependency; classify changes by intended-use and risk impact; require regression evidence and approval before controlled release | FDE4 | E-004 |
| What is the control for `GXP-SUM-1`'s `pilot` state? | **DECISION**: a `pilot`-state model may be used only in a mode that cannot itself cause a prohibited action (already structurally guaranteed by INV-01/POL-03 regardless of model maturity) — but its output must be visibly labeled `pilot, not validated` to the reviewer (extends `18_RESPONSIBLE_AI_HUMAN_FACTORS.md` §1's accountable-owner labeling to include model lifecycle state) | FDE1/FDE4 | `18_RESPONSIBLE_AI_HUMAN_FACTORS.md` §1 |
| What does INJ-070 (artefact 16 §6) add here? | **FACT**: the deployed-hash-vs-registry-hash mismatch on `GXP-SUM-1` (`data/model_artifacts.csv`) is exactly the kind of gap K-005's "version every... runtime dependency" control exists to prevent — this artefact and artefact 16 describe the same control from governance vs security angles respectively, consistent with the split established in artefact 16's Purpose | FDE4/FDE5 | `16_THREAT_ABUSE_MODEL.md` §6 |
| What closes the loop end-to-end? | **DECISION**: no controlled release (pilot→validated transition) without regression evidence — this is the same evidence `submission/tests/test_model_supply_chain_integrity.py` (built this phase) specs as a hard gate | FDE3/FDE5 | `submission/tests/test_model_supply_chain_integrity.py` |

## 5. Supplier and data governance

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the vendor-concentration finding? | **FACT**: `data/vendor_dependencies.csv` — all 4 AI-adjacent capabilities (model hosting, vector store, evaluation, observability) sit with a single vendor, `AIVENDOR-X`; `data/vendor_contracts.csv` shows a 120-day exit window and "prompts only" data export (not full evidence/audit data) | FDE4/FDE5 | E-003 |
| Is this an AI-governance risk, not just a cost risk? | **INTERPRETATION**: yes — single-vendor concentration across hosting+evaluation+observability means the same vendor both runs the AI and grades it, a governance conflict-of-interest pattern independent of INJ-078's cost framing (D12/FinOps, artefact 23, out of this phase's scope); this artefact records the governance angle, artefact 23 (future phase) records the cost angle | FDE4 | `data/vendor_dependencies.csv` |
| What does K-002 (AI-Disabled Continuity) require here? | **FACT**: "maintain a documented manual path for each mandatory workflow... do not degrade into an unvalidated or higher-authority automated mode" — directly answers the vendor-concentration risk: if `AIVENDOR-X` fails or exits, all 3 workflows must already have the manual path `06-c4/boundary_and_degraded_mode.md` designs, not a scramble | FDE3/FDE4 | `knowledge/AI_DISABLED_CONTINUITY.md`; `06-c4/boundary_and_degraded_mode.md` |
| What is AF-1's relevance here? | **FACT**: `audit_findings.csv` `AF-1,"data integrity","shared accounts and missing original records",open` — a data-governance finding independent of the AI-specific AF-2, but relevant to this artefact's supplier/data-governance section since AI evaluation depends on the same source data integrity | FDE4 | E-001 |

## 6. Monitoring, incidents and improvement

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What does K-004 (AI Incident Response) require? | **FACT**: contain affected models/prompts/retrieval sources/tools/credentials; preserve logs/versions/evidence hashes/decision impact; assess rollback/notification/CAPA/revalidation/safe resumption | FDE5 | E-005 |
| Does an incident-response precedent exist in the evidence? | **FACT**: yes — `data/downtime_events.csv` `DT-1` (ransomware containment, MES/QMS/historian) is a real containment-and-recovery event, already used in `16_THREAT_ABUSE_MODEL.md` §6 and `06-c4/boundary_and_degraded_mode.md`; this artefact does not re-analyze it, only confirms K-004's containment/preservation/rollback structure matches what was actually done | FDE5 | `data/downtime_events.csv` |
| What is the continual-improvement loop? | **DECISION**: `18_RESPONSIBLE_AI_HUMAN_FACTORS.md` §7's monitoring design (reviewer feedback logged with the same shape as `reviewer_feedback.csv`) is this AIMS's improvement input — a fast-accept pattern recurring, or a new abuse case, re-triggers both artefact 15 (QRM) and this artefact's risk assessment (§3) | FDE1/FDE4/FDE5 | `18_RESPONSIBLE_AI_HUMAN_FACTORS.md` §7 |

## 7. Evidence mapping

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Where does each AIMS clause map in this engagement? | **DECISION**, summary table: AI inventory → §2 (`model_registry.csv`); risk/impact assessment → §3 (indexes 15/16/19); lifecycle controls → §4 (K-005, `model_artifacts.csv`); supplier governance → §5 (`vendor_dependencies.csv`, K-002); data governance → §5 (AF-1) + `06_DATA_GOVERNANCE_INTEGRITY.md`; monitoring/incident/improvement → §6 (K-004, `downtime_events.csv`) | FDE4 | This table |
| Is this a certification claim? | **FACT**: no — restated per the Document control "Hard rule" and `.claude/skills/trust-risk-security.md`: "never claim 'Act compliant' / '42001 certified' from this skill alone" | FDE4 | `.claude/skills/trust-risk-security.md` |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Gap | AF-2 ("unclear validated state and vendor change controls") is given a named control (§4) but not yet closed — `GXP-SUM-1` remains `pilot`, not `validated` | Cannot claim AF-2 resolved until the registry state changes | FDE3/FDE4 | P5/P7 build + validation | Open — expected at this phase |
| R-002 | Risk | Single-vendor AI concentration (§5) has a continuity mitigation (K-002 manual path) but no named exit/migration plan | If `AIVENDOR-X` fails within the 120-day exit window, the manual path is the only fallback, not a like-for-like AI capability | FDE3/FDE5 | Artefact 27 (Vendor exit, future phase) | Open — explicitly deferred, not silently dropped |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| AF-2 has a named, evidence-grounded control | §3–§4 | Manual review | `data/audit_findings.csv`; `data/model_registry.csv` | Done — control named, closure pending (R-001) |
| AI inventory is complete and lifecycle-stated | §2 | Manual cross-check | `data/model_registry.csv` | Done — 3/3 models accounted for |
| No AIMS section duplicates rather than indexes prior artefacts | §3, §6 | Manual review | `15_QUALITY_RISK_MANAGEMENT.md`; `16_THREAT_ABUSE_MODEL.md` | Done |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| — | FDE5/FDE1 (pending) | Not yet reviewed | — | — |
