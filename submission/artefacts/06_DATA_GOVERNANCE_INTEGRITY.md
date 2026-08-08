# Data Governance and Integrity

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

Methodology: `data-and-knowledge` skill's four discovery questions (EXISTS / USABLE / GOVERNED / MISSING) and six quality properties (validity, completeness, accuracy, consistency, uniqueness, timeliness).

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE2 (Domain/Evidence Lead) primary, FDE4 (GxP/Quality) co-owner |
| Version / date | v0.1 — 2026-08-08 |
| Reviewers | FDE3, FDE5 |
| Status | Draft |
| Related requirements / ADRs | `requirements/ASSESSMENT_RUBRIC.csv` RUB-04,05,06 (hard-gate related) |

## Purpose

Establishes what data exists, is usable, is governed, and is missing across the three workflows' evidence base, and the integrity/retention/residency controls that follow. Scope: the 143 datasets in `data/` as consumed by the three workflows via the Evidence & Provenance context (`04-ddd/domain_model.md`). Accountable owner: FDE2, with FDE4 holding veto on any ALCOA+ or retention claim. Complete when every dataset class has a stated authority, quality assessment, and retention/residency rule, or an explicit gap.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `data/DATA_DICTIONARY.csv` | Package data dictionary | Full schema, 143 datasets, inferred types | Ground truth for §1 |
| E-002 | `data/knowledge_catalog.csv` | Current | 32 knowledge docs with authority/status/trust/sha256 | Governs §2, §7 |
| E-003 | `data/RELATIONSHIP_MODEL.csv` | Current | 56 FK rules including `declared_exception` entries | Governs §3, §4 |
| E-004 | `data/retention_rules.csv`, `legal_holds.csv`, `deletion_requests.csv` | Current | Conflicting retention/hold/deletion obligations | Governs §6 (INJ-035) |
| E-005 | `data/data_residency.csv` | Current | Approved vs. observed region mismatch for EU trial personal data | Governs §6 (INJ-064) |
| E-006 | `data/document_lineage.csv`, `certificates_analysis.csv` | Current | Manually transcribed CoA with no locatable original signed source | Governs §4, §5 (INJ-036) |

## 1. Dataset inventory and classification

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What **EXISTS**? | **FACT**: 143 CSVs + `injects.json`, fully profiled in `DATA_DICTIONARY.csv` with dataset/column/type/nullability/example per field — this is itself the source register with an implicit owner (the package), no separate discovery needed | FDE2 | E-001 |
| What is **GOVERNED**, by classification? | **FACT** (sample): `system_inventory.csv` shows classification is itself contested — `LIMS-4` is `GxP critical/validated`, `AI-EVIDENCE` is `business support/pilot`, `BIOX-ELN` is `research only/acquired` — classification is not a solved problem in the source estate, it must be resolved per-object by the Evidence & Provenance context, not assumed uniform | FDE4 | `data/system_inventory.csv`; `04-ddd/domain_model.md` (Evidence & Provenance context) |
| What is **MISSING**? | **FACT**: `document_catalog.csv` contains an explicit `referenced_missing` / `intentionally_absent` record (a submission index references a document not present in the archive, INJ-048) — this is a declared gap, not a data-loading defect, and must be surfaced as such, never silently backfilled | FDE2 | `data/document_catalog.csv`; INJ-048 |

## 2. Source authority by object/context/time

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Who/what may assert authority per data class? | **FACT**: `knowledge_catalog.csv` gives the authoritative pattern — every document has `authority` (issuing body), `effective` (date), `status`, `trust`, `jurisdiction`, and `sha256`; e.g. `BATCH_RELEASE_EVIDENCE_POLICY.md` (K-006) supersedes `BATCH_RELEASE_POLICY_OLD.md` (K-007, superseded) as of 2026-06-01 | FDE4 | E-002 |
| Is authority ever jurisdiction-scoped? | **FACT**: yes — `LOCAL_WORK_INSTRUCTION_DE.md` (K-016) is `local_approved`, jurisdiction `DE`, distinct from the 29 `Global` documents; a query with no stated jurisdiction cannot correctly resolve which document governs | FDE4 | E-002 |
| What is the general rule (case-level)? | **FACT** (`case/SOURCE_SYSTEM_FACT_PACK.md`): "No system is universally authoritative... a later timestamp is not automatically more authoritative than an approved signed record" — this is the governing principle behind the entire Evidence & Provenance context design | FDE2 | `case/SOURCE_SYSTEM_FACT_PACK.md` |

## 3. Identity and master-data conflicts

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What identity conflicts exist? | **FACT**: compound identity collision — two acquired compounds share a local code but differ in structure/salt form (INJ-008, `compounds.csv; substance_master.csv`); IDMP identity conflict — substance/strength/form codes differ across RIM/ERP/regional registrations (INJ-045, `medicinal_products.csv; idmp_mappings.csv`, `mapping_status=ambiguous_strength_presentation`) | FDE2 | INJ-008, INJ-045 |
| How are these represented, not resolved? | **DECISION**: via the Product & Substance Master anti-corruption layer (`04-ddd/domain_model.md` §7) — conflicts are surfaced in the `gaps` field of any workflow response, never silently defaulted | FDE3 | `04-ddd/domain_model.md` INV-10 |

## 4. Quality and ALCOA+ assessment

Six quality properties, applied to the evidence base as a whole (not per-file — the estate-level pattern is what matters for this engagement):

