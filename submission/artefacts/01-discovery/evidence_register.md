# Evidence Register — Prompt 01 Discovery

**Stage:** Discover · **Prompt:** `prompts/01_discovery.md` · **Phase:** P1 (plan §8) · **Gate target:** G1

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice · ABSTAIN = unresolved until evidence/as-of/auth present.

Scope of this Discovery pass: the three mandatory workflows and their shared cross-cutting evidence (D01 portfolio/value, D04 GMP/batch, D06 pharmacovigilance, D08 supply, plus the cross-cutting D05 data-integrity, D09 privacy, D10 security and D13 continuity dimensions that all three workflows touch). Full per-dimension deep dives happen in Prompt 04 (DDD) and Prompt 05 (feature specs); this register establishes the factual floor only.

---

## 1. Repository and source-system map

**FACT** — `case/SOURCE_SYSTEM_FACT_PACK.md` lists nine domains and their systems, each with a known-condition caveat:

| Domain | Systems | Known condition |
|---|---|---|
| Discovery | ELN, assay platform, image repository, compound registry | Research identifiers collide after acquisition; metadata incomplete |
| Clinical | EDC, CTMS, eConsent, IRT, ePRO, wearable hub, imaging core lab | Protocol/consent versions asynchronous; clocks differ |
| Manufacturing | ERP, MES, eBR, historian, PAT, warehouse system | Genealogy breaks during downtime; vendor interfaces use different units |
| Laboratory | LIMS, CDS, instrument PCs, notebooks, spreadsheets | Shared accounts, inconsistent OOS states, undocumented spreadsheets |
| Quality | eQMS, document management, training, supplier quality | Deviation taxonomies and effective documents inconsistent |
| Safety | Global safety DB, affiliate inboxes, vendors, literature, call centre | Duplicate cases, versioned terminology, conflicting awareness dates |
| Regulatory | RIM, eCTD archive, labeling, IDMP/SPOR staging | Product identities and commitments not synchronized |
| Supply | Serialization, logistics, cold-chain, CMO portals | Aggregation and logger association can be incomplete |
| AI platform | Gateway, model endpoints, vector store, tools, evaluator | Bundled vendor, stale entitlements, mutable manifests, weak cost controls |

**FACT** — `data/system_inventory.csv` (3 sampled rows) shows classification is itself unstable: `LIMS-4` (QC, GxP critical, validated), `AI-EVIDENCE` (Digital, business support, pilot), `BIOX-ELN` (Research, research only, acquired). `data/validation_inventory.csv` reportedly disagrees with `system_inventory.csv` on at least one system's validation state (INJ-031) — not yet cross-checked in this pass; flagged to the acquisition backlog below.

**INTERPRETATION** — This is not a single system-of-record architecture; it is a federation of 9+ domain systems plus spreadsheets, with no platform strong enough to be trusted by default.

## 2. Entities, identifiers and timestamp semantics

**FACT (examples, not exhaustive):**
- Batch/material identity can break across MES genealogy and warehouse consumption records (INJ-021, `batches.csv; material_genealogy.csv; warehouse_movements.csv`).
- Compound identity can collide: two acquired compounds share a local code but differ in structure/salt form (INJ-008, `compounds.csv; substance_master.csv`).
- Product identity (substance/strength/form) differs across RIM, ERP and regional registrations (INJ-045, `medicinal_products.csv; idmp_mappings.csv`).
- Time is not a single semantic: ICSR "awareness date" differs across vendor receipt, affiliate inbox and global safety database (INJ-038); wearable devices mix local time and UTC with DST errors (INJ-018); a lab result's unit assumption differs between sender (mg/L) and receiver (µg/mL) even when the *timestamp* is not in question (INJ-024).

**INTERPRETATION** — Identity and time are workflow-scoped, not global. Every workflow response must carry an explicit `as_of` and resolve identity via an evidence-resolver rather than assuming any single system's key is canonical (this is already reflected as a DECISION in the governing project plan §11.3, which specifies a shared evidence-resolver module for A/B/C).

## 3. Evidence ownership and authority

**FACT** — `case/SOURCE_SYSTEM_FACT_PACK.md`: *"No system is universally authoritative. Participants must define authority by business object, jurisdiction, effective time, process state and accountable role. A later timestamp is not automatically more authoritative than an approved signed record."*

