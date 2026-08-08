# DMAIC Lens — Frame (FULL cycle, per updated `prompts/02_scqa_minto.md`)

Frame is a designated full-DMAIC stage (with Discovery/01, DDD/04, C4/06, ADR/07). This file extracts the "Lean / DMAIC lens" section of `scqa_minto_decision_narrative.md` §C as a standalone artefact, per the stage's file contract — see that document for full narrative context.

## 1. Define

Restated at Frame level: the improvement problem is reducing evidence-assembly **Waiting** and **Motion** (per Discovery's Pareto candidate) while structurally preventing the prohibited terminal action in each of the three workflows. This sharpens Discovery's business-level Define into a bounded engineering/decision question (`scqa_minto_decision_narrative.md` §A "Question").

## 2. Measure

No new metrics added beyond Discovery's Measure set. Frame confirms which are the Measure targets the Answer will be judged against: release lead time (−14% target, baseline **Unknown**), evidence-assembly time per object (**Unknown**), PV duplicate rate (**Unknown**), fully-loaded cost with the human-review line corrected from its $0 booking (**Unknown**). All carried forward, none newly estimated — consistent with the Measure-first discipline for `hypothesis`-adjacent gaps even though overall framing mode is `decision-ready`.

## 3. Analyze

Frame's Complication (§A) **confirms** Discovery's Analyze conclusion rather than correcting it: the leading root-cause candidate remains control/process fragmentation (absence of an object-scoped, authority-aware evidence-resolution layer), not model capability. No new root cause was surfaced by restating the problem at Frame/narrative level.

## 4. Improve

The Answer itself is this stage's Improve candidate: deterministic-first evidence-reconciliation, with constrained/grounded AI layered on top only where justified against the non-AI baselines. **Rejected alternative**: an AI-first or agentic-first approach, rejected because Discovery's AI-specific waste register shows every named risk is a control/integration failure mode, not a model-capability gap — an AI-first approach would not address the root cause and would add new token/retrieval/model waste on top of unresolved control gaps. Still **PROVISIONAL** — no architecture exists yet; hardens at DDD (04).

## 5. Control

Provisional: the same Measure set above, checked post-decision, is the candidate Control mechanism. Ownership is not yet assigned — deferred to Prompt 09 (reconciliation) and Prompt 12 (Control close), per the governing plan's RACI (`submission/artefacts/ProjectPlan/AEGIS_PROJECT_PLAN_FINAL.md` §6.4).

## Cross-reference

Full narrative: `scqa_minto_decision_narrative.md`. Waste registers: `waste_register_downtime.md`, `waste_register_ai_specific.md` (this stage — carried forward from `01-discovery/`, confirmed unchanged).
