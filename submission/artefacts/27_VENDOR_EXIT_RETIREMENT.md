# Vendor Exit and Retirement

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE5 (Security/Privacy/Eval/Reliability Lead) |
| Version / date | v1.0 — 2026-08-11 |
| Reviewers | FDE1, FDE3 |
| Status | Draft |
| Related requirements / ADRs | RUB-15; `04-ddd/inject_register_84.md` INJ-078/083/084 |

## Purpose

States dependency concentration, exit portability gaps, substitution strategy and retirement approval path for `AIVENDOR-X`, the single external AI vendor this build's optional generative layer would depend on. Accountable owner: FDE5.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `data/vendor_dependencies.csv` | Package | 4 capabilities (model hosting, vector store, evaluation, observability) all mapped to the single vendor `AIVENDOR-X` | Real disclosed concentration |
| E-002 | `data/vendor_contracts.csv` | Package | `AIVENDOR-X`: `exit_days=120`, `data_export="prompts only"`. `CMO-IE` (unrelated manufacturing vendor): `exit_days=180`, `data_export="PDF/CSV partial"` | Real disclosed terms |
| E-003 | `data/vendor_exit_assets.csv` | Package | `prompt_export: available`; `embedding_export: not_supported`; `evaluation_history: PDF_only`; `tool_audit: partial` | Real disclosed export capability gaps |
| E-004 | `data/model_costs.csv` | Package | `AIVENDOR-X large-1` input pricing rose \$5.00→\$8.50/M (+70%) with no disclosed second live vendor in the deterministic path | Real price-shock evidence (INJ-075), also cited in artefact 23 |
| E-005 | `submission/src/services/model_registry.py` | Generated P5 | `verify_model_integrity` blocks serving on hash mismatch or missing signature, independent of which vendor supplied the artifact | `submission/tests/test_model_supply_chain_integrity.py` |

## 1. Dependency inventory

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What does this build actually depend on `AIVENDOR-X` for, today? | **FACT**: nothing in the shipped deterministic code path (`submission/src/workflows/*.py` has zero model/API calls, per `AI_DISABLED.md`) — the dependency is entirely in the *not-yet-built* 2 narrow-scope agents (`04-ddd/gen_ai_boundaries.md` §1) | FDE5 | `submission/src/workflows/*.py` (no LLM call) |
| What would depend on it if those agents were built? | **FACT**: all 4 disclosed capabilities — model hosting, vector store, evaluation, observability — are mapped to the one vendor (E-001), a full-stack single point of failure, not just a model-hosting dependency | FDE1 | E-001 |

## 2. Contract and portability gaps

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the contractual exit window? | **FACT**: 120 days (E-002) — shorter than the batch/supply continuity tolerance (14 days is the *outage* tolerance, not the *exit* window; these are different clocks and must not be conflated) | FDE1 | E-002 |
| What can actually be exported on exit? | **FACT**, itemized (E-003): prompts — yes; embeddings — **not supported**; evaluation history — PDF only (not machine-readable); tool audit — partial | FDE5 | E-003 |
| Is the evaluation-history gap already mitigated? | **INTERPRETATION**: partially — this build's own evaluation history (`submission/evaluation/reports/`) is already machine-readable (JSON/JSONL/CSV) and generated independently of any vendor, so the P6 harness's own output does not depend on `AIVENDOR-X`'s PDF-only export; only a vendor-hosted eval history (if one existed) would hit this gap | FDE5 | `submission/evaluation/reports/summary.json` |

## 3. Substitution strategy

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Is a same-shape substitute available? | **FACT**: yes, partially disclosed — `data/model_costs.csv` lists `LOCAL-SLM small-7b` at \$0.80/\$1.20 per M tokens (vs. `AIVENDOR-X large-1` \$8.50/\$22.00) as an on-prem/local alternative already present in the cost data | FDE1 | `data/model_costs.csv` |
| Is substitution safe without further work? | **DECISION**: no — `data/model_performance.csv` shows a real non-English fidelity gap (`PV-NER-4` English F1 0.91 vs. Hindi F1 0.67) consistent with INJ-081 (model substitution regression); any substitution must re-run suite S12 (`submission/evaluation/datasets/S12_*.json`) before being trusted | FDE5 | `23_TOKEN_FINOPS.md` §2; `24_RELIABILITY_OBSERVABILITY.md` §6 |
| Does the model supply-chain integrity gate work regardless of vendor? | **FACT**: yes — `model_registry.verify_model_integrity` checks `deployed_hash`/`registry_hash`/`signature`, none of which are vendor-specific fields; substituting vendors does not require bypassing or modifying this gate | FDE5 | E-005 |

