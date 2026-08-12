# Requirements and Traceability

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

**Stage note**: per the governing plan (`AEGIS_PROJECT_PLAN_FINAL.md` §12, artefact assignment matrix), this artefact spans Phases P2–P3. §1–5 are the **P2 portion** (stakeholder/business requirements, FRs, NFRs, GxP/safety/security/privacy requirements, acceptance criteria), derivable from Phase 1 (Discovery/Frame) and Phase 2 (DDD) work. §6 (traceability matrix) required C4 container IDs and ADR IDs that did not exist at P2 — now that `10_C4_ARCHITECTURE.md`/`11_ADR_REGISTER.md` (P3) exist, §6 is filled in below. §7 (waiver control process, distinct from the matrix) remains genuinely deferred — see §7.

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE2/FDE3 (P2 portion), FDE3/FDE5 (P3 completion) |
| Version / date | v0.2 (P2+P3 §6 complete; §7 remains deferred) — 2026-08-11 |
| Reviewers | FDE3, FDE5 |
| Status | Approved for defence — §6 completed, §7 explicitly out of scope for this pass |
| Related requirements / ADRs | `requirements/ASSESSMENT_RUBRIC.csv` RUB-05,07 (hard-gate related) |

## Purpose

Establishes traceable functional, non-functional, GxP, safety, security and privacy requirements for the three workflows, derived from case evidence and the domain model — not invented. Scope: requirements sufficient to drive Prompt 05 (Feature Specs) and Prompt 06 (C4). Accountable owner: FDE2/FDE3. Complete (P2 portion) when every requirement traces to a case fact or a domain invariant/policy.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `submission/artefacts/04-ddd/domain_model.md` §4 | This engagement | 10 invariants, 6 policies — direct requirement source | — |
| E-002 | `data/continuity_requirements.csv` | Current | Outage tolerances per workflow | NFR source |
| E-003 | `data/decision_rights.csv`, `ai_use_boundaries.csv` | Current | Prohibited-action requirements | GxP/safety requirement source |
| E-004 | `case/INTEGRATED_CASE.md` §9; `DEFINITION_OF_DONE.md` | Package | Acceptance-criteria source | — |

## 1. Stakeholder and business requirements

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What business requirement governs scope? | **FACT**: −14% release lead time by 2026-11-30, no spec/Quality-authority change (`board_requests.csv` BR-01) | FDE1 | `01_BUSINESS_CASE.md` §1 |
| What stakeholder requirements are binding? | **FACT**: EU QP and Safety Physician retain human-only final authority; Supply Governance Board retains draft-only AI authority (`decision_rights.csv`) — non-negotiable business requirement, not a design preference | FDE4 | `03_STAKEHOLDER_DECISION_RIGHTS.md` §2 |

## 2. Functional requirements (FR)

Derived directly from the domain model's invariants/policies and the three workflow definitions — each FR traces to an `INV-*`/`POL-*` or a case fact, not invented independently.

