# Ontology and Semantic Layer

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

Per `data-and-knowledge` skill's meaning ladder (`Pure RAG → +metadata → +semantic/metrics layer → Knowledge Graph → hybrid`) — this artefact establishes the **semantic/metrics layer** rung: governed concepts, identifiers, and vocabulary definitions that stop conflicting-language drift before any retrieval or graph decision is made (that decision is artefact 08).

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE2 (Domain/Evidence Lead) primary |
| Version / date | v0.1 — 2026-08-08 |
| Reviewers | FDE3, FDE4 |
| Status | Draft |
| Related requirements / ADRs | `requirements/ASSESSMENT_RUBRIC.csv` RUB-05,06; feeds artefact 08 (KG Decision) |

## Purpose

Defines the governed concepts, identifiers, temporal/jurisdictional semantics, controlled vocabularies, entitlements and versioning rules that every workflow's evidence citation must respect. Scope: terms and identifiers actually used across the three workflows' evidence base. Accountable owner: FDE2. Complete when every competency question is answerable from the model, every identifier class has a stated resolution rule, and controlled vocabularies are version-pinned.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `data/controlled_vocabularies.csv` | Version `2026-1` | Dose-form and route-of-administration codes | Only 2 domains sampled; not exhaustive |
| E-002 | `data/product_master_aliases.csv`, `idmp_mappings.csv`, `substance_master.csv` | Current | Product/substance identity and alias mapping | `idmp_mappings.mapping_status` can be `ambiguous_strength_presentation` |
| E-003 | `data/timezone_rules.csv`, `regional_rules.csv` | Current | Site timezone + DST transition; region-scoped roles | Governs temporal/jurisdictional semantics |
| E-004 | `data/users_entitlements.csv` | Current | User/role/IAM-state/gateway-cache-state | Governs entitlements section; INJ-067 |
| E-005 | `data/terminology_versions.csv`, `knowledge_catalog.csv` | Current | MedDRA version 27.1 `legacy_cases`; document `effective`/`supersedes` fields | Governs versioning section |

## 1. Competency questions

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What must this ontology be able to answer? | **DECISION** — 6 competency questions the model must support: (1) "Which document currently governs decision X, as of date Y, in jurisdiction Z?" (2) "What is the canonical product for alias/local-code A?" (3) "Does result R's unit match the receiving system's assumed unit?" (4) "Is case C a duplicate candidate of case D, and why?" (5) "Is stock S excluded from options due to a quality hold?" (6) "Who is entitled to invoke workflow W right now, per IAM, independent of any cache?" | FDE2 | Each question maps to an invariant/policy in `04-ddd/domain_model.md` §4 |

## 2. Core concepts and relations

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What are the core concepts? | **FACT/DECISION**, carried from the domain model: `Product`, `Substance`, `Batch`, `EvidenceItem`, `KnowledgeDocument`, `PVCase`, `SupplyOption`, `AccountableRole` — each with the relations already enumerated in `data/RELATIONSHIP_MODEL.csv` (56 rules) | FDE2 | `04-ddd/domain_model.md` §4; `data/RELATIONSHIP_MODEL.csv` |
| Are relations multi-hop in practice? | **INTERPRETATION**: yes for at least one class — `Batch → MaterialGenealogy → WarehouseMovement`, and `PVCase → DuplicateCandidate → PVCase` are two-hop patterns already present; whether this requires a graph store or a two-join relational query is the exact question artefact 08 answers | FDE3 | `data/material_genealogy.csv`, `warehouse_movements.csv`, `duplicate_candidates.csv` |

## 3. Identifiers and aliases

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| How many identifier systems exist for "the same" product? | **FACT**: at least 3 — `product_id` (`portfolio_products.csv`, e.g. `NCB-204`), `idmp_product`/`local_product` (`idmp_mappings.csv`, e.g. `NCB204-DE` → `NCB-204`), `canonical_product`/`alias` (`product_master_aliases.csv`, e.g. `brand_alias_B` → `NCB-204`) | FDE2 | E-002 |
| What happens when mapping is ambiguous? | **FACT**: `idmp_mappings.mapping_status` can be `ambiguous_strength_presentation` — a declared, not-yet-resolved state (INJ-045) | FDE4 | E-002; INV-10 |
| What is the resolution rule? | **DECISION**: the Product & Substance Master ACL (`04-ddd/domain_model.md` §7) returns a canonical reference **or** an explicit ambiguity flag — it never guesses | FDE3 | INV-10 |

