#!/usr/bin/env python3
"""Performance/budget soak test (P9 workstream, `AEGIS_PROJECT_PLAN_FINAL.md`
§8.1: owner P5, "Done when: Within declared budgets").

Runs all three workflows repeatedly (default 200 iterations each) against
their real fixture data and confirms: (a) every response still holds
`execution_status: "not_executed"` throughout — no drift under repeated
load, and (b) p50/p95/p99 latency stays within a declared budget. This is
a soak of the deterministic control layer, not a token/cost soak — no
model inference exists in this code path to soak (`23_TOKEN_FINOPS.md`
§4), so the cost-per-successful-task budget (`$0.20`/task, artefact 23
§6) is a static, pre-computed figure this soak does not re-derive; what
this soak *can* and does measure honestly is CPU-bound latency stability.

Stdlib-only, offline, deterministic. Run from repo root:
    python3 -B submission/scripts/soak_test.py [iterations]
"""
import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from submission.src.workflows.batch_evidence import assemble_batch_response  # noqa: E402
from submission.src.workflows.pv_intake import assemble_pv_response  # noqa: E402
from submission.src.workflows.supply_options import assemble_supply_response  # noqa: E402

LATENCY_BUDGET_MS_P99 = 5.0  # declared budget: p99 well under 5ms for the deterministic control layer

BATCH_REQUEST = {
    "request_id": "SOAK-BATCH", "batch_id": "NCB204-B24071", "as_of": "2026-08-01T08:00:00Z",
    "authorization": {"purpose": "soak_test"}, "entitlement": {"user": "soak", "iam_state": "active"},
    "evidence": [{"source": "data/lab_results.csv", "record_id": "r0", "authority": "system_of_record",
                  "effective_at": None, "retrieved_at": "2026-08-01T08:00:00Z", "facts": {},
                  "integrity": {"sha256": "a" * 64, "source_preserved": True}}],
    "lab_states": {"lims_state": "OOS", "stats_state": "OOT", "notebook_state": "invalid_sample_prep"},
}
PV_REQUEST = {
    "request_id": "SOAK-PV", "case_ids": ["PV-1001", "PV-1014"], "as_of": "2026-08-01T08:00:00Z",
    "authorization": {"purpose": "soak_test"}, "entitlement": {"user": "soak", "iam_state": "active"},
    "evidence": [], "duplicate_pairs": [{"case_a": "PV-1001", "case_b": "PV-1014", "similarity": 0.93}],
}
SUPPLY_REQUEST = {
    "request_id": "SOAK-SUPPLY", "event_id": "SOAK-SH-901", "as_of": "2026-08-01T08:00:00Z",
    "authorization": {"purpose": "soak_test"}, "entitlement": {"user": "soak", "iam_state": "active"},
    "evidence": [],
    "inventory": [
        {"product": "NCB-204", "market": "EU", "quality_status": "released", "units": "4300"},
        {"product": "NCB-204", "market": "Global", "quality_status": "quarantine", "units": "5100"},
    ],
}


def percentile(values, pct):
    sorted_vals = sorted(values)
    idx = min(int(len(sorted_vals) * pct), len(sorted_vals) - 1)
    return sorted_vals[idx]


def soak_one(name, fn, request, iterations):
    latencies_ms = []
    execution_status_violations = 0
    for _ in range(iterations):
        start = time.perf_counter()
        response = fn(request)
        latencies_ms.append((time.perf_counter() - start) * 1000.0)
        if response.get("execution_status") != "not_executed":
            execution_status_violations += 1
    return {
        "workflow": name,
        "iterations": iterations,
        "execution_status_violations": execution_status_violations,
        "latency_ms": {
            "p50": round(percentile(latencies_ms, 0.50), 4),
            "p95": round(percentile(latencies_ms, 0.95), 4),
            "p99": round(percentile(latencies_ms, 0.99), 4),
            "max": round(max(latencies_ms), 4),
        },
        "within_budget_p99": percentile(latencies_ms, 0.99) <= LATENCY_BUDGET_MS_P99,
    }


def main():
    iterations = int(sys.argv[1]) if len(sys.argv) > 1 else 200

    results = [
        soak_one("batch_evidence", assemble_batch_response, BATCH_REQUEST, iterations),
        soak_one("pv_intake", assemble_pv_response, PV_REQUEST, iterations),
        soak_one("supply_options", assemble_supply_response, SUPPLY_REQUEST, iterations),
    ]

    report = {
        "run_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "iterations_per_workflow": iterations,
        "latency_budget_ms_p99": LATENCY_BUDGET_MS_P99,
        "results": results,
        "all_within_budget": all(r["within_budget_p99"] for r in results),
        "zero_execution_status_drift": all(r["execution_status_violations"] == 0 for r in results),
        "note": "Cost-per-successful-task budget ($0.20/task, 23_TOKEN_FINOPS.md §6) is not re-derived here — "
                "no model inference exists in this code path to soak; this measures deterministic-layer latency "
                "stability under repeated load instead.",
    }

    out_path = ROOT / "submission" / "evidence" / "soak_test_report.json"
    out_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in report.items() if k != "results"}, indent=2))
    for r in results:
        print(f"  {r['workflow']}: p50={r['latency_ms']['p50']}ms p99={r['latency_ms']['p99']}ms "
              f"within_budget={r['within_budget_p99']} violations={r['execution_status_violations']}")

    return 0 if report["all_within_budget"] and report["zero_execution_status_drift"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