| FR ID | Requirement | Traces to |
|---|---|---|
| FR-01 | System shall assemble batch evidence (genealogy, EM, lab results, deviations, release packet) and classify `readiness_state` as one of `insufficient_evidence`/`conflicted_evidence`/`ready_for_authorized_review` | INV-01, INV-03; `case/INTEGRATED_CASE.md` §4 Workflow A; INJ-021 (genealogy break), INJ-022 (sterility excursion), INJ-023 (OOS/OOT disagreement), INJ-031 (validation-state ambiguity) |
| FR-02 | System shall never emit a `readiness_state` or any field implying release/reject/reprocess/relabel/recall | INV-01; `ai_use_boundaries.csv` |
| FR-03 | System shall extract, normalize (preserving verbatim), and surface duplicate candidates for PV cases, with required human review on every candidate | INV-04, INV-05, POL-04; INJ-037 (ICSR duplicate cluster) |
| FR-04 | System shall reconstruct candidate reporting-clock values from all available channels without collapsing them to one value | INJ-038; `04-ddd/domain_model.md` event-storming board |
| FR-05 | System shall generate draft supply/cold-chain options excluding quarantined/held inventory, each carrying `no_side_effects: true` including on error paths | INV-06, INV-07, POL-05; INJ-056 (allocation ethics), INJ-080 (checkpoint corruption), INJ-051 (cold-chain lane excursion), INJ-054 (critical excipient shortage), INJ-058 (recall-scope uncertainty) |
| FR-06 | System shall compute a real SHA-256 integrity hash and `source_preserved` flag for every evidence item cited | INV-08; INJ-029 (audit-trail disabled — the adjacent failure mode this hash/provenance requirement is designed to make detectable) |
| FR-07 | System shall check knowledge-document `status`/`trust` before any citation and exclude `untrusted` documents structurally | INV-09, POL-02; INJ-065 (prompt injection in SOP) |
| FR-08 | System shall check authorization from current IAM state at execution time, not from cached gateway state | POL-01; INJ-067 (entitlement revocation lag) |
| FR-09 | System shall surface, never silently resolve, unit/terminology/identity mismatches | INV-02, INV-10; INJ-024 (unit conversion defect), INJ-045 (IDMP identity conflict), INJ-008 (compound genealogy collision) |
| FR-10 | System shall deny execution of any tool not present in a signed/approved manifest | POL-06; INJ-066 (tool-manifest poisoning) |

**Additional scope — Workflow D (clinical trial context, not one of the three mandated workflows, see `WORKFLOW_D_CLINICAL_TRIAL_CONTEXT.md`):**

| FR ID | Requirement | Traces to |
|---|---|---|
| FR-11 | System shall never state or imply subject eligibility; disagreeing eligibility-threshold sources shall be surfaced as a contradiction | INV-11; INJ-014 (eligibility ambiguity) |
| FR-12 | System shall never confirm or deny treatment-arm/blinding status; unblinding-risk evidence shall be a flagged risk only | INV-12; INJ-016 (potential unblinding) |
| FR-13 | System shall never adjudicate a disagreeing endpoint conclusion; disagreement shall be surfaced as a contradiction | INV-13; INJ-019 (endpoint adjudication backlog) |
| FR-14 | System shall surface, never default, a site-approved-vs-global-current protocol-version conflict | POL-07; INJ-013 (protocol-version divergence) |
| FR-15 | System shall surface non-automated randomization events and site data-quality risk indicators as gaps/flags, never resolve them to an allocation or inspection outcome | `clinical_trial_context.py`; INJ-015 (randomization service outage), INJ-020 (site inspection risk) |

## 3. Non-functional requirements (NFR)

| NFR ID | Requirement | Traces to |
|---|---|---|
| NFR-01 | Batch and Supply workflows shall tolerate up to 14 days of AI unavailability with a mandatory manual runbook | `continuity_requirements.csv` |
| NFR-02 | PV workflow shall tolerate 0 hours of AI unavailability before the manual runbook is the operative path | `continuity_requirements.csv` |
| NFR-03 | Every response shall carry `request_id`, `as_of`, and `authorization{checked_at}` for auditability | `04-ddd/gen_ai_boundaries.md` §5 |
| NFR-04 | Token/context budgets shall be bounded per request to control cost (target: avoid the denial-of-wallet pattern already observed, INJ-076) | `01-discovery/waste_register_ai_specific.md` |
| NFR-05 | Retrieval shall be scoped per bounded context — no cross-workflow document retrieval | `04-ddd/gen_ai_boundaries.md` §2 |

**Baselines still Unknown** (carried from Discovery, not fabricated here): evidence-assembly time per object, PV duplicate rate, fully-loaded review cost — NFR targets for these remain qualitative until Measure data exists (`01-discovery/evidence_acquisition_backlog.md` item 1).

