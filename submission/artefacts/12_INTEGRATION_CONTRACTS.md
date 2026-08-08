# Integration Contracts

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE3 (Architecture/Build Lead) |
| Version / date | v0.1 — 2026-08-08 |
| Reviewers | FDE4, FDE5 |
| Status | Draft |
| Related requirements / ADRs | ADR-001, ADR-004, ADR-010; `requirements/ASSESSMENT_RUBRIC.csv` RUB-04,07 |

## Purpose

Defines the versioned input/output contracts, per-integration semantics, and error/idempotency handling for the three workflows, grounded in the package's own pre-existing JSON schemas (`evaluation/contracts/`) rather than inventing a new contract shape. Scope: the 3 workflow response contracts + the shared `evidence_item` contract. Accountable owner: FDE3, with FDE5 confirming negative-path coverage.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `evaluation/contracts/batch_response.schema.json`, `pv_response.schema.json`, `supply_response.schema.json`, `evidence_item.schema.json` | Package, immutable | Exact required fields, enums, consts | Cannot be edited — challenge evidence |
| E-002 | `evaluation/contract_samples/*.json` (3 positive, 3 negative) | Package, immutable | Concrete valid/invalid examples | Already validated PASS by `tools/test_contracts.py` |
| E-003 | `case/SOURCE_SYSTEM_FACT_PACK.md` | Package | 9 source-system domains, each read-only | Governs §1 |
| E-004 | `data/interface_mappings.csv`, `api_contract_versions.csv` | Current | Real example of an unapproved unit-conversion interface | Governs §4 |

## 1. System/interface inventory

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What external interfaces exist? | **FACT**: 9 source-system domains (Discovery, Clinical, Manufacturing, Laboratory, Quality, Safety, Regulatory, Supply, AI platform — `SOURCE_SYSTEM_FACT_PACK.md`), all read-only per the C4 map's PROHIBITED-write design (`06-c4/c4_context.md`) | FDE3 | E-003 |
| What is the contract-versioning example already in the package? | **FACT**: `api_contract_versions.csv` shows a real LIMS-result API at version `v1` with an explicit `unit_field` ("do not silently convert") — this is the pattern our own contracts must follow: version, unit field, status field, date semantics, all explicit | FDE3 | `data/api_contract_versions.csv` |

## 2. Versioned input contracts

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What does a workflow request look like? | **FACT**: object ID + user context + purpose + as-of time (per `04-ddd/domain_model.md` §6 minimum governed workflow) — no formal input JSON Schema exists yet in the package (only response schemas are supplied); this is a build task for Prompt 08, not invented here | FDE3 | `04-ddd/domain_model.md` §6 |

## 3. Versioned output contracts

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the shared response spine? | **FACT** (from `batch_response.schema.json`, cross-checked against `pv_response.schema.json`/`supply_response.schema.json`): `request_id`, `workflow` (const per workflow), `as_of`, `authorization{user,purpose,checked_at,decision}`, `evidence[]` (→ `evidence_item.schema.json`), `contradictions[]`, `gaps[]`, `abstentions[]`, `human_review{}`, `execution_status: const "not_executed"`, `audit{}` — `additionalProperties: false` on every object | FDE3 | E-001 |
| What does each workflow add? | **FACT**: Batch adds `batch_id`, `readiness_state` (enum: `insufficient_evidence`/`conflicted_evidence`/`ready_for_authorized_review`), `applicable_documents[]`. PV adds (per governing plan §11.3, consistent with schema pattern) `case_ids`, `source_facts`, `duplicate_candidates`, `clock_evidence`, `terminology`, `listedness_context`, `required_reviews`. Supply adds `event_id`, `options[]` (each `status: "draft"`), `constraints[]`, `approvals_required[]`, `quality_holds[]`, `no_side_effects: true` | FDE3 | E-001; governing plan §11.3 |
| What does the shared `evidence_item` require? | **FACT**: `source`, `record_id`, `authority`, `effective_at` (string or null), `retrieved_at`, `facts{}`, `integrity{sha256: 64-hex pattern, source_preserved: const true}` | FDE3 | `evaluation/contracts/evidence_item.schema.json` |

