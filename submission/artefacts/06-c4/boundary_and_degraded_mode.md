# Boundaries and Degraded/Offline Mode (Prompt 06)

## Data / trust / privacy / authority / connectivity boundaries

| Boundary | Where it sits | Control |
|---|---|---|
| Data (read vs. write) | Every container ↔ external system edge | All read-only; PROHIBITED write paths drawn explicitly (`c4_context.md`, `c4_containers.md`) |
| Trust (document citation) | Knowledge Authority Gateway ↔ knowledge corpus | Status-gate (`approved`/`superseded`/`draft`/`untrusted`/`local_approved`) before any citation, INV-09 |
| Privacy | Evidence-Resolver ↔ any personal-data-bearing source | Purpose/jurisdiction check before cross-border use (INJ-060/064, `06_DATA_GOVERNANCE_INTEGRITY.md` §6) — component-level design deferred to Prompt 08 (Technical Design) |
| Authority | Authorization Service ↔ every core container | Execution-time IAM check, never cached-gateway-state (POL-01, INJ-067) |
| Connectivity | App ↔ core containers ↔ Model Endpoint | Model Endpoint is the only optional/external-dependency edge; all core-container-to-core-container paths are internal |

## Degraded / offline mode

| Scenario | Behavior | Evidence |
|---|---|---|
| Model Endpoint unavailable (any duration) | Batch/PV containers continue functioning without the optional Summarizer/Similarity agents — evidence assembly, classification, and contradiction surfacing are all deterministic and do not depend on the endpoint | `04-ddd/gen_ai_boundaries.md` §1 |
| AI unavailable up to 14 days (Batch/Supply) | Manual runbook engages; system remains usable in a reduced (non-agent) mode throughout | `continuity_requirements.csv`; NFR-01 |
| AI unavailable any duration (PV) | Manual runbook is the default operative path, not a 14-day fallback — PV's core function was never designed to depend on AI | `continuity_requirements.csv`; NFR-02 |
| Source system unavailable (e.g. ransomware/OT segmentation, INJ-069) | Evidence-Resolver surfaces `gaps` for the affected object rather than blocking the entire response — partial evidence is still assembled and gaps are explicit, not hidden | `04-ddd/domain_model.md` (Evidence & Provenance context) |
| Knowledge corpus partially unavailable | Knowledge Authority Gateway returns only status-verified citations available; an uncitable claim is flagged as an abstention, never silently dropped | POL-02 |

## Prohibited operational write paths (consolidated)

No container, under any mode (normal or degraded), writes to: `batches.status`, `inventory.quality_status`, ICSR case disposition fields, or any reservation/allocation record. This is asserted at three independent layers — contract schema (`execution_status: const "not_executed"`), invariant design (INV-01/06/07), and this boundary document — deliberately redundant, per the governing plan's "guardrails traced to INV-*/POL-*" requirement.