## 4. GxP, safety, security and privacy requirements

| ID | Requirement | Traces to |
|---|---|---|
| GXP-01 | No workflow shall perform or imply a regulated disposition (batch release/reject, final PV decision, stock allocation/ship/recall) | INV-01, INV-06; `case/INTEGRATED_CASE.md` §4 |
| GXP-02 | Every response shall name the accountable human role and the AI authority level (`none`/`draft only`) | `decision_rights.csv`; POL-01 |
| SEC-01 | Every tool invocation shall be checked against a signed manifest; unsigned/poisoned manifests shall be denied by default | POL-06; INJ-066 |
| SEC-02 | Authorization shall fail closed on stale or ambiguous state | POL-01; INJ-067 |
| PRIV-01 | Cross-border data movement and secondary use shall require explicit, evidenced approval — not inferred consent | INJ-060, INJ-064; `data/data_residency.csv`, `data_exports.csv` |
| PRIV-02 | Retention, legal hold, and deletion-request conflicts shall be surfaced to Legal/DPO/Quality jointly, never auto-resolved | INJ-035; `06_DATA_GOVERNANCE_INTEGRITY.md` §6 |

## 5. Acceptance criteria

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What proves a requirement is met? | **DECISION**: every FR/GXP/SEC/PRIV requirement above must have a corresponding negative test proving the prohibited behavior cannot occur, per the governing plan's Track A non-negotiable ("tests before inference") | FDE5 | `submission/tests/` (not yet built) |
| What proves the NFRs are met? | **DECISION**: NFR-01/02 proven by an AI-disabled continuity drill (governing plan M7); NFR-03 proven by audit-log inspection; NFR-04/05 proven by token/retrieval-scope tests | FDE5 | Not yet built |

## 6. Traceability matrix

**Completed** — C4 containers (`10_C4_ARCHITECTURE.md`) and ADRs (`11_ADR_REGISTER.md`) now exist, so the FR→container→ADR→test matrix deferred at P2 is filled in below rather than left `PENDING` past the point it's fabrication-risk-free to complete.

| FR ID | Container(s) | Governing ADR(s) | Test evidence |
|---|---|---|---|
| FR-01 | Batch Evidence Container | ADR-001 (Evidence-Resolver kernel) | `submission/tests/test_prohibited_batch_disposition.py` |
| FR-02 | Batch Evidence Container, Contract Validator | ADR-004 (contract validation build+runtime) | `submission/tests/test_prohibited_batch_disposition.py` |
| FR-03 | PV Case Container | ADR-001 | `submission/tests/test_prohibited_pv_auto_merge.py` |
| FR-04 | PV Case Container | ADR-001 | `submission/tests/test_prohibited_pv_auto_merge.py` |
| FR-05 | Supply Option Container, Contract Validator | ADR-004 | `submission/tests/test_prohibited_supply_side_effects.py` |
| FR-06 | Evidence-Resolver Service | ADR-001, ADR-005 (hash-chained Audit Store) | `submission/tests/test_evidence_integrity.py` |
| FR-07 | Knowledge Authority Gateway | ADR-007 (live per-citation status check) | `submission/tests/test_knowledge_authority_gate.py` |
| FR-08 | Authorization Service | ADR-006 (live IAM check, never cached) | `submission/tests/test_authorization_fail_closed.py` |
| FR-09 | Evidence-Resolver Service, Product & Substance ACL | ADR-001, ADR-002 (resolve-per-request identity) | `submission/tests/test_evidence_integrity.py` |
| FR-10 | Contract Validator | ADR-004 | `submission/tests/test_replay_and_excessive_agency.py` |
| FR-11–FR-15 (Workflow D, additional scope) | Not a named C4 container — deliberately not wired into the App demonstrator (`WORKFLOW_D_CLINICAL_TRIAL_CONTEXT.md` R-002) | N/A — Workflow D predates and sits outside the ADR set, by design | `submission/tests/test_prohibited_clinical_eligibility.py` |

