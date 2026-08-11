#!/usr/bin/env python3
"""Observability & SLO / error-budget evidence (P9 workstream, `AEGIS_
PROJECT_PLAN_FINAL.md` §8.1: owner P5+P3, "Done when: Metrics/logs; error
budget").

SLO (stated, per `24_RELIABILITY_OBSERVABILITY.md` §2): since no model
inference runs in the shipped code path, the primary SLI is structural
correctness, not latency — target **>=99.5% of regression evaluation
scenarios clear every release gate** (`release_gates_blocked == 0` share).
Error budget = 1 - SLO = 0.5% of scenario-runs allowed to trip a gate
before the budget is exhausted.

This script appends the current `submission/evaluation/reports/summary.json`
run to a history file and reports cumulative budget consumption. It does
not fabricate a trend from one data point — with a single historical
entry it says so explicitly, per the "document platform limits, never
fake determinism" discipline established in `OPERATIONS.md`.

Stdlib-only, offline, deterministic. Run from repo root:
    python3 -B submission/scripts/slo_error_budget.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HISTORY_PATH = ROOT / "submission" / "evidence" / "slo_error_budget_history.jsonl"
SUMMARY_PATH = ROOT / "submission" / "evaluation" / "reports" / "summary.json"

SLO_TARGET = 0.995  # >=99.5% of regression scenarios must clear every release gate
ERROR_BUDGET = 1 - SLO_TARGET


def main():
    summary = json.loads(SUMMARY_PATH.read_text(encoding="utf-8"))
    total = summary["regression_scenarios"]
    blocked = summary["release_gates_blocked"]
    pass_rate = (total - blocked) / total if total else 0.0

    entry = {
        "run_at": summary["run_at"],
        "regression_scenarios": total,
        "release_gates_blocked": blocked,
        "pass_rate": round(pass_rate, 6),
    }

    history = []
    if HISTORY_PATH.exists():
        history = [json.loads(line) for line in HISTORY_PATH.read_text(encoding="utf-8").splitlines() if line.strip()]
    history.append(entry)
    with HISTORY_PATH.open("a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")

    cumulative_scenarios = sum(h["regression_scenarios"] for h in history)
    cumulative_blocked = sum(h["release_gates_blocked"] for h in history)
    cumulative_pass_rate = (cumulative_scenarios - cumulative_blocked) / cumulative_scenarios if cumulative_scenarios else 0.0
    budget_consumed_fraction = (1 - cumulative_pass_rate) / ERROR_BUDGET if ERROR_BUDGET else 0.0

    report = {
        "slo_target": SLO_TARGET,
        "error_budget": ERROR_BUDGET,
        "this_run": entry,
        "cumulative_runs_recorded": len(history),
        "cumulative_pass_rate": round(cumulative_pass_rate, 6),
        "error_budget_consumed_fraction": round(min(budget_consumed_fraction, 1.0), 6),
        "slo_met_this_run": pass_rate >= SLO_TARGET,
        "note": (
            "Only 1 historical run recorded — a real trend cannot yet be assessed; "
            "this is stated honestly rather than implied from a single data point."
            if len(history) == 1 else
            f"{len(history)} historical runs recorded — trend is now assessable."
        ),
    }

    out_path = ROOT / "submission" / "evidence" / "slo_error_budget_report.json"
    out_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0 if report["slo_met_this_run"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
