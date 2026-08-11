# 90-Day Roadmap and Handover

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE1 (Product) |
| Version / date | v1.0 — 2026-08-11 |
| Reviewers | FDE3, FDE4, FDE5 |
| Status | Approved for defence |
| Related requirements / ADRs | RUB-16; consolidates every open R-item from artefacts 22/24/26/27/28 |

## Purpose

Sequences the real open items already recorded across P6/P7 artefacts into a 0–30/31–60/61–90 day plan, and states what a receiving team needs to take this over. Accountable owner: FDE1. No new gap is invented here — every backlog item below cites the artefact that first recorded it.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `submission/artefacts/22_EVALUATION_SCORECARD.md` R-001 | Generated P6 | 8 injects with no dedicated harness coverage (D07/D13/D05 items) | — |
| E-002 | `submission/artefacts/24_RELIABILITY_OBSERVABILITY.md` R-001, R-002 | Generated P6 | 2 unblocked denial-of-wallet events; `DT-2` outage still open past any tested horizon | — |
| E-003 | `submission/artefacts/25_INCIDENT_RECOVERY.md` R-001, R-002 | Generated P6 | No named regulatory-notification tree; `DT-2` unresolved | — |
| E-004 | `submission/artefacts/26_TARGET_OPERATING_MODEL.md` R-001, R-002 | Generated P7 | Unconfirmed operating structure; no named model-change-approval forum | — |
| E-005 | `submission/artefacts/27_VENDOR_EXIT_RETIREMENT.md` R-001, R-002 | Generated P7 | No real vendor-export rehearsal; single-vendor concentration | — |
| E-006 | `submission/artefacts/28_PRODUCTION_READINESS.md` §1/§4/§6 PENDING rows | Generated P7 | RC tag/packaging, load/soak test, backup/restore/rollback — all explicit P9 scope | — |
| E-007 | `04-ddd/inject_register_84.md` "Coverage summary" | Generated P2, updated P6 | 12 `in_scope_open` injects (INJ-026/030/034/046/047/049/050/052/053/057/083/084) | — |

## 1. Prioritized backlog

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is P0 (do first)? | **DECISION**: close the 2 unblocked denial-of-wallet events (E-002) with a runtime guard — highest severity because it's a live, already-occurring, already-disclosed gap, not a hypothetical | FDE5 | `data/security_events.csv` |
| What is P1? | **DECISION**: instantiate the regulatory-notification decision tree (E-003) — currently a named-but-unfilled gap in an incident path that will eventually fire for real | FDE4 | `25_INCIDENT_RECOVERY.md` R-001 |
| What is P2? | **DECISION**: treat the 12 `in_scope_open` injects (E-007) as the P7-carried backlog the register already promised — D05 (change-control/shared-account, 3 items), D07 (regulatory/eCTD, 4 items), D08 (serialization/counterfeit/customs, 3 items), D13 (vendor exit/retirement, 2 items) | FDE2/FDE4 | `04-ddd/inject_register_84.md` |

## 2. 0–30 day actions

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What ships in the first 30 days? | **DECISION**: (1) runtime denial-of-wallet guard (P0 above); (2) named regulatory-notification contacts/timeline (P1 above); (3) confirm the operating structure proposal (`26_TARGET_OPERATING_MODEL.md` R-001) with the actual receiving team, not just propose it | FDE1 | Sprint plan (not yet created — first 30-day deliverable) |

## 3. 31–60 day actions

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What ships in days 31–60? | **DECISION**: close the D05/D08 in-scope-open injects (6 of the 12, E-007) — these touch already-built bounded contexts (data integrity, supply) so extend existing services rather than adding new ones; rehearse a real `AIVENDOR-X` export (`27_VENDOR_EXIT_RETIREMENT.md` R-001) | FDE2/FDE3 | Updated `04-ddd/inject_register_84.md` count |

## 4. 61–90 day actions

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What ships in days 61–90? | **DECISION**: close the remaining D07/D13 injects (6 of the 12, E-007) — these are the ones with no existing workflow to extend (regulatory/eCTD, vendor exit/retirement), so budget more design time per item; begin Track B (P9) scoping if a production-ready claim is commissioned (E-006) | FDE4/FDE1 | Updated register; P9 kickoff decision |

## 5. Dependencies and owners

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What blocks the P9 track specifically? | **FACT**: G8 PASS is the hard entry criterion (`AEGIS_PROJECT_PLAN_FINAL.md` §8, P9 row: "Entry: G8 (or conditional-go)") — Track B cannot start before Track A's defence (P8) concludes | FDE1 | `AEGIS_PROJECT_PLAN_FINAL.md` §8 |
| Who owns the model-change-approval forum decision (`26_TARGET_OPERATING_MODEL.md` R-002)? | **DECISION**: FDE1, due before any generative-assist agent (`gen_ai_boundaries.md` §1) is built — this is a hard prerequisite, not a nice-to-have | FDE1 | `26_TARGET_OPERATING_MODEL.md` |

## 6. Handover inventory

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What does a receiving team get? | **FACT**: 29 numbered artefacts, `submission/src` (3 workflows + 5 services), `submission/tests` (35 specs), `submission/evaluation` (12-suite harness, 9 graders, reports), `submission/app` (offline demonstrator), `submission/runbooks` (4), `submission/scripts` (6), `submission/evidence` (manifest, hashes, test/eval results) — all reproducible via `submission/scripts/setup.sh` → `test.sh` → `evaluate.sh` on a clean machine | FDE1 | `submission/` tree; this phase's clean-room rehearsal |
| What does the receiving team need to read first? | **DECISION**: `submission/runbooks/SETUP.md`, then this artefact's backlog (§1–4), then `28_PRODUCTION_READINESS.md` for the Track A/B boundary | FDE1 | — |

## 7. Success and stop criteria

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What does success look like at day 90? | **DECISION**: inject register at 84/84 addressed-or-explicitly-out-of-scope (0 remaining `in_scope_open`, currently 12); denial-of-wallet runtime guard live; regulatory-notification tree named; P9 either completed or explicitly deferred with a stated reason, never silently dropped | FDE1 | Updated `04-ddd/inject_register_84.md`; updated `28_PRODUCTION_READINESS.md` |
| What triggers a stop/pivot on this backlog? | **DECISION**: if the receiving team's actual operating structure diverges materially from `26_TARGET_OPERATING_MODEL.md`'s proposal (R-001), replan §2–4 around the real structure rather than forcing the proposed one | FDE1 | — |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Assumption | The 0–30/31–60/61–90 day sequencing assumes the same 5-person FDE structure continues into operations — not confirmed (same root cause as `26_TARGET_OPERATING_MODEL.md` R-001) | Backlog owners in §2–4 may not match the real receiving team | FDE1 | Day 0 of handover | Open |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| Every backlog item traces to a real, already-recorded gap | Artefacts 22/24/25/26/27/28 R-items | Cross-reference | Evidence register above | Confirmed — no new gap invented in this artefact |
| Handover package is reproducible on a clean machine | `submission/scripts/setup.sh` → `test.sh` | Clean-room rehearsal (P7) | `submission/runbooks/SETUP.md` | PASS |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| FDE1 (self-review) | Product | Backlog consolidates existing R-items rather than inventing new ones | Accepted | 2026-08-11 |
