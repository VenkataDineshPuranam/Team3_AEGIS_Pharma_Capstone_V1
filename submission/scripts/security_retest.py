#!/usr/bin/env python3
"""Security harden + retest (P9 workstream, `AEGIS_PROJECT_PLAN_FINAL.md`
§8.1: owner P5, "Done when: Threat controls on RC").

Re-runs exactly the security-relevant subset of the test/evaluation suite
against the current RC — not the full 56 tests, a scoped retest an
independent security reviewer can point at specifically — and writes a
dated, RC-tagged result file distinct from the general test_results.json,
so a security sign-off has its own evidence trail.

Stdlib-only, offline, deterministic. Run from repo root:
    python3 -B submission/scripts/security_retest.py
"""
import json
import sys
import time
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

SECURITY_TEST_MODULES = [
    "submission.tests.test_authorization_fail_closed",
    "submission.tests.test_knowledge_authority_gate",
    "submission.tests.test_replay_and_excessive_agency",
    "submission.tests.test_model_supply_chain_integrity",
    "submission.tests.test_prohibited_batch_disposition",
    "submission.tests.test_prohibited_pv_auto_merge",
    "submission.tests.test_prohibited_supply_side_effects",
]

SECURITY_GRADER_MODULE = "submission.evaluation.graders.test_graders"
SECURITY_GRADER_CLASSES = [
    "AuthorityGraderTest",
    "SecurityGraderTest",
    "TrajectoryGraderTest",
    "ProhibitedActionGraderTest",
]


def main():
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    for mod in SECURITY_TEST_MODULES:
        suite.addTests(loader.loadTestsFromName(mod))
    grader_mod = __import__(SECURITY_GRADER_MODULE, fromlist=SECURITY_GRADER_CLASSES)
    for cls_name in SECURITY_GRADER_CLASSES:
        suite.addTests(loader.loadTestsFromTestCase(getattr(grader_mod, cls_name)))

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    report = {
        "run_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "rc": "v1.0.0-rc1",
        "scope": "security-relevant subset only (authorization, knowledge authority, replay/excessive-agency, "
                 "model supply-chain integrity, all 3 prohibited-action specs, 4 security-relevant graders)",
        "total_tests": result.testsRun,
        "passed": result.testsRun - len(result.failures) - len(result.errors),
        "failed": len(result.failures),
        "errors": len(result.errors),
        "threat_controls_verified": [
            "POL-01 deny-by-default authorization (live iam_state, cached ai_gateway_state ignored — ADR-006)",
            "INV-09/POL-02 knowledge citation status-gate (untrusted/superseded never citable)",
            "INV-01 disposition-write denial independent of tool approval",
            "Idempotency-key replay detection, no duplicate execution",
            "Model artifact hash/signature integrity gate",
            "INV-01/05/06/07 no prohibited terminal action across all 3 workflows",
        ],
    }

    out_path = ROOT / "submission" / "evidence" / "security_retest_report.json"
    out_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(f"\nWrote {out_path.relative_to(ROOT)}")
    print(json.dumps({k: v for k, v in report.items() if k != "threat_controls_verified"}, indent=2))

    return 0 if result.wasSuccessful() else 1


if __name__ == "__main__":
    raise SystemExit(main())
