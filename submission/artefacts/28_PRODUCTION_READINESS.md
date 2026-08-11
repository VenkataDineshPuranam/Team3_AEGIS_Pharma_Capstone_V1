# Production Readiness

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

**Status: DRAFT** — per `AEGIS_PROJECT_PLAN_FINAL.md` §12 artefact assignment matrix ("28 | Production readiness | P7/P9"), this artefact is drafted at P7 and only completed at P9/G9. Per non-negotiable constraint 8 (dual-track honesty): **this submission has completed Track A (G1–G7) only. It is defence-ready, not production-ready.** A "production-ready" claim requires Track B (P9, +16–24h, not yet run).

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE4 chairs (P3 tech, P5 security) |
| Version / date | v0.1 draft — 2026-08-11 |
| Reviewers | FDE1, FDE3, FDE5 |
| Status | Draft — completes at P9/G9 |
| Related requirements / ADRs | RUB-16; G9 gate criteria (`AEGIS_PROJECT_PLAN_FINAL.md` §8.1) |

## Purpose

Tracks the readiness checklist toward G9 (Track B). At P7, states current status honestly per item — PASS where Track A evidence already supports it, PENDING where it is explicitly a P9 workstream, never claimed PASS without evidence. Accountable owner: FDE4 chairs.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `AEGIS_PROJECT_PLAN_FINAL.md` §8.1 | Package | G9 Go criteria: G1–G8 PASS; artefact 28 complete; no Blockers; hard gates hold on RC; clean-room on RC PASS; P4/P5/P1 sign-off | Immutable |
| E-002 | `submission/evaluation/reports/summary.json` | Generated P6 | 18/18 regression scenarios PASS, 0 release gates blocked | `submission/scripts/evaluate.sh` |
| E-003 | `submission/evidence/test_results.json` | Generated P6/P7 | 56/56 tests passing | `submission/scripts/test.sh` |
| E-004 | `submission/scripts/`, `submission/runbooks/` | Generated P7 | setup/run/test/evaluate/reset/export all present and independently verified this phase | This artefact §1 |

## 1. Readiness checklist

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Do the three workflows pass all hard gates? | **FACT — PASS (Track A)**: 0/18 regression scenarios blocked (E-002); 56/56 tests passing (E-003) | FDE5 | E-002, E-003 |
| Do setup/run/test/evaluate/reset/export commands exist and work? | **FACT — PASS (Track A)**: all 6 verified working this phase (`submission/scripts/*.sh`), including the reset↔evaluate regeneration cycle | FDE3 | E-004 |
| Is there a versioned release-candidate (RC) tag? | **PENDING (Track B / P9)**: no RC packaging/versioning exists yet — this is explicitly a P9 workstream ("App packaging & config", `AEGIS_PROJECT_PLAN_FINAL.md` §8.1) | FDE3 | Not yet started |
| Has clean-room been rehearsed on an RC? | **PENDING (Track B / P9)**: clean-room was rehearsed at P7 on the current branch (§ below), not on a tagged RC — G9 requires repeating it on RC specifically | FDE4 | `AEGIS_PROJECT_PLAN_FINAL.md` §18 |

## 2. Open defects and risk acceptances

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Are there any Blocker-severity defects? | **FACT**: none identified against the current Track A scope (0 release gates blocked, 56/56 tests green) | FDE5 | E-002, E-003 |
| What open risks are carried into P9? | **FACT**, itemized: `22_EVALUATION_SCORECARD.md` R-001 (8 injects with no dedicated harness coverage), `24_RELIABILITY_OBSERVABILITY.md` R-001 (2 unblocked denial-of-wallet events), `27_VENDOR_EXIT_RETIREMENT.md` R-001 (no real vendor-export rehearsal), `26_TARGET_OPERATING_MODEL.md` R-001/R-002 (unconfirmed operating structure and change-approval forum) | FDE4 | See cited artefacts |

