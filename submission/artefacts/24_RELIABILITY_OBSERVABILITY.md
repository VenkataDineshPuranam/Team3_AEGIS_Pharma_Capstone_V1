# Reliability and Observability

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE5 (Security/Privacy/Eval/Reliability Lead) + FDE3 (Architecture) |
| Version / date | v1.0 — 2026-08-11 |
| Reviewers | FDE1, FDE4 |
| Status | Approved for defence |
| Related requirements / ADRs | `AEGIS_PROJECT_PLAN_FINAL.md` §5.3 NFRs; RUB-15; suite S12 (`submission/evaluation/datasets/`) |

## Purpose

States SLI/SLO, outage/fallback behaviour and evidence retention for the three workflows, grounded in the P5 AI-disabled proof and the P6 outage/model-substitution suite. Accountable owner: FDE5.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `data/model_endpoints.csv` | Package | `primary_large` (EU-West) status `down`; `fallback_small` (OnPrem-DE) status `available` | Real disclosed outage state |
| E-002 | `data/continuity_requirements.csv` | Package | `batch_review`/`supply_planning`: `max_ai_outage_days=14`, manual runbook required; `pv_intake`: `max_ai_outage_hours=0`, manual runbook required | Real disclosed requirement — PV has **zero** tolerated AI outage before manual mode is mandatory |
| E-003 | `data/downtime_events.csv` | Package | `DT-1`: MES/QMS/historian, ransomware containment, 2026-07-22T16:00→2026-07-23T08:00 (16h). `DT-2`: AI primary region, regional outage, started 2026-08-01T01:00, still `open` | Real disclosed events |
| E-004 | `data/network_zones.csv` | Package | `OT_FILL_FINISH`: restricted, isolated during incident. `AI_CLOUD`: external, unavailable primary | Real disclosed state |
| E-005 | `data/model_artifacts.csv`, `data/model_registry.csv` | Package | `GXP-SUM-1` deployed hash `sha256:222BAD` ≠ registry hash `sha256:222bbb`, signature `missing` | Real hash mismatch |
| E-006 | `submission/scripts/ai_disabled_offline_demo.py` | Generated P5 | Monkey-patches `socket.socket.connect` to raise for the run duration; all 3 workflows execute against real fixtures with zero network calls, exit 0 | `python3 -B submission/scripts/ai_disabled_offline_demo.py` |
| E-007 | `submission/evaluation/reports/detailed_results.jsonl` (suite S12) | Generated P6 | `PUB-10`: primary down + fallback available confirmed by execution; `S12-model-registry`: `GXP-SUM-1` correctly returns `may_serve: False, reason_code: hash_mismatch` via `model_registry.verify_model_integrity` | `python3 -B submission/evaluation/runner.py` |

## 1. Critical user journeys

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What are the three critical journeys? | **FACT**: Workflow A (batch evidence reconciliation), B (PV case intake/signal support), C (supply/cold-chain options) — each must remain available in a documented manual/deterministic mode, never silently degrade into an autonomous decision | FDE3 | `case/INTEGRATED_CASE.md`; `04-ddd/domain_model.md` |
| Which journey has the tightest reliability bar? | **FACT**: PV intake — `continuity_requirements.csv` sets `max_ai_outage_hours: 0` for `pv_intake` (E-002), the only workflow with an hours-not-days tolerance; batch/supply both get 14 days | FDE5 | E-002 |

## 2. SLI/SLO and error budgets

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What SLIs apply to a deterministic-only build? | **DECISION**: since no model inference runs in the shipped code path (`AEGIS_PROJECT_PLAN_FINAL.md` constraint 9), the primary SLI is **structural correctness under load**, not model latency/accuracy — measured as: (a) 100% of responses carry `execution_status: "not_executed"`, (b) 0 release-gate blocks across the evaluation suite, (c) reproducible offline execution (`ai_disabled_offline_demo.py` exit 0) | FDE5 | `submission/evaluation/reports/summary.json` (`release_gates_blocked: 0`) |
| What is the SLO for gate-block rate? | **DECISION**: 0 blocked release gates on any regression scenario before ship — currently met (0/18) | FDE5 | `submission/evaluation/reports/summary.json` |

## 3. Logs, metrics and traces

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What does every response carry for traceability? | **FACT**: every workflow response includes an `audit.event_id` field (`f"AUD-{request_id}"`, `submission/src/workflows/*.py`); the evaluation runner separately records `scenario_id, input_hash, impl_version, contract_version, result, evidence_path, reviewer_role, gate_outcome` per `evaluation/EVALUATION_PLAN.md`'s runner requirement | FDE5 | `submission/evaluation/reports/detailed_results.jsonl` |
| Are unusual token/volume patterns observable? | **FACT**: `data/security_events.csv` discloses two already-occurred anomalies neither of which was blocked: `SEC-1` cross-affiliate narrative query (48,900 tokens, `blocked: no`) and `SEC-2` oversized-document loop (980,000 tokens, `blocked: no`) — both are denial-of-wallet-shaped patterns (INJ-076) that a deployed system's observability layer must alert on, not silently pass | FDE5 | `data/security_events.csv` |

