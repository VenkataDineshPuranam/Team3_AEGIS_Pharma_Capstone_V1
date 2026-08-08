# DDD Context Map

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

**Artifact status: `provisional`** — critical ubiquitous-language/SoT questions remain open (see Risks below). Full working detail: `submission/artefacts/04-ddd/domain_model.md`, `context_map.md`, `gen_ai_boundaries.md`.

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE2 (Domain/Evidence Lead) primary, FDE3 (Architecture/Build) co-owner |
| Version / date | v0.1 — 2026-08-08 |
| Reviewers | FDE3, FDE4 |
| Status | Draft |
| Related requirements / ADRs | `requirements/ASSESSMENT_RUBRIC.csv` RUB-04,05,06; feeds artefact 10 (C4), artefact 11 (ADRs) |

## Purpose

Establishes the domain model — bounded contexts, ubiquitous language, aggregates/invariants, and context relationships — that all three workflows and later architecture (C4, ADRs) must respect. Scope: the three mandatory workflows plus the two required cross-cutting contexts (Evidence & Provenance; Decision Authority & Accountability). Accountable owner: FDE2, with FDE3/FDE4 review. Complete when every context has a distinct owner and language, every invariant traces to a case fact, and no context silently owns another's decision.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `data/RELATIONSHIP_MODEL.csv` | Package data model, current | 56 FK relationships including declared exceptions | Some relationships marked `declared_exception` — deliberate, not to be "fixed" |
| E-002 | `data/DATA_DICTIONARY.csv` | Package data dictionary, current | Full schema for 143 datasets | Ground truth for entity/value-object modeling |
| E-003 | `data/knowledge_catalog.csv` | Current | 32 knowledge documents with status/trust/authority/sha256 | 2 untrusted, 1 draft, 1 superseded, 1 jurisdiction-local |
| E-004 | `case/INTEGRATED_CASE.md` §4 | Case mandate | Three workflow definitions and prohibited actions | Fixed scope |
| E-005 | `submission/artefacts/01-discovery/`, `02-frame/` | This engagement | Full DMAIC/waste input feeding this domain model | — |

## 1. Ubiquitous language

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What terms carry ambiguity risk high enough to require explicit disambiguation? | **FACT/DECISION**: 13-term table built, most severe being `authority` (three distinct meanings: issuing policy body, accountable decision role, or a regulator) and `trust` (a status field, not a content-quality judgement — INJ-065 poisoned document is well-formed prose) | FDE2 | `04-ddd/domain_model.md` §3 full table |
| Which terms must never be used loosely? | **FACT**: `readiness_state` (never = release status), `duplicate_candidate` (never = duplicate), `quality_status` (never cross-assigned between Batch and Supply fields), `no_side_effects` (must hold on every path including errors) | FDE4 veto on any code/prompt conflating these | `04-ddd/domain_model.md` §3 |

## 2. Bounded contexts

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What are the bounded contexts and their subdomain class? | **DECISION**: 3 Core (Batch Evidence & Release Readiness; PV Case Intake & Signal Support; Supply & Cold-Chain Option Planning), 2 Generic (Evidence & Provenance; Decision Authority & Accountability — required by methodology), 2 Supporting (Product & Substance Master; Regulatory & Knowledge Authority) | FDE2, ratified at G2 | `04-ddd/domain_model.md` §2, full canvases in `context_map.md` |
| Does every context have a named human owner and decisions it does NOT own? | **FACT**: yes for all 7 — e.g. Batch Evidence owns no decisions (readiness classification only); Batch certification itself is explicitly NOT owned (EU Qualified Person only) | FDE4 | `04-ddd/context_map.md` canvases |

