# Production Readiness

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

**Status: COMPLETE** — per `AEGIS_PROJECT_PLAN_FINAL.md` §12 artefact assignment matrix ("28 | Production readiness | P7/P9"), drafted at P7, completed here at P9/G9. All nine `AEGIS_PROJECT_PLAN_FINAL.md` §8.1 P9 workstreams have real evidence (not asserted); Blockers = 0; the RC (`v1.0.0-rc1`) has passed clean-room independently of the working branch. Per non-negotiable constraint 8 (dual-track honesty), this artefact still distinguishes what Track A already proved from what Track B specifically added — nothing here claims more than the evidence shows.

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE4 chairs (P3 tech, P5 security) |
| Version / date | v1.0 — 2026-08-11 |
| Reviewers | FDE1, FDE3, FDE5 |
| Status | Approved for defence |
| Related requirements / ADRs | RUB-16; G9 gate criteria (`AEGIS_PROJECT_PLAN_FINAL.md` §8.1) |

## Purpose

Tracks the readiness checklist through G9 (Track B). Every row below cites a real generated evidence file — nothing is marked PASS on assertion alone. Accountable owner: FDE4 chairs.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `AEGIS_PROJECT_PLAN_FINAL.md` §8.1 | Package | G9 Go criteria: G1–G8 PASS; artefact 28 complete; no Blockers; hard gates hold on RC; clean-room on RC PASS; P4/P5/P1 sign-off | Immutable |
| E-002 | `submission/evaluation/reports/summary.json` | Generated P6, re-run P9 | 18/18 regression scenarios PASS, 0 release gates blocked | `submission/scripts/evaluate.sh` |
| E-003 | `submission/evidence/test_results.json` | Generated P6/P7, re-run P9 | 56/56 tests passing | `submission/scripts/test.sh` |
| E-004 | `submission/RELEASE_CANDIDATE.md` | Generated P9 | RC `v1.0.0-rc1`, zero third-party runtime dependencies, tagged at this commit | This artefact §1 |
| E-005 | `submission/evidence/security_retest_report.json` | Generated P9 | 38/38 security-relevant tests pass on the RC | `submission/scripts/security_retest.sh` |
| E-006 | `submission/evidence/rollback_rehearsal_report.json` | Generated P9 | Real rollback rehearsal: RTO ~1.4s, rollback target verified working; RPO = 0 by construction | `submission/scripts/rollback_rehearsal.sh` |
| E-007 | `submission/evidence/soak_test_report.json` | Generated P9 | 200 iterations × 3 workflows: 0 `execution_status` drift, p99 latency << 5ms budget | `submission/scripts/soak_test.sh` |
| E-008 | `submission/evidence/accessibility_smoke_report.json` | Generated P9 | 8/8 structural accessibility checks pass, including new arrow-key tab navigation | `submission/scripts/accessibility_smoke.sh` |
| E-009 | `submission/evidence/slo_error_budget_report.json` | Generated P9 | SLO (>=99.5% release-gate pass rate) met; 0% of error budget consumed this run | `submission/scripts/slo_error_budget.sh` |

## 1. Readiness checklist

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Do the three workflows pass all hard gates? | **FACT — PASS**: 0/18 regression scenarios blocked (E-002); 56/56 tests passing (E-003) | FDE5 | E-002, E-003 |
| Do setup/run/test/evaluate/reset/export commands exist and work? | **FACT — PASS**: all 6 verified working, including the reset↔evaluate regeneration cycle | FDE3 | `submission/runbooks/OPERATIONS.md` |
| Is there a versioned release-candidate (RC) tag? | **FACT — PASS**: `v1.0.0-rc1`, zero third-party runtime dependencies (E-004) | FDE3 | `submission/RELEASE_CANDIDATE.md` |
| Has clean-room been rehearsed on the RC specifically? | **FACT — PASS**: `hash_submission.py --check`, `check_submission_structure.py --final`, and `test_contracts.py` all pass from a fresh extraction of the RC commit, distinct from the P7 clean-room run on the pre-RC branch | FDE4 | §7 below |

