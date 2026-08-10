# 84-Inject Register — Phase P2 Domain exit requirement

Per the governing plan (`AEGIS_PROJECT_PLAN_FINAL.md` §8, Phase P2 row: "P2: 05–08 + **84-inject register**"). This is a submission-side coverage assessment of the immutable `data/inject_evidence_map.csv` (which ships with every `participant_status` as `UNASSESSED` by design) — it does not edit that file.

**Method**: coverage was checked mechanically (`grep` for each `INJ-NNN` ID across every artefact written in Phases P1–P2) rather than asserted from memory, so this table reflects actual citations, not intent.

**Status legend**:
- **addressed** — cited by ID with a concrete design response (an `INV-*`/`POL-*`, a context canvas, or a named analysis) in at least one artefact.
- **in_scope_open** — belongs to one of the three mandated workflows or a cross-cutting spine context (Evidence & Provenance, Decision Authority & Accountability, Regulatory & Knowledge Authority, Product & Substance Master), but not yet individually treated. Carried forward to Prompt 05 (Feature Specs) or Prompt 06 (C4) — not a gap in this register, a gap in later work.
- **out_of_scope** — belongs to a domain this engagement does not build a workflow for (Discovery/Translational Science, Clinical Trial Management), per the Business Case's explicit scope narrowing (`01_BUSINESS_CASE.md` §5). Recorded here so the exclusion is a stated decision, not a silent omission.

## D01 — Portfolio, strategy and product value (in scope — cross-cutting business framing)

| Inject | Title | Status | Where addressed |
|---|---|---|---|
| INJ-001 | Board compression target | addressed | `01_BUSINESS_CASE.md` §1 |
| INJ-002 | Conflicting success metrics | addressed | `01_BUSINESS_CASE.md` §2; `02_DMAIC_WORKBOOK.md` |
| INJ-003 | No-AI challenge | addressed | `01_BUSINESS_CASE.md` §3; `02-frame/scqa_minto_decision_narrative.md` |
| INJ-004 | Patent-cliff urgency | addressed | `01_BUSINESS_CASE.md` E-007 |
| INJ-005 | Acquisition integration | addressed | `01-discovery/evidence_register.md` §9 |
| INJ-006 | Prohibited optimization | addressed | `01_BUSINESS_CASE.md` §5; `04-ddd/domain_model.md` INV-01 |

## D02 — Discovery, translational science and model risk (out of scope, one exception)

| Inject | Title | Status | Where addressed / reason |
|---|---|---|---|
| INJ-007 | Assay drift | out_of_scope | Discovery/Translational Science bounded context not built — not one of the three mandated workflows |
| INJ-008 | Compound genealogy collision | **addressed** (exception) | `04-ddd/domain_model.md` §7, Product & Substance Master ACL — identity-collision pattern recurs at the product-master level the three workflows *do* depend on |
| INJ-009 | Omics cohort bias | out_of_scope | Same as INJ-007 |
| INJ-010 | Preclinical image manipulation concern | out_of_scope | Same |
| INJ-011 | Unqualified research model | out_of_scope | Same |
| INJ-012 | Target-evidence conflict | out_of_scope | Same |

## D03 — Clinical development and trial integrity (out of scope, one exception)

| Inject | Title | Status | Where addressed / reason |
|---|---|---|---|
| INJ-013 | Protocol-version divergence | out_of_scope | Clinical Trial Management bounded context not built |
| INJ-014 | Eligibility ambiguity | out_of_scope | Same |
| INJ-015 | Randomization service outage | out_of_scope | Same |
| INJ-016 | Potential unblinding | out_of_scope | Same |
| INJ-017 | eConsent withdrawal mismatch | out_of_scope | Same (privacy pattern is structurally similar to INV-01-class invariants, but this specific inject not modeled) |
| INJ-018 | Decentralized-device clock skew | **addressed** (exception) | `07_ONTOLOGY_SEMANTIC_LAYER.md` §4 — cited as the concrete instance behind the general timezone/DST temporal-semantics requirement |
| INJ-019 | Endpoint adjudication backlog | out_of_scope | Clinical Trial Management not built |
| INJ-020 | Site inspection risk | out_of_scope | Same |

## D04 — GMP manufacturing, laboratories and batch release (in scope — Workflow A core)

