# AI-Specific Waste Register — C4 stage (carried forward + refined)

Base register: `04-ddd/waste_register_ai_specific.md`. Updated with architecture-level findings.

## Refinements from C4

| Waste | Refinement at C4 stage | Treatment (now architectural) |
|---|---|---|
| **Integration** | POL-06 (tool-manifest gating) now has an architectural home: the Authorization Service component gates every tool/agent call, not just a documented policy | `c4_containers.md`; ADR candidate #3 |
| **Observability** | New concrete risk found: an Audit/Evidence Store with no query interface or owner would silently accumulate unreviewed logs — exactly the Observability-waste pattern flagged at Discovery, now visible as a specific container risk | ADR candidate #5; `dmaic_lens.md` §5 Control |
| **Context** | Confirmed contained: retrieval/context scoping per bounded context (DDD finding) maps directly to the Knowledge Authority Gateway being called only by its owning workflow container, never shared context across containers | `c4_containers.md` |
| **Token** | No new finding — still deferred to Prompt 08 (Technical Design) where actual token/context budgets are specified as NFR-level contract terms | `09_REQUIREMENTS_TRACEABILITY.md` NFR-04 |
| **Evaluation** | New finding: the Contract Validator container gives evaluation a concrete architectural home (schema conformance is now testable at the component level, not just a future aspiration) | `c4_components.md`; `evaluation/contracts/*.schema.json` already exist and match the domain model exactly (verified: `batch_response.schema.json`'s `readiness_state` enum is identical to INV-01) |

**Model, Human-review** wastes unchanged from DDD stage.

## Confirmed at C4

Cross-checking `evaluation/contracts/batch_response.schema.json` and `evidence_item.schema.json` against `04-ddd/domain_model.md`'s invariant register found **zero contradictions** — the package's own pre-existing contracts already encode INV-01 (`readiness_state` enum), INV-06 (`execution_status: const "not_executed"`), and INV-08 (`integrity.sha256` pattern, `source_preserved: const true`). This is strong evidence the domain model built in Phase 2 is correctly grounded, not free-floating theory.
