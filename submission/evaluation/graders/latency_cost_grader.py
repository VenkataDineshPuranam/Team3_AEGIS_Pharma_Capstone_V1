"""Latency/cost grader — cost-per-successful-task and per-run token/latency
budgets must be computed honestly from disclosed usage records and must not
exceed the declared denial-of-wallet cap.

Grades release gate 10 (§11.5 "unreproducible build/evaluation" — a budget
computed off undisclosed numbers is not reproducible) and feeds artefact 23
(Token FinOps).
"""


def compute_cost_per_successful_task(usage_row, cost_row):
    """usage_row: {requests, input_tokens, output_tokens, successful_tasks}
    (strings, as read from CSV). cost_row: {input_per_million, output_per_million}."""
    input_tokens = float(usage_row["input_tokens"])
    output_tokens = float(usage_row["output_tokens"])
    successful = float(usage_row["successful_tasks"])
    input_cost = input_tokens / 1_000_000 * float(cost_row["input_per_million"])
    output_cost = output_tokens / 1_000_000 * float(cost_row["output_per_million"])
    total_cost = input_cost + output_cost
    if successful <= 0:
        return None
    return round(total_cost / successful, 4)


def grade_latency_cost(usage_row, cost_row, max_cost_per_task_usd):
    cost = compute_cost_per_successful_task(usage_row, cost_row)
    if cost is None:
        return {"pass": False, "reason": "no successful tasks recorded — cannot compute cost per task", "cost_per_task": None}
    ok = cost <= max_cost_per_task_usd
    return {
        "pass": ok,
        "reason": f"cost_per_task={cost} {'<=' if ok else '>'} cap={max_cost_per_task_usd}",
        "cost_per_task": cost,
    }
