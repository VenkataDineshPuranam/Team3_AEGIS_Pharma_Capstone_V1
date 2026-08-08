# Knowledge Graph Decision

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

Per `data-and-knowledge` skill's meaning ladder (`Pure RAG → +metadata → +semantic/metrics layer → Knowledge Graph → hybrid`): "climb a rung only when the evidence forces you." This artefact makes that call explicitly, with a simpler alternative benchmarked first.

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE2 (Domain/Evidence Lead) primary, FDE3 (Architecture/Build) co-owner |
| Version / date | v0.1 — 2026-08-08 |
| Reviewers | FDE3, FDE4 |
| Status | Draft |
| Related requirements / ADRs | `requirements/ASSESSMENT_RUBRIC.csv` RUB-06; feeds artefact 10 (C4), artefact 11 (ADR) |

## Purpose

Decides, with evidence and a simpler-alternative benchmark, whether a knowledge graph is required for the three workflows, per the case's own instruction that "a knowledge graph, agent, vector database or large language model is not mandatory unless justified by evidence" (`PACKAGE_SCOPE_AND_ASSUMPTIONS.md`). Scope: the relationship/query needs of the three core bounded contexts. Accountable owner: FDE2, with FDE3 confirming technical feasibility of the simpler alternative.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `data/RELATIONSHIP_MODEL.csv` | Current | 56 explicit FK relationships, each with an enforcement rule (`required`/`optional`/`declared_exception`) | This is already a relational, not graph, model — supplied as such |
| E-002 | `submission/artefacts/07_ONTOLOGY_SEMANTIC_LAYER.md` §2 | This engagement | Identified multi-hop patterns (max 2 hops found) | Not exhaustive — deeper hops possible but unevidenced |
| E-003 | `PACKAGE_SCOPE_AND_ASSUMPTIONS.md` | Package rule | KG not mandatory unless evidence-justified | — |

## 1. Decision criteria

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What would force a KG rung climb? | **DECISION**, per skill: relationship/multi-hop questions a passage or a simple join cannot answer; entity resolution at scale across near-duplicate names; provenance reconstruction requiring a reproducible clause→policy→version path | FDE2 | `data-and-knowledge` skill, "Three things naive RAG cannot do" |
| Does this engagement's data already provide relational structure? | **FACT**: yes — `RELATIONSHIP_MODEL.csv` is an explicit, enumerated FK model (56 rules) with enforcement semantics already defined, including `declared_exception` cases that must be preserved, not graph-modeled away | FDE3 | E-001 |