**FACT** — `knowledge/` carries explicit authority status per document, not implied by content quality: `BATCH_RELEASE_EVIDENCE_POLICY.md` is current; `BATCH_RELEASE_POLICY_OLD.md` is superseded; `FAKE_PV_EXPEDITED_RULE.md` and `MALICIOUS_SUPPLIER_DEVIATION.md` are untrusted (poison candidates, tied to INJ-065); `RESEARCH_NOTE_UNAPPROVED.md` is draft; `LOCAL_WORK_INSTRUCTION_DE.md` is jurisdiction-local.

**FACT** — `data/decision_rights.csv`: batch certification is accountable to the **EU Qualified Person** with `ai_authority=none`; ICSR reportability is accountable to the **Safety Physician** with `ai_authority=none`; stock allocation is accountable to the **Supply Governance Board** with `ai_authority=draft only`.

**DECISION** — Treat `knowledge_catalog.csv` status + `decision_rights.csv` as the two authority gates every workflow response must check before citing a document or asserting a conclusion; this is not yet implemented (FDE3/FDE4 work).

## 4. Material inconsistencies, gaps and conflicts (representative, by workflow)

**Workflow A (batch):** genealogy break (INJ-021), sterility excursion with corrected organism ID (INJ-022), OOS vs OOT vs "invalid" disagreement across three systems (INJ-023), unit conversion defect mg/L vs µg/mL (INJ-024), back-entered EBR step during downtime (INJ-025), PAT model/recipe version desync (INJ-027), missing CMO audit-commitment confirmation in an EU release packet (INJ-028), validation-state disagreement across three inventories (INJ-031), unapproved dissolution spreadsheet with no version history (INJ-032), audit trail disabled for 47 minutes (INJ-029).

**Workflow B (PV):** duplicate ICSR cluster across three intake channels (INJ-037), reporting-clock disagreement (INJ-038), MedDRA version mismatch changing preferred term/signal grouping (INJ-039), IB/CDS/local-label expectedness disagreement (INJ-040), pregnancy/paediatric data inside a general queue (INJ-041), unverifiable social-media report (INJ-042), particle complaint possibly linked to both quality and safety (INJ-043), signal instability under duplicate-suppression assumptions (INJ-044).

**Workflow C (supply):** disputed cold-chain excursion with disputed logger/pallet association (INJ-051), sole-source excipient shortage with an 8-week recovery estimate (INJ-054), CMO double-booked capacity (INJ-055), demand exceeding stock across markets/trials/compassionate-use with an ethics dimension (INJ-056), incomplete recall-scope genealogy (INJ-058).

**Cross-cutting:** record-retention obligations conflict across legal hold, GxP retention and privacy deletion for the same record (INJ-035); prompt injection embedded in a supplier deviation PDF (INJ-065); a newly registered batch-status tool that silently writes a disposition field (INJ-066); stale entitlement cached in the AI gateway after IAM revocation (INJ-067).

**INTERPRETATION** — These are not edge cases to design around later; they are the primary test surface. A workflow that cannot represent "I found two answers and neither is clearly authoritative" is not viable for this case.

## 5. Stakeholder decisions and decision horizons

**FACT** — `case/STAKEHOLDER_PACK.md` lists 15 stakeholders with mandate/incentive/concern/decision-authority (full detail carried into artefact 03). Five deliberate conflicts are named directly in the pack:
1. Quality vs. Manufacturing — speed vs. evidence completeness as the binding constraint.
2. Global process owners (standardization) vs. local accountable roles (jurisdictional variance).
3. Privacy (minimization) vs. Legal/GxP (defensible preservation).
4. Procurement (bundled vendor) vs. Architecture/CISO (substitutability).
5. Clinical Operations (automation) vs. Biostatistics/investigators (prespecified, explainable transformations).

**Decided (FACT, `case/INTEGRATED_CASE.md` §4–5):** the three workflows' scope and their prohibited terminal actions are fixed by the case, not open for participant redesign.

**Pending (this Discovery pass):** which knowledge documents are trusted per workflow; how the evidence-resolver adjudicates conflicting authority; team seat assignment (plan §6.1 — names not yet filled).

