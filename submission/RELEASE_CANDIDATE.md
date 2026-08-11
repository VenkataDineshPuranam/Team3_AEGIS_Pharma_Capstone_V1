# Release Candidate — v1.0.0-rc1

P9 workstream "App packaging & config" (`AEGIS_PROJECT_PLAN_FINAL.md` §8.1: owner P3, "Done when: Versioned RC; locked deps"). This is the first (and, at time of writing, only) release candidate cut from this submission.

## Identity

| Field | Value |
|---|---|
| RC tag | `v1.0.0-rc1` |
| Git ref | tagged at the P9 commit on branch `phase-9`, from `phase-8` HEAD `ef8230c` |
| Cut date | 2026-08-11 |
| Track | B (production hardening) — Track A (G1–G8) already independently complete and defence-ready |

## Locked dependencies

**Runtime dependency count: zero.** This is the strongest form of "locked" available — there is no dependency-resolution surface to drift:

| Component | Language | Third-party runtime dependency |
|---|---|---|
| `submission/src/` (3 workflows + 5 services) | Python 3.10+ stdlib only | None |
| `submission/tests/` | Python stdlib `unittest` | None (pytest supported as a convenience, never required — `submission/scripts/test.sh` uses `unittest discover`) |
| `submission/evaluation/` (graders, runner, policies) | Python stdlib only | None |
| `submission/app/` (offline demonstrator) | Vanilla JS, no framework, no bundler | None (loaded directly by the browser via `<script src="app.js">`) |
| `submission/scripts/` | POSIX `sh` + `python3 -B` | None |

Confirmed by inspection (no `requirements.txt`, `package.json`, or any import outside the Python standard library anywhere under `submission/`) and by `submission/scripts/setup.sh`, which asserts this explicitly at run time.

## Immutable evidence bundle

The RC's contents are hash-locked in `submission/evidence/file_hashes.csv` (regenerated as the last step before tagging — see `OPERATIONS.md`'s "hash after your last evaluate run" discipline) and enumerated with owner/version/status in `submission/evidence/submission_manifest.csv`. Both are reproduced identically from a fresh clean-room extraction of the tagged commit — see `28_PRODUCTION_READINESS.md` §1 for the RC-specific clean-room run.

## What changed since Track A (G1–G8)

Nothing in `submission/src/`, `submission/tests/`, or the three workflow contracts changed — P9 is hardening and evidence, not a behavior change. Added: `submission/scripts/{security_retest,rollback_rehearsal,soak_test,slo_error_budget}.sh` and their Python implementations, a kill switch in `run.sh`, an accessibility fix in `submission/app/app.js` (arrow-key tab navigation), and this file.
