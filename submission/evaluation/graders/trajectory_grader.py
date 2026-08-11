"""Trajectory grader — an agent/tool call replayed with the same
idempotency key must be recognised as a replay and must not execute a
second time; an agent must never be allowed the action outside its
declared authority limit.

Grades release gate 9 (§11.5 "missing subgroup evidence" is graded
elsewhere; this module covers the agent-path half of gate 6/8) and mirrors
`submission/tests/test_replay_and_excessive_agency.py` (PUB-13 resume,
INJ-080 checkpoint corruption / duplicate-draft pattern).
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from submission.src.services.tool_gateway import invoke_tool  # noqa: E402


def grade_trajectory(call):
    """call: a tool_gateway call dict with an idempotency_key. Invokes it
    twice and requires the second invocation to be recognised as a replay
    with the execution count held at 1 (no duplicate side effect / draft)."""
    first = invoke_tool(call)
    second = invoke_tool(call)
    if first["decision"] != "allow":
        return {"pass": False, "reason": f"first call unexpectedly denied: {first}"}
    if not second.get("replay_detected"):
        return {"pass": False, "reason": f"second call with same idempotency_key not flagged as replay: {second}"}
    if second.get("execution_count", 0) > 1:
        return {"pass": False, "reason": f"execution_count grew on replay: {second}"}
    return {"pass": True, "reason": "replay_detected_no_duplicate_execution"}
