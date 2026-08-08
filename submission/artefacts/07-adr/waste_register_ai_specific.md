# AI-Specific Waste Register — ADR stage (carried forward, closed out)

Base register: `06-c4/waste_register_ai_specific.md`. Closed out here, ahead of Prompt 09 reconciliation.

| Waste | Closure status | Treatment ADR |
|---|---|---|
| Token | **Open** — deferred to Prompt 08 (Technical Design) where NFR-04's actual budget is specified | — (correctly not architecture-level) |
| Retrieval | Closed by design | ADR-007 (live status check) |
| Model | Closed by design | ADR-003 (in-process, narrow scope, no runtime dependency added) |
| Human-review | **Open, deliberately** — same universal-HITL trade-off as the DOWNTIME register's N category | — |
| Evaluation | Closed by design | ADR-004, ADR-010 (contract validation + package fixture reuse) |
| Integration | Closed by design | ADR-003 (no new tool-calling runtime), POL-06 already gates tool manifests |
| Context | Closed by design | Retrieval scoping (DDD) + ADR-007's per-citation check together bound context surface |
| Observability | Closed by design | ADR-005 (hash-chained audit), ADR-009 (explicit health checks) |

**6 of 8 closed at architecture level; 2 (Token budget specifics, universal-HITL Human-review trade-off) correctly deferred** — Token to Prompt 08 (needs actual NFR numbers), Human-review to a future Measure-driven pilot decision, consistent with not fabricating a resolution ahead of evidence.

## Full-DMAIC-stage set complete

This closes the 01→02→04→06→07 full-DMAIC chain. Prompt 09 (Lean & DMAIC) now reconciles this closed-out register set against the three thin-lens stages (03, 05, 08 — none yet executed) into the single governing plan and register set for Prompts 10–13.
