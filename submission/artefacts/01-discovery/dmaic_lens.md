# DMAIC Lens — Discovery (FULL cycle, per updated `prompts/01_discovery.md`)

Discovery is a designated full-DMAIC stage (with Frame/02, DDD/04, C4/06, ADR/07) — this replaces the earlier thin Measure/Define-only version of this file. Improve and Control content below is **provisional**: no architecture exists yet, so these are candidate directions to carry into Frame/PRD/DDD, not locked decisions. Full waste detail lives in `waste_register_downtime.md` and `waste_register_ai_specific.md` (this file summarizes and links to them).

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice · PROVISIONAL = candidate, not yet architecture-validated.

## 1. Define

**FACT**: the improvement problem is release-lead-time reduction (−14%, `board_requests.csv` BR-01) achieved without changing registered specifications or Quality authority (`data/ai_use_boundaries.csv`), across a fragmented, multi-system estate (`case/SOURCE_SYSTEM_FACT_PACK.md`).

**Scope boundary (FACT, `case/INTEGRATED_CASE.md` §4)**: three workflows only — GxP batch evidence reconciliation, PV case intake/signal support, supply/cold-chain option planning. Improvement is bounded to evidence assembly/reconciliation, never to the regulated decision itself.

## 2. Measure

**FACT** — what is already measurable: target metric (−14% lead time, due 2026-11-30); four function-level KPI targets (`kpi_conflicts.csv`); three non-AI improvement-option estimates, not measurements (`no_ai_baselines.csv`); partial cost model with a known $0-booked gap on human review (`cost_model.csv`, INJ-077).

**FACT** — what is Unknown: current-state release lead time (the number −14% applies to), PV case cycle time, supply-option turnaround time, true fully-loaded review cost, defect/rework rate from identity/unit/terminology/temporal mismatches. None of these are fabricated here; they are explicit gaps in `evidence_acquisition_backlog.md`.

**Full detail**: `evidence_register.md` §§1–10 and `evidence_acquisition_backlog.md`.

## 3. Analyze

**INTERPRETATION**, grounded in the two waste registers (not yet a confirmed root cause — Measure baselines are mostly Unknown):

- The dominant candidate root cause of the lead-time problem is **Waiting** and **Motion**: time spent on cross-system evidence reconciliation *before* the accountable human's judgement begins, not the judgement itself (`waste_register_downtime.md` Pareto section).
- A secondary candidate root cause is **Defects** propagating from unresolved identity/unit/terminology conflicts (INJ-024, INJ-039, INJ-021, INJ-045) that force rework once discovered downstream, rather than being caught at intake.
- **Fishbone (5 of the 8 standard branches populated from evidence; 3 not yet evidenced):**
  - *Process* — manual, sequential evidence assembly across 5+ systems before judgement (Waiting/Motion).
  - *Source documents/inputs* — untrusted/superseded/draft knowledge documents mixed with approved ones (`knowledge/` status variance); unapproved spreadsheet in the batch chain (INJ-032).
  - *Reference/master data* — identity collisions (compound INJ-008, product INJ-045) and validation-state disagreement (INJ-031).
  - *Control design* — audit trail disabled 47 minutes undetected (INJ-029); tool-manifest poisoning already present (INJ-066).
  - *Model behaviour* — not yet evidenced (no model exists); flagged **not applicable at this stage**, revisit once a model is built.
  - *People, retrieval, integration* — not yet evidenced at Discovery depth; carried to DDD (04)/C4 (06) as open branches.
- **5 Whys (top candidate — Waiting):** Why is release lead time high? → Evidence must be manually assembled from 5+ systems. → Why manually? → No shared, trusted, cross-system evidence view exists. → Why none? → Each system was built/acquired independently with no shared identity/authority model (`SOURCE_SYSTEM_FACT_PACK.md`, INJ-005 acquisition integration). → Why was this tolerated? → No single system was ever mandated as authoritative across business objects (deliberate, per case design — "no system is universally authoritative"). → **Root cause candidate:** the absence of an object-scoped, authority-aware evidence-resolution layer, not a deficiency in any single system.

**Root-cause register**: identity/authority fragmentation (process+data cause; candidate treatment: shared evidence-resolver) is the leading candidate; unresolved until Measure baselines exist to confirm magnitude.

## 4. Improve (PROVISIONAL)

Candidate treatment classes to carry into Frame (02) / PRD (03) / DDD (04) — none are locked:

1. **Deterministic validation / evidence-resolver** (non-AI-first) — computes integrity hashes, checks knowledge-document authority/status, validates identity/relationship links, and surfaces contradictions rather than resolving them silently. This directly targets the Waiting/Motion/Defects root causes above.
2. **Risk-tiered human review** — routes clean, fully-corroborated evidence faster while routing conflicted/incomplete evidence for deeper review, rather than uniform review depth for everything (addresses Non-utilised-talent waste).
3. **Constrained/grounded AI, only after the deterministic layer** — per `no_ai_baselines.csv`, AI is not the only or obviously-best lever; any AI component must be justified against `rules_workflow` (27%/6wk) and `master_data_repair` (38%/10wk) at Prompt 02/03, not assumed.

**Explicitly not recommended yet**: any agentic/autonomous component — insufficient evidence exists that model accuracy (vs. control/integration failures) is the dominant problem (`waste_register_ai_specific.md`, closing section).

## 5. Control (PROVISIONAL)

Candidate Control questions to firm up once Prompt 09 consolidates and Prompt 12 closes Control:

- Which metric proves the Waiting/Motion root cause was actually addressed (candidate: evidence-assembly time per object, once instrumented)?
- Who owns the evidence-resolver's authority ruling once built (candidate: shared ownership across P3/build and P4/GxP per the governing plan's RACI)?
- What re-triggers a revisit of this Analyze conclusion (candidate: if Measure baselines, once acquired, show Waiting/Motion is not in fact dominant)?

## Cross-reference

- Full waste detail: `waste_register_downtime.md`, `waste_register_ai_specific.md`.
- This full lens is a direct input to Prompt 02 (Frame/SCQA) — see `submission/artefacts/02-frame/`.
