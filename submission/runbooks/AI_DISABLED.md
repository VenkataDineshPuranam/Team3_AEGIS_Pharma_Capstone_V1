# AI-Disabled Continuity Runbook

Authority: `knowledge/AI_DISABLED_CONTINUITY.md` (K-002, approved, effective 2026-06-20): "Maintain a documented manual path for each mandatory workflow. Reconcile work performed during outage before resuming AI-assisted processing. Do not degrade into an unvalidated or higher-authority automated mode."

## The claim, and how it's proven

**Claim**: all three workflows keep functioning with zero AI/model dependency and zero network calls.

**Proof, not assertion**: `submission/scripts/ai_disabled_offline_demo.py` monkey-patches `socket.socket.connect` to raise `NetworkAttemptDuringOfflineRun` for the duration of the run, then executes all three workflows against real fixture data (`NCB204-B24071` evidence conflict, `PV-1001`/`PV-1014` duplicate at similarity 0.93, `NCB-204` inventory with a quarantine + released row). This is a stronger guarantee than "no call was observed" — it proves no call was *attempted*, offline-capability by construction.

Run it:

```sh
submission/scripts/run.sh
```

Exit 0 iff all three workflows ran, every response's `execution_status == "not_executed"`, and no network attempt occurred.

## Why this works: there was never an AI dependency in the control layer to begin with

`04-ddd/gen_ai_boundaries.md` §1 DECISION: every invariant (INV-01…10) and policy (POL-01…06) is enforced by deterministic code, never by model judgement. No workflow file (`submission/src/workflows/*.py`) contains a model/API call. "AI-disabled mode" is therefore not a degraded fallback path requiring separate maintenance — it is the system's only mode. Where generative assistance is later added (the 2 narrow-scope agents named in `gen_ai_boundaries.md` §1, neither built in this Track A submission), it sits outside this control layer by design.

## Per-workflow continuity requirement (`data/continuity_requirements.csv`)

| Workflow | Max AI outage tolerated | Manual runbook required |
|---|---|---|
| `batch_review` | 14 days | Yes |
| `pv_intake` | **0 hours** | Yes |
| `supply_planning` | 14 days | Yes |

`pv_intake` has zero tolerance for any AI-dependent step — since no step in the shipped code is AI-dependent, this bar is met trivially and permanently, not through a 0-hour SLA the team has to race to meet during a real outage.

## Reconciliation after restoration

Per K-002's second mandatory control ("reconcile work performed during outage before resuming AI-assisted processing"): since this build has no AI-assisted processing to resume into, and every response produced during "outage" is identical in shape and content guarantees to one produced with AI/network fully available, there is no reconciliation step required for the deterministic control layer itself. If/when the two narrow-scope agents (`gen_ai_boundaries.md` §1) are built, this section must be revisited before they ship — recorded as an open item, not silently assumed to still hold.

## Verify this claim yourself

```sh
python3 -B submission/scripts/ai_disabled_offline_demo.py   # exit 0 = proof holds
python3 -B -m unittest submission.tests.test_authorization_fail_closed -v
```

## Related

- `OPERATIONS.md` — day-to-day commands
- `INCIDENT.md` — what to do during a live outage
- `submission/artefacts/24_RELIABILITY_OBSERVABILITY.md` §6 — fallback-model risk if AI is later reintroduced
