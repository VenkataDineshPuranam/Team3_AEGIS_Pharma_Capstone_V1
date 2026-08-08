# DMAIC Lens — C4 (FULL cycle, per updated `prompts/06_c4.md`)

C4 is a designated full-DMAIC stage (with Discovery/01, Frame/02, DDD/04, ADR/07). Builds on all three prior full lenses — carried forward, not restarted.

## 1. Define

Restated at architecture granularity: which container/component boundary exists specifically to eliminate a named waste? Answer, per container (full table in `c4_containers.md`): the Evidence-Resolver container exists to eliminate Extra-processing waste from three divergent hash/authority implementations; the Knowledge Authority Gateway exists to eliminate Retrieval waste from untrusted-document citation; the three workflow containers exist to eliminate Waiting/Motion waste from manual multi-system evidence assembly.

## 2. Measure

Architectural metrics as measurable proxies:

| Metric | Proxy for | Current (design-time) | Target |
|---|---|---|---|
| Hop count per request (App → Resolver → workflow container → response) | Transportation waste | 3 hops (fixed by design) | ≤3 — no additional intermediary containers added without justification |
| Sync-call depth to Model Endpoint | Waiting waste from AI dependency | 0 for Supply, ≤1 for Batch/PV (optional call) | Never on the critical path for a response — always optional/parallel |
| Fan-out per workflow container (number of downstream containers called) | Integration waste | 4 (Resolver, ACL, Knowledge Gateway, AuthZ) per workflow container, ×3 = 12 total edges | Held constant — no workflow container should need more than these 4 |

All figures above are **design-time estimates from the diagram**, not measured runtime data — `submission/src` does not exist yet. This is itself consistent with Discovery's Measure-first discipline: the target is stated before the system is built, so it can be checked once built, not adjusted after the fact.

## 3. Analyze

- Does the map reduce Transportation/Integration waste? **Yes** — every workflow container calls the same 4 shared containers (Resolver, ACL, Knowledge Gateway, AuthZ) rather than reimplementing equivalent logic; this is the direct architectural realization of the DDD-stage Improve decision (`04-ddd/dmaic_lens.md` §4).
- Where could containers create Waiting? The Model Endpoint edge, if placed on the synchronous critical path, would reintroduce Waiting waste — this is why `c4_containers.md` and `boundary_and_degraded_mode.md` both state the endpoint must be optional/non-blocking, not merely "fast."
- Risk of Observability waste? The Audit/Evidence Store is a single append-only container — if it has no owner or query interface, findings would be logged but unusable (Observability waste in a new form: logs exist but no one reviews them). ADR candidate #5 addresses this directly.
- Overproduction vs. minimum governed workflow? The 9-container map is checked against `04-ddd/domain_model.md` §6's minimum governed workflow (5 steps) — no container was added that isn't traceable to one of those 5 steps or a named cross-cutting context. The optional Summarizer/Similarity agents are the only "extra" components, and both are explicitly optional, not required for the minimum governed workflow to function.

## 4. Improve

The architecture is the Improve artifact. Per-container waste removed and trade-off accepted:

| Container | Waste removed | Trade-off accepted (→ ADR) |
|---|---|---|
| Evidence-Resolver | Extra-processing (3x divergent logic) | Single point of failure for hash/authority logic — mitigated by it being pure, stateless, easily tested code (ADR #1) |
| Knowledge Authority Gateway | Retrieval waste (untrusted citation) | Added latency for per-citation status check vs. a cached/synced catalog (ADR #7) |
| Authorization Service (execution-time check) | Prevents the INJ-067 stale-cache failure mode | Slightly higher latency per request than a cached check would give (accepted — security over speed, per INV/POL priority) |

## 5. Control

Which container/component needs a health/SLO check?

- **Authorization Service** — highest priority; a silent failure here would fail-open (the opposite of POL-01's intent) if not actively monitored.
- **Audit/Evidence Store** — must be monitored for write failures; an audit gap (INJ-029 precedent) must be detectable, not just theoretically prevented.
- **Knowledge Authority Gateway** — staleness of the status check itself needs a monitor (a stale "approved" status is as dangerous as no check at all).

Feeds `boundary_and_degraded_mode.md`'s degraded-mode design directly — Control and degraded-mode are the same design surface viewed from two angles.

## Cross-reference

Full C4 detail: `c4_context.md`, `c4_containers.md`, `c4_components.md`, `boundary_and_degraded_mode.md`, `adr_candidates.md`. Waste registers: `waste_register_downtime.md`, `waste_register_ai_specific.md` (this stage).