| Inject | Title | Status | Where addressed |
|---|---|---|---|
| INJ-021 | Biologics batch genealogy break | addressed | `04-ddd/domain_model.md` INV-03; context canvas |
| INJ-022 | Sterility excursion | addressed | `04-ddd/context_map.md` canvas (known gaps) |
| INJ-023 | OOS/OOT disagreement | addressed | `04-ddd/domain_model.md` INV-03 |
| INJ-024 | Unit conversion defect | addressed | `04-ddd/domain_model.md` INV-02 (central example throughout) |
| INJ-025 | Electronic batch record exception | addressed | `06_DATA_GOVERNANCE_INTEGRITY.md` §4 (timeliness) |
| INJ-026 | Cleaning validation boundary | in_scope_open | Carried to Prompt 05 (Feature Specs) |
| INJ-027 | Process analytical technology drift | addressed | `01-discovery/waste_register_downtime.md` |
| INJ-028 | Qualified Person evidence gap | addressed | `04-ddd/context_map.md` canvas (known gaps) |

## D05 — Quality systems, validation and data integrity (in scope — Evidence & Provenance spine)

| Inject | Title | Status | Where addressed |
|---|---|---|---|
| INJ-029 | Audit-trail disabled | addressed | `01-discovery/waste_register_downtime.md`; `04-ddd/domain_model.md` |
| INJ-030 | Shared laboratory account | in_scope_open | Carried to Prompt 05 |
| INJ-031 | Validation-state ambiguity | addressed | `06_DATA_GOVERNANCE_INTEGRITY.md` §1 |
| INJ-032 | Unapproved spreadsheet | addressed | `06_DATA_GOVERNANCE_INTEGRITY.md` §1; `01-discovery/waste_register_downtime.md` |
| INJ-033 | CAPA effectiveness failure | addressed | `02_DMAIC_WORKBOOK.md` §3 (fishbone) |
| INJ-034 | Change-control bypass | in_scope_open | Carried to Prompt 05 |
| INJ-035 | Record-retention conflict | addressed | `06_DATA_GOVERNANCE_INTEGRITY.md` §6 (central example); `17_PRIVACY_ETHICS.md` §6 (deepened — 3-way legal-hold/GxP-retention/deletion conflict) |
| INJ-036 | ALCOA+ provenance break | addressed | `06_DATA_GOVERNANCE_INTEGRITY.md` §4 (central example) |

## D06 — Pharmacovigilance and benefit-risk (in scope — Workflow B core)

| Inject | Title | Status | Where addressed |
|---|---|---|---|
| INJ-037 | ICSR duplicate cluster | addressed | `04-ddd/domain_model.md` INV-05, POL-04 (central example) |
| INJ-038 | Reporting-clock conflict | addressed | `04-ddd/domain_model.md` §3 `awareness_date` |
| INJ-039 | MedDRA version mismatch | addressed | `04-ddd/domain_model.md` §7 ACL |
| INJ-040 | Expectedness source conflict | addressed | `04-ddd/domain_model.md` §3 `listedness` |
| INJ-041 | Pregnancy and paediatric sensitivity | addressed | `04-ddd/domain_model.md` aggregate composition |
| INJ-042 | Social-media authenticity | addressed | `01-discovery/evidence_register.md` §4 |
| INJ-043 | Product-quality and safety link | addressed | `04-ddd/domain_model.md` §8 (open cross-context question — deliberately unresolved, not silently dropped) |
| INJ-044 | Signal disproportionality instability | addressed | `01-discovery/evidence_register.md` §4 |

## D07 — Regulatory information and submissions (in scope, mostly open)

| Inject | Title | Status | Where addressed |
|---|---|---|---|
| INJ-045 | IDMP identity conflict | addressed | `04-ddd/domain_model.md` INV-10 (central example) |
| INJ-046 | Labeling divergence | in_scope_open | Carried to Prompt 05 |
| INJ-047 | Commitment deadline ambiguity | in_scope_open | Carried to Prompt 05 |
| INJ-048 | eCTD sequence gap | addressed | `06_DATA_GOVERNANCE_INTEGRITY.md` §1 |
| INJ-049 | Variation classification dispute | in_scope_open | Carried to Prompt 05 |
| INJ-050 | Inspection request surge | in_scope_open | Relevant to defence artefact (30) later; not yet modeled |

## D08 — Supply chain, serialization and anti-counterfeit (in scope — Workflow C core)

