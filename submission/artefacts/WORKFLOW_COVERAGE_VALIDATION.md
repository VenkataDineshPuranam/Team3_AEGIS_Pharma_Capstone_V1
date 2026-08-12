# Workflow Coverage Validation

Consolidated validation view of inject coverage across all five workflows (three mandatory — A/B/C — plus the two participant-added, additional-scope workflows D/E) and the cross-cutting spine. Built from `submission/artefacts/04-ddd/inject_register_84.md` (source of truth for status/citations) and `submission/artefacts/INJECT_WORKFLOW_CATEGORIZATION.md` (source of truth for the workflow grouping). This file does not introduce new claims — it is a validation-oriented summary of those two.

**Coverage result: 84/84 injects addressed. 0 in_scope_open. 0 out_of_scope.**

## Table 1 — Injects covered per workflow

| Workflow | Mandate | Count | Injects |
|---|---|---|---|
| A — GxP Batch Review | Mandatory | 8 | INJ-021, 022, 023, 024, 025, 026, 027, 028 |
| B — Pharmacovigilance | Mandatory | 8 | INJ-037, 038, 039, 040, 041, 042, 043, 044 |
| C — Supply/Cold-Chain | Mandatory | 8 | INJ-051, 052, 053, 054, 055, 056, 057, 058 |
| D — Clinical Trial Context | Additional, optional scope | 8 | INJ-013, 014, 015, 016, 017, 018, 019, 020 |
| E — Discovery/Translational Science | Additional, optional scope | 6 | INJ-007, 008, 009, 010, 011, 012 |
| Cross-cutting spines (business, evidence & provenance, regulatory info, privacy, security, human factors, economics, reliability) | n/a | 46 | INJ-001–006, 029–036, 045–050, 059–084 |
| **Total** | | **84** | |

`RUB-08` (three-workflow engineering quality, highest-weight rubric line) scores A/B/C specifically. D and E are additional scope and do not change that scoring — see `WORKFLOW_D_CLINICAL_TRIAL_CONTEXT.md` and `WORKFLOW_E_DISCOVERY_TRANSLATIONAL_SCIENCE.md` headers.

## Table 2 — Evidence each workflow created

| Workflow | Contract / schema | Invariants / policies | Real data cited | Tests | Result |
|---|---|---|---|---|---|
| A | `batch_response.schema.json` | INV-01/02/03, POL-03 | `cleaning_validation.csv`, `production_schedule.csv` + genealogy/lab/EM/deviation sources | `submission/tests/test_prohibited_batch_disposition.py` | 6/6 pass |
| B | `pv_response.schema.json` | INV-04/05, POL-04 | ICSR, MedDRA, duplicate-candidate sources | `submission/tests/test_prohibited_pv_auto_merge.py` | pass |
| C | `supply_response.schema.json` | INV-06/07, POL-05 | `serialisation_events.csv`, `packaging_events.csv`, `returns.csv`, `shipments.csv`, `trade_documents.csv` + cold-chain/allocation sources | `submission/tests/test_prohibited_supply_side_effects.py` | 7/7 pass |
| D | `clinical_response.schema.json` | INV-11/12/13, POL-07 | `eligibility_evidence.csv`, `support_tickets.csv`, `endpoint_packets.csv`/`imaging_reviews.csv`, `protocol_versions.csv`/`site_approvals.csv`, `randomization_events.csv`, `site_metrics.csv` | `submission/tests/test_prohibited_clinical_eligibility.py` + eval suite S13 | 5/5, S13 5/5 PASS |
| E | `discovery_response.schema.json` | INV-14–18 | `assay_results.csv`/`instruments.csv`/`reagent_lots.csv`, `omics_cohorts.csv`/`model_performance.csv`, `preclinical_studies.csv`/`image_forensics.csv`, `model_registry.csv`, `target_evidence.csv`/`data_licenses.csv` | `submission/tests/test_prohibited_discovery_translational_science.py` + eval suite S14 | 7/7, S14 5/5 PASS |
| Cross-cutting (7 injects closed via verification script) | — (script-verified, no new contract) | n/a | `access_logs.csv`/`staff_rosters.csv`, `change_controls.csv`/`vendor_releases.csv`, `product_labels.csv`/`market_authorisations.csv`, `regulatory_commitments.csv`/`authority_correspondence.csv`, `regulatory_changes.csv`, `vendor_contracts.csv`/`vendor_exit_assets.csv`, `retention_rules.csv`/`retirement_assets.csv` | `submission/scripts/data_integrity_findings_demo.py` | 7/7 findings, exit 0 |

## Prohibited terminal action per workflow (structural, not just documented)

| Workflow | Must never | Enforced by |
|---|---|---|
| A | Release, reject, reprocess, relabel or recall a batch | `additionalProperties: false` in `batch_response.schema.json` structurally forbids a `batch_disposition` field |
| B | Make final seriousness, causality, expectedness, reportability or signal decisions | `pv_response.schema.json` schema; no auto-merge of duplicate candidates |
| C | Reserve, allocate, change quality status, ship or initiate a recall | `no_side_effects: true` on every path including error paths, `supply_response.schema.json` |
| D | State eligibility, confirm/deny blinding, adjudicate an endpoint, default a protocol-version conflict | `clinical_response.schema.json` forbids `eligibility`/`treatment_arm`/`endpoint_conclusion` fields |
| E | Accept/reject an assay result, approve a model for portfolio use, certify image authenticity, promote an unqualified model, resolve a target-validation conflict | `discovery_response.schema.json` forbids `assay_disposition`/`model_approval`/`image_authenticity`/`model_status_change`/`target_validation_conclusion` fields |

## Validation commands

```sh
python3 -m unittest submission.tests.test_prohibited_batch_disposition -v
python3 -m unittest submission.tests.test_prohibited_pv_auto_merge -v
python3 -m unittest submission.tests.test_prohibited_supply_side_effects -v
python3 -m unittest submission.tests.test_prohibited_clinical_eligibility -v
python3 -m unittest submission.tests.test_prohibited_discovery_translational_science -v
python3 submission/scripts/data_integrity_findings_demo.py
python3 -B submission/evaluation/runner.py
python3 tools/check_submission_structure.py --final
python3 tools/hash_submission.py --check
```

## Sources

| Artefact | Role |
|---|---|
| `submission/artefacts/04-ddd/inject_register_84.md` | Source of truth for per-inject status and citation |
| `submission/artefacts/INJECT_WORKFLOW_CATEGORIZATION.md` | Source of truth for the workflow grouping |
| `submission/artefacts/EVIDENCE_MAP_SCENARIOS.md` | Full scenario text for all 84 injects |
| `submission/artefacts/WORKFLOW_D_CLINICAL_TRIAL_CONTEXT.md` | Workflow D scope statement, evidence register, invariants |
| `submission/artefacts/WORKFLOW_E_DISCOVERY_TRANSLATIONAL_SCIENCE.md` | Workflow E scope statement, evidence register, invariants |
