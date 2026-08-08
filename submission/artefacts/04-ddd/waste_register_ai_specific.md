# AI-Specific Waste Register — DDD stage (carried forward + refined)

Base register: `01-discovery/waste_register_ai_specific.md` (all 8 categories). This stage **updates** it with domain-model-level treatment, now that bounded contexts and Gen AI boundaries exist.

## Refinements from domain modeling

| Waste | Refinement at DDD stage | Treatment (now concrete) |
|---|---|---|
| **Retrieval** | Domain model converts the INJ-065 poisoned-document risk from a general principle into a specific, testable gate: `knowledge_catalog.status` check before any citation (POL-02, INV-09), scoped per bounded context | `gen_ai_boundaries.md` §2 — untrusted documents (K-998/K-999) are structurally unretrievable as citation sources |
| **Model** | Confirmed: no invariant or policy in `domain_model.md` §4 depends on model judgement — every one is a deterministic rule. This directly supports Discovery's closing interpretation that model accuracy is not the dominant bottleneck | `gen_ai_boundaries.md` §1 — AI scoped to drafting/scoring only, never deciding |
| **Human-review** | The INJ-071 automation-bias risk is now addressed structurally: the Evidence-summarizer agent's stop condition is explicitly "any omitted material fact detected in review halts and flags for full manual review" — not a general awareness note | `gen_ai_boundaries.md` §3 agent table |
| **Context** | Retrieval scoping per bounded context (see DOWNTIME register Transportation refinement) also bounds Context waste — an agent cannot accumulate irrelevant cross-workflow context | `gen_ai_boundaries.md` §2 |
| **Integration** | POL-06 (tool-manifest gating) now has a concrete home — Evidence & Provenance / cross-cutting context, directly citing the already-present poisoned manifest (`data/tool_manifest_poisoned.json`) | `domain_model.md` §4 policy register |

**Token, Evaluation, Observability** wastes are unchanged from Discovery — no domain-level finding altered them; they remain hypothesized, structural gaps (no evaluation harness, no observability design) to be addressed at C4 (06) and later stages, not at the domain-modeling level.

## Confirmed at DDD

The domain model's central design choice — every invariant is a deterministic rule, never a model judgement — is the direct architectural consequence of Discovery's AI-specific waste finding that control/integration failures, not model capability, are the dominant risk. This closes the loop: Discover found the risk pattern, DDD designed the boundary that prevents it.
