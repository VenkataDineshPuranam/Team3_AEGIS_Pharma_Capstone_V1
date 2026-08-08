# DOWNTIME Waste Register — C4 stage (carried forward + refined)

Base register: `04-ddd/waste_register_downtime.md`. This stage updates it with architecture-level findings (per `dmaic_lens.md` §3–4 above), not a restart.

## Refinements from C4

| Code | Waste | Refinement at C4 stage | Treatment (now architectural) |
|---|---|---|---|
| **T** | Transportation | Confirmed contained: every workflow container's fan-out is fixed at 4 shared containers (`c4_containers.md`), no ad-hoc point-to-point integrations | Architecturally closed — any deviation is now a visible diagram change, reviewable at ADR |
| **W** | Waiting | New concrete control: Model Endpoint edges are explicitly non-blocking/optional (`boundary_and_degraded_mode.md`) — this is the architectural enforcement of the Discovery-stage Waiting concern | Closed by design; Control monitor needed to verify it stays non-blocking (`dmaic_lens.md` §5) |
| **E** | Extra processing | Confirmed contained: Evidence-Resolver shared kernel means no container reimplements hash/authority logic | Architecturally closed |
| **O** | Overproduction | New finding: the 2 optional AI agents (Summarizer, Similarity) are the only architecture elements not traceable to the minimum governed workflow — flagged, not removed, since they were deliberately scoped as optional in DDD | Watch item for Prompt 09 reconciliation — confirm they remain genuinely optional in build |

All other entries (D, N, I, M) unchanged from DDD stage — no C4-level finding altered them.