## 3. Security/privacy/GxP gates

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Do the hard security/GxP gates hold? | **FACT — PASS (Track A)**: authorization deny-by-default, disposition-write always denied, knowledge citation status-gated, model integrity hash-checked — all four independently unit-tested and exercised live in suite S05/S08/S12 | FDE5 | `submission/evaluation/reports/detailed_results.jsonl` |
| Is a "P9 harden + retest" pass still required? | **FACT**: yes, explicitly — `AEGIS_PROJECT_PLAN_FINAL.md` §8.1 lists "Security harden + retest" as its own P9 workstream distinct from the P4–P6 controls already built; this artefact does not claim that retest has happened | FDE5 | E-001 |

## 4. Performance and capacity

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Is cost-per-successful-task within budget? | **FACT — PASS (Track A)**: \$0.0613 (batch) / \$0.0413 (PV) per task, both under the \$0.20 declared cap (`23_TOKEN_FINOPS.md` §6) | FDE1 | `submission/evaluation/reports/detailed_results.jsonl` PUB-14 |
| Has a load/soak test been run? | **PENDING (Track B / P9)**: "Performance/budget soak" is an explicit P9 workstream (§8.1) — not run at P7; this build's "performance" evidence to date is structural (gate-block rate), not load-tested | FDE5 | E-001 |

## 5. Operational support

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Do runbooks exist for setup, operations, incident and AI-disabled paths? | **FACT — PASS (Track A)**: all 4 written and cross-referenced this phase (`submission/runbooks/`), each grounded in real disclosed evidence, not generic boilerplate | FDE1 | `submission/runbooks/{SETUP,OPERATIONS,INCIDENT,AI_DISABLED}.md` |
| Is a support tiering model defined? | **DECISION — PASS (Track A, proposed)**: L1/L2/L3 mapped in `26_TARGET_OPERATING_MODEL.md` §4, not yet confirmed by a receiving team | FDE1 | `26_TARGET_OPERATING_MODEL.md` |

## 6. Release/rollback decision

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Is there a rollback path if a release regresses? | **PENDING (Track B / P9)**: "Backup/restore + rollback" is an explicit P9 workstream (§8.1) requiring RTO/RPO evidence not yet produced | FDE3 | E-001 |
| What is the release decision at end of P7? | **DECISION**: **conditional-go to P8 (Defence)** — Track A hard gates hold, evidence is complete and reproducible, but this is explicitly not a production-release decision (constraint 8); P8 defends the Track A submission, P9 is a separate, optional, additional-effort track | FDE4 chairs | This artefact |

## 7. Conditions for go/no-go

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What must be true for P8 go? | **FACT**: G7 checkpoint criteria — clean-room reproducible, `--final` structure check passes (excluding Track B-only items), `hash_submission.py --check` passes (`AEGIS_PROJECT_PLAN_FINAL.md` §8.2) | FDE4 chairs | Clean-room log, this phase |
| What must additionally be true for G9 (production-ready claim)? | **FACT**: all of §1's PENDING rows resolved, artefact 28 status changed from Draft to Complete, Blockers=0 confirmed on an RC specifically, clean-room repeated on that RC (E-001) | FDE4 chairs | Not yet — Track B |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Decision | This submission stops at Track A (G1–G8) by default; Track B (P9) is optional additional scope (+16–24h) | Must never be described as "production-ready" without P9 | FDE1 | If P9 is commissioned | Open — explicit constraint 8 |
| R-002 | Gap | No RC has been tagged/versioned yet, so every "clean-room PASS" claim in this artefact is against the current branch, not an RC | G9 requires repeating clean-room specifically on RC | FDE3 | P9 §8.1 "RC tag + manifest" | Open |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| Track A hard gates hold | INV-01…10, POL-01…06 | 56 tests + 18 eval scenarios | `submission/evidence/test_results.json`, `evaluation_results.json` | PASS |
| Six operational commands work | `submission/scripts/*.sh` | Manual + clean-room run | `submission/runbooks/OPERATIONS.md` | PASS |
| Production-ready claim | Track B (P9) | Not yet run | — | PENDING |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| FDE4 chairs (self-review) | Production Readiness chairs | Draft correctly separates Track A PASS from Track B PENDING, per constraint 8 | Accepted as P7 draft; completes at P9/G9 | 2026-08-11 |
