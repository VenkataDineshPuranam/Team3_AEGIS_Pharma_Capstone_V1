# Evaluation Scorecard

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE5 (Security/Privacy/Eval/Reliability Lead) |
| Version / date | v1.0 — 2026-08-11 |
| Reviewers | FDE4, FDE3 |
| Status | Approved for defence |
| Related requirements / ADRs | `evaluation/EVALUATION_PLAN.md`; `AEGIS_PROJECT_PLAN_FINAL.md` §11.4/§11.8; RUB-13 |

## Purpose

Reports the P6 TEVV evaluation run: what was built (`submission/evaluation/`), what it measured, and what it found. Accountable owner: FDE5. Completion criteria (`AEGIS_PROJECT_PLAN_FINAL.md` §8, P6 row): "Report set + machine-readable results; G6".

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `evaluation/EVALUATION_PLAN.md` | Package | 12 required suites, release-gate list, "no answer key" constraint | Immutable |
| E-002 | `evaluation/PUBLIC_FIXTURE_INDEX.csv`, `evaluation/public_fixtures/PUB-01…15.json` | Package | 15 disclosed scenario fixtures, real SHA-256 hashes, `expected_answer_included: false` | Immutable |
| E-003 | `submission/evaluation/reports/summary.json` | Generated 2026-08-11T04:33:56Z | 21 scenarios, 18 regression + 3 baseline, 0 gates blocked | Reproducible: `python3 -B submission/evaluation/runner.py` |
| E-004 | `submission/evaluation/reports/detailed_results.jsonl` | Generated same run | Per-scenario input hash, result, gate outcome, injects covered | Reproducible |
| E-005 | `submission/evaluation/graders/test_graders.py` | Generated this phase | 21 positive+negative unit tests, all passing | `python3 -B -m pytest submission/evaluation/graders -q` |
| E-006 | `submission/evidence/test_results.json` | Generated this phase | 56/56 tests passing (35 Phase 4/5 + 21 Phase 6 grader tests) | Reproducible |

## 1. Evaluation objectives

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What does this evaluation measure? | **DECISION**: whether the three shipped workflows (`submission/src`) satisfy the ten release gates (§11.5) across the twelve required suites (§11.4), and whether the pre-engagement brownfield code (`starter/legacy_pharma.py`) actually exhibits the defects the case package and threat model (artefact 16) describe — measured by execution, not assertion | FDE5 | E-003, E-004 |
| Is there an answer key? | **FACT**: no — `evaluation/EVALUATION_PLAN.md` states public fixtures are "reproducible input bundles, not answer keys"; every grader checks a structural invariant (schema conformance, integrity hash validity, authority-status gate, no-disposition-present), never a memorized correct output | FDE5 | E-001 |

## 2. Datasets and cohorts

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What scenarios were run? | **FACT**: 18 regression scenarios across all 12 suites, built from 11 of the 15 disclosed PUB fixtures plus 7 participant-authored scenarios grounded in already-disclosed `data/*.csv` records (never invented data) — `submission/evaluation/datasets/S01…S12_*.json` | FDE5 | `submission/evaluation/datasets/` |
| What baseline cohort was used? | **DECISION**: 3 scenarios run the unmodified `starter/legacy_pharma.py` against the same underlying data as the regression scenarios (`NCB204-B24071`, "supplier deviation" knowledge query, `NCB-204` inventory) — a same-data, different-code comparison, not a synthetic control | FDE5 | `submission/evaluation/adapters/workflow_adapter.py` `run_baseline_*` functions |
| Which injects are covered? | **FACT**: 29 distinct inject IDs appear in the 21 scenarios' `injects` fields (`submission/evaluation/reports/scorecard.csv`), spanning D01, D04–D14 dimensions; cross-referenced into the mirrored tracker | FDE5 | `submission/evaluation/inject_test_coverage.csv` |

## 3. Deterministic graders

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| How many graders, and what do they check? | **FACT**: 9 — `schema` (contract conformance, reuses `tools/test_contracts.validate`), `evidence` (integrity hash + declared-source fidelity, reuses `evidence_resolver.verify_integrity`), `prohibited_action` (INV-01/05/06/07), `authority` (INV-09, reuses `knowledge_gateway.resolve_citation`), `security` (POL-01, reuses `authorization.check_authorization`), `temporal_unit` (INV-02/10), `trajectory` (replay/idempotency, reuses `tool_gateway.invoke_tool`), `latency_cost` (cost-per-successful-task vs. denial-of-wallet cap), `subgroup` (disclosed performance/accessibility gaps must be surfaced) | FDE5 | `submission/evaluation/graders/*.py` |
| Are graders independently tested? | **FACT**: yes, 21 positive+negative unit tests, one pair minimum per grader, all passing — a grader that always returns `pass: True` would be caught by its own negative case | FDE5 | E-005 |
| Do graders duplicate or reuse the shipped invariant logic? | **DECISION**: reuse, deliberately — every grader imports the same `submission/src/services/*` function the workflow code calls, so a grader can never silently define "correct" more loosely than the code it's grading | FDE5 | `submission/evaluation/graders/authority_grader.py` (imports `knowledge_gateway.resolve_citation` directly) |