## 4. Units and terminology

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| How are units handled across interfaces? | **FACT**: never silently converted (INV-02) — the package's own `interface_mappings.csv` shows a real, currently-**unapproved** conversion rule (`CRO_LAB_TO_LIMS`, mg/L→ug/mL, `conversion_rule=1:1_assumed`, `approved=no`) already in the estate; our contracts must flag this class of mismatch, not adopt it | FDE3 | E-004; INJ-024 |
| How is terminology versioning handled? | **FACT**: `terminology_versions.csv` (MedDRA 27.1, `legacy_cases`) — the PV contract's `terminology` field must carry the version explicitly, never assume a single current version | FDE2 | `data/terminology_versions.csv`; INJ-039 |

## 5. Time and identity semantics

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What time fields are required? | **FACT**: `as_of` (request-level, required, `minLength: 1`) and `retrieved_at`/`effective_at` (per evidence item) — distinguishing source-event time from retrieval time by contract, not convention | FDE3 | E-001 |
| How is identity handled across contracts? | **DECISION**: `record_id` in `evidence_item` is scoped per source (`04-ddd/domain_model.md` §7 ACL) — the contract does not assume one global identity space, consistent with the Product & Substance Master ACL design | FDE3 | `04-ddd/domain_model.md` §7 |

## 6. Error/idempotency/replay

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What does the package's own negative-sample testing already prove? | **FACT**: `negative_supply_side_effect.json` is a real, already-tested-invalid sample — it sets `no_side_effects: false` and adds an out-of-schema `reservation_id` field; `tools/test_contracts.py` already confirms this correctly fails validation (`additionalProperties: false` catches `reservation_id`; the `no_side_effects` value would need its own const check) | FDE5 | `evaluation/contract_samples/negative_supply_side_effect.json`; confirmed PASS in `tools/test_contracts.py` run |
| What must `no_side_effects` hold on? | **DECISION**: every path, including error/exception paths (INV-06) — this is stricter than the sample currently tests (the sample tests the happy-path-shaped-wrong case); a build-time task is to add an error-path negative sample | FDE5 | ADR-004 |
| How is idempotency handled? | **DECISION**: `request_id` serves as the idempotency key (per governing plan §11.3) — a repeated `request_id` must return the same result, never duplicate a side effect (directly relevant to INJ-080 checkpoint-corruption precedent) | FDE3 | `04-ddd/domain_model.md` §4 (Improve, error-path idempotency) |

## 7. Compatibility and contract tests

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Do contract tests already exist and pass? | **FACT**: yes — `tools/test_contracts.py` validates all 6 package-supplied samples (3 positive, 3 negative) correctly; this was independently re-confirmed during this session (`tools/test_contracts.py` run: 6/6 PASS) | FDE5 | `evaluation/contract_samples/`; live tool run |
| What is the compatibility strategy going forward? | **DECISION**: extend, never break, the existing schemas — any new required field is an explicit schema version bump (ADR-004), consistent with `additionalProperties: false` already enforcing strictness | FDE3 | ADR-004 |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Gap | No formal input-request JSON Schema exists yet (only response schemas are package-supplied) | Must be authored at Prompt 08, not fabricated here | FDE3 | Prompt 08 | Open |
| R-002 | Gap | Error-path `no_side_effects` negative test doesn't exist yet — current negative sample only covers the happy-path-shaped violation | A real error-path side-effect bug could pass current tests | FDE5 | Prompt 09/11 (build) | Open |
| R-003 | Assumption | PV/Supply contract field lists (§3) are derived from the governing plan's description, not independently re-verified against a package-supplied PV/Supply JSON Schema beyond what was directly read | Minor risk of field-name drift once Prompt 08 formalizes them | FDE3 | Prompt 08 | Open |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| No silent unit conversion in any contract | INV-02 | Cross-check against `interface_mappings.csv` unapproved-rule example | This document §4 | Done — pattern identified, build-time test pending |
| `no_side_effects` holds on every path including errors | INV-06 | Negative sample (happy-path variant exists; error-path pending) | `evaluation/contract_samples/negative_supply_side_effect.json` | Partial — R-002 |
| Contract tests currently pass against the immutable package | ADR-004, ADR-010 | `tools/test_contracts.py` | Live tool run this session | **PASS** — 6/6 |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| — | FDE4/FDE5 (pending) | Not yet reviewed | — | — |
