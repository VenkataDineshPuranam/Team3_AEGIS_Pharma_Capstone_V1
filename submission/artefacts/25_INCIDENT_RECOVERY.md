# Incident and Recovery

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE5 (Security/Privacy/Eval/Reliability Lead) |
| Version / date | v1.0 — 2026-08-11 |
| Reviewers | FDE1, FDE4 |
| Status | Approved for defence |
| Related requirements / ADRs | `knowledge/AI_INCIDENT_RESPONSE.md` (K-004); `16_THREAT_ABUSE_MODEL.md`; RUB-15 |

## Purpose

States the incident taxonomy, containment/kill-switch, evidence preservation and CAPA path for the three workflows, grounded in disclosed real incidents (`DT-1`, `DT-2`) and the P6 evaluation harness's ability to reproduce them. Accountable owner: FDE5.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `data/downtime_events.csv` | Package | `DT-1`: MES/QMS/historian, ransomware containment, 2026-07-22T16:00→2026-07-23T08:00. `DT-2`: AI primary region, regional outage, started 2026-08-01T01:00, still `open` | Real disclosed incidents |
| E-002 | `data/network_zones.csv` | Package | `OT_FILL_FINISH` (restricted) isolated during incident; `AI_CLOUD` (external) unavailable primary | Real disclosed containment state |
| E-003 | `knowledge/AI_INCIDENT_RESPONSE.md` (K-004, approved) | NovaCura Global Policy, 2026-05-17 | Mandatory controls: containment, evidence preservation, rollback, regulatory assessment | Used by artefact 16 also |
| E-004 | `data/model_artifacts.csv`, `data/model_registry.csv` | Package | `GXP-SUM-1` hash mismatch, missing signature — a live model supply-chain incident condition | Real disclosed mismatch |
| E-005 | `data/agent_runs.csv` | Package | `AR-77`: `supply_recovery` workflow, `checkpoint: cp-4`, `state_age_minutes: 380`, `resume_result: duplicates_created` — a resume-without-checkpoint-freshness-check incident (INJ-080) | Real disclosed record |
| E-006 | `submission/src/services/tool_gateway.py` `invoke_tool` | Generated P5 | Idempotency-key replay cache; second call with the same key is flagged `replay_detected: True`, `execution_count` held at 1 | `submission/tests/test_replay_and_excessive_agency.py` |
| E-007 | `submission/evaluation/reports/detailed_results.jsonl` (`PUB-13`) | Generated P6 | Replaying `AR-77`'s `run_id` as an idempotency key through `invoke_tool` twice: first call allowed, second correctly flagged as replay, no duplicate execution | `python3 -B submission/evaluation/runner.py` |

## 1. Incident taxonomy

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What incident classes apply to this system? | **DECISION**, evidence-grounded: (1) OT/production system compromise (`DT-1`, ransomware); (2) AI/model endpoint outage (`DT-2`); (3) model supply-chain compromise (`GXP-SUM-1` hash mismatch, E-004); (4) agent checkpoint/resume duplication (`AR-77`, E-005); (5) knowledge/retrieval poisoning (artefact 16 §3, INJ-065); (6) tool/identity abuse (artefact 16 §4, INJ-066/067) | FDE5 | E-001, E-004, E-005 |
| Are these hypothetical? | **FACT**: no — all six classes have concrete evidence rows already present in `data/`, the same discipline artefact 16 established for the threat model | FDE5 | See Evidence register |

## 2. Detection and triage

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| How is a model supply-chain incident detected? | **FACT**: `model_registry.verify_model_integrity` compares `deployed_hash` to `registry_hash` and checks `signature == "present"` before any model may serve; run against `GXP-SUM-1`'s real mismatch it returns `may_serve: False, reason_code: hash_mismatch` — detection happens at the integrity-check boundary, before serving, not after an incident is reported | FDE5 | `submission/evaluation/reports/detailed_results.jsonl` `S12-model-registry` |
| How is a checkpoint-resume incident detected? | **FACT**: `tool_gateway.invoke_tool`'s idempotency cache flags a repeated `idempotency_key` as `replay_detected: True`; exercised against `AR-77`'s real `run_id` in suite S08/`PUB-13`, the second invocation is correctly caught before a duplicate draft reservation would be created | FDE5 | E-006, E-007 |

## 3. Containment and kill switch

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What was the real containment action during `DT-1`? | **FACT**: `OT_FILL_FINISH` zone set to `connectivity: isolated during incident` (E-002) while MES/QMS/historian were down (E-001) — network-level isolation, not an application-level control this codebase implements | FDE5 | E-001, E-002 |
| Does this system have a kill switch for its own scope? | **FACT**: yes, structurally — `check_authorization` denies by default on any non-`active` `iam_state` (POL-01), and `invoke_tool` denies any `disposition:write` permission or `postAction` unconditionally (INV-01) regardless of tool approval status; there is no "override" path in the code that re-enables a denied action | FDE5 | `submission/src/services/authorization.py`; `submission/src/services/tool_gateway.py` |
| Is the AI-disabled path itself a containment tool? | **INTERPRETATION**: yes — `ai_disabled_offline_demo.py` proves the three workflows keep functioning with zero network calls, meaning cutting AI/model connectivity entirely (as `network_zones.csv` shows happened to `AI_CLOUD` during `DT-2`) is a viable containment action that does not stop the decision-support service itself | FDE5 | `submission/scripts/ai_disabled_offline_demo.py`; E-001 (`DT-2`) |