## 2. Graph-required use cases

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Are there genuine multi-hop questions? | **INTERPRETATION**: the deepest patterns identified so far are 2-hop (`Batch → MaterialGenealogy → WarehouseMovement`; `PVCase → DuplicateCandidate → PVCase`) — both are answerable by a single SQL join or two indexed lookups, not requiring graph traversal | FDE2 | `07_ONTOLOGY_SEMANTIC_LAYER.md` §2 |
| Is entity resolution at graph-scale needed? | **INTERPRETATION**: the identity-collision problem (product/substance, INJ-008/045) is a **small, enumerable** conflict set (few products, few aliases) resolved via the Product & Substance Master ACL — not a large-scale fuzzy-matching problem (`data-and-knowledge` skill's "Meridian Freight" example) that would justify graph-based entity resolution | FDE2/FDE3 | `04-ddd/domain_model.md` §7 |
| Is impact analysis across many documents needed? | **ASSUMPTION**: not yet evidenced — the knowledge corpus is 32 documents, status-gated by a flat catalog (`knowledge_catalog.csv`), not requiring cross-document relationship traversal | FDE2 | `data/knowledge_catalog.csv` |

## 3. Simpler alternative benchmark

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the simpler alternative? | **DECISION**: a governed relational/semantic layer — the `RELATIONSHIP_MODEL.csv` FK rules implemented as query joins/lookups, plus the ontology's controlled identifiers (artefact 07) and the Evidence & Provenance shared kernel (artefact 05) for provenance — no separate graph store | FDE3 | `07_ONTOLOGY_SEMANTIC_LAYER.md`; `04-ddd/domain_model.md` |
| Does the simpler alternative meet the competency questions? | **INTERPRETATION**: yes for all 6 competency questions in artefact 07 §1 — each is answerable by a lookup or a bounded join (e.g. "is case C a duplicate of case D" = a lookup in `duplicate_candidates.csv`-equivalent, not a graph traversal) | FDE2 | `07_ONTOLOGY_SEMANTIC_LAYER.md` §1 |
| Consistent with prior no-AI/no-graph-first framing? | **FACT**: yes — mirrors the Phase 1 finding that `rules_workflow`/`master_data_repair` (deterministic, non-AI) already deliver 27–38% estimated value (`no_ai_baselines.csv`); the same "deterministic-first" logic applies to the graph-vs-relational choice | FDE1 | `01-discovery/evidence_register.md` §9 |

## 4. Graph model and provenance (if later triggered — not built now)

**DECISION (not exercised now)**: if a future trigger (§7) is hit, the candidate graph model would center on `Product`/`Substance`/`Batch`/`PVCase` nodes with typed edges mirroring `RELATIONSHIP_MODEL.csv` rules, and would need temporal validity on edges (e.g. `knowledge_catalog.effective`/`supersedes` as edge properties) — noted here as a forward-looking design sketch only, per `data-and-knowledge` skill's KG vocabulary (entities/relationships, temporal validity, entity resolution on key nodes).

## 5. Query patterns and performance

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What are the actual query patterns? | **FACT**: point lookups (by batch/case/event ID) and shallow joins (1–2 hops) — no evidenced need for arbitrary-depth traversal or path-finding | FDE3 | `07_ONTOLOGY_SEMANTIC_LAYER.md` §2 |
| Performance implication? | **INTERPRETATION**: a relational/indexed-lookup approach meets these patterns with lower operational complexity (no graph-store operations skill/vendor dependency added to `vendor_dependencies.csv`'s already-flagged concentration risk, INJ-078) | FDE5 | `data/vendor_dependencies.csv`; INJ-078 |

## 6. Security and temporal filtering

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| How is temporal filtering handled without a graph? | **DECISION**: `as_of` time is a first-class field on every evidence-resolver query (per the shared contract spine, `04-ddd/gen_ai_boundaries.md` §5) — document/record effective-dating is enforced at the lookup layer, not via graph edge-validity queries | FDE3 | `04-ddd/gen_ai_boundaries.md` §5 |
| Security implication of not adding a graph store? | **DECISION**: one fewer system to secure, entitlement-gate, and vendor-manage — directly reduces the AI-specific "Integration" and "Observability" waste already flagged in `04-ddd/waste_register_ai_specific.md` | FDE5 | `04-ddd/waste_register_ai_specific.md` |

## 7. Decision and exit criteria

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Final decision | **DECISION: No knowledge graph at this stage.** Use the governed relational/semantic layer (artefact 07) plus the Evidence & Provenance shared kernel (artefact 05) as the simpler, evidence-justified alternative | FDE1 (Product/Value) ratifies, FDE3 confirms feasibility | This artefact, §§1–5 |
| What would trigger re-evaluation? | **DECISION** — explicit revisit triggers: (a) a competency question emerges requiring >2-hop traversal not answerable by a bounded join; (b) product/substance identity conflicts grow beyond an enumerable set, requiring fuzzy graph-based entity resolution; (c) cross-document knowledge relationships (not just status-gating) become a real requirement | FDE2, reviewed at Prompt 09 reconciliation | — |
| Where is this tracked? | **DECISION**: as an ADR candidate at Prompt 07, citing this artefact as the evidence basis | FDE3 | Carried to `04-ddd/domain_model.md` §8 boundary risks |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Assumption | Multi-hop depth assessment (max 2 hops) is based on the patterns surfaced so far, not an exhaustive query-pattern audit | Could underestimate real query complexity once features are specified (Prompt 05) | FDE2 | Prompt 05 (Feature Specs) | Open |
| R-002 | Risk | If revisited later mid-build, switching to a graph store would be a structural change requiring the Prompt 09 `structural_reopen` gate | Schedule risk if triggered late | FDE3 | Any of the 3 triggers above | Open |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| KG decision is evidence-justified, not fashion-driven | §§1–3 above | Reviewed at G2 | This document | Done |
| Simpler alternative benchmarked before deciding against KG | §3 | Competency-question coverage check | `07_ONTOLOGY_SEMANTIC_LAYER.md` §1 | Done — all 6 covered |
| Revisit triggers are concrete, not vague | §7 | Reviewed at Prompt 09 | This document §7 | Done |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| — | FDE3/FDE4 (pending) | Not yet reviewed | — | — |
