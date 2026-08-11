#!/usr/bin/env python3
"""Inspection-style evidence request demonstration (defence element 11,
`requirements/FINAL_DEFENCE.md` line 15; closes INJ-050, D07).

Reads the real disclosed inspection request (`data/inspection_requests.csv`,
`IR-72H`: scope = trial, batch, safety, AI controls; deadline = 72 hours)
and, for each scope item, links the claim to real immutable/submission
evidence paths and verifies every cited path actually exists on disk —
this script does not just assert traceability, it checks it. Where a
scope item is out of this engagement's bounded scope (trial data — see
`01_BUSINESS_CASE.md` §5), that is stated as an explicit abstention, never
filled in with fabricated evidence.

Stdlib-only, offline, deterministic. Run from repo root:
    python3 -B submission/scripts/inspection_response_demo.py
Writes submission/evidence/inspection_response_IR-72H.json and exits 0 iff
every cited path for every in-scope item was verified to exist.
"""
import csv
import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

SCOPE_EVIDENCE = {
    "trial": {
        "status": "out_of_scope",
        "reason": "Clinical Trial Management bounded context not built for this engagement (01_BUSINESS_CASE.md §5; 04-ddd/inject_register_84.md D03) — a real inspection response would route this to the separate CTMS system of record, not this submission",
        "paths": [],
    },
    "batch": {
        "status": "traceable",
        "reason": "Workflow A (batch evidence reconciliation) — full chain from code to test to design rationale",
        "paths": [
            "submission/src/workflows/batch_evidence.py",
            "submission/src/services/evidence_resolver.py",
            "submission/tests/test_prohibited_batch_disposition.py",
            "submission/tests/test_evidence_integrity.py",
            "submission/artefacts/13_GXP_LIFECYCLE_VALIDATION.md",
            "submission/evaluation/reports/detailed_results.jsonl",
        ],
    },
    "safety": {
        "status": "traceable",
        "reason": "Workflow B (PV intake and signal support) — full chain from code to test to design rationale",
        "paths": [
            "submission/src/workflows/pv_intake.py",
            "submission/tests/test_prohibited_pv_auto_merge.py",
            "submission/artefacts/17_PRIVACY_ETHICS.md",
            "submission/artefacts/22_EVALUATION_SCORECARD.md",
        ],
    },
    "AI controls": {
        "status": "traceable",
        "reason": "Authorization, tool-gateway, knowledge-authority, model-integrity controls plus the threat model and evaluation harness that exercise them",
        "paths": [
            "submission/src/services/authorization.py",
            "submission/src/services/tool_gateway.py",
            "submission/src/services/knowledge_gateway.py",
            "submission/src/services/model_registry.py",
            "submission/artefacts/16_THREAT_ABUSE_MODEL.md",
            "submission/scripts/ai_disabled_offline_demo.py",
            "submission/evaluation/README.md",
        ],
    },
}


def main():
    with open(ROOT / "data" / "inspection_requests.csv", encoding="utf-8") as f:
        request = next(csv.DictReader(f))

    scope_items = [s.strip() for s in request["scope"].split(",")]
    started_at = time.perf_counter()

    response_items = []
    all_verified = True
    for item in scope_items:
        entry = SCOPE_EVIDENCE.get(item)
        if entry is None:
            all_verified = False
            response_items.append({"scope_item": item, "status": "unmapped", "reason": "no evidence mapping defined for this scope item", "paths": [], "all_paths_verified": False})
            continue
        verified_paths = []
        for p in entry["paths"]:
            exists = (ROOT / p).exists()
            verified_paths.append({"path": p, "exists": exists})
            if not exists:
                all_verified = False
        response_items.append({
            "scope_item": item,
            "status": entry["status"],
            "reason": entry["reason"],
            "paths": verified_paths,
            "all_paths_verified": all(vp["exists"] for vp in verified_paths) if verified_paths else True,
        })

    elapsed_seconds = time.perf_counter() - started_at

    response = {
        "request_id": request["request_id"],
        "agency": request["agency"],
        "deadline_hours": int(request["deadline_hours"]),
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "automated_retrieval_seconds": round(elapsed_seconds, 4),
        "scope_response": response_items,
        "note": "Automated evidence-path retrieval and verification completes in well under a second; the 72-hour window is consumed by human review/synthesis (Regulatory Strategist, per data/staff_rates.csv), not evidence location. 'trial' is an explicit abstention, not a gap silently filled.",
        "execution_status": "not_executed",
    }

    out_path = ROOT / "submission" / "evidence" / "inspection_response_IR-72H.json"
    out_path.write_text(json.dumps(response, indent=2) + "\n", encoding="utf-8")

    print(f"Wrote {out_path.relative_to(ROOT)}")
    for item in response_items:
        marker = "OK" if item.get("all_paths_verified", True) else "MISSING PATH"
        print(f"  [{marker}] {item['scope_item']}: {item['status']}")

    return 0 if all_verified else 1


if __name__ == "__main__":
    sys.exit(main())
