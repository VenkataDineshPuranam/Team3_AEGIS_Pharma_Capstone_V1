# GxP Lifecycle and Validation

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE4 (GxP/Quality/ISO Lead) |
| Version / date | v0.1 — 2026-08-08 |
| Reviewers | FDE3, FDE5 |
| Status | Draft |
| Related requirements / ADRs | ADR-001, ADR-004, ADR-008; `requirements/ASSESSMENT_RUBRIC.csv` RUB-09 (hard-gate) |

## Purpose

Establishes intended use, GxP risk classification, computerised-system lifecycle deliverables, and validation/assurance strategy for the AEGIS-PHARMA system, proportionate to risk per `COMPUTERISED_SYSTEM_LIFECYCLE.md` (K-010). Scope: the three workflows as an advisory (non-regulated-decision) computerised system. Accountable owner: FDE4, with FDE3 confirming technical feasibility of validation controls.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `knowledge/AI_GXP_BOUNDARY.md` (K-003) | Approved, 2026-05-01 | "AI may support evidence review but cannot replace accountable GxP decisions" | — |
| E-002 | `knowledge/COMPUTERISED_SYSTEM_LIFECYCLE.md` (K-010) | Approved, 2026-03-10 | Risk-based lifecycle, supplier assessment, validation, access, audit trail, retirement expectations | — |
| E-003 | `data/system_inventory.csv`, `validation_inventory.csv` | Current | Real example of contested validation classification (INJ-031) | Illustrates the risk this artefact must avoid repeating |
| E-004 | `04-ddd/domain_model.md` §4 | This engagement | 10 invariants, 6 policies as the system's own risk-control basis | — |

## 1. Intended use and boundary

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the intended use? | **FACT/DECISION**: decision-support only — evidence reconciliation, contradiction surfacing, and draft-option generation for three workflows; never a GxP decision itself (`AI_GXP_BOUNDARY.md` K-003) | FDE4 | E-001; `case/INTEGRATED_CASE.md` §4 |
| What is explicitly outside the boundary? | **FACT**: batch disposition, final PV decisions, stock allocation/shipment/recall — the system's own contracts assert `execution_status: "not_executed"` on every response, making the boundary a schema-level fact, not just policy prose | FDE4 | `evaluation/contracts/batch_response.schema.json` |

## 2. Risk classification

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What GxP risk classification applies? | **DECISION**: classified **GxP-relevant, advisory-only** — touches regulated records and processes (batch evidence, PV cases) but does not itself create, modify, or dispose of a GxP record; distinct from **GxP-critical** (e.g. `LIMS-4`, `system_inventory.csv`, which directly produces regulated results) | FDE4 | `data/system_inventory.csv` (comparison classes) |
| Why does this matter, concretely? | **FACT**: `system_inventory.csv`/`validation_inventory.csv` already show classification is contested in the source estate (INJ-031 — the same system labeled `validated`, `conditionally_released`, and `research-only` in three places) — this artefact must state one classification and defend it, not reproduce that ambiguity for our own system | FDE4 | E-003; INJ-031 |

## 3. Lifecycle deliverables

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What lifecycle deliverables does K-010 require? | **FACT**: intended use, requirements, supplier assessment, risk and acceptance evidence, configuration/access/audit-trail/backup/continuity/change/periodic-review control, and record preservation through retirement | FDE4 | E-002 |
| Which are already produced? | **FACT**: intended use (§1 above), requirements (artefact 09), risk classification (§2 above), audit-trail design (ADR-005), access/authorization design (ADR-006, INV/POL-01) | FDE3/FDE4 | Cross-referenced artefacts |
| Which are not yet produced? | **DECISION**: supplier assessment (no third-party vendor selected yet — deferred to Prompt 08/Track B); backup/continuity procedural detail (deferred to artefact 25 Incident Recovery); retirement plan (deferred to artefact 27) | FDE4 | Backlog |

## 4. Validation/assurance strategy

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What validation approach is proportionate to this risk class? | **DECISION**: risk-based, per K-010 — not exhaustive scripted testing of every path, but focused, evidence-driven testing concentrated on the 10 invariants/6 policies (`04-ddd/domain_model.md` §4), since those are precisely the points where a failure would have GxP consequence | FDE4/FDE5 | `14_COMPUTER_SOFTWARE_ASSURANCE.md` (companion artefact, full CSA detail) |
| Is this consistent with Computer Software Assurance thinking? | **FACT**: yes — proportionate, risk-based validation (critical thinking over exhaustive scripted testing) is exactly the CSA approach detailed in artefact 14 | FDE4 | `14_COMPUTER_SOFTWARE_ASSURANCE.md` |

## 5. Supplier and configuration controls

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Are there supplier/vendor dependencies? | **ASSUMPTION**: Track A (this engagement) assumes no external AI vendor is contracted yet — the 2 optional agents (ADR-003) are scoped but not vendor-selected; if a vendor is chosen, `vendor_dependencies.csv`'s concentration risk (INJ-078) applies and must be reassessed | FDE4 | `data/vendor_dependencies.csv` |
| What configuration control applies? | **DECISION**: contract schema versioning (ADR-004) IS the configuration-control mechanism for this system's regulated-facing interfaces — any schema change is a version bump, reviewed like any other GxP configuration change | FDE3 | ADR-004 |

## 6. Change and periodic review

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| How are changes controlled? | **DECISION**: per governing plan §17 — plan changes require a new RAID row + version bump, never a silent edit; the same discipline applies to this system's invariants/policies (a change to `INV-*`/`POL-*` is itself a change-controlled event) | FDE4 | `AEGIS_PROJECT_PLAN_FINAL.md` §17 |
| What triggers periodic review? | **DECISION**: any of the 10 ADR revisit triggers (artefact 11), or a new inject/finding surfacing a gap in the invariant register | FDE4 | `11_ADR_REGISTER.md` §7 |

## 7. Retention and retirement

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What retention obligation applies to this system's own records? | **DECISION**: the system's audit trail (ADR-005, hash-chained) must itself follow the retention discipline the system enforces on source evidence — no shorter retention for the system's own decisions than for the evidence it cites | FDE4 | ADR-005; `06_DATA_GOVERNANCE_INTEGRITY.md` §6 |
| Is retirement planned? | **DEFERRED**: full retirement/evidence-preservation plan belongs to artefact 27 (Vendor Exit) and artefact 29 — not fabricated here | FDE4 | Backlog |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Gap | Supplier assessment cannot be completed until a model vendor (if any) is selected | Blocks full K-010 lifecycle closure | FDE4 | Prompt 08/Track B | Open |
| R-002 | Gap | Backup/continuity procedural detail and full retirement plan are deferred to later artefacts (25, 27) | Not a Phase P3 blocker — explicitly scoped elsewhere | FDE4 | Artefacts 25, 27 | Open — expected |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| System never performs a GxP decision itself | `execution_status: const "not_executed"` | Negative contract tests (already PASS) | `evaluation/contract_samples/negative_*` | Done |
| Risk classification is defended, not assumed | §2 comparison against `system_inventory.csv` contested example | Manual review at G3 | This document §2 | Done |
| Validation is risk-based, not exhaustive-by-default | §4, companion CSA artefact | Reviewed at G3 | `14_COMPUTER_SOFTWARE_ASSURANCE.md` | Done |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| — | FDE3/FDE5 (pending) | Not yet reviewed | — | — |
