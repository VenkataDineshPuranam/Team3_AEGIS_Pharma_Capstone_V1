#!/usr/bin/env python3
"""AI-disabled continuity proof (P5 deliverable, per governing plan row
"P5 POC build ... AI-disabled scripts" and `knowledge/AI_DISABLED_CONTINUITY.md`,
K-002: "maintain a documented manual path for each mandatory workflow").

Runs all three workflows against real fixture data drawn from `data/*.csv`,
with `socket.socket.connect` monkey-patched to raise if anything ever
attempts a network call. This is a stronger claim than "no call was
observed" — it proves no call was *attempted*, offline-capability by
construction, not by omission.

Stdlib-only, deterministic. Run from repo root:
    python3 submission/scripts/ai_disabled_offline_demo.py
Exit code 0 iff all three workflows ran, stayed not_executed, and made
zero network attempts.
"""
import socket
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[2]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from submission.src.workflows.batch_evidence import assemble_batch_response
from submission.src.workflows.pv_intake import assemble_pv_response
from submission.src.workflows.supply_options import assemble_supply_response


class NetworkAttemptDuringOfflineRun(RuntimeError):
    pass


def _blocked_connect(*_args, **_kwargs):
    raise NetworkAttemptDuringOfflineRun(
        "socket.connect() called — a workflow attempted a network call during "
        "an AI-disabled offline run. This should never happen; every workflow "
        "in submission/src is deterministic Python with no model/network dependency."
    )


# Real fixture requests, drawn from actual package rows (not synthesized).
BATCH_REQUEST = {
    "request_id": "AI-DISABLED-DEMO-BATCH", "batch_id": "NCB204-B24071",
    "as_of": "2026-08-10T00:00:00Z",
    "authorization": {"purpose": "batch_review"},
    "entitlement": {"user": "qp_eu_1", "iam_state": "active"},
    "evidence": [{"source": "data/oos_investigations.csv", "record_id": "OOS-1"}],
    # data/oos_investigations.csv-class disagreement (INJ-023).
    "lab_states": {"lims_state": "OOS", "stats_state": "in_spec", "notebook_state": "invalid"},
}
PV_REQUEST = {
    "request_id": "AI-DISABLED-DEMO-PV", "as_of": "2026-08-10T00:00:00Z",
    "authorization": {"purpose": "pv_intake"},
    "entitlement": {"user": "safety_physician_1", "iam_state": "active"},
    "case_ids": ["PV-1001", "PV-1014"],
    # data/duplicate_candidates.csv: PV-1001,PV-1014,0.93,patient/product/date overlap
    "duplicate_pairs": [{"case_a": "PV-1001", "case_b": "PV-1014", "similarity": 0.93,
                          "reason": "patient/product/date overlap"}],
}
SUPPLY_REQUEST = {
    "request_id": "AI-DISABLED-DEMO-SUPPLY", "event_id": "AI-DISABLED-DEMO-EVENT",
    "as_of": "2026-08-10T00:00:00Z",
    "authorization": {"purpose": "supply_options"},
    "entitlement": {"user": "supply_board_1", "iam_state": "active"},
    # data/inventory.csv: NCB-204,Global,quarantine,5100 + NCB-204,EU,released,4300
    "inventory": [
        {"product": "NCB-204", "market": "Global", "quality_status": "quarantine", "units": 5100},
        {"product": "NCB-204", "market": "EU", "quality_status": "released", "units": 4300},
    ],
}


def run():
    original_connect = socket.socket.connect
    socket.socket.connect = _blocked_connect
    try:
        batch_response = assemble_batch_response(BATCH_REQUEST)
        pv_response = assemble_pv_response(PV_REQUEST)
        supply_response = assemble_supply_response(SUPPLY_REQUEST)
    finally:
        socket.socket.connect = original_connect

    results = [
        ("Workflow A — batch_evidence", batch_response),
        ("Workflow B — pv_intake", pv_response),
        ("Workflow C — supply_options", supply_response),
    ]

    all_ok = True
    print("== AI-disabled continuity proof ==")
    print("(socket.socket.connect was monkey-patched to raise for the entire run — "
          "no exception below means zero network attempts occurred)\n")
    for name, response in results:
        status = response.get("execution_status")
        ok = status == "not_executed"
        all_ok &= ok
        print(f"{name}: execution_status={status!r} — {'OK' if ok else 'FAIL'}")

    print(f"\nZero network attempts: OK (no {NetworkAttemptDuringOfflineRun.__name__} was raised)")
    print(f"\nResult: {'PASS — all 3 workflows ran fully offline' if all_ok else 'FAIL'}")
    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(run())
