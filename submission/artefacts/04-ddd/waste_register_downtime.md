# DOWNTIME Waste Register — DDD stage (carried forward + refined)

Base register: `01-discovery/waste_register_downtime.md` (all 8 categories, unchanged there since Frame confirmed no new entries). This stage **updates** it with domain-model-level refinements — new understanding, not a restart.

## Refinements from domain modeling

| Code | Waste | Refinement at DDD stage | Evidence / reasoning | Treatment (now concrete, via `domain_model.md`) |
|---|---|---|---|---|
| **M** | Motion | **Sharpened root cause identified**: the `authority`/`trust` term overload (`domain_model.md` §3) is now the specific, named mechanism behind the previously-hypothesized Motion waste — reviewers would have to manually re-interpret which "authority" is meant at every step if the domain model did not disambiguate it | `domain_model.md` §3 ubiquitous-language table, `authority` row | Fields kept separate by construction: `knowledge_catalog.authority` vs `decision_rights.accountable_role` vs plain-English "a regulator" are never merged into one field |
| **N** | Non-utilised talent | **Still hypothesized, now with an explicit trade-off decision**: universal HITL (`gen_ai_boundaries.md` §4) is a deliberate provisional choice that *accepts* this waste rather than risk-tiering prematurely, since no Measure data exists yet to justify tiering safely | `04-ddd/dmaic_lens.md` §4 | Flagged as the top pilot-learning candidate (`domain_model.md` §9) — revisit once Measure data exists |
| **E** | Extra processing | **New concrete instance found**: without a shared Evidence & Provenance kernel, three contexts would each reimplement hash/authority logic independently — a domain-model-level Extra-processing risk not visible at Discovery/Frame's process-level view | `context_map.md` shared-kernel defence | Shared kernel design (`domain_model.md` §2, §4 `EvidenceItem`) eliminates this by construction |
| **T** (new sub-finding) | Transportation | **New concrete instance found**: an unscoped RAG design would retrieve across all three contexts' documents per query, effectively "transporting" irrelevant context across workflow boundaries | `gen_ai_boundaries.md` §2 | Retrieval scoped per bounded context — a PV request cannot trigger Batch-context retrieval |

All other DOWNTIME entries (D, O, W, I) from Discovery stand unchanged — no domain-model finding altered their observed/hypothesized status or evidence.
