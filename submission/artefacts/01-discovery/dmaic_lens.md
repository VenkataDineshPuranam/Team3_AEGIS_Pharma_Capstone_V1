# DMAIC Lens — Prompt 01 (thin Measure/Define only)

Per `prompts/01_discovery.md`: this is a short lens, not the full Prompt 09 Lean workshop. Do not run Analyse/Improve/Control here.

## 1. What can already be measured

- **Board target metric** — release lead time, with an explicit numeric target (−14%) and due date (2026-11-30). Baseline lead-time value itself is **not yet in evidence** — `board_requests.csv` states the target, not the current-state number.
- **No-AI comparison baselines exist as estimates**, not measurements: `no_ai_baselines.csv` gives estimated value % and duration in weeks for three options (master_data_repair 38%/10wk, rules_workflow 27%/6wk, genai_assist 51%/14wk) — these are themselves synthetic planning estimates, to be treated as INTERPRETATION inputs, not measured facts.
- **Cost signals exist and are partially measured, partially missing**: `cost_model.csv` gives a real inference-cost figure ($184,000/mo) and a real observability figure ($31,000/mo), but human quality-review and medical-review costs are booked at $0 — a known gap (INJ-077), not a true zero.
- **Continuity/outage tolerance is measured as a policy value**, not an observed incident rate: `continuity_requirements.csv` states max AI outage (14 days for batch/supply, 0 hours for PV) as a requirement, not a historical MTTR.

## 2. Baselines that are Unknown

- Current-state release lead time (the number the −14% target applies against).
- Current-state PV case cycle time and duplicate rate.
- Current-state supply/cold-chain option turnaround time.
- True fully-loaded review cost (human_quality_review and medical_review lines are $0-booked, not measured).
- Error/defect rate for unit-mismatch or terminology-mismatch incidents (INJ-024, INJ-039 are known occurrences, not a measured rate).

## 3. Top 3 early waste signals (see `early_waste_signals.md` for full list)

1. Manual, multi-system evidence assembly before the accountable human can act — **observed**.
2. Rework from unit/terminology mismatches already present in the data — **observed**.
3. Retrieval/token waste risk if trust-by-default retrieval is built — **hypothesized**.

## 4. What Prompt 09 (full DMAIC) must Measure before scaling automation

- Real current-state lead time per workflow (to validate the −14% target is even attributable to evidence-reconciliation effort vs. other bottlenecks).
- Real fully-loaded cost including human quality/medical review (to correct the INJ-077 gap before any ROI claim in artefact 01/23).
- Defect/rework rate attributable specifically to identity, unit, terminology and temporal mismatches (to size the evidence-resolver's expected value).
- Duplicate-case rate in PV intake before and after any dedup-support feature.
- Actual AI outage/incident history (none yet — system is pre-build) once the workflows are live, to validate the 14-day/0-hour continuity targets are achievable, not just declared.

**Status: thin lens only. Full DMAIC workshop is out of scope for this Discovery pass and belongs to Prompt 09 / artefact 02 §§3–5 (Analyse/Improve/Control).**
