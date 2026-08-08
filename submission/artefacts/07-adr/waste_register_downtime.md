# DOWNTIME Waste Register — ADR stage (carried forward, closed out)

Base register: `06-c4/waste_register_downtime.md`. This is the final full-DMAIC stage in the 01/02/04/06/07 set — the register is **closed out** here (each entry given a final treatment decision), not merely refined, ahead of Prompt 09's cross-stage reconciliation.

## Closure status, all 8 categories

| Code | Waste | Closure status | Treatment ADR |
|---|---|---|---|
| D | Defects | Closed by design | ADR-001 (identity), ADR-004 (schema validation) |
| O | Overproduction | Closed by design (2 optional agents flagged, not removed — watch item) | ADR-003, ADR-010 |
| W | Waiting | Closed by design | ADR-003 (non-blocking agents), ADR-006 (accepted latency trade-off) |
| N | Non-utilised talent | **Open, deliberately** | No ADR yet — universal HITL remains a DDD-stage provisional trade-off; correctly not force-closed at architecture stage without Measure data |
| T | Transportation | Closed by design | ADR-001, ADR-008 (single-process topology) |
| I | Inventory | Not separately treated by an ADR — carried as a domain-level concern (INV-03/POL-03 contradiction surfacing already addresses the backlog/false-closure pattern) | — |
| M | Motion | Closed by design | Term-overload disambiguation from DDD stands; no new architecture-level Motion risk found |
| E | Extra processing | Closed by design | ADR-001 (shared kernel) |

**6 of 8 categories have a concrete architecture-level closure via ADR; 2 (N, I) are correctly left open/domain-level**, since forcing an architectural "fix" without Measure data would itself violate the Measure-first discipline carried from Discovery.
