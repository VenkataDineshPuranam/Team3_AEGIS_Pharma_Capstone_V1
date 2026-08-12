# Inject-to-Workflow Categorization

All 84 disclosed injects (`data/injects.json`), categorized by which of the three mandated workflows (A/B/C), the additional-scope Workflow D or Workflow E, a cross-cutting spine, or an explicit out-of-scope decision each belongs to. Derived from `submission/artefacts/04-ddd/inject_register_84.md` (source of truth for status and citations); this file adds the workflow grouping on top and does not change any status.

## Summary by workflow

| Workflow / grouping | Inject count |
|---|---|
| Workflow A (GxP batch review) | 8 |
| Workflow B (Pharmacovigilance) | 8 |
| Workflow C (Supply/cold-chain) | 8 |
| Workflow D (clinical trial, additional scope) | 8 |
| Workflow E (discovery/translational science, additional scope) | 6 |
| Cross-cutting (business framing) | 6 |
| Cross-cutting (Evidence & Provenance spine) | 8 |
| Cross-cutting (Regulatory info, supports A) | 6 |
| Cross-cutting (Privacy/Ethics) | 6 |
| Cross-cutting (Security) | 6 |
| Cross-cutting (Human factors/Responsible AI) | 4 |
| Cross-cutting (Economics/Token FinOps) | 4 |
| Cross-cutting (Reliability/Continuity) | 6 |
| **Total** | **84** |

## Summary by status

| Status | Count |
|---|---|
| addressed | 71 |
| in_scope_open | 0 |
| addressed (Workflow D) | 6 |
| addressed (Workflow E) | 5 |
| addressed (exception) | 2 |
| **Total** | **84** |

## Full categorization

