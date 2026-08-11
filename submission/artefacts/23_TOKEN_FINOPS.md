# Token Efficiency and AI FinOps

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE1 (Product) + FDE5 (Eval) |
| Version / date | v1.0 — 2026-08-11 |
| Reviewers | FDE4, FDE3 |
| Status | Approved for defence |
| Related requirements / ADRs | `AEGIS_PROJECT_PLAN_FINAL.md` §11.9; RUB-14; `evaluation/public_fixtures/PUB-14.json` |

## Purpose

Computes cost-per-successful-task including human review, from the disclosed `PUB-14` fixture, and states a routing/budget decision. Accountable owner: FDE1/FDE5.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `data/model_usage.csv` (via `evaluation/public_fixtures/PUB-14.json`) | Capstone evaluation fixture, 2026-08-01 | `batch_review`: 1900 requests, 5.8M input / 0.85M output tokens, 1110 successful tasks. `pv_intake`: 4200 requests, 9.2M input / 1.7M output tokens, 2800 successful tasks | Disclosed fixture; real sha256 in `PUB-14.json` |
| E-002 | `data/model_costs.csv` | Same fixture | `AIVENDOR-X large-1`: input \$8.50/M (previous \$5.00/M), output \$22.00/M. `LOCAL-SLM small-7b`: input \$0.80/M, output \$1.20/M | Disclosed fixture |
| E-003 | `data/cost_model.csv` | Same fixture | `inference: \$184,000/mo`, `human_quality_review: \$0/mo`, `medical_review: \$0/mo`, `observability: \$31,000/mo` | The two \$0 review lines are the fixture's own disclosed (incomplete) cost model — not this artefact's error |
| E-004 | `data/staff_rates.csv` | Same fixture | `Quality reviewer: \$92/hr`, `Safety physician: \$165/hr`, `Regulatory strategist: \$148/hr` | Disclosed fixture |
| E-005 | `data/reviewer_feedback.csv` | Package | `CO-1` reviewed by `QR-11` in 19 seconds | Real disclosed record, used as an illustrative review-time sample |
| E-006 | `submission/evaluation/graders/latency_cost_grader.py` `compute_cost_per_successful_task` | Generated P6 | The exact formula used for every number in §6 below | `submission/evaluation/reports/scorecard.csv` PUB-14 row |

## 1. Workload baseline

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the current inference workload? | **FACT**: two workflows disclosed in PUB-14 — `batch_review` (1900 req/period) and `pv_intake` (4200 req/period), both on `AIVENDOR-X large-1` at current pricing | FDE1 | E-001 |
| What is the success rate? | **INTERPRETATION**: `batch_review` 1110/1900 = 58.4% requests-to-successful-task; `pv_intake` 2800/4200 = 66.7% — both well under 100%, meaning per-request cost understates true cost-per-outcome by roughly 1.7x/1.5x | FDE5 | E-001 |

## 2. Model/routing strategy

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What does full `large-1` routing cost per successful task? | **FACT** (computed, E-001+E-002): `batch_review` = \$68.00 total / 1110 = **\$0.0613/task**; `pv_intake` = \$115.60 total / 2800 = **\$0.0413/task** | FDE5 | `graders/latency_cost_grader.py` |
| What would full `small-7b` (LOCAL-SLM) routing cost? | **FACT** (computed, same formula, E-002 small-7b pricing): `batch_review` = \$5.66 / 1110 = **\$0.0051/task**; `pv_intake` = \$9.40 / 2800 = **\$0.0034/task** — a ~12x reduction | FDE5 | Same |
| Is blanket small-model routing recommended? | **DECISION**: no, not without an accuracy/fidelity re-evaluation first — `data/model_performance.csv` already shows `PV-NER-4` drops from English F1 0.91 to Hindi F1 0.67, and INJ-081 (model substitution regression) specifically warns a smaller fallback model "preserves schema compliance but loses evidence fidelity in non-English cases"; a routing change is a Model/Data-governance decision (`04-ddd/domain_model.md`), not a pure cost decision | FDE1 | `data/model_performance.csv`; `04-ddd/inject_register_84.md` INJ-081 |

## 3. Context and token budgets

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the per-request token shape? | **FACT**: `batch_review` averages 3,053 input / 447 output tokens per request (5.8M/1900, 0.85M/1900); `pv_intake` averages 2,190/405 — batch review is the more input-heavy, evidence-dense workflow, consistent with its wider evidence bundle (batches, lab results, genealogy, warehouse, OOS, release packets, supplier audits, CoAs — 8+ sources per PUB-01) | FDE1 | E-001; `evaluation/public_fixtures/PUB-01.json` |

