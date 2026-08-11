# Operations Runbook

Scope: running, evaluating and observing the three workflows day to day. See `SETUP.md` first if this is a fresh checkout.

## Commands

| Action | Command | What it does |
|---|---|---|
| Setup | `submission/scripts/setup.sh` | Verify Python 3.10+, confirm no third-party deps required |
| Run | `submission/scripts/run.sh [--serve]` | Execute all 3 workflows offline against real fixtures; optionally serve the demonstrator UI |
| Test | `submission/scripts/test.sh` | 56 deterministic/adversarial specs (`unittest discover`, stdlib-only) |
| Evaluate | `submission/scripts/evaluate.sh` | Run the P6 TEVV harness (12 suites, 21 scenarios), regenerate `submission/evaluation/reports/` |
| Reset | `submission/scripts/reset.sh` | Remove bytecode caches + machine-generated reports (never source, never `final_evaluation_report.md`) |
| Export | `submission/scripts/export.sh` | Zip `evidence/` + `evaluation/reports/` + `artefacts/` for an inspector, to `submission/evidence/exports/` (gitignored) |

## SLI/SLO (per `submission/artefacts/24_RELIABILITY_OBSERVABILITY.md` §2)

Since no model inference runs in the shipped code path (`AEGIS_PROJECT_PLAN_FINAL.md` constraint 9, agent freeze), the primary signal is **structural correctness**, not latency:

- 100% of responses carry `execution_status: "not_executed"`.
- 0 release-gate blocks on any regression scenario (`submission/evaluation/reports/summary.json` → `release_gates_blocked`).
- `submission/scripts/run.sh` exits 0 with zero network attempts (proves the AI-disabled path, not just asserts it).

Check current status any time with `submission/scripts/evaluate.sh` then read `submission/evaluation/reports/summary.json`.

## Observability

- Every workflow response carries `audit.event_id` (`f"AUD-{request_id}"`).
- The evaluation runner independently records `scenario_id, input_hash, impl_version, contract_version, result, evidence_path, reviewer_role, gate_outcome` per scenario — a second, independent audit trail for the same run (`submission/evaluation/reports/detailed_results.jsonl`).
- Known unenforced observability gap: `data/security_events.csv` discloses two denial-of-wallet-shaped events (`SEC-1`, `SEC-2`) both recorded `blocked: no` — no runtime guard exists yet in this build, only the evaluation-time cost cap (suite S11). See `24_RELIABILITY_OBSERVABILITY.md` R-001.

## Model/routing changes

Before changing which model backs any generative-assist feature (none is currently wired into the deterministic control layer — see `04-ddd/gen_ai_boundaries.md` §1), re-run `submission/scripts/evaluate.sh` and check the S12 (`model substitution/regression`) suite result. `data/model_performance.csv` already shows a real subgroup regression risk (`PV-NER-4` English F1 0.91 vs. Hindi F1 0.67) — a routing change is a Model/Data-governance decision, never a pure cost decision (`23_TOKEN_FINOPS.md` §2).

## Escalation

If `evaluate.sh` reports any `release_gates_blocked > 0`, or `test.sh` reports a failure, do not ship — see `INCIDENT.md`.

## A known, honest non-determinism: hash `--check` after evaluate, not before

`submission/evaluation/reports/detailed_results.jsonl` records real measured `latency_ms` per scenario (wall-clock, not fabricated), and `summary.json` records a real `run_at` timestamp — both change on every `evaluate.sh` run even when every `result`/`gate_outcome` is unchanged (`scorecard.csv`, which omits both, **is** byte-identical run to run — verified this phase). This means `tools/hash_submission.py --check` will correctly report "stale" if you run `evaluate.sh` again after the hashes were last generated. This is expected, not a bug: **always run `tools/hash_submission.py` (no `--check`) immediately after the last `evaluate.sh`/`test.sh` run for a given freeze, then use `--check` only to confirm nothing changed afterward** — matching `AEGIS_PROJECT_PLAN_FINAL.md`'s own "After freeze; clean-room; G9 RC" framing for when that gate applies.