| Inject | Title | Status | Where addressed |
|---|---|---|---|
| INJ-051 | Cold-chain lane excursion | addressed | `04-ddd/context_map.md` canvas |
| INJ-052 | Serialization aggregation break | in_scope_open | Carried to Prompt 05 |
| INJ-053 | Counterfeit suspicion | in_scope_open | Carried to Prompt 05 |
| INJ-054 | Critical excipient shortage | addressed | `04-ddd/context_map.md` canvas |
| INJ-055 | CMO capacity conflict | addressed | `01-discovery/evidence_register.md` §4 |
| INJ-056 | Allocation ethics | addressed | `04-ddd/domain_model.md` INV-06/07, POL-05 (central example) |
| INJ-057 | Customs documentation mismatch | in_scope_open | Carried to Prompt 05 |
| INJ-058 | Recall-scope uncertainty | addressed | `04-ddd/context_map.md` canvas |

## D09 — Privacy, ethics and cross-border data (in scope — cross-cutting)

| Inject | Title | Status | Where addressed |
|---|---|---|---|
| INJ-059 | Genomic re-identification risk | addressed | `17_PRIVACY_ETHICS.md` §3 (genomic quasi-identifier finding, `privacy_risk.csv` singling-out=high) |
| INJ-060 | Cross-border secondary use | addressed | `06_DATA_GOVERNANCE_INTEGRITY.md` §6; `17_PRIVACY_ETHICS.md` §4 |
| INJ-061 | Data-subject request versus GxP record | addressed | `17_PRIVACY_ETHICS.md` §6 (central example — real DSR-17/LH-44 conflict) |
| INJ-062 | Patient-support programme leakage | addressed | `17_PRIVACY_ETHICS.md` §1 (finding + explicit scope-boundary decision; residual gap tracked as R-001) |
| INJ-063 | Research-commercial boundary | addressed | `17_PRIVACY_ETHICS.md` §4 |
| INJ-064 | Regional residency failure | addressed | `06_DATA_GOVERNANCE_INTEGRITY.md` §6 (central example); `17_PRIVACY_ETHICS.md` §5 |

## D10 — Cybersecurity, agentic security and Zero Trust (in scope — cross-cutting)

| Inject | Title | Status | Where addressed |
|---|---|---|---|
| INJ-065 | Prompt injection in SOP | addressed | `04-ddd/domain_model.md` INV-09, POL-02 (central example); `16_THREAT_ABUSE_MODEL.md` §3; failing spec `submission/tests/test_knowledge_authority_gate.py` |
| INJ-066 | Tool-manifest poisoning | addressed | `04-ddd/domain_model.md` POL-06; `16_THREAT_ABUSE_MODEL.md` §4; failing spec `submission/tests/test_knowledge_authority_gate.py` |
| INJ-067 | Entitlement revocation lag | addressed | `04-ddd/domain_model.md` POL-01; `07_ONTOLOGY_SEMANTIC_LAYER.md` §6; `16_THREAT_ABUSE_MODEL.md` §4; failing spec `submission/tests/test_authorization_fail_closed.py` |
| INJ-068 | Safety-data exfiltration | addressed | `16_THREAT_ABUSE_MODEL.md` §5 (finding + cross-affiliate scoping gap named; no ADR yet, tracked as R-002) |
| INJ-069 | Ransomware and OT segmentation | addressed | `06-c4/boundary_and_degraded_mode.md` — source-system unavailability produces explicit `gaps`, not a blocked response; `16_THREAT_ABUSE_MODEL.md` §6 (threat-actor framing added) |
| INJ-070 | Model supply-chain compromise | addressed | `01-discovery/waste_register_ai_specific.md`; `16_THREAT_ABUSE_MODEL.md` §6; `20_ISO42001_GOVERNANCE.md` §4; failing spec `submission/tests/test_model_supply_chain_integrity.py` |

## D11 — Human factors, responsible AI and adoption (in scope — cross-cutting)

| Inject | Title | Status | Where addressed |
|---|---|---|---|
| INJ-071 | Automation bias in batch review | addressed | `04_PRODUCT_SERVICE_BLUEPRINT.md` §4; `04-ddd/gen_ai_boundaries.md` §3; `15_QUALITY_RISK_MANAGEMENT.md` HAZ-02; `18_RESPONSIBLE_AI_HUMAN_FACTORS.md` §2 (concrete mitigation design added) |
| INJ-072 | Language inequity | addressed | `04_PRODUCT_SERVICE_BLUEPRINT.md` §6; `18_RESPONSIBLE_AI_HUMAN_FACTORS.md` §4 (hard-gate control added) |
| INJ-073 | Accessibility failure | addressed | `04_PRODUCT_SERVICE_BLUEPRINT.md` §6; `18_RESPONSIBLE_AI_HUMAN_FACTORS.md` §5 (binding build requirement added) |
| INJ-074 | Role conflict | addressed | `03_STAKEHOLDER_DECISION_RIGHTS.md` context; `18_RESPONSIBLE_AI_HUMAN_FACTORS.md` §1 (own design response — inline accountable-owner labeling) |

