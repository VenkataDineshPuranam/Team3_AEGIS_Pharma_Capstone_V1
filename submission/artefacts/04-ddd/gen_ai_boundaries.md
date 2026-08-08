# Gen AI Boundary Design — DDD (Prompt 04)

**Artifact status: `provisional`.** Designed after ubiquitous language and bounded contexts (`domain_model.md`, `context_map.md`), before any C4 boxes — per skill ordering.

## 1. Rules vs. AI reasoning

**DECISION**: every `INV-*` and `POL-*` in `domain_model.md` §4 is enforced by **deterministic code**, not model judgement. AI, if used at all, is scoped to two narrow tasks: (a) drafting a human-readable summary of already-adjudicated, already-cited evidence, and (b) proposing candidate similarity scores for PV duplicate detection (never the merge decision itself, per INV-05). AI must never decide `readiness_state`, evaluate `duplicate_candidate` confirmation, or select which `SupplyOptionSet` option is best — those remain rule-driven or explicitly deferred to the human.

This follows directly from Discovery's Analyze conclusion (`01-discovery/dmaic_lens.md` §3): the root cause is control/process fragmentation, not model reasoning quality, so the treatment is deterministic control, not a smarter model.

## 2. RAG design (from DDD artefacts, not tech fashion)

- **What is retrieved**: `knowledge/*.md` documents (via the Regulatory & Knowledge Authority context, status-gated by `knowledge_catalog.csv`), and structured evidence records (via the Evidence & Provenance context) — never raw, unfiltered source-system dumps.
- **From which artefacts/sources**: retrieval is scoped per bounded context — Batch Evidence retrieves only batch-relevant knowledge docs (e.g. `BATCH_RELEASE_EVIDENCE_POLICY.md`), PV retrieves only PV-relevant docs (e.g. `PHARMACOVIGILANCE_CASE_POLICY.md`, `PV_DUPLICATE_MANAGEMENT.md`), Supply retrieves only supply-relevant docs (e.g. `SUPPLY_ALLOCATION_ETHICS.md`, `COLD_CHAIN_ASSESSMENT.md`) — cross-context retrieval is out of scope by design (mirrors the context map's narrow cross-context relationship).
- **What is out of retrieval scope**: any document with `knowledge_catalog.status` of `untrusted` (K-998, K-999) is never retrievable as a citation source, only as a labeled example in security testing (INV-09). `RESEARCH_NOTE_UNAPPROVED.md` (draft) is retrievable but must be labeled draft in any citation, never presented as approved policy.

## 3. Agent responsibilities (if any agentic component is used)

**DECISION, consistent with the governing plan's agent-freeze rule**: no agent/model-inference feature ships before architecture review (Prompt 07) passes and the corresponding failing prohibited-action tests exist (Prompt 09/build). If an agent is used at all:

| Agent (candidate) | Task | Authority limit | Stop condition |
|---|---|---|---|
| Evidence-summarizer | Draft a citation-backed summary of an already-assembled `BatchEvidenceBundle`/`PVCaseBundle`/`SupplyOptionSet` | Read-only; may not modify evidence, may not set `readiness_state` | Any omitted material fact detected in review (INJ-071 automation-bias precedent) halts and flags for full manual review |
| Duplicate-similarity scorer | Propose a similarity score for two PV cases | Read-only; may not merge or close a case | Score alone is insufficient — `required_reviews` always populated regardless of score |

No agent has write access to any source system, by construction (no tool in the approved manifest grants write permission to a regulated record — POL-06).

## 4. HITL & decision ownership

Per bounded context (from `context_map.md` canvases):

| Context | Human owner | When human intervenes |
|---|---|---|
| Batch Evidence & Release Readiness | EU Qualified Person | Always — every response ends in human review before any certification act |
| PV Case Intake & Signal Support | Safety Physician | Always — every `duplicate_candidate`, clock conflict, and listedness determination requires confirmation |
| Supply & Cold-Chain Option Planning | Supply Governance Board | Always — every draft option requires board approval before any downstream action (which itself happens outside this system) |

HITL is not a fallback for AI failure — it is the design's permanent, non-negotiable terminal step for every workflow, independent of whether AI is used at all (directly reflects `decision_rights.csv`: `ai_authority` is `none` or `draft only` for all three).

## 5. Evidence & audit trail

Every response records: `request_id`, `workflow`, `as_of`, `authorization{user, purpose, checked_at, decision}`, `evidence[]` (each with integrity hash and `source_preserved`), `contradictions`, `gaps`, `abstentions`, `human_review`, `execution_status: "not_executed"`, `audit` — per the governing plan's shared contract spine (`AEGIS_PROJECT_PLAN_FINAL.md` §11.3), now grounded directly in the invariant register above (INV-08 requires the hash; POL-01 requires the authorization block).

## 6. Evaluation using DDD vocabulary (offline eval intent)

Domain-true success/failure cases, stated in this model's own terms (not generic ML metrics):

- **Success**: a `conflicted_evidence` batch bundle correctly surfaces INJ-023-class disagreement without picking a side; a `duplicate_candidate` pair correctly cites its similarity reason without auto-merging; a `SupplyOptionSet` correctly excludes quarantined stock (INV-07) on every option including error paths.
- **Failure**: any response that would violate INV-01 through INV-10 or POL-01 through POL-06 — these become the direct source of the prohibited-action and fail-closed test suite (Prompt 09 build phase), not a separately-invented test list.
- Full eval design (datasets, graders, thresholds) is Prompt 09/12 scope; this section only establishes that eval cases must be traceable to a named invariant or policy, not free-floating.

## Cross-reference

Domain foundation: `domain_model.md`. Context relationships: `context_map.md`. Full DMAIC cycle and waste registers: `dmaic_lens.md`, `waste_register_downtime.md`, `waste_register_ai_specific.md`.