**Horizon:** Board due date on the headline metric is **2026-11-30** (`data/board_requests.csv`, BR-01); the governing project plan targets **G1 at hour 7** of the 40-hour Track A budget.

## 6. Constraints register (visible in evidence)

| Class | Constraint | Source |
|---|---|---|
| Business | −14% end-to-end release lead time, no spec/Quality-authority change, due 2026-11-30 | `data/board_requests.csv` BR-01; INJ-001 |
| Business | Four conflicting function-level KPIs (Mfg 98% schedule adherence, Quality 96% right-first-time, Safety 100% expedited-on-time, Clinical DB lock 2026-09-15) | `data/kpi_conflicts.csv`; INJ-002 |
| Prohibited action | No AI autonomy over formulation, spec, clinical eligibility, safety-case disposition, batch release or recall | `data/ai_use_boundaries.csv`; INJ-006 |
| Decision rights | Batch certification / ICSR reportability = `ai_authority: none`; stock allocation = `ai_authority: draft only` | `data/decision_rights.csv` |
| Continuity | 14-day max AI outage for batch_review and supply_planning with mandatory manual runbook; pv_intake has a 0-hour max AI outage tolerance before manual runbook engages | `data/continuity_requirements.csv`; INJ-082 |
| Economics | Inference cost $184,000/mo booked; human quality-review and medical-review costed at $0/mo | `data/cost_model.csv`; INJ-077 |
| Security | Untrusted knowledge documents and a poisoned tool manifest are already present in the estate | `knowledge/FAKE_PV_EXPEDITED_RULE.md`, `MALICIOUS_SUPPLIER_DEVIATION.md`; `data/tool_manifest_poisoned.json`; INJ-065/066 |
| Regulatory | Non-binding regulatory anchor list only (21 CFR Part 11, EU GMP Annexes, ICH Q9/Q10/E6/E8, GVP, IDMP, India NDCT, GDPR/EU AI Act, ISO 42001/27001) — jurisdiction/purpose/role must be stated per conclusion | `case/REGULATORY_BOUNDARY_PACK.md` |

## 7. Current-state workflow sketch (as observed, not redesigned)

**ASSUMPTION (marked as inferred — no direct process-map artifact was supplied):**
- **Batch review today:** a human reviewer manually pulls genealogy, EM/micro results, deviations/CAPA, change-control and supplier-audit records from separate systems (MES, LIMS, eQMS, supplier-quality) to assemble a release packet; QP certifies. Time is spent on evidence assembly and reconciliation, not on the certification judgement itself — this is the implied target of the "−14% lead time" ask (BR-01) and the reason `no_ai_baselines.csv` scores `master_data_repair` and `rules_workflow` as the leading non-AI options (see §9).
- **PV intake today:** cases arrive from multiple channels (patient programme, literature vendor, call centre) without deduplication at source, get coded against whichever MedDRA version is locally current, and go through a reporting-clock reconstruction that depends on which system's timestamp is used — all consistent with INJ-037/038/039 being framed as *existing* conditions, not hypothetical failure modes.
- **Supply/cold-chain today:** allocation decisions are made under incomplete/disputed cold-chain evidence and genuine multi-claimant demand (trials, compassionate use, markets) with no visible single source of truth for "what is actually available and released."

## 8. Fact / derivation / assumption / question register (sample — not exhaustive)

| # | Class | Statement | Basis |
|---|---|---|---|
| F-01 | FACT | Board wants −14% release lead time without spec or Quality-authority change, due 2026-11-30 | `board_requests.csv` BR-01 |
| F-02 | FACT | AI must never release/reject/reprocess/recall a batch, make final PV decisions, or reserve/allocate/ship stock | `ai_use_boundaries.csv`; case §4 |
| F-03 | FACT | Human quality/medical review cost is currently booked at $0 in the cost model | `cost_model.csv` |
| I-01 | INTERPRETATION | The $0 review-cost line is a deliberate omission the business case must correct, not a true zero | INJ-077 + `staff_rates.csv` showing non-zero loaded rates for Quality reviewer/Safety physician/Regulatory strategist |
| A-01 | ASSUMPTION | Current-state batch/PV/supply processes are manual and system-fragmented as described in §7 | Inferred from system/process evidence; no direct workflow diagram supplied |
| Q-01 | QUESTION | Which knowledge documents are in scope as "trusted" for each workflow, and by what rule? | Open — blocks Prompt 04/05 design |
| Q-02 | QUESTION | Does the evidence-resolver's authority ruling need to be itself auditable/citable, or only its output? | Open — affects contract schema (`evaluation/contracts/evidence_item.schema.json`) |