## 4. Data/model/prompt/tool lineage

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Is model lineage verified before serving? | **FACT**: yes — `model_registry.verify_model_integrity` compares `deployed_hash` to `registry_hash` and requires `signature: present`; run against the real disclosed mismatch (`GXP-SUM-1`: `sha256:222BAD` ≠ `sha256:222bbb`), it correctly returns `may_serve: False, reason_code: hash_mismatch` (INJ-070) | FDE5 | E-005, E-007 |

## 5. Capacity and backpressure

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Is there a denial-of-wallet control? | **FACT**: `submission/evaluation/graders/latency_cost_grader.py` enforces a `max_cost_per_task_usd` cap per scenario, exercised in suite S11 against the disclosed `PUB-14` usage figures — a scenario exceeding the cap is recorded as a release-gate-relevant finding (see artefact 23 §7) | FDE5 | `submission/evaluation/reports/detailed_results.jsonl` PUB-14 row |
| Are the two disclosed unblocked anomalies (§3) addressed? | **INTERPRETATION**: not yet enforced in code — `security_events.csv`'s `blocked: no` rows are a disclosed gap, not something this deterministic-only build fixes automatically; recorded as an open risk below | FDE5 | `data/security_events.csv` |

## 6. Outage, fallback and recovery

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What happens when the primary model is down? | **FACT**: `model_endpoints.csv` shows `primary_large` (EU-West) `down` with `fallback_small` (OnPrem-DE) `available` (E-001) — confirmed by suite S12/PUB-10 execution (`submission/evaluation/reports/detailed_results.jsonl`) | FDE5 | E-001, E-007 |
| Does the system have a proven zero-AI continuity path? | **FACT**: yes — `submission/scripts/ai_disabled_offline_demo.py` proves this by construction: `socket.socket.connect` is monkey-patched to raise for the run duration, and all three workflows still execute correctly against real fixtures (`NCB204-B24071` conflict, `PV-1001`/`PV-1014` duplicate, `NCB-204` quarantine), exit 0, zero network attempts | FDE5 | E-006 |
| Is switching to the fallback model itself safe? | **DECISION**: not without re-evaluation — `data/model_performance.csv` shows `PV-NER-4` drops from English F1 0.91 to Hindi F1 0.67, so blind fallback substitution risks exactly the regression INJ-081 warns about; fallback routing is therefore a reviewed decision, never an automatic one, in this build | FDE1 | `data/model_performance.csv`; artefact 23 §2 |
| What happened during the ransomware containment event? | **FACT**: `DT-1` — MES/QMS/historian systems down 2026-07-22T16:00→2026-07-23T08:00 (16h), `OT_FILL_FINISH` zone isolated during the incident (E-003, E-004) — this is INJ-069's real evidence trail, addressed by artefact 25's containment/kill-switch section | FDE5 | E-003, E-004 |

## 7. Alerting and evidence retention

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Is the current AI-region outage (`DT-2`) still open? | **FACT**: yes — `downtime_events.csv` records `DT-2` (AI primary region, regional outage) with `end: open` as of the fixture's `as_of` (2026-08-01) — this is the live condition suite S12/PUB-10 was written against, not a hypothetical | FDE5 | E-003 |
| What is retained for evidence after an outage? | **FACT**: every workflow response's `evidence` array carries `integrity.sha256`/`source_preserved: true` regardless of outage state (`evidence_resolver.verify_integrity`), so evidence integrity is not itself outage-dependent | FDE5 | `submission/src/services/evidence_resolver.py` |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Risk | Two disclosed denial-of-wallet-shaped security events (`SEC-1`, `SEC-2`) are recorded as `blocked: no` and no code in this build enforces a real-time block — the evaluation-time cap (§5) is a post-hoc grader, not a runtime guard | Cost/availability exposure if repeated in production | FDE5 | P7 Ops (runtime guard design) | Open |
| R-002 | Gap | `DT-2` (AI primary region outage) has no recorded `end` — vendor exit / extended-outage runway beyond 14 days is not modeled in this artefact | Continuity claim (`max_ai_outage_days: 14`) is untested past that horizon | FDE1 | Artefact 27 (Vendor Exit) | Open |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| Zero-network continuity proven, not asserted | Deterministic core, no model dependency | `ai_disabled_offline_demo.py` | `submission/scripts/ai_disabled_offline_demo.py` | PASS (exit 0) |
| Model supply-chain integrity checked before serving | `model_registry.verify_model_integrity` | Suite S12 `S12-model-registry` | `submission/evaluation/reports/detailed_results.jsonl` | PASS (hash mismatch correctly blocked) |
| Outage state reflects real disclosed data | `model_endpoints.csv` read directly | Suite S12 `PUB-10` | `submission/evaluation/reports/detailed_results.jsonl` | PASS |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| FDE5 (self-review) | Reliability Lead | R-001 (unblocked DoW events) is a real gap, not swept under the SLO table | Recorded, deferred to P7 | 2026-08-11 |
