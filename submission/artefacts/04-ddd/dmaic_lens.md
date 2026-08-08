# DMAIC Lens — DDD (FULL cycle, per updated `prompts/04_ddd.md`)

DDD is a designated full-DMAIC stage (with Discovery/01, Frame/02, C4/06, ADR/07). Builds on `01-discovery/dmaic_lens.md` and `02-frame/dmaic_lens.md` — carried forward, not restarted.

## 1. Define

Restated at domain-model granularity: which bounded-context boundaries exist specifically to contain a named waste or defect risk? Answer — **every** boundary in `context_map.md` does: the Product & Substance Master ACL exists to contain identity-collision Defects (INJ-008/045); the Regulatory & Knowledge Authority published-language relationship exists to contain Retrieval waste from untrusted documents (INJ-065); the Evidence & Provenance shared kernel exists to contain Extra-processing waste from three independently-reimplemented hash/authority checks.

## 2. Measure

Which domain invariants are (or should be) instrumented so a violation is measurable, not just theoretically prevented? Every `INV-*` in `domain_model.md` §4 is designed to be a **testable** assertion (e.g. INV-01 = "readiness_state never equals a disposition value" is a schema-enum check, not a narrative claim). This converts Discovery's Unknown baselines into a concrete, buildable measurement plan: once `submission/src` exists, each INV-*/POL-* becomes a unit test, and the pass/fail rate becomes the first real Measure data this engagement will have (currently still Unknown — no code exists yet).

## 3. Analyze

Root cause, at the domain level, **confirms and sharpens** Discovery/Frame's conclusion:
- Which invariants/rules remove **Defects** vs. leaving them to the model? INV-02 (no silent unit conversion) and INV-03 (surface lab-result disagreement) directly remove the two concrete Defect incidents already in evidence (INJ-024, INJ-023) — neither requires a model at all, both are deterministic field checks.
- Where does **HITL** prevent human-review waste while still catching high-risk cases? `gen_ai_boundaries.md` §4 makes HITL universal (every response ends in human review) rather than risk-tiered — this is a **deliberate provisional choice**, flagged as a candidate Improve-stage refinement once Measure data exists on which response classes are consistently "clean" (see Improve below).
- RAG/agent boundaries: risk of retrieval/token/context waste if unbounded? Contained by scoping retrieval per bounded context (`gen_ai_boundaries.md` §2) — a PV request cannot trigger a Batch-context document retrieval, bounding the token/context surface by construction.
- Domain ambiguities causing Extra processing/Motion if left unresolved? The `authority`/`trust` term overload (`domain_model.md` §3) is the leading candidate — if not disambiguated in code (separate fields, never conflated), it would force manual re-interpretation at every review step, directly reproducing the Motion waste Discovery identified.

## 4. Improve

The domain model itself is the Improve artifact (per stage design). Specific modeling choices and the root cause each treats:

| Modeling choice | Root cause treated |
|---|---|
| Product & Substance Master as an ACL (not shared kernel) | Identity collision Defects (INJ-008/045) — surfaces rather than forces false agreement |
| Evidence & Provenance as a shared kernel | Extra-processing waste from divergent hash/authority logic across 3 contexts |
| Universal HITL (not yet risk-tiered) | Provisional acceptance of Non-utilised-talent waste risk, traded off against Defect/prohibited-action risk until Measure data justifies tiering |
| Narrow Batch→Supply-only cross-context link | Prevents authority leakage between workflows (a *new* waste/risk this stage explicitly designed against, not present in Discovery's register) |

**Explicitly deferred, not rejected**: risk-tiered review (routing "clean" evidence faster) — flagged in `domain_model.md` §9 pilot notes as the top candidate pilot learning, not committed now because no Measure data exists to justify which cases are safely "clean."

## 5. Control

Which domain invariants need a runtime check/monitor so a violation is caught, not just documented?

- **INV-01, INV-06** (prohibited-action boundaries) — highest priority for a runtime monitor, not just a build-time test, since these are the hard-gate invariants (governing plan §3.4 STOP conditions).
- **INV-08, INV-09** (integrity hash, document-trust gate) — runtime check on every retrieval/citation, not sampled.
- **POL-01** (stale-authorization deny) — runtime check at execution time specifically, per the INJ-067 precedent (a build-time-only check would miss the cache-staleness failure mode).

Ownership: still provisional (`domain_model.md` §10) — FDE3 (build) / FDE5 (security) jointly, pending a named business owner.

## Cross-reference

Full domain detail: `domain_model.md`, `context_map.md`, `gen_ai_boundaries.md`. Waste registers: `waste_register_downtime.md`, `waste_register_ai_specific.md` (this stage).