## 4. Evidence preservation

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Is evidence integrity preserved through an incident? | **FACT**: yes by construction — `evidence_resolver.verify_integrity` requires a real SHA-256 (`^[a-f0-9]{64}$`) and `source_preserved: true` on every evidence item regardless of system state; nothing in the workflow code path can mutate or drop an evidence item silently | FDE5 | `submission/src/services/evidence_resolver.py`; `submission/tests/test_evidence_integrity.py` |
| Is every action auditable after the fact? | **FACT**: yes — every workflow response carries `audit.event_id`; the P6 evaluation runner independently logs `scenario_id, input_hash, gate_outcome` per scenario (`detailed_results.jsonl`), giving two independent audit trails for the same run | FDE5 | `submission/evaluation/reports/detailed_results.jsonl` |

## 5. Rollback and reconciliation

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What rolls back if a model artifact fails integrity? | **DECISION**: `model_registry.verify_model_integrity` returning `may_serve: False` is the rollback trigger — the `lifecycle_label` (from `model_registry.csv` `status`) is passed through unchanged so a human reviewer sees exactly what stage the blocked model was in (`pilot`, `validated_scope_en_de`, etc.), never a bare "blocked" with no context | FDE5 | `submission/src/services/model_registry.py` |
| What reconciles a duplicated agent resume? | **FACT**: `AR-77`'s `resume_result: duplicates_created` (E-005) is the real disclosed failure this build's idempotency cache exists to prevent — replayed through `invoke_tool`, the second call is denied duplicate execution (`execution_count` held at 1), so reconciliation in this design is prevention-first, not cleanup-after | FDE5 | E-006, E-007 |

## 6. Communication and regulatory assessment

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Does an incident ever get silently absorbed into a normal response? | **FACT**: no — `supply_options._error_response` (the exception-path fallback) still returns `human_review.required: true`, `approvals_required: ["Supply Governance Board"]`, and `execution_status: "not_executed"` — an internal error produces a response that demands human/regulatory attention, not a silently-degraded success | FDE5 | `submission/src/workflows/supply_options.py` `_error_response` |

## 7. CAPA and resumption criteria

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What must be true before AI-assisted operation resumes after an outage? | **FACT**: `continuity_requirements.csv` sets the manual-runbook requirement per workflow (`required` for all three) and a maximum tolerated outage (`14` days for batch/supply, `0` hours for PV) — resumption criteria are therefore workflow-specific, not a single blanket switch | FDE5 | `data/continuity_requirements.csv` |
| Does a fixed defect become a regression case? | **DECISION**: yes, by convention established in `eval-ai-cache`'s workshop rule ("every confirmed application defect that is fixed must become a regression case") and already followed in this build: the `DT-2`/model-endpoint-outage condition became suite S12/`PUB-10`; the `GXP-SUM-1` hash mismatch became `S12-model-registry`; the `AR-77` duplicate-resume condition became suite S08/`PUB-13` — all three are now permanent, re-runnable checks (`python3 -B submission/evaluation/runner.py`), not one-off manual verifications | FDE5 | `submission/evaluation/datasets/S08_*.json`, `S12_*.json` |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Gap | No documented regulatory-notification decision tree exists for a confirmed model supply-chain compromise (who is told, within what window) — `knowledge/AI_INCIDENT_RESPONSE.md` states the mandatory controls but this artefact does not yet instantiate a named contact/timeline | Incident response could stall on "who do we tell" during a real event | FDE5 | P7 Ops (runbooks) | Open |
| R-002 | Risk | `DT-2` (AI primary region outage) remains `open` in the disclosed data with no resolution recorded — this artefact's containment narrative (§3) describes the correct response, not a confirmed resolution | Cannot claim the incident is closed | FDE1 | P7 Ops | Open |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| Model supply-chain incident detected before serving | `model_registry.verify_model_integrity` | Suite S12 `S12-model-registry` | `submission/evaluation/reports/detailed_results.jsonl` | PASS |
| Duplicate agent-resume incident prevented, not just logged | `tool_gateway.invoke_tool` idempotency cache | Suite S08 `PUB-13`; `test_replay_and_excessive_agency.py` | `submission/evaluation/reports/detailed_results.jsonl`; `submission/tests/` | PASS |
| Error path never silently succeeds | `supply_options._error_response` | `test_prohibited_supply_side_effects.py` | `submission/tests/` | PASS |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| FDE5 (self-review) | Reliability Lead | R-001 (no named regulatory-notification tree) is a real gap for P7, not glossed over | Recorded, deferred to P7 runbooks | 2026-08-11 |
