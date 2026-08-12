# Evidence Map with Scenarios

Generated from `data/injects.json` (84 disclosed injects) and `data/inject_evidence_map.csv`. Source data is immutable challenge evidence; this file is a submission-side traceability aid only.

| Inject | Dimension | Title | Scenario | Evidence Sources |
|---|---|---|---|---|
| INJ-001 | D01 | Board compression target | The board requires a 14% reduction in end-to-end release lead time without changing registered specifications or weakening independent Quality authority. | board_requests.csv; portfolio_products.csv |
| INJ-002 | D01 | Conflicting success metrics | Manufacturing rewards throughput, Quality rewards deviation containment, Supply rewards service level, and Clinical rewards database lock speed. | kpi_conflicts.csv; stakeholders.csv |
| INJ-003 | D01 | No-AI challenge | A process-excellence team claims workflow redesign and master-data repair could deliver most value without generative AI. | no_ai_baselines.csv |
| INJ-004 | D01 | Patent-cliff urgency | A major product loses exclusivity in 19 months, creating pressure to accelerate a new indication and reduce cost of goods. | portfolio_products.csv; commercial_forecast.csv |
| INJ-005 | D01 | Acquisition integration | A recently acquired biotech uses incompatible identifiers, cloud tenancy and quality procedures. | organisations.csv; system_inventory.csv |
| INJ-006 | D01 | Prohibited optimization | Executives prohibit any AI from autonomously changing formulation, specification, clinical eligibility, safety case disposition, batch release or recall decisions. | ai_use_boundaries.csv |
| INJ-007 | D02 | Assay drift | A potency assay changed reagent lot and instrument firmware; historical comparability is disputed. | assay_results.csv; instruments.csv; reagent_lots.csv |
| INJ-008 | D02 | Compound genealogy collision | Two acquired compounds share a local code but have different structures and salt forms. | compounds.csv; substance_master.csv |
| INJ-009 | D02 | Omics cohort bias | A translational model was trained mainly on one ancestry group and underperforms on another. | omics_cohorts.csv; model_performance.csv |
| INJ-010 | D02 | Preclinical image manipulation concern | Image metadata suggests duplicated microscopy panels in a CRO report. | preclinical_studies.csv; image_forensics.csv |
| INJ-011 | D02 | Unqualified research model | A discovery model promoted into portfolio decisions has no approved intended-use statement or locked training set. | model_registry.csv |
| INJ-012 | D02 | Target-evidence conflict | Internal experiments and an external licensed dataset disagree on target validation. | target_evidence.csv; data_licenses.csv |
| INJ-013 | D03 | Protocol-version divergence | Sites are executing three protocol versions; one country has not approved the latest amendment. | clinical_trials.csv; protocol_versions.csv; site_approvals.csv |
| INJ-014 | D03 | Eligibility ambiguity | A participant meets central-lab criteria but not the local-lab range encoded by the EDC rule. | subjects.csv; eligibility_evidence.csv |
| INJ-015 | D03 | Randomization service outage | The IRT service was unavailable and emergency kits were assigned using a manual log. | randomization_events.csv; downtime_events.csv |
| INJ-016 | D03 | Potential unblinding | A support ticket exposes treatment-arm hints to site personnel. | support_tickets.csv; access_logs.csv |
| INJ-017 | D03 | eConsent withdrawal mismatch | Consent was withdrawn in the eConsent platform but downstream biomarker processing continued. | consents.csv; specimens.csv; processing_events.csv |
| INJ-018 | D03 | Decentralized-device clock skew | Wearable devices report timestamps in mixed local time and UTC with daylight-saving errors. | wearable_readings.csv; timezone_rules.csv |
| INJ-019 | D03 | Endpoint adjudication backlog | Imaging endpoint packets contain missing source documents and conflicting reviewer conclusions. | endpoint_packets.csv; imaging_reviews.csv |
| INJ-020 | D03 | Site inspection risk | A high-enrolling site has unusual data regularity, late source uploads and repeated credential sharing. | site_metrics.csv; access_logs.csv |
| INJ-021 | D04 | Biologics batch genealogy break | A single-use assembly lot is missing from one MES genealogy branch but appears in warehouse consumption. | batches.csv; material_genealogy.csv; warehouse_movements.csv |
| INJ-022 | D04 | Sterility excursion | Environmental monitoring shows an excursion near fill-finish; organism identification was corrected after initial review. | environmental_monitoring.csv; microbiology_results.csv |
| INJ-023 | D04 | OOS/OOT disagreement | LIMS marks an assay OOS, the statistical tool marks it OOT, and the laboratory notebook labels it invalid. | lab_results.csv; oos_investigations.csv |
| INJ-024 | D04 | Unit conversion defect | A contract laboratory transmitted concentration in mg/L while the receiving interface assumed µg/mL. | lab_results.csv; interface_mappings.csv |
| INJ-025 | D04 | Electronic batch record exception | A required step was completed during network degradation and back-entered after the operation. | ebr_steps.csv; downtime_events.csv |
| INJ-026 | D04 | Cleaning validation boundary | Campaign sequencing changed after a new high-potency product was introduced. | cleaning_validation.csv; production_schedule.csv |
| INJ-027 | D04 | Process analytical technology drift | A PAT model version changed without synchronized update to the batch record recipe. | pat_models.csv; recipes.csv |
| INJ-028 | D04 | Qualified Person evidence gap | The EU release packet lacks confirmation of one contract-site audit commitment. | release_packets.csv; supplier_audits.csv |
| INJ-029 | D05 | Audit-trail disabled | A privileged account disabled audit capture for 47 minutes during master-data repair. | audit_trails.csv; privileged_sessions.csv |
| INJ-030 | D05 | Shared laboratory account | Three analysts used a shared instrument account during night shift. | access_logs.csv; staff_rosters.csv |
| INJ-031 | D05 | Validation-state ambiguity | The same application is labelled validated, conditionally released and research-only in three inventories. | system_inventory.csv; validation_inventory.csv |
| INJ-032 | D05 | Unapproved spreadsheet | A macro-enabled spreadsheet calculates dissolution acceptance and has no verified version history. | spreadsheet_inventory.csv |
| INJ-033 | D05 | CAPA effectiveness failure | A recurring deviation reappears after CAPA closure with a different taxonomy code. | deviations.csv; capa_records.csv |
| INJ-034 | D05 | Change-control bypass | A vendor hotfix was installed under emergency change but never retrospectively approved. | change_controls.csv; vendor_releases.csv |
| INJ-035 | D05 | Record-retention conflict | Legal hold, GxP retention and privacy deletion obligations point to different actions for the same records. | retention_rules.csv; legal_holds.csv; deletion_requests.csv |
| INJ-036 | D05 | ALCOA+ provenance break | A PDF certificate was manually transcribed; the original signed source cannot be located. | certificates_analysis.csv; document_lineage.csv |
| INJ-037 | D06 | ICSR duplicate cluster | Cases from a patient programme, literature vendor and call centre likely describe the same event under different product names. | icsr_cases.csv; duplicate_candidates.csv |
| INJ-038 | D06 | Reporting-clock conflict | Awareness date differs across vendor receipt, affiliate inbox and global safety database. | icsr_cases.csv; safety_receipts.csv |
| INJ-039 | D06 | MedDRA version mismatch | Coding was performed with two MedDRA versions, changing the preferred term and signal grouping. | adverse_events.csv; terminology_versions.csv |
| INJ-040 | D06 | Expectedness source conflict | The investigator brochure, core data sheet and local label are not aligned. | listedness_sources.csv; product_labels.csv |
| INJ-041 | D06 | Pregnancy and paediatric sensitivity | A narrative includes pregnancy exposure and a minor’s data within a general case queue. | icsr_cases.csv; sensitive_segments.csv |
| INJ-042 | D06 | Social-media authenticity | A high-severity post cannot be linked to an identifiable reporter or patient. | social_listening.csv |
| INJ-043 | D06 | Product-quality and safety link | A complaint about particles may relate to adverse events and a specific packaging lot. | product_complaints.csv; icsr_cases.csv |
| INJ-044 | D06 | Signal disproportionality instability | A signal changes materially when duplicate suppression and exposure estimates are varied. | signal_metrics.csv; exposure_estimates.csv |
| INJ-045 | D07 | IDMP identity conflict | Substance, strength and pharmaceutical-form codes differ across RIM, ERP and regional registrations. | medicinal_products.csv; idmp_mappings.csv |
| INJ-046 | D07 | Labeling divergence | A risk statement is approved in the EU but pending in the US and absent in two distributor leaflets. | product_labels.csv; market_authorisations.csv |
| INJ-047 | D07 | Commitment deadline ambiguity | A post-authorisation commitment has conflicting due dates in authority correspondence and the tracking system. | regulatory_commitments.csv; authority_correspondence.csv |
| INJ-048 | D07 | eCTD sequence gap | A submission index references a document not present in the archived sequence. | ectd_sequences.csv; document_catalog.csv |
| INJ-049 | D07 | Variation classification dispute | Regulatory teams disagree whether a manufacturing change is reportable before implementation. | regulatory_changes.csv |
| INJ-050 | D07 | Inspection request surge | Regulators request traceable evidence spanning trial data, batch history, safety cases and AI-system controls within 72 hours. | inspection_requests.csv |
| INJ-051 | D08 | Cold-chain lane excursion | A biologic shipment exceeds range; logger clocks and pallet association are disputed. | shipments.csv; temperature_loggers.csv |
| INJ-052 | D08 | Serialization aggregation break | Case-to-pallet aggregation is missing after a line restart. | serialisation_events.csv; packaging_events.csv |
| INJ-053 | D08 | Counterfeit suspicion | Two returned packs have valid-looking serials but inconsistent print and distribution history. | returns.csv; serialisation_events.csv |
| INJ-054 | D08 | Critical excipient shortage | A sole-source excipient supplier reports contamination and an eight-week recovery estimate. | supplier_risks.csv; inventory.csv |
| INJ-055 | D08 | CMO capacity conflict | The CMO promises capacity to two sponsors during the same campaign window. | cmo_capacity.csv; vendor_contracts.csv |
| INJ-056 | D08 | Allocation ethics | Demand exceeds available stock across markets, trials and compassionate-use programmes. | demand_forecast.csv; inventory.csv; allocation_constraints.csv |
| INJ-057 | D08 | Customs documentation mismatch | Shipment product description differs from the import licence and invoice. | shipments.csv; trade_documents.csv |
| INJ-058 | D08 | Recall-scope uncertainty | Potentially affected lots share components, equipment and distribution routes but not all genealogy links are complete. | recall_candidates.csv; material_genealogy.csv |
| INJ-059 | D09 | Genomic re-identification risk | A rare-disease dataset is nominally pseudonymised but contains highly identifying combinations. | genomic_data.csv; privacy_risk.csv |
| INJ-060 | D09 | Cross-border secondary use | EU trial data is proposed for global model training under a purpose not explicit in the original consent. | consents.csv; data_exports.csv |
| INJ-061 | D09 | Data-subject request versus GxP record | A participant requests deletion of data that may need preservation for trial integrity and legal obligations. | deletion_requests.csv; retention_rules.csv |
| INJ-062 | D09 | Patient-support programme leakage | Free text contains diagnoses, financial hardship and family details beyond the stated purpose. | patient_support_cases.csv |
| INJ-063 | D09 | Research-commercial boundary | Biomarker data licensed for research is being considered for commercial targeting. | data_licenses.csv; commercial_use_requests.csv |
| INJ-064 | D09 | Regional residency failure | A backup replica places regulated personal data in an unapproved region. | data_residency.csv; backup_inventory.csv |
| INJ-065 | D10 | Prompt injection in SOP | A supplier deviation PDF includes hidden instructions asking the AI to ignore quality holds. | knowledge_catalog.csv; MALICIOUS_SUPPLIER_DEVIATION.md |
| INJ-066 | D10 | Tool-manifest poisoning | A newly registered batch-status tool requests write access and silently changes a disposition field. | tool_catalog.csv; tool_manifest_poisoned.json |
| INJ-067 | D10 | Entitlement revocation lag | A contractor’s access was revoked in IAM but remains cached in the AI gateway. | users_entitlements.csv; access_cache.csv |
| INJ-068 | D10 | Safety-data exfiltration | A crafted query attempts to retrieve identifiable narratives across affiliates. | security_events.csv |
| INJ-069 | D10 | Ransomware and OT segmentation | Manufacturing historians are isolated while MES and QMS operate in degraded mode. | downtime_events.csv; network_zones.csv |
| INJ-070 | D10 | Model supply-chain compromise | A model package hash differs from the approved registry entry. | model_registry.csv; model_artifacts.csv |
| INJ-071 | D11 | Automation bias in batch review | Reviewers accept an AI summary despite an omitted critical deviation. | candidate_outputs.csv; reviewer_feedback.csv |
| INJ-072 | D11 | Language inequity | Safety narratives in Arabic and Hindi have lower extraction quality than English and German. | model_performance.csv; icsr_cases.csv |
| INJ-073 | D11 | Accessibility failure | The proposed interface cannot be operated fully by keyboard and uses colour-only warnings. | usability_findings.csv |
| INJ-074 | D11 | Role conflict | A global process owner wants uniform automation while local Qualified Persons and safety officers retain legal accountability. | stakeholders.csv; decision_rights.csv |
| INJ-075 | D12 | Model price shock | The preferred model vendor increases input-token price by 70% and reduces batch discounts. | model_costs.csv; vendor_contracts.csv |
| INJ-076 | D12 | Denial-of-wallet pattern | Repeated oversized document submissions create abnormal inference and embedding spend. | model_usage.csv; security_events.csv |
| INJ-077 | D12 | Hidden human-review cost | The business case excludes medical, Quality and regulatory review time. | cost_model.csv; staff_rates.csv |
| INJ-078 | D12 | Vendor concentration | The same provider hosts the model, vector store, evaluation service and observability pipeline. | vendor_dependencies.csv |
| INJ-079 | D13 | Regional platform outage | The primary AI region fails during batch review and expedited safety reporting. | downtime_events.csv; model_endpoints.csv |
| INJ-080 | D13 | Checkpoint corruption | An agent resumes a supply-recovery plan from stale state and duplicates draft reservations. | agent_runs.csv |
| INJ-081 | D13 | Model substitution regression | A smaller fallback model preserves schema compliance but loses evidence fidelity in non-English cases. | model_performance.csv; model_endpoints.csv |
| INJ-082 | D13 | AI-disabled continuity | The organisation must operate safely for 14 days without any model inference. | continuity_requirements.csv |
| INJ-083 | D13 | Vendor exit deadline | A strategic vendor will terminate service in 120 days and export formats are incomplete. | vendor_contracts.csv; vendor_exit_assets.csv |
| INJ-084 | D13 | Retirement and evidence preservation | The AI service may be retired, but prompts, model versions, decisions and validation evidence must remain inspectable. | retention_rules.csv; retirement_assets.csv |