| Inject | Dimension | Workflow | Title | Status | Where addressed / reason |
|---|---|---|---|---|---|
| INJ-001 | D01 | Cross-cutting (business framing) | Board compression target | addressed | `01_BUSINESS_CASE.md` §1 |
| INJ-002 | D01 | Cross-cutting (business framing) | Conflicting success metrics | addressed | `01_BUSINESS_CASE.md` §2; `02_DMAIC_WORKBOOK.md` |
| INJ-003 | D01 | Cross-cutting (business framing) | No-AI challenge | addressed | `01_BUSINESS_CASE.md` §3; `02-frame/scqa_minto_decision_narrative.md` |
| INJ-004 | D01 | Cross-cutting (business framing) | Patent-cliff urgency | addressed | `01_BUSINESS_CASE.md` E-007 |
| INJ-005 | D01 | Cross-cutting (business framing) | Acquisition integration | addressed | `01-discovery/evidence_register.md` §9 |
| INJ-006 | D01 | Cross-cutting (business framing) | Prohibited optimization | addressed | `01_BUSINESS_CASE.md` §5; `04-ddd/domain_model.md` INV-01 |
| INJ-007 | D02 | Workflow E (discovery/translational science, additional scope) | Assay drift | addressed (Workflow E) | `WORKFLOW_E_DISCOVERY_TRANSLATIONAL_SCIENCE.md` §2; INV-14; live suite S14 scenario `S14-assay-qualification-conflict` |
| INJ-008 | D02 | Workflow E (discovery/translational science, additional scope) | Compound genealogy collision | addressed (exception) | `04-ddd/domain_model.md` §7, Product & Substance Master ACL — identity-collision pattern recurs at the product-master level the three workflows *do* depend on |
| INJ-009 | D02 | Workflow E (discovery/translational science, additional scope) | Omics cohort bias | addressed (Workflow E) | `WORKFLOW_E_DISCOVERY_TRANSLATIONAL_SCIENCE.md` §2; INV-15; live suite S14 scenario `S14-omics-cohort-subgroup-gap` |
| INJ-010 | D02 | Workflow E (discovery/translational science, additional scope) | Preclinical image manipulation concern | addressed (Workflow E) | `WORKFLOW_E_DISCOVERY_TRANSLATIONAL_SCIENCE.md` §2; INV-16; live suite S14 scenario `S14-preclinical-image-forensics` |
| INJ-011 | D02 | Workflow E (discovery/translational science, additional scope) | Unqualified research model | addressed (Workflow E) | `WORKFLOW_E_DISCOVERY_TRANSLATIONAL_SCIENCE.md` §2; INV-17; live suite S14 scenario `S14-unqualified-research-model` |
| INJ-012 | D02 | Workflow E (discovery/translational science, additional scope) | Target-evidence conflict | addressed (Workflow E) | `WORKFLOW_E_DISCOVERY_TRANSLATIONAL_SCIENCE.md` §2; INV-18; live suite S14 scenario `S14-target-evidence-conflict` |
| INJ-013 | D03 | Workflow D (clinical trial, additional scope) | Protocol-version divergence | addressed (Workflow D) | `WORKFLOW_D_CLINICAL_TRIAL_CONTEXT.md` §2; POL-07; live suite S13 scenario `PUB-15` |
| INJ-014 | D03 | Workflow D (clinical trial, additional scope) | Eligibility ambiguity | addressed (Workflow D) | `WORKFLOW_D_CLINICAL_TRIAL_CONTEXT.md` §2; INV-11; live suite S13 scenario `PUB-15` |
| INJ-015 | D03 | Workflow D (clinical trial, additional scope) | Randomization service outage | addressed (Workflow D) | `WORKFLOW_D_CLINICAL_TRIAL_CONTEXT.md` §2; live suite S13 scenario `S13-randomization-outage` |
| INJ-016 | D03 | Workflow D (clinical trial, additional scope) | Potential unblinding | addressed (Workflow D) | `WORKFLOW_D_CLINICAL_TRIAL_CONTEXT.md` §2; INV-12; live suite S13 scenario `S13-unblinding` |
| INJ-017 | D03 | Workflow D (clinical trial, additional scope) | eConsent withdrawal mismatch | addressed | `17_PRIVACY_ETHICS.md` §6; `06_DATA_GOVERNANCE_INTEGRITY.md` §6 (first treatment); Workflow D adds a second, complementary demonstration of the same stale-cache pattern |
| INJ-018 | D03 | Workflow D (clinical trial, additional scope) | Decentralized-device clock skew | addressed (exception) | `07_ONTOLOGY_SEMANTIC_LAYER.md` §4 — cited as the concrete instance behind the general timezone/DST temporal-semantics requirement |
| INJ-019 | D03 | Workflow D (clinical trial, additional scope) | Endpoint adjudication backlog | addressed (Workflow D) | `WORKFLOW_D_CLINICAL_TRIAL_CONTEXT.md` §2; INV-13; live suite S13 scenario `S13-endpoint-adjudication` |
| INJ-020 | D03 | Workflow D (clinical trial, additional scope) | Site inspection risk | addressed (Workflow D) | `WORKFLOW_D_CLINICAL_TRIAL_CONTEXT.md` §2; live suite S13 scenario `S13-site-inspection-risk` |
| INJ-021 | D04 | Workflow A (GxP batch review) | Biologics batch genealogy break | addressed | `04-ddd/domain_model.md` INV-03; context canvas |
| INJ-022 | D04 | Workflow A (GxP batch review) | Sterility excursion | addressed | `04-ddd/context_map.md` canvas (known gaps) |
| INJ-023 | D04 | Workflow A (GxP batch review) | OOS/OOT disagreement | addressed | `04-ddd/domain_model.md` INV-03 |
| INJ-024 | D04 | Workflow A (GxP batch review) | Unit conversion defect | addressed | `04-ddd/domain_model.md` INV-02 (central example throughout) |
| INJ-025 | D04 | Workflow A (GxP batch review) | Electronic batch record exception | addressed | `06_DATA_GOVERNANCE_INTEGRITY.md` §4 (timeliness) |
| INJ-026 | D04 | Workflow A (GxP batch review) | Cleaning validation boundary | addressed | `submission/src/workflows/batch_evidence.py`; `submission/tests/test_prohibited_batch_disposition.py::TestINJ026CleaningValidationBoundaryConflict` |
| INJ-027 | D04 | Workflow A (GxP batch review) | Process analytical technology drift | addressed | `01-discovery/waste_register_downtime.md` |
| INJ-028 | D04 | Workflow A (GxP batch review) | Qualified Person evidence gap | addressed | `04-ddd/context_map.md` canvas (known gaps) |
| INJ-029 | D05 | Cross-cutting (Evidence & Provenance spine) | Audit-trail disabled | addressed | `01-discovery/waste_register_downtime.md`; `04-ddd/domain_model.md` |
| INJ-030 | D05 | Cross-cutting (Evidence & Provenance spine) | Shared laboratory account | addressed | `submission/scripts/data_integrity_findings_demo.py`; `06_DATA_GOVERNANCE_INTEGRITY.md` §8 |
| INJ-031 | D05 | Cross-cutting (Evidence & Provenance spine) | Validation-state ambiguity | addressed | `06_DATA_GOVERNANCE_INTEGRITY.md` §1 |
| INJ-032 | D05 | Cross-cutting (Evidence & Provenance spine) | Unapproved spreadsheet | addressed | `06_DATA_GOVERNANCE_INTEGRITY.md` §1; `01-discovery/waste_register_downtime.md` |
| INJ-033 | D05 | Cross-cutting (Evidence & Provenance spine) | CAPA effectiveness failure | addressed | `02_DMAIC_WORKBOOK.md` §3 (fishbone) |
| INJ-034 | D05 | Cross-cutting (Evidence & Provenance spine) | Change-control bypass | addressed | `submission/scripts/data_integrity_findings_demo.py`; `06_DATA_GOVERNANCE_INTEGRITY.md` §8 |
| INJ-035 | D05 | Cross-cutting (Evidence & Provenance spine) | Record-retention conflict | addressed | `06_DATA_GOVERNANCE_INTEGRITY.md` §6 (central example); `17_PRIVACY_ETHICS.md` §6 (deepened — 3-way legal-hold/GxP-retention/deletion conflict) |
| INJ-036 | D05 | Cross-cutting (Evidence & Provenance spine) | ALCOA+ provenance break | addressed | `06_DATA_GOVERNANCE_INTEGRITY.md` §4 (central example) |
| INJ-037 | D06 | Workflow B (Pharmacovigilance) | ICSR duplicate cluster | addressed | `04-ddd/domain_model.md` INV-05, POL-04 (central example) |
| INJ-038 | D06 | Workflow B (Pharmacovigilance) | Reporting-clock conflict | addressed | `04-ddd/domain_model.md` §3 `awareness_date` |
| INJ-039 | D06 | Workflow B (Pharmacovigilance) | MedDRA version mismatch | addressed | `04-ddd/domain_model.md` §7 ACL |
| INJ-040 | D06 | Workflow B (Pharmacovigilance) | Expectedness source conflict | addressed | `04-ddd/domain_model.md` §3 `listedness` |
| INJ-041 | D06 | Workflow B (Pharmacovigilance) | Pregnancy and paediatric sensitivity | addressed | `04-ddd/domain_model.md` aggregate composition |
| INJ-042 | D06 | Workflow B (Pharmacovigilance) | Social-media authenticity | addressed | `01-discovery/evidence_register.md` §4 |
| INJ-043 | D06 | Workflow B (Pharmacovigilance) | Product-quality and safety link | addressed | `04-ddd/domain_model.md` §8 (open cross-context question — deliberately unresolved, not silently dropped) |
| INJ-044 | D06 | Workflow B (Pharmacovigilance) | Signal disproportionality instability | addressed | `01-discovery/evidence_register.md` §4 |
| INJ-045 | D07 | Cross-cutting (Regulatory info, supports A) | IDMP identity conflict | addressed | `04-ddd/domain_model.md` INV-10 (central example) |
| INJ-046 | D07 | Cross-cutting (Regulatory info, supports A) | Labeling divergence | addressed | `submission/scripts/data_integrity_findings_demo.py`; `09_REQUIREMENTS_TRACEABILITY.md` §6a |
| INJ-047 | D07 | Cross-cutting (Regulatory info, supports A) | Commitment deadline ambiguity | addressed | `submission/scripts/data_integrity_findings_demo.py`; `09_REQUIREMENTS_TRACEABILITY.md` §6a |
| INJ-048 | D07 | Cross-cutting (Regulatory info, supports A) | eCTD sequence gap | addressed | `06_DATA_GOVERNANCE_INTEGRITY.md` §1 |
| INJ-049 | D07 | Cross-cutting (Regulatory info, supports A) | Variation classification dispute | addressed | `submission/scripts/data_integrity_findings_demo.py`; `09_REQUIREMENTS_TRACEABILITY.md` §6a |
| INJ-050 | D07 | Cross-cutting (Regulatory info, supports A) | Inspection request surge | addressed | `submission/scripts/inspection_response_demo.py` (verifies every cited evidence path exists on disk, exit 0) + `FINAL_DEFENCE_DOSSIER.md` element 11 — closed at P8 as promised here at P2 |
| INJ-051 | D08 | Workflow C (Supply/cold-chain) | Cold-chain lane excursion | addressed | `04-ddd/context_map.md` canvas |
| INJ-052 | D08 | Workflow C (Supply/cold-chain) | Serialization aggregation break | addressed | `submission/src/workflows/supply_options.py::_detect_serialization_aggregation_break`; `submission/tests/test_prohibited_supply_side_effects.py::TestINJ052SerializationAggregationBreak` |
| INJ-053 | D08 | Workflow C (Supply/cold-chain) | Counterfeit suspicion | addressed | `submission/src/workflows/supply_options.py::_detect_counterfeit_suspicion`; `submission/tests/test_prohibited_supply_side_effects.py::TestINJ053CounterfeitSuspicion` |
| INJ-054 | D08 | Workflow C (Supply/cold-chain) | Critical excipient shortage | addressed | `04-ddd/context_map.md` canvas |
| INJ-055 | D08 | Workflow C (Supply/cold-chain) | CMO capacity conflict | addressed | `01-discovery/evidence_register.md` §4 |
| INJ-056 | D08 | Workflow C (Supply/cold-chain) | Allocation ethics | addressed | `04-ddd/domain_model.md` INV-06/07, POL-05 (central example) |
| INJ-057 | D08 | Workflow C (Supply/cold-chain) | Customs documentation mismatch | addressed | `submission/src/workflows/supply_options.py::_detect_customs_documentation_mismatch`; `submission/tests/test_prohibited_supply_side_effects.py::TestINJ057CustomsDocumentationMismatch` |
| INJ-058 | D08 | Workflow C (Supply/cold-chain) | Recall-scope uncertainty | addressed | `04-ddd/context_map.md` canvas |
| INJ-059 | D09 | Cross-cutting (Privacy/Ethics) | Genomic re-identification risk | addressed | `17_PRIVACY_ETHICS.md` §3 (genomic quasi-identifier finding, `privacy_risk.csv` singling-out=high) |
| INJ-060 | D09 | Cross-cutting (Privacy/Ethics) | Cross-border secondary use | addressed | `06_DATA_GOVERNANCE_INTEGRITY.md` §6; `17_PRIVACY_ETHICS.md` §4 |
| INJ-061 | D09 | Cross-cutting (Privacy/Ethics) | Data-subject request versus GxP record | addressed | `17_PRIVACY_ETHICS.md` §6 (central example — real DSR-17/LH-44 conflict) |
| INJ-062 | D09 | Cross-cutting (Privacy/Ethics) | Patient-support programme leakage | addressed | `17_PRIVACY_ETHICS.md` §1 (finding + explicit scope-boundary decision; residual gap tracked as R-001) |
| INJ-063 | D09 | Cross-cutting (Privacy/Ethics) | Research-commercial boundary | addressed | `17_PRIVACY_ETHICS.md` §4 |
| INJ-064 | D09 | Cross-cutting (Privacy/Ethics) | Regional residency failure | addressed | `06_DATA_GOVERNANCE_INTEGRITY.md` §6 (central example); `17_PRIVACY_ETHICS.md` §5 |
| INJ-065 | D10 | Cross-cutting (Security) | Prompt injection in SOP | addressed | `04-ddd/domain_model.md` INV-09, POL-02 (central example); `16_THREAT_ABUSE_MODEL.md` §3; failing spec `submission/tests/test_knowledge_authority_gate.py` |
| INJ-066 | D10 | Cross-cutting (Security) | Tool-manifest poisoning | addressed | `04-ddd/domain_model.md` POL-06; `16_THREAT_ABUSE_MODEL.md` §4; failing spec `submission/tests/test_knowledge_authority_gate.py` |
| INJ-067 | D10 | Cross-cutting (Security) | Entitlement revocation lag | addressed | `04-ddd/domain_model.md` POL-01; `07_ONTOLOGY_SEMANTIC_LAYER.md` §6; `16_THREAT_ABUSE_MODEL.md` §4; failing spec `submission/tests/test_authorization_fail_closed.py` |
| INJ-068 | D10 | Cross-cutting (Security) | Safety-data exfiltration | addressed | `16_THREAT_ABUSE_MODEL.md` §5 (finding + cross-affiliate scoping gap named; no ADR yet, tracked as R-002) |
| INJ-069 | D10 | Cross-cutting (Security) | Ransomware and OT segmentation | addressed | `06-c4/boundary_and_degraded_mode.md` — source-system unavailability produces explicit `gaps`, not a blocked response; `16_THREAT_ABUSE_MODEL.md` §6 (threat-actor framing added) |
| INJ-070 | D10 | Cross-cutting (Security) | Model supply-chain compromise | addressed | `01-discovery/waste_register_ai_specific.md`; `16_THREAT_ABUSE_MODEL.md` §6; `20_ISO42001_GOVERNANCE.md` §4; failing spec `submission/tests/test_model_supply_chain_integrity.py` |
| INJ-071 | D11 | Cross-cutting (Human factors/Responsible AI) | Automation bias in batch review | addressed | `04_PRODUCT_SERVICE_BLUEPRINT.md` §4; `04-ddd/gen_ai_boundaries.md` §3; `15_QUALITY_RISK_MANAGEMENT.md` HAZ-02; `18_RESPONSIBLE_AI_HUMAN_FACTORS.md` §2 (concrete mitigation design added) |
| INJ-072 | D11 | Cross-cutting (Human factors/Responsible AI) | Language inequity | addressed | `04_PRODUCT_SERVICE_BLUEPRINT.md` §6; `18_RESPONSIBLE_AI_HUMAN_FACTORS.md` §4 (hard-gate control added) |
| INJ-073 | D11 | Cross-cutting (Human factors/Responsible AI) | Accessibility failure | addressed | `04_PRODUCT_SERVICE_BLUEPRINT.md` §6; `18_RESPONSIBLE_AI_HUMAN_FACTORS.md` §5 (binding build requirement added) |
| INJ-074 | D11 | Cross-cutting (Human factors/Responsible AI) | Role conflict | addressed | `03_STAKEHOLDER_DECISION_RIGHTS.md` context; `18_RESPONSIBLE_AI_HUMAN_FACTORS.md` §1 (own design response — inline accountable-owner labeling) |
| INJ-075 | D12 | Cross-cutting (Economics/Token FinOps) | Model price shock | addressed | `01-discovery/waste_register_ai_specific.md` |
| INJ-076 | D12 | Cross-cutting (Economics/Token FinOps) | Denial-of-wallet pattern | addressed | `01-discovery/waste_register_ai_specific.md`; `09_REQUIREMENTS_TRACEABILITY.md` NFR-04 |
| INJ-077 | D12 | Cross-cutting (Economics/Token FinOps) | Hidden human-review cost | addressed | `01_BUSINESS_CASE.md` §4 (central example) |
| INJ-078 | D12 | Cross-cutting (Economics/Token FinOps) | Vendor concentration | addressed | `08_KNOWLEDGE_GRAPH_DECISION.md` §5 |
| INJ-079 | D13 | Cross-cutting (Reliability/Continuity) | Regional platform outage | addressed | `submission/scripts/ai_disabled_offline_demo.py` (P5) — mechanically proves all 3 workflows succeed with `socket.connect` blocked, i.e. zero dependency on the AI region that INJ-079 describes as failing. **Correction**: previously marked "carried to Prompt 06" but never actually treated by name in `06-c4/boundary_and_degraded_mode.md` or `16_THREAT_ABUSE_MODEL.md` — found and fixed during Phase 5 cross-verification |
| INJ-080 | D13 | Cross-cutting (Reliability/Continuity) | Checkpoint corruption | addressed | `04-ddd/domain_model.md` §4 (Improve, error-path idempotency) |
| INJ-081 | D13 | Cross-cutting (Reliability/Continuity) | Model substitution regression | addressed | `01-discovery/waste_register_ai_specific.md` |
| INJ-082 | D13 | Cross-cutting (Reliability/Continuity) | AI-disabled continuity | addressed | `01_BUSINESS_CASE.md`; `04_PRODUCT_SERVICE_BLUEPRINT.md` §5 (central example) |
| INJ-083 | D13 | Cross-cutting (Reliability/Continuity) | Vendor exit deadline | addressed | `submission/scripts/data_integrity_findings_demo.py`; `27_VENDOR_EXIT_RETIREMENT.md` §8 |
| INJ-084 | D13 | Cross-cutting (Reliability/Continuity) | Retirement and evidence preservation | addressed | `submission/scripts/data_integrity_findings_demo.py`; `29_NINETY_DAY_ROADMAP_HANDOVER.md` §6 |

