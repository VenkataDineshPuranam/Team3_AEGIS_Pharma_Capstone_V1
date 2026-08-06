---
description: Create contracts and deterministic acceptance, adversarial, outage and prohibited-action tests before implementation.
argument-hint: [workflow: batch|pv|supply]
---

Create versioned input/output contracts and deterministic acceptance, adversarial, outage and prohibited-action tests for workflow: $ARGUMENTS — before writing implementation code.

Use the `test-engineer` agent. Contracts go under `submission/evaluation/` or `submission/src/` with schemas validated the way `tools/test_contracts.py` validates `evaluation/contracts`; tests go under `submission/tests/` and must cover happy, edge, adversarial, subgroup, outage/recovery, and the workflow's prohibited terminal action failing closed.
