# Incident Runbook

Scope: what to do when something goes wrong. Full analysis and evidence: `submission/artefacts/25_INCIDENT_RECOVERY.md`, `submission/artefacts/16_THREAT_ABUSE_MODEL.md`. This runbook is the short, actionable version.

## Incident classes and first action

| Class | Real evidence this is grounded in | First action |
|---|---|---|
| AI/model endpoint outage | `data/model_endpoints.csv`: `primary_large` (EU-West) `down`, `fallback_small` (OnPrem-DE) `available` | Confirm manual/deterministic mode is active — see `AI_DISABLED.md`. Do **not** auto-switch to the fallback model without re-running `evaluate.sh` suite S12 first (fallback has a known non-English fidelity regression, `24_RELIABILITY_OBSERVABILITY.md` §6) |
| Model supply-chain compromise | `data/model_artifacts.csv`: `GXP-SUM-1` deployed hash `sha256:222BAD` ≠ registry hash `sha256:222bbb`, signature `missing` | `model_registry.verify_model_integrity` already blocks serving (`may_serve: False, reason_code: hash_mismatch`) — confirm the block held, do not override it |
| Knowledge/retrieval poisoning | `knowledge/MALICIOUS_SUPPLIER_DEVIATION.md`, `knowledge/FAKE_PV_EXPEDITED_RULE.md` (both `status: untrusted`) | Confirm `knowledge_gateway.resolve_citation` refused citation (`citable: False`) — never manually re-enable a document by editing its status without a real authority change |
| Tool/identity abuse | `data/tool_manifest_poisoned.json`; `data/users_entitlements.csv` `contractor_77` revoked but `ai_gateway_state: active_cached` | Confirm `check_authorization` denied on live `iam_state`, not the cached gateway state (ADR-006) |
| Duplicate agent-resume | `data/agent_runs.csv` `AR-77`: `resume_result: duplicates_created` | Confirm `tool_gateway.invoke_tool`'s idempotency cache flagged the replay (`replay_detected: True`) before any resume is accepted |
| OT/production compromise (ransomware) | `data/downtime_events.csv` `DT-1`; `data/network_zones.csv` `OT_FILL_FINISH: isolated during incident` | Out of this system's direct control (network-level containment) — confirm this codebase's AI-disabled path (§`AI_DISABLED.md`) keeps the 3 workflows usable while OT is isolated |

## Containment (this codebase's own kill switch)

There is no "override" path in the code for a denied action:

- `authorization.check_authorization` denies by default on any non-`active` `iam_state` (POL-01) — the cached `ai_gateway_state` is never consulted.
- `tool_gateway.invoke_tool` denies any `disposition:write` permission or `postAction` unconditionally (INV-01), regardless of tool-approval status.

If an incident requires disabling AI/model dependency entirely, cutting network connectivity is safe and does not stop the three workflows — see `AI_DISABLED.md`.

**Literal kill switch (P9)**: this system has no live server/daemon to "kill" — it is a stateless CLI + static-file app. `submission/scripts/run.sh` checks for `submission/evidence/KILL_SWITCH` (a sentinel file) or `AEGIS_KILL_SWITCH=1` (an env var) before doing anything else, and refuses to run if either is set. To halt operation during a real incident: `touch submission/evidence/KILL_SWITCH`. To resume: remove that file. Verified this phase — both the file and env-var forms correctly block `run.sh` with exit code 1, and normal operation resumes cleanly once cleared.

## Evidence preservation

`evidence_resolver.verify_integrity` requires a real SHA-256 and `source_preserved: true` on every evidence item at all times — nothing in the workflow code path can mutate or drop an evidence item during an incident. Run `submission/scripts/export.sh` to snapshot current `evidence/` + `evaluation/reports/` + `artefacts/` before further changes.

## After the incident

1. Confirm resumption criteria per workflow (`data/continuity_requirements.csv`: `max_ai_outage_hours: 0` for `pv_intake`; `max_ai_outage_days: 14` for `batch_review`/`supply_planning`, manual runbook required for all three).
2. Add a regression scenario for the confirmed defect (`submission/evaluation/datasets/`) so it is re-checked on every future `evaluate.sh` run — per convention already followed for `PUB-10` (outage), `S12-model-registry` (hash mismatch) and `PUB-13` (duplicate resume).
3. Re-run `submission/scripts/test.sh` and `submission/scripts/evaluate.sh`; do not resume normal operation until both are green and `release_gates_blocked == 0`.

## Open gap (recorded honestly)

No named regulatory-notification contact/timeline exists yet for a confirmed model supply-chain compromise (`25_INCIDENT_RECOVERY.md` R-001) — `knowledge/AI_INCIDENT_RESPONSE.md` (K-004) states the mandatory controls but this runbook does not yet instantiate "who is told, by when." Escalate to the Regulatory Strategist role (`data/staff_rates.csv`) until this is closed.