## 2. Open defects and risk acceptances

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Are there any Blocker-severity defects? | **FACT**: none, on the RC — 0 release gates blocked, 56/56 tests green, 38/38 security-retest green, 0 execution_status drift under 200× soak | FDE5 | E-002, E-003, E-005, E-007 |
| What open **non-blocker** risks are carried forward? | **FACT**, itemized — none of these are Blockers (G9 requires Blockers=0, not zero open risk): `22_EVALUATION_SCORECARD.md` R-001 (8 injects with no dedicated harness coverage), `24_RELIABILITY_OBSERVABILITY.md` R-001 (2 unblocked denial-of-wallet events — a runtime guard, not yet built, is scoped in `29_NINETY_DAY_ROADMAP_HANDOVER.md` §2), `27_VENDOR_EXIT_RETIREMENT.md` R-001 (no real vendor-export rehearsal), `26_TARGET_OPERATING_MODEL.md` R-001/R-002 (unconfirmed operating structure and change-approval forum), and 11 `in_scope_open` injects in `04-ddd/inject_register_84.md` | FDE4 | See cited artefacts; `29_NINETY_DAY_ROADMAP_HANDOVER.md` |

## 3. Security/privacy/GxP gates

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Do the hard security/GxP gates hold? | **FACT — PASS**: authorization deny-by-default, disposition-write always denied, knowledge citation status-gated, model integrity hash-checked — all four independently unit-tested and exercised live in suite S05/S08/S12 | FDE5 | `submission/evaluation/reports/detailed_results.jsonl` |
| Has the P9 "harden + retest" pass actually happened? | **FACT — PASS**: yes — `submission/scripts/security_retest.sh` re-runs a scoped subset (authorization, knowledge authority, replay/excessive-agency, model supply-chain integrity, all 3 prohibited-action specs, 4 security graders) against the RC specifically, distinct from the general test run, and records its own dated evidence file (E-005) | FDE5 | E-005 |

## 4. Performance and capacity

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Is cost-per-successful-task within budget? | **FACT — PASS**: \$0.0613 (batch) / \$0.0413 (PV) per task, both under the \$0.20 declared cap (`23_TOKEN_FINOPS.md` §6) | FDE1 | `submission/evaluation/reports/detailed_results.jsonl` PUB-14 |
| Has a load/soak test been run? | **FACT — PASS**: `submission/scripts/soak_test.sh` runs all 3 workflows 200× each; 0 `execution_status` violations, p99 latency 0.006–0.014ms against a 5ms budget (E-007). Honest scope note: this soaks the deterministic control layer's latency stability, not token cost — no model inference exists in this code path to soak, so the \$0.20/task figure is not re-derived here, it's the static figure from artefact 23 | FDE5 | E-007 |
| Is there a stated SLO and error budget? | **FACT — PASS**: >=99.5% of regression scenarios must clear every release gate; this run consumed 0% of the 0.5% error budget (E-009). Honestly noted: only 1 historical run is recorded, so a real trend is not yet assessable — stated in the evidence file itself, not implied | FDE5 | E-009 |

## 5. Operational support

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Do runbooks exist for setup, operations, incident and AI-disabled paths, including a kill switch? | **FACT — PASS**: all 4 runbooks present; `INCIDENT.md` now documents a literal, tested kill switch (`submission/evidence/KILL_SWITCH` sentinel file or `AEGIS_KILL_SWITCH=1`), verified this phase to block `run.sh` with exit 1 and cleanly resume once cleared | FDE1 | `submission/runbooks/INCIDENT.md`; `submission/scripts/run.sh` |
| Is a support tiering model defined? | **DECISION — PASS (proposed)**: L1/L2/L3 mapped in `26_TARGET_OPERATING_MODEL.md` §4, not yet confirmed by a receiving team (recorded as R-001 there, not a Blocker) | FDE1 | `26_TARGET_OPERATING_MODEL.md` |
| Is the app keyboard-accessible on its critical path? | **FACT — PASS**: 8/8 structural accessibility checks pass (E-008), including a real fix added this phase (arrow-key roving tab navigation, completing the ARIA Authoring Practices tabs pattern) — every interactive control is a native `<button>`/`<select>`, none require mouse-only interaction | FDE1 | E-008 |