## 9. Top ten investigation hypotheses (ranked by impact on framing/design)

1. The −14% lead-time target is achievable primarily through evidence reconciliation, not new clinical/quality judgement — testable against `no_ai_baselines.csv` (rules_workflow 27% / 6wk, master_data_repair 38% / 10wk, genai_assist 51% / 14wk).
2. The true cost baseline is understated because human review cost is $0-booked (INJ-077); the business case in artefact 01 must correct this before any ROI claim.
3. A single shared evidence-resolver (hash + authority + relationship-model check) can serve all three workflows rather than three bespoke reconciliation engines — already a DECISION in the governing plan (§11.3) but unverified against actual schema needs until Prompt 05/08.
4. Knowledge-document trust cannot be content-inferred; it requires an explicit status check per query, or INJ-065-class poisoning succeeds by default.
5. Identity resolution (batch, compound, product, patient/case) is the dominant technical risk across all three workflows, not model quality.
6. The −14%/no-AI comparison (hypothesis 1) may itself be a decision-forcing trap: `INJ-003` frames this explicitly as a challenge to justify AI at all.
7. PV intake has zero AI-outage tolerance (`continuity_requirements.csv`) while batch/supply tolerate 14 days — this asymmetry should drive different degraded-mode design per workflow, not one shared continuity plan.
8. The five stakeholder conflicts in `STAKEHOLDER_PACK.md` map onto five separate escalation paths the RACI in artefact 03 must resolve individually, not with one generic "escalate to manager" rule.
9. Security posture cannot be bolted on after G4 — INJ-065/066/067 are already-present conditions, meaning the evidence-resolver must treat retrieval as untrusted from its first version, not after a later hardening pass.
10. The regulatory boundary pack is explicitly non-binding (`REGULATORY_BOUNDARY_PACK.md`) — every regulatory claim in later artefacts must state jurisdiction/purpose/role/system-boundary explicitly or it is not defensible at G3/G4.

## 10. AI FDE input sufficiency score

| AI FDE input | Score | What exists | What is missing |
|---|---|---|---|
| Business context | **Strong** | Board target (BR-01), KPI conflicts, portfolio risk profile, patent-cliff timing, cost model | Real-world validation of the −14% target's basis (synthetic by design) |
| User workflow | **Partial** | System landscape, known failure conditions per domain, decision-rights table | No literal current-state process map/diagram; §7 is inferred, not observed |
| Constraints | **Strong** | Prohibited actions, decision rights, continuity SLOs, regulatory anchor list, security preconditions (poisoned tool/doc already present) | Jurisdiction-by-jurisdiction regulatory applicability still requires explicit team decision per `REGULATORY_BOUNDARY_PACK.md` |
| Evidence (data, logs, research) | **Strong** | 143 CSVs, 84 injects fully disclosed and evidence-mapped, 15 public fixtures | Evidence is synthetic and partial by design (`referenced_missing`/`unknown` states are deliberate) |
| Stakeholder needs | **Strong** | 15 stakeholders with mandate/incentive/concern/authority, 5 named conflicts | Seat assignment (who on the team owns which stakeholder relationship) not yet done |

**Overall framing mode: `decision-ready`.** Evidence and stakeholder needs are Strong; user workflow is Partial but the gap (a literal process diagram) does not block writing Situation/Complication in Prompt 02 — the fragmentation and its consequences are independently evidenced by the inject catalogue and system fact pack. Proceed decision-ready; flag §7 process sketch explicitly as assumption-based in downstream artefacts.

---

*Continued in: `evidence_acquisition_backlog.md`, `dmaic_lens.md` (full DMAIC), `waste_register_downtime.md`, `waste_register_ai_specific.md`. (`early_waste_signals.md` is superseded, kept as historical seed only.)*
