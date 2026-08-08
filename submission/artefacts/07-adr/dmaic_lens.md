# DMAIC Lens — ADR (FULL cycle, per updated `prompts/07_adrs.md`)

ADR is the last of the five designated full-DMAIC stages (Discovery/01, Frame/02, DDD/04, C4/06, ADR/07). Builds on all four prior full lenses.

## 1. Define

Restated at decision granularity: which ADR exists specifically to resolve a named waste or risk trade-off? All 10 — each ADR's Context/Drivers section names the specific waste or risk it resolves (e.g. ADR-001 → Extra-processing; ADR-006 → the INJ-067 security incident; ADR-005 → Observability/audit-integrity risk).

## 2. Measure

Metric and threshold per ADR with a measurable consequence:

| ADR | Metric | Threshold |
|---|---|---|
| ADR-001 | Hash/authority logic implementations | Exactly 1 (not 3) |
| ADR-004 | Schema-violating responses reaching a human reviewer | 0 |
| ADR-005 | Audit-chain tamper-detection test | Must fail (detect) on any past-entry modification |
| ADR-006 | Stale-authorization test (INJ-067 scenario) | Must deny, 100% of runs |
| ADR-007 | Untrusted-document citation test | Must exclude, 100% of runs |
| ADR-009 | Authorization Service failure → system behavior | Must deny system-wide, never fail-open |

Six of ten ADRs have a stated, testable threshold — the remaining four (002, 003, 008, 010) are structural/deployment decisions without a single pass/fail metric, appropriately validated by design review instead (noted in each ADR's Validation field).

## 3. Analyze

- Which ADRs explicitly prevent a named waste? ADR-001 (Extra-processing), ADR-007 (Retrieval waste from untrusted citation), ADR-010 (Overproduction — avoids inventing a redundant fixture format).
- Which decisions risk new Waiting/Human-review/Token waste? ADR-006 and ADR-007's live-check-over-cache choices both trade a small latency cost for security — flagged, accepted, with explicit revisit triggers if that trade-off proves wrong at scale.
- Architecture review open issues that are really waste risks? The 2-optional-agent scope-creep watch item (`architecture_review.md` §3) is exactly this — an unmanaged agent-scope expansion would reintroduce Model/Token waste the domain model was designed to avoid.

## 4. Improve

The ADR set itself is the Improve artifact (per stage design). Confirmation check: every `accepted`-track ADR (all 10, currently `proposed`) maps to a specific waste or root cause from Prompts 01/02/04/06 — verified in `decision_index.md`'s C4/DDD-element mapping column. No ADR was written without a traceable root cause; none flagged for rejection.

## 5. Control

Validation and revisit triggers per ADR are the Control mechanism (see each ADR's fields in `adrs.md`) — this is where Control becomes concrete and enforceable, per the stage's design intent. Summary: 6 ADRs have automated-test-style validation (001, 004, 005, 006, 007, 009); 2 have explicit Track B triggers (005 implicitly via query needs, 008 explicitly); all 10 have a named revisit condition, none silently "permanent."

Feeds Prompt 09's structural-reopen gate directly: **no structural reopen is needed yet** (nothing has been built to reopen), but the gate mechanism itself (`structural_reopen.md`, produced at Prompt 09) will use this ADR set as its baseline.

## Cross-reference

Full ADR detail: `adrs.md`, `decision_index.md`, `architecture_review.md`. Waste registers: `waste_register_downtime.md`, `waste_register_ai_specific.md` (this stage, closed out).
