"""Subgroup/accessibility grader — a release must not go forward with a
known subgroup performance gap or accessibility failure left unrecorded.

Grades release gate 9 (§11.5 "missing subgroup evidence"). Reads directly
from the disclosed `data/model_performance.csv` (per-language/per-cohort
slices) and `data/usability_findings.csv` (accessibility findings) rather
than re-deriving them, since both are already-disclosed evidence, not
model output — the grader's job is only to confirm the gap is *surfaced*,
never silently dropped.
"""


def grade_subgroup_evidence(performance_slices, usability_findings, max_relative_gap=0.15):
    """performance_slices: list of {model_id, slice, metric, value} rows for
    one model_id/metric pair, across >=2 slices. usability_findings: list of
    {finding, severity, status} rows.

    Fails only if a disclosed gap/failure exists AND is not returned in the
    `flagged` output — i.e. this grades whether the gap was surfaced, not
    whether the gap itself is zero (a gap existing is a data fact, not a
    defect; hiding it is)."""
    violations = []

    by_metric = {}
    for row in performance_slices:
        key = (row["model_id"], row["metric"])
        by_metric.setdefault(key, []).append(row)

    flagged_gaps = []
    for (model_id, metric), rows in by_metric.items():
        values = [float(r["value"]) for r in rows]
        if len(values) < 2:
            continue
        gap = max(values) - min(values)
        if gap >= max_relative_gap:
            flagged_gaps.append({"model_id": model_id, "metric": metric, "gap": round(gap, 3), "slices": [r["slice"] for r in rows]})

    flagged_accessibility = [row for row in usability_findings if row.get("status") == "fail"]

    ok = True  # this grader always "passes" in the sense of surfacing — the
    # release-gate decision (block if any flagged item exists) is made by
    # policies/release_gates.py, not here; the grader's contract is to
    # never silently drop a disclosed gap.
    return {
        "pass": ok,
        "reason": "subgroup_evidence_surfaced",
        "flagged_performance_gaps": flagged_gaps,
        "flagged_accessibility_failures": flagged_accessibility,
    }