## 3. Aggregates and invariants

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What are the aggregate roots? | **DECISION**: `BatchEvidenceBundle`, `PVCaseBundle`, `SupplyOptionSet`, `EvidenceItem` (shared) — one per core context plus the shared evidence primitive | FDE3 | `04-ddd/domain_model.md` §4 |
| What invariants must always hold? | **FACT/DECISION**: 10 invariants (`INV-01`…`INV-10`) registered, each tracing to a specific inject and a human owner — e.g. INV-01 (no disposition-implying `readiness_state`) traces to `ai_use_boundaries.csv`; INV-07 (no quarantined stock in supply options) traces directly to `starter/legacy_pharma.py`'s known-broken `plan_supply()` anti-pattern | FDE4 (GxP invariants), FDE5 (security invariants) | `04-ddd/domain_model.md` §4 invariant register |
| What policies govern domain events? | **FACT/DECISION**: 6 policies (`POL-01`…`POL-06`) — e.g. POL-04 (duplicate candidates always require human review, never auto-merge) directly prevents the governing plan's named STOP condition (irreversible case merge) | FDE2/FDE4 | `04-ddd/domain_model.md` §4 policy register |

## 4. Context relationships

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| How do contexts relate, and why? | **DECISION**, each defended with a one-line rationale: Product & Substance Master → **ACL** into all 3 core contexts (source systems actively disagree, INJ-008/045 — an ACL carries the disagreement forward rather than forcing false agreement); Regulatory & Knowledge Authority → **published language** (already a well-formed, gate-only contract); Evidence & Provenance → **shared kernel** (byte-identical logic, zero-divergence requirement); Decision Authority & Accountability → **published language**; Batch → Supply is the **only** direct core-to-core relationship (quality-status vocabulary ACL only) — Batch/PV and PV/Supply have no direct relationship, by design, to prevent cross-workflow authority leakage | FDE3, defended at Prompt 07 (ADR) | `04-ddd/context_map.md` full relationship defence |

## 5. Anti-corruption layers

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Where are ACLs required? | **DECISION**: Product identity ACL (RIM/ERP/regional → canonical-or-flagged reference); Knowledge-status ACL (raw content → status-gated citation); Quality-status ACL (Batch↔Supply vocabulary translation, no shared decision logic) | FDE3 | `04-ddd/domain_model.md` §7 |

## 6. Ownership and change boundaries

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Who owns each context's language and change control? | **PROVISIONAL**: business ownership is not yet assigned for the two generic contexts (Evidence & Provenance, Decision Authority & Accountability) — currently team-seat-owned (FDE3/FDE5), acceptable for Track A, insufficient for a Track B production claim | FDE1, before any G9 claim | `04-ddd/domain_model.md` §10 |

## 7. Event semantics

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What domain events must the system be aware of? | **FACT**: 8-row event-storming board (`BatchEvidenceRequested`, `EvidenceConflictDetected`, `PVCaseReceived`, `ReportingClockReconstructed`, `SupplyShortageEventOpened`, `DraftOptionSetGenerated`, `KnowledgeDocumentCited`, `AuthorizationChecked`) each with governing policy, evidence source, and failure/exception condition **left unresolved** per methodology (exceptions are carried as gaps, not fixed here) | FDE2/FDE3 | `04-ddd/context_map.md` event-storming board |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Gap | Which context owns a `product_complaints` record linking both a batch and a PV case (INJ-043) is unresolved | Could create an unowned cross-context event | FDE2 | Before Prompt 05 (Feature Specs) locks flows | Open |
| R-002 | Gap | Whether Evidence & Provenance should be shared-kernel code or three independent published-language consumers is undecided | Affects C4 container boundaries | FDE3 | Before Prompt 06 (C4) | Open |
| R-003 | Risk | Universal HITL (not yet risk-tiered) accepts Non-utilised-talent waste as a deliberate trade-off pending Measure data | Could under-deliver on the −14% lead-time target if never revisited | FDE1/FDE2 | Pilot learnings, Prompt 11 | Open |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| No context silently owns another's decision | Bounded-context canvases, "decisions NOT owned" field | Manual review at G2; later contract schema check | `04-ddd/context_map.md` | Done — all 7 canvases state decisions NOT owned |
| Every invariant traces to a case fact | Invariant register `INV-*` | Cross-check against `case/INTEGRATED_CASE.md` inject IDs | `04-ddd/domain_model.md` §4 | Done — all 10 verified |
| Every prohibited action is structurally impossible, not just policy-stated | Invariant + policy registers → future contract schema | Prohibited-action test suite (Prompt 09 build) | `submission/tests/` (not yet built) | Pending |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| — | FDE3/FDE4 (pending) | Not yet reviewed | — | — |