Model-substitution and replay/excessive-agency controls (ADR-010's fixture pattern; ADR-003's in-process agent scope) are cross-cutting rather than FR-specific: `submission/tests/test_model_supply_chain_integrity.py`, `test_replay_and_excessive_agency.py`.

## 6a. Regulatory-information findings — closing INJ-046, INJ-047, INJ-049

Closes the three remaining regulatory-information `in_scope_open` injects from `04-ddd/inject_register_84.md`, each verified against the real disclosed CSV rows by `submission/scripts/data_integrity_findings_demo.py` (exit 0 iff every cited row is present; fails loud if the data drifts).

| ID | Finding (real evidence) | Never auto-resolved to | Acceptance evidence |
|---|---|---|---|
| INJ-046 | `data/product_labels.csv` shows NCB-204's risk-statement text and version diverge by market: EU v6 "severe infusion reactions including anaphylaxis", US v5 "serious infusion reactions", IN v3 "infusion reactions" — while `data/market_authorisations.csv` confirms all three markets are authorised at exactly those label versions, so the divergence is a real, currently-authorised cross-market wording gap, not a data error | One harmonized risk statement across markets | `submission/scripts/data_integrity_findings_demo.py::find_inj046_labeling_divergence`; `data/product_labels.csv`; `data/market_authorisations.csv` |
| INJ-047 | `data/regulatory_commitments.csv` `PMC-88` (NCB-204) records `tracker_due=2026-10-15` while `authority_letter_due=2026-09-30`; `data/authority_correspondence.csv` shows the authority's own letter (`EMA_letter_2026_114.pdf`) states the due date in natural language as "within 60 calendar days of receipt" of `2026-07-28T09:14:00Z`, machine-tracked as `2026-09-30` — a real 15-day disagreement between the tracker clock and the authority-letter clock | A single silently-picked due date | `submission/scripts/data_integrity_findings_demo.py::find_inj047_commitment_deadline_ambiguity`; `data/regulatory_commitments.csv`; `data/authority_correspondence.csv` |
| INJ-049 | `data/regulatory_changes.csv` `RC-19` (PAT model and control limit update) shows `EU_classification="Type II proposed"`, `US_classification="CBE-30 proposed"`, `dispute=open` — regulatory teams genuinely disagree on reportability-before-implementation across jurisdictions | A single reportability classification decided by this system | `submission/scripts/data_integrity_findings_demo.py::find_inj049_variation_classification_dispute`; `data/regulatory_changes.csv` |

## 7. Change and waiver control

**PENDING (Prompt 07 ADR / governing plan §17).** Change control process is already specified at the plan level ("Plan changes: new RAID row + version bump — not silent edit," `AEGIS_PROJECT_PLAN_FINAL.md` §17) but this artefact's own waiver process (e.g. how an NFR target gets waived with justification) is not yet instantiated — deferred to P3 completion of this artefact.

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Gap | §7 (waiver control process) remains deferred — change control is specified at the plan level but not instantiated as this artefact's own waiver workflow | Cannot claim full RTM+waiver closure yet | FDE3 | Before final defence, if a waiver is actually needed | Open — narrowed from §6+§7 to §7 only after this fix |
| R-002 | Assumption | FR/NFR list above is derived from evidence gathered so far; Prompt 05 (Feature Specs) may surface additional requirements | List may grow, not shrink | FDE2 | Prompt 05 | Open |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| Every FR traces to a domain invariant/policy or case fact | §2 table | Manual cross-check | `04-ddd/domain_model.md` §4 | Done — all 10 FRs verified |
| No FR implies a prohibited action | GXP-01 | Negative test suite (pending) | `submission/tests/` (not yet built) | Pending |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| — | FDE3/FDE5 (pending) | Not yet reviewed | — | — |