## 4. Human-review rubric

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Is a human reviewer role recorded per scenario? | **FACT**: yes — every scorecard row carries a `reviewer_role` field; deterministic-grader-only scenarios record `"Not applicable (deterministic grader)"` rather than a false human sign-off, and every regression workflow response itself still carries its own `human_review.required: true` (EU Qualified Person / Safety Physician / Supply Governance Board, per workflow) | FDE5 | `submission/evaluation/reports/detailed_results.jsonl` |
| Is an LLM judge used? | **FACT**: no — the P0–P8 build is deterministic-only (`AEGIS_PROJECT_PLAN_FINAL.md` non-negotiable constraint 9, "agent freeze"); no model inference runs anywhere in this harness | FDE5 | `AEGIS_PROJECT_PLAN_FINAL.md` constraint 9 |

## 5. Safety and prohibited-action gates

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Did any regression scenario trip a release gate? | **FACT**: no — 0 of 18 regression scenarios blocked on any of the 10 gates (`submission/evaluation/policies/release_gates.py`); `release_gates_blocked: 0` in the run summary | FDE5 | E-003 |
| Did the baseline confirm the gap this build closes? | **FACT**: yes, 3/3 — brownfield `plan_supply()` mutates `reservation_status` and includes quarantined inventory (fails the supply side-effect check); `batch_ready()` returns a bare bool with no contract shape; `search_knowledge()` returns the untrusted `MALICIOUS_SUPPLIER_DEVIATION.md` as an equally-trusted hit | FDE5 | `submission/evaluation/reports/final_evaluation_report.md` §3 |

## 6. Subgroup and adversarial results

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Was a disclosed subgroup gap surfaced, not hidden? | **FACT**: yes — `PV-NER-4` entity-F1 English 0.91 vs. Hindi 0.67 (a 0.24 gap, above the 0.15 threshold) and 2 accessibility findings (`keyboard navigation`, `colour-only hold warning`, both `severity: high, status: fail`) are both flagged by `grade_subgroup_evidence` (suite S10) | FDE5 | `data/model_performance.csv`, `data/usability_findings.csv` |
| Were adversarial/poisoning inputs handled correctly? | **FACT**: yes — `MALICIOUS_SUPPLIER_DEVIATION.md` and `FAKE_PV_EXPEDITED_RULE.md` (both `status: untrusted`) are correctly refused citation by `knowledge_gateway.resolve_citation` in suite S05; the same query against the unmodified baseline (`S05-baseline`) confirms the brownfield code has no such gate | FDE5 | `submission/evaluation/reports/scorecard.csv` rows PUB-03, PUB-05, S05-baseline |

## 7. Release thresholds and regression

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Were thresholds set before or after seeing results? | **DECISION**: before — the `max_cost_per_task_usd: 0.20` cap (suite S11) and `max_relative_gap: 0.15` subgroup threshold (`grade_subgroup_evidence` default) were both set from the workflow's declared risk tolerance while writing `submission/evaluation/datasets/S11_*.json` and `graders/subgroup_grader.py`, before `runner.py` was executed against them | FDE5 | `submission/evaluation/datasets/S11_latency_capacity_token_use_cost_per_succ.json` |
| Is this run reproducible? | **FACT**: yes — `python3 -B submission/evaluation/runner.py` re-executes all 21 scenarios deterministically (no model inference, no network, no random seed) and regenerates the same report set | FDE5 | `submission/evaluation/README.md` "Run it" |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Gap | 8 of 84 injects (D07 regulatory/eCTD, most D13 vendor-exit/retirement — INJ-046/047/049/050/052/053/057/083/084 and D05 change-control/shared-account items INJ-026/030/034) have no dedicated PUB fixture or workflow and are not exercised by this harness | Under-covers defence element 12 (vendor exit/substitution/retirement) if not addressed at P7 | FDE5 | P7 Ops + clean-room | Open — see `04-ddd/inject_register_84.md` R-001 |
| R-002 | Assumption | `evidence_item.authority`/`effective_at` fields for fixture-derived evidence are set to `"undisclosed"`/`null` where the fixture's text doesn't state them explicitly (regex-extracted from "Synthetic authority:"/"Effective date:" lines) | Low — the fixture's authority discipline is deliberately partial by design; this harness never invents a value | FDE5 | N/A | Accepted |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| Three workflows pass all 10 release gates | INV-01/02/05/06/07/08/09/10, POL-01–06 | 18 regression scenarios, 9 graders | `submission/evaluation/reports/detailed_results.jsonl` | PASS (18/18) |
| Brownfield defect is real, not asserted | `starter/legacy_pharma.py` (unmodified) | 3 baseline scenarios | `submission/evaluation/reports/final_evaluation_report.md` §3 | Confirmed (3/3) |
| Graders themselves are correct | positive+negative unit tests | `submission/evaluation/graders/test_graders.py` | `submission/evidence/test_results.json` | PASS (21/21) |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| FDE5 (self-review) | Security/Privacy/Eval/Reliability Lead | Initial draft consistent with `evaluation/EVALUATION_PLAN.md` and §11.4/§11.5/§11.8 | Accepted for P6 exit | 2026-08-11 |
