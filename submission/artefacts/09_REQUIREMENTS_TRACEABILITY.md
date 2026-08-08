# Requirements and Traceability

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

**Stage note**: per the governing plan (`AEGIS_PROJECT_PLAN_FINAL.md` §12, artefact assignment matrix), this artefact spans Phases P2–P3. This is the **P2 portion**: stakeholder/business requirements, functional requirements, NFRs, GxP/safety/security/privacy requirements, and acceptance criteria — all derivable from Phase 1 (Discovery/Frame) and Phase 2 (DDD) work already done. §6 (full traceability matrix) and §7 (change/waiver control) require C4 container IDs and ADR IDs that do not exist until Phase P3 (Architecture) — those sections are explicitly marked **PENDING (Prompt 06/07)**, not fabricated.

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE2/FDE3 (P2 portion), FDE3/FDE5 (P3 completion) |
| Version / date | v0.1 (P2 portion) — 2026-08-08 |
| Reviewers | FDE3, FDE5 |
| Status | Draft — partial (P2 scope only) |
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
| FR-01 | System shall assemble batch evidence (genealogy, EM, lab results, deviations, release packet) and classify `readiness_state` as one of `insufficient_evidence`/`conflicted_evidence`/`ready_for_authorized_review` | INV-01, INV-03; `case/INTEGRATED_CASE.md` §4 Workflow A |
| FR-02 | System shall never emit a `readiness_state` or any field implying release/reject/reprocess/relabel/recall | INV-01; `ai_use_boundaries.csv` |
| FR-03 | System shall extract, normalize (preserving verbatim), and surface duplicate candidates for PV cases, with required human review on every candidate | INV-04, INV-05, POL-04 |
| FR-04 | System shall reconstruct candidate reporting-clock values from all available channels without collapsing them to one value | INJ-038; `04-ddd/domain_model.md` event-storming board |
| FR-05 | System shall generate draft supply/cold-chain options excluding quarantined/held inventory, each carrying `no_side_effects: true` including on error paths | INV-06, INV-07, POL-05 |
| FR-06 | System shall compute a real SHA-256 integrity hash and `source_preserved` flag for every evidence item cited | INV-08 |
| FR-07 | System shall check knowledge-document `status`/`trust` before any citation and exclude `untrusted` documents structurally | INV-09, POL-02 |
| FR-08 | System shall check authorization from current IAM state at execution time, not from cached gateway state | POL-01 |
| FR-09 | System shall surface, never silently resolve, unit/terminology/identity mismatches | INV-02, INV-10 |
| FR-10 | System shall deny execution of any tool not present in a signed/approved manifest | POL-06 |

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

**PENDING (Prompt 06 C4 / Prompt 07 ADR).** A full FR→container→ADR→test matrix requires C4 container IDs and ADR IDs that do not exist yet at this phase. Filling this now would fabricate architecture ahead of Prompt 06. The FR/GXP/SEC/PRIV IDs above are stable and ready to be traced once those IDs exist.

## 7. Change and waiver control

**PENDING (Prompt 07 ADR / governing plan §17).** Change control process is already specified at the plan level ("Plan changes: new RAID row + version bump — not silent edit," `AEGIS_PROJECT_PLAN_FINAL.md` §17) but this artefact's own waiver process (e.g. how an NFR target gets waived with justification) is not yet instantiated — deferred to P3 completion of this artefact.

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Gap | §6 and §7 incomplete pending Phase P3 (C4/ADR IDs) | Cannot claim full RTM closure yet — by design, per plan's own P2-P3 span for this artefact | FDE3 | Prompt 07 (ADR) | Open — expected |
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
