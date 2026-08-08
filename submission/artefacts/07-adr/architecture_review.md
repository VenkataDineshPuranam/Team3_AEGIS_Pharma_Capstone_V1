# Architecture Review / Defense (Prompt 07)

## 1. Review status: `conditional`

Per the prompt's rule: under `provisional`/`hypothesis`-adjacent status, prefer `conditional` unless evidence supports `pass`. C4/DDD remain `provisional` (open SoT/language questions), so `conditional` is the honest call, not `pass`.

## 2. Defensibility checks

| Check | Result | Evidence |
|---|---|---|
| C4 map matches DDD bounded contexts and in-scope features | **Pass** | Every container in `06-c4/c4_containers.md` names its owning DDD context; every component maps to an FR-ID |
| Material trade-offs have ADRs | **Pass** | 10 ADRs cover identity, evidence, authority, AI behavior, deployment, observability — all "suggested decision themes" from the prompt are represented |
| Trust, authority, privacy, degraded-mode, prohibited writes are visible on the map | **Pass** | `06-c4/c4_context.md` (PROHIBITED edges), `boundary_and_degraded_mode.md` (all five), `10_C4_ARCHITECTURE.md` §5/§7 |
| Gen AI / HITL / rules boundaries are placed on the map | **Pass** | `06-c4/c4_components.md` — only 2 components (both optional agents) have a Model Endpoint edge; every other component is deterministic |
| Out-of-scope from PRD/Business Case is not smuggled into containers | **Pass** | No container performs a prohibited action (release/reject/reprocess/recall/final-PV/allocate/ship); cross-checked against `01_BUSINESS_CASE.md` §5 scope and exclusions |

## 3. Open issues

| Issue | Blocker or residual? |
|---|---|
| 10 ADRs are `proposed`, none `accepted` — no validation evidence exists yet (nothing is built) | **Residual** — expected at this phase, not a blocker to proceeding to Prompt 08 |
| 19 `in_scope_open` injects from `04-ddd/inject_register_84.md` are not yet individually reflected in C4/ADR (1 more, INJ-069, was closed incidentally by the degraded-mode design) | **Residual** — explicitly carried forward, tracked, not hidden |
| ADR-008 (single-process deployment) has an explicit, unresolved Track B revisit trigger | **Residual** — correctly deferred, not a Track A blocker |
| 2 optional AI agents are the only architecture elements without a hard FR requirement | **Blocker-watch** — flagged in `06-c4/waste_register_downtime.md` as a Prompt 09 reconciliation item; not yet a blocker but must be checked before build |

**No true blocker identified** — all open issues are either expected-at-this-phase residuals or explicitly flagged watch items with a named owner and trigger.

## 4. Go-forward decision

**Proceed to Prompt 08 (Technical Design), conditionally**, with these named conditions carried forward:
1. The 2 optional-agent scope-creep watch item must be re-checked at Prompt 09 reconciliation before build (Prompt 11).
2. ADR-008's Track B trigger must be re-evaluated explicitly if/when Track B is pursued, not silently forgotten.
3. The 19 remaining `in_scope_open` injects should be prioritized for closure at Prompt 08 (Technical Design) work before the defence (G8).

Per the prompt's rule, `conditional` with named conditions is a valid go-forward — this review does not loop back to Prompt 06/07.