## 4. Caching and avoided inference

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Does the current build avoid unnecessary inference? | **FACT**: yes, entirely — the P0–P8 build is deterministic-only (`AEGIS_PROJECT_PLAN_FINAL.md` constraint 9, agent freeze); zero of the \$184,000/mo modeled inference spend (E-003) is actually incurred by `submission/src`, since no model call exists in the shipped code path | FDE5 | `submission/src/workflows/*.py` (no LLM/API call in any workflow) |
| Is this a permanent design choice? | **DECISION**: for the mandatory three workflows' *deterministic control layer* (authorization, evidence integrity, prohibited-action gates), yes — those must never depend on model availability. Where generative assistance is later added (`04-ddd/gen_ai_boundaries.md` §1, the 2 narrow-scope agents), it sits outside this control layer, never inside it | FDE1 | `04-ddd/gen_ai_boundaries.md` §1 |

## 5. Human-review and validation cost

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Does the disclosed cost model include human review? | **FACT**: no — `data/cost_model.csv` discloses `human_quality_review: $0/mo` and `medical_review: $0/mo` (E-003) even though every workflow response requires `human_review.required: true` (`submission/src/workflows/*`) — this is INJ-077 (hidden human-review cost), reproduced exactly as disclosed | FDE5 | E-003 |
| What does an illustrative per-case review cost look like? | **INTERPRETATION** (computed, E-004+E-005): one disclosed review sample, `CO-1` reviewed by `QR-11` in 19 seconds at the Quality reviewer rate (\$92/hr) = 19/3600 × \$92 = **\$0.486/case** — this single sample cannot be extrapolated to a monthly total without a review-volume figure, which the fixture does not disclose; recorded as a gap below, not silently filled in | FDE5 | E-004, E-005 |

## 6. Cost per successful task

| Workflow | Model | Total cost | Successful tasks | Cost/task |
|---|---|---:|---:|---:|
| batch_review | large-1 (current pricing) | \$68.00 | 1,110 | **\$0.0613** |
| pv_intake | large-1 (current pricing) | \$115.60 | 2,800 | **\$0.0413** |
| batch_review | small-7b (illustrative) | \$5.66 | 1,110 | \$0.0051 |
| pv_intake | small-7b (illustrative) | \$9.40 | 2,800 | \$0.0034 |

Neither figure includes human-review cost (§5) or observability spend (\$31,000/mo, E-003) apportioned per task — both are real costs the disclosed `cost_model.csv` omits or leaves at the workflow level, not per-task.

## 7. Budget alerts and vendor shock

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Is there a live price-shock signal? | **FACT**: `large-1` input pricing rose from \$5.00/M to \$8.50/M — a **+70%** increase (E-002) — this is INJ-075 (model price shock), reproduced exactly as disclosed | FDE5 | E-002 |
| What is the denial-of-wallet control? | **DECISION**: `submission/evaluation/graders/latency_cost_grader.py::grade_latency_cost` enforces a `max_cost_per_task_usd` cap per suite S11 scenario (set to \$0.20 in `submission/evaluation/datasets/S11_*.json`, above both current large-1 figures with margin) — a scenario exceeding the cap fails the grader and is recorded as a release-gate-relevant finding, not silently absorbed into an average | FDE5 | `submission/evaluation/reports/detailed_results.jsonl` PUB-14 row |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Gap | Monthly human-review volume is not disclosed anywhere in the package, so §5's \$0.486/case sample cannot be extrapolated into a real monthly human-review budget line | Cost-per-successful-task understates true TCO by an unknown, currently non-computable margin | FDE1 | P7 Ops (TOM/budget artefact 26) | Open |
| R-002 | Risk | A +70% single-vendor input-price shock (E-002) with no second live vendor in the deterministic path is a concentration risk (also INJ-078, vendor concentration) | Budget exposure if `AIVENDOR-X` raises prices again | FDE1 | Vendor exit artefact 27 | Open |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| Cost per successful task is computed, not guessed | `latency_cost_grader.compute_cost_per_successful_task` | Suite S11, PUB-14 | `submission/evaluation/reports/detailed_results.jsonl` | PASS (within \$0.20 cap) |
| Zero inference cost incurred by shipped deterministic code | Agent freeze (constraint 9) | Code inspection: no LLM call in `submission/src` | `submission/src/workflows/*.py` | Confirmed |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| FDE5 (self-review) | Eval Lead | Human-review cost gap (R-001) is real and disclosed, not hidden | Recorded as open risk, not silently closed | 2026-08-11 |
