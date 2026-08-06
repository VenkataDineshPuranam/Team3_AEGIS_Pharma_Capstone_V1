# Evidence Acquisition Backlog — Prompt 01 Discovery

Required because one AI FDE input (User workflow) is scored Partial in `evidence_register.md` §10. Ordered by which later prompt it blocks.

| # | Artifact needed | Likely owner/source | Why it blocks | Priority |
|---|---|---|---|---|
| 1 | Explicit current-state process map for batch release, PV intake, and supply/cold-chain decisioning (today's manual steps, handoffs, systems touched, average cycle time per step) | Domain lead (FDE2) synthesizing from `case/SOURCE_SYSTEM_FACT_PACK.md` + inject evidence, since no literal diagram is supplied | Confirms/corrects the assumption-based sketch in `evidence_register.md` §7; feeds Prompt 03 (PRD) scope and Prompt 04 (DDD) bounded-context boundaries | Blocks framing (Prompt 02/03) |
| 2 | Cross-check of `system_inventory.csv` vs. `validation_inventory.csv` validation-state disagreement referenced by INJ-031 | Architecture/Build (FDE3) | Determines whether the shared evidence-resolver needs a validation-state conflict rule at v1 or can defer it | Blocks design (Prompt 04/08) |
| 3 | Confirmation of which `knowledge/` documents each workflow may cite by default, beyond the explicit untrusted/superseded/draft flags already known | GxP/Quality lead (FDE4) | Needed before the evidence-resolver's authority-check rule can be written precisely | Blocks design (Prompt 05/08) |
| 4 | Team seat assignment (names against FDE1–FDE5 in the governing plan §6.1) and stakeholder-relationship ownership mapping (plan §6.3) | Team, at kickoff | Needed for RACI in artefact 03 to be real rather than templated | Blocks framing (Prompt 02/03) |
| 5 | Jurisdiction, purpose, accountable role and system-boundary statement per regulatory claim, per `PACKAGE_SCOPE_AND_ASSUMPTIONS.md` "Regulatory boundary" clause | GxP/Quality lead (FDE4) with Regulatory Affairs stakeholder framing (`STAKEHOLDER_PACK.md`) | Blocks any artefact (13–15, 19–20) that asserts regulatory applicability | Blocks production/defence readiness |
| 6 | Decision on which single knowledge-graph-worthy relations (if any) justify a KG vs. simpler relational/lookup approach | Domain/Architecture (FDE2/FDE3) | Blocks artefact 08 (Knowledge Graph Decision) and downstream data-layer design | Blocks design (Prompt 04/08) |

**None of the above block Prompt 02 (Frame/SCQA)** — framing mode remains `decision-ready` per `evidence_register.md` §10; items 1–3 should be resolved before Prompt 04 (DDD) locks bounded contexts, and item 4 before Prompt 02's RACI section is finalized.