## D12 — Economics, token efficiency and vendor concentration (in scope — cross-cutting)

| Inject | Title | Status | Where addressed |
|---|---|---|---|
| INJ-075 | Model price shock | addressed | `01-discovery/waste_register_ai_specific.md` |
| INJ-076 | Denial-of-wallet pattern | addressed | `01-discovery/waste_register_ai_specific.md`; `09_REQUIREMENTS_TRACEABILITY.md` NFR-04 |
| INJ-077 | Hidden human-review cost | addressed | `01_BUSINESS_CASE.md` §4 (central example) |
| INJ-078 | Vendor concentration | addressed | `08_KNOWLEDGE_GRAPH_DECISION.md` §5 |

## D13 — Reliability, business continuity and retirement (in scope — cross-cutting)

| Inject | Title | Status | Where addressed |
|---|---|---|---|
| INJ-079 | Regional platform outage | in_scope_open | Carried to Prompt 06 (degraded-mode design) |
| INJ-080 | Checkpoint corruption | addressed | `04-ddd/domain_model.md` §4 (Improve, error-path idempotency) |
| INJ-081 | Model substitution regression | addressed | `01-discovery/waste_register_ai_specific.md` |
| INJ-082 | AI-disabled continuity | addressed | `01_BUSINESS_CASE.md`; `04_PRODUCT_SERVICE_BLUEPRINT.md` §5 (central example) |
| INJ-083 | Vendor exit deadline | in_scope_open | Carried to artefact 27 (Vendor Exit) |
| INJ-084 | Retirement and evidence preservation | in_scope_open | Carried to artefact 27/29 |

## Coverage summary

| Status | Count |
|---|---|
| addressed | 59 |
| in_scope_open (carried forward, real gap to close before defence) | 13 |
| out_of_scope (stated exclusion — Discovery/Translational Science, Clinical Trial Management) | 12 |
| **Total** | **84** |

**INTERPRETATION**: 59/84 (70%) addressed after four phases (Discovery/Frame/Domain/Architecture + Secure Design) is expected and healthy — the `in_scope_open` items are not a quality failure, they are the explicit backlog for P5 (Technical Design/POC build) work, which is exactly what this register exists to drive. The 12 `out_of_scope` items are a stated scope decision (two whole dimensions — Discovery/Translational Science, 5 of 6 injects, and Clinical Trial Management, 7 of 8 injects — are outside the three mandated workflows, with one addressed exception in each), not silently dropped injects.

*(Revision history: originally miscounted as 51/25/8 due to a hand-tally arithmetic error, corrected to 52/20/12 during Phase 3 cross-verification (2026-08-08); then INJ-069 upgraded from `in_scope_open` to `addressed` after Phase 3's degraded-mode design gave it substantive treatment, giving 53/19/12; then Phase 4 (artefacts 16-21) gave INJ-059, 061, 062, 063, 068 and 074 their own dedicated design response for the first time, upgrading all 6 from `in_scope_open` to `addressed` — mechanically confirmed via `grep -oh 'INJ-[0-9]\{3\}' submission/artefacts/{16,17,18,19,20,21}*.md`, giving the current 59/13/12.)*

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Risk | 19 `in_scope_open` injects (as of end of Phase 3) must be closed before `submission/evaluation`'s inject-test-coverage mirror (governing plan §11.1) can show anything but `NOT_RUN` for them | Could under-deliver on defence element 6 (unit/term/temporal/identity conflicts) if not closed by Prompt 08/09 | FDE2 | Prompt 08/09 | Open |
| R-002 | Decision | Two full dimensions (D02, D03) are scoped out entirely, with one addressed exception each (INJ-008, INJ-018) picked up incidentally via cross-cutting identity/temporal patterns | Correctly narrows scope per `01_BUSINESS_CASE.md` §5; must be defended explicitly at G8 defence if challenged | FDE1 | Defence prep | Closed — decision recorded here |