| Property | Finding | Evidence |
|---|---|---|
| **Validity** | Contested — same field can carry two valid-looking but incompatible values (e.g. `lab_results.unit=mg/L` vs. the receiving interface's assumed `ug/mL`) | INJ-024; `interface_mappings.csv` |
| **Completeness** | Deliberately incomplete in places — `document_catalog.csv` `referenced_missing`; `release_packets.csv` `status=missing` for a CMO audit commitment | INJ-028, INJ-048 |
| **Accuracy** | Cannot be assumed from formatting alone — a manually transcribed Certificate of Analysis has no locatable original signed source (INJ-036, `certificates_analysis.csv; document_lineage.csv`) | INJ-036 |
| **Consistency** | Actively violated across systems — three states for one lab result (`OOS`/`OOT`/`invalid`, INJ-023); three inventories disagreeing on one system's validation state (INJ-031) | INJ-023, INJ-031 |
| **Uniqueness** | Violated by design in places — duplicate ICSR cases across intake channels before dedup (INJ-037, `duplicate_candidates.csv`) | INJ-037 |
| **Timeliness** | Ambiguous — an EBR step performed during network degradation and back-entered afterward (INJ-025, `ebr_steps.csv performed_time` vs. `entered_time`) | INJ-025 |

**ALCOA+ specific finding**: the transcribed CoA (INJ-036) fails Attributable/Original/Contemporaneous simultaneously — `document_lineage.csv` shows `derived_from=vendor_pdf_missing`, i.e. the original is gone and only a transcription with a named transcriber/verifier remains. This is the single clearest data-integrity gap in the package and must be treated as `untrusted`-equivalent evidence, not silently accepted because a value exists.

## 5. Lineage and transformation controls

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Is lineage tracked? | **FACT**: `document_lineage.csv` tracks `record → derived_from → transcribed_by → verified_by` for at least the COA-RG78 case — this pattern should be the minimum lineage record for any transformed evidence item | FDE2 | E-006 |
| Are transformations controlled? | **FACT**: no — `interface_mappings.csv` shows an **unapproved** conversion rule (`conversion_rule=1:1_assumed`, `approved=no`) already in use between a contract lab and the receiving interface | FDE3 | `data/interface_mappings.csv`; INJ-024 |
| What is the control going forward? | **DECISION**: the evidence-resolver never performs a unit/terminology transformation itself; it flags the mismatch and requires human resolution (INV-02, `04-ddd/domain_model.md`) | FDE3 | INV-02 |

## 6. Retention, residency and legal hold

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Do retention obligations conflict? | **FACT**: yes — legal hold, GxP retention, and privacy deletion obligations point to different actions for the same records (INJ-035, `retention_rules.csv; legal_holds.csv; deletion_requests.csv`); e.g. `legal_holds.csv` shows an active hold (LH-44) scoped to `NCB204-301 and NCB204-B24071` that would conflict with a deletion request on overlapping data | FDE5 (privacy) + FDE4 (GxP) jointly | INJ-035 |
| Is residency respected? | **FACT**: no — `data_residency.csv` shows EU trial personal data with `approved_regions=EU` but `observed_region=SG` via a backup replica (INJ-064) | FDE5 | `data/data_residency.csv` |
| What is the governing rule? | **DECISION**: retention/residency/hold conflicts are never auto-resolved by this system; they are surfaced to Legal/DPO/Quality jointly, consistent with the case's deliberate-ambiguity design (`PACKAGE_SCOPE_AND_ASSUMPTIONS.md`) | FDE5 | — |

## 7. Stewardship and issue remediation

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Who stewards the knowledge/data authority layer? | **PROVISIONAL**: Data Steward role named in `04-ddd/context_map.md` canvases (Regulatory & Knowledge Authority, Evidence & Provenance) but not yet assigned to a real person — team-seat default FDE2/FDE3 | FDE1, at kickoff | `04-ddd/context_map.md` |
| How are issues remediated? | **DECISION**: any dataset-level issue found (e.g. an unapproved spreadsheet, INJ-032) is logged as a gap in the response, never fixed in place — challenge evidence is immutable by package design (`PACKAGE_SCOPE_AND_ASSUMPTIONS.md`) | FDE2 | — |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Gap | No formal profiling report (e.g. ydata-profiling-style) has been run against the real data yet — this artefact uses the supplied `DATA_DICTIONARY.csv` as a substitute | Some quality claims are INTERPRETATION from the dictionary, not independently re-profiled | FDE2 | Before Prompt 06 (C4) if profiling becomes a build task | Open |
| R-002 | Risk | Retention/residency/legal-hold conflict (INJ-035, INJ-064) has no resolution owner named yet | Could block a real deletion or residency remediation | FDE5 | Kickoff | Open |
| R-003 | Assumption | Knowledge-document jurisdiction scoping (`DE` local vs. `Global`) is assumed sufficient to resolve authority; multi-jurisdiction queries (e.g. a DE-and-Global-relevant question) are not yet modeled | Could under- or over-apply a local instruction | FDE4 | Prompt 05 (Feature Specs) | Open |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| No silent unit/terminology conversion | INV-02 | Negative test: unapproved conversion rule must be flagged not applied | `submission/tests/` (not yet built) | Pending |
| Retention/residency conflicts surfaced, not resolved | Evidence-resolver gap field | Manual review; later automated check | `04-ddd/domain_model.md` §4 | Pending code |
| Knowledge-document authority checked before citation | POL-02, INV-09 | Retrieval-layer status-check test | `04-ddd/gen_ai_boundaries.md` §2 | Pending code |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| — | FDE3/FDE5 (pending) | Not yet reviewed | — | — |