## 4. Exit rehearsal

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Has an exit actually been rehearsed? | **FACT**: not for `AIVENDOR-X` itself (no live vendor integration exists to rehearse against, since the deterministic build has zero calls to it) — what **has** been rehearsed and proven is the harder claim: full *AI* unavailability, vendor-agnostic, via `submission/scripts/ai_disabled_offline_demo.py` (all 3 workflows execute with `socket.socket.connect` blocked entirely) | FDE5 | `submission/scripts/ai_disabled_offline_demo.py`; `AI_DISABLED.md` |
| What would still need rehearsing if the 2 agents were built? | **DECISION**: a real export-and-reload cycle using `AIVENDOR-X`'s actual export tooling, specifically to confirm the `embedding_export: not_supported` gap doesn't silently strand data — deferred, recorded as R-001 below, not silently assumed fine | FDE1 | — |

## 5. Evidence and data export

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Can this submission's own evidence be exported independent of any vendor? | **FACT**: yes — `submission/scripts/export.sh` zips `submission/evidence/` + `submission/evaluation/reports/` + `submission/artefacts/` using only the Python stdlib `zipfile` module, no vendor dependency of any kind | FDE5 | `submission/scripts/export_evidence.py` |

## 6. Retention/destruction

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What governs retention on exit? | **FACT**: `data/retention_rules.csv` (already cited in `17_PRIVACY_ETHICS.md` / suite S09) sets record-type-specific rules (e.g., "AI prompt logs: delete after 90 days unless evidence hold") independent of which vendor hosted the data — retention is a data-governance decision, not a vendor-contract term | FDE1 | `data/retention_rules.csv` |

## 7. Retirement approval and residual risk

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the residual risk if `AIVENDOR-X` exited today? | **INTERPRETATION**: low for the shipped Track A build (zero live dependency) — high for the *planned* 2-agent generative layer, specifically the `embedding_export: not_supported` gap, which would strand any vector-store content built up during operation | FDE5 | E-003 |
| Who approves retirement of the vendor relationship? | **DECISION**: Supply Governance Board for supply-adjacent capability, Regulatory Strategist for anything touching GxP evidence pipelines — per `data/decision_rights.csv`'s existing accountable-role pattern, extended by analogy (no vendor-retirement row exists in that CSV, so this is a DECISION, not a FACT) | FDE1 | `data/decision_rights.csv` |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Gap | No real export-and-reload rehearsal has been run against `AIVENDOR-X`'s actual tooling (only the vendor-agnostic AI-disabled path is proven) | Unknown whether `embedding_export: not_supported` would actually block a real exit within the 120-day window | FDE1 | Before the 2-agent generative layer is built | Open |
| R-002 | Risk | Single vendor covers all 4 capabilities (E-001) with a recent 70% price increase (E-004) and no second live vendor in the deterministic path | Budget and continuity exposure concentrated in one relationship | FDE1 | Vendor diversification review | Open — same risk as `23_TOKEN_FINOPS.md` R-002 |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| Zero live vendor dependency in shipped code | Deterministic-only workflows | Code inspection + `ai_disabled_offline_demo.py` | `submission/src/workflows/*.py` | Confirmed |
| Model supply-chain gate is vendor-agnostic | `model_registry.verify_model_integrity` | `S12-model-registry` | `submission/evaluation/reports/detailed_results.jsonl` | PASS |
| Evidence export does not depend on any vendor | `export_evidence.py` (stdlib `zipfile` only) | Manual run | `submission/evidence/exports/` | Confirmed |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| FDE5 (self-review) | Reliability Lead | R-001 (no real export rehearsal) is a genuine gap tied to future work, not the current build | Recorded, deferred until the 2-agent layer is scoped | 2026-08-11 |