## 4. Temporal and jurisdictional semantics

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What time semantics must be distinguished? | **FACT**: source event time vs. receipt/entry time (e.g. `ebr_steps.performed_time` vs. `entered_time`, INJ-025); timezone and DST transitions per site (`timezone_rules.csv`, e.g. site `DE-008`, `Europe/Berlin`, DST transition `2026-03-29` — directly implicated in INJ-018 wearable clock-skew) | FDE2 | `data/timezone_rules.csv`; `data/ebr_steps.csv` |
| How is jurisdiction modeled? | **FACT**: `knowledge_catalog.jurisdiction` (`Global` vs. `DE`) and `regional_rules.csv` (e.g. `EU` region, `Qualified Person` role, rule "batch certification human-only") together scope which policy and which accountable role apply per region | FDE4 | `data/knowledge_catalog.csv`; `data/regional_rules.csv` |
| Must every claim state jurisdiction? | **DECISION**: yes — per `PACKAGE_SCOPE_AND_ASSUMPTIONS.md`'s regulatory-boundary clause, every regulatory conclusion must state jurisdiction, purpose, accountable role, system boundary and assumptions explicitly | FDE4 | `PACKAGE_SCOPE_AND_ASSUMPTIONS.md` |

## 5. Controlled vocabularies and units

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What controlled vocabularies exist? | **FACT** (sample): `dose_form` (code `DF-001` = "concentrate for solution for infusion"), `route` (code `ROA-IV` = "intravenous use"), both version `2026-1` | FDE2 | E-001 |
| How are units governed? | **FACT/DECISION**: units are **reported, never silently converted** (`DATA_DICTIONARY.csv` explicitly annotates unit fields "Reported unit; do not silently convert") — this is a package-level rule, not a team invention, directly reinforcing INV-02 | FDE3 | `data/DATA_DICTIONARY.csv` (e.g. `assay_results.unit`, `lab_results.unit`, `commercial_forecast.annual_units`) |

## 6. Entitlements and policy context

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| How are entitlements modeled? | **FACT**: `users_entitlements.csv` carries `user`, `role`, `iam_state`, and `ai_gateway_state` as **separate** fields — e.g. contractor_77 shows `iam_state=revoked` but `ai_gateway_state=active_cached` (INJ-067) | FDE5 | E-004 |
| What is the policy consequence? | **DECISION**: authorization is evaluated from `iam_state` at execution time, never from `ai_gateway_state` alone — directly implements POL-01 | FDE5 | `04-ddd/domain_model.md` POL-01 |

## 7. Versioning and validation

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| How are terminology/document versions tracked? | **FACT**: `terminology_versions.csv` shows MedDRA version `27.1` marked `legacy_cases` (implying a newer version is in use elsewhere, INJ-039); `knowledge_catalog.csv` tracks `effective` date and `supersedes` per document (e.g. K-006 supersedes K-007) | FDE2 | E-005 |
| How is validation performed? | **FACT**: `validation_tests.csv` already contains a test requirement — `citation provenance`, result `fail_on_superseded_doc` — i.e. the package itself expects the system to fail closed when citing a superseded document, not merely a design aspiration | FDE5 | `data/validation_tests.csv` |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Gap | Controlled-vocabulary sample (2 domains) is not exhaustive against the full evidence base | Coverage of the ontology's controlled-term layer is unproven | FDE2 | Prompt 05 (Feature Specs) | Open |
| R-002 | Assumption | Jurisdiction resolution assumes a single jurisdiction per query; multi-jurisdiction queries are not yet modeled (also flagged in artefact 06) | Could misapply a local-only instruction | FDE4 | Prompt 05 | Open |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| Superseded documents fail citation, not silently accepted | POL-02, INV-09 | `validation_tests.csv` VT-1 (`fail_on_superseded_doc`) already exists in package | `data/validation_tests.csv` | Confirmed as a package-level expectation; implementation pending |
| Units never silently converted | INV-02 | Negative test | `submission/tests/` (not yet built) | Pending |
| Authorization from IAM state, not gateway cache | POL-01 | Negative test on stale-cache scenario (INJ-067) | `submission/tests/` (not yet built) | Pending |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| — | FDE3/FDE4 (pending) | Not yet reviewed | — | — |