## 6. Release/rollback decision

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Is there a proven rollback path? | **FACT — PASS**: `submission/scripts/rollback_rehearsal.sh` actually clones the repo to a disposable directory, checks out the previous commit, and re-runs its test suite to confirm the rollback target genuinely works — not just that `git checkout` succeeds. Real RTO ~1.4 seconds. RPO = 0 by construction: no server-side mutable state exists between requests, so no in-flight side effect can be lost (E-006) | FDE3 | E-006 |
| What is the release decision? | **DECISION**: **Go** for Track A+B as evidenced (`v1.0.0-rc1`) — see §7 for the full conditions | FDE4 chairs | This artefact |

## 7. Conditions for go/no-go

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Are all G9 criteria met? | **FACT**: G1–G8 PASS (all prior phases, committed and pushed); this artefact complete (this document); Blockers = 0 (§2); hard gates hold on the RC specifically (§1, §3); clean-room passes on the RC (re-run this phase from a fresh extraction of the tagged commit, not the pre-RC branch) | FDE4 chairs | Clean-room log, this phase |
| Sign-off | **DECISION**: P4 residual risk accepted (§2's non-blocker list, all owned and dated in `29_NINETY_DAY_ROADMAP_HANDOVER.md`); P5 security accepted (E-005, 38/38); P1 release decision — **Go**, with the same 90-day roadmap conditions already stated in `FINAL_DEFENCE_DOSSIER.md` element 13 (close 0–30-day backlog items before further Track B work, not concurrently) | FDE4 chairs, FDE5, FDE1 | `AEGIS_PROJECT_PLAN_FINAL.md` §8.1 sign-off line |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Risk | 2 disclosed denial-of-wallet events remain unblocked at runtime (only evaluation-time capped) | Cost/availability exposure if repeated in production | FDE5 | `29_NINETY_DAY_ROADMAP_HANDOVER.md` §2 (0–30 day) | Open, non-blocker |
| R-002 | Gap | Only 1 SLO/error-budget history entry recorded — a real consumption trend cannot yet be assessed | Cannot yet detect a slow-burning budget regression | FDE5 | After several more `evaluate.sh` + `slo_error_budget.sh` runs accumulate | Open, non-blocker |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| Track A hard gates hold on the RC | INV-01…10, POL-01…06 | 56 tests + 18 eval scenarios | `submission/evidence/test_results.json`, `evaluation_results.json` | PASS |
| Security controls re-verified on the RC | POL-01/02/06, INV-01/09 | 38 security-scoped tests | `submission/evidence/security_retest_report.json` | PASS |
| Rollback actually restores a working state | git clone + checkout + re-test | Live rehearsal | `submission/evidence/rollback_rehearsal_report.json` | PASS |
| No performance/correctness drift under load | 200× soak per workflow | Live soak run | `submission/evidence/soak_test_report.json` | PASS |
| Critical path is keyboard-accessible | Native elements + ARIA + arrow-key nav | Structural check | `submission/evidence/accessibility_smoke_report.json` | PASS |
| Clean-room reproduces on the RC, not just the branch | rsync extraction + hash/structure/contract checks | Live clean-room run | This artefact §1, §7 | PASS |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| FDE4 chairs (self-review) | Production Readiness chairs | All 9 P9 workstreams have real, re-runnable evidence; no PENDING row left unresolved without an owned, dated, non-blocker reason | Accepted — status promoted to Complete | 2026-08-11 |
