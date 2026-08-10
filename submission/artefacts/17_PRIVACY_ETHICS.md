# Privacy and Ethics

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

Awareness-level analysis per `.claude/skills/trust-risk-security.md` — not a legal opinion or DPO sign-off. Scope: the 6 D09 privacy injects (INJ-059…064) plus the declared retention conflict INJ-035.

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE5 (Security/Privacy/Eval/Reliability Lead) |
| Version / date | v0.1 — 2026-08-10 |
| Reviewers | FDE4, FDE2 |
| Status | Draft |
| Related requirements / ADRs | `04-ddd/domain_model.md` INV-02/04; `AEGIS_PROJECT_PLAN_FINAL.md` line 260 (declared conflict: "Privacy vs GxP retention → P5 (17; INJ-035)") |

## Purpose

Maps personal-data purpose, consent, minimisation, cross-border and retention/deletion questions for the three mandatory workflows, and records the one declared privacy-vs-GxP conflict this engagement owns explicitly rather than resolving silently. Accountable owner: FDE5.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `data/injects.json` INJ-059…064 (D09), INJ-035 (D05) | Package | 7 disclosed privacy injects, the hazard source for this artefact | — |
| E-002 | `knowledge/PRIVACY_AND_PSEUDONYMISATION.md` (K-020, approved) | NovaCura Global Policy, 2026-03-20 | Mandatory controls: minimise, assess re-identification, control access/purpose/retention/transfer | — |
| E-003 | `knowledge/ECONSENT_AND_SECONDARY_USE.md` (K-011, approved) | NovaCura Global Policy, 2026-02-28 | Mandatory controls: propagate consent/withdrawal, map use to purpose, restrict incompatible secondary use | — |
| E-004 | `knowledge/GENOMIC_DATA_STANDARD.md` (K-013, approved) | NovaCura Global Policy, 2026-05-05 | Enhanced controls for rare-disease/genomic data; separate research vs commercial purpose | — |
| E-005 | `data/legal_holds.csv` `LH-44`, `data/deletion_requests.csv` `DSR-17` | Current | Same trial (`NCB204-301`) is simultaneously under an active legal hold and an open deletion request for subject `S-301-044` | Real, unresolved conflict in the evidence, not hypothesized |

## 1. Purpose and data map

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Where does personal data enter the three workflows? | **FACT**: Workflow A (batch evidence) is largely product/process data, low personal-data density; Workflow B (PV intake) is the highest-density workflow — `icsr_cases.csv` carries `patient_key` directly; Workflow C (supply) is product/lot data, not personal data, except where patient-support-programme context leaks in (INJ-062) | FDE2/FDE5 | `data/icsr_cases.csv`; `data/patient_support_cases.csv` |
| What is the INJ-062 finding? | **FACT**: `data/patient_support_cases.csv` `PSP-17,NCX-101,"Cancer diagnosis, job loss, spouse details and bank hardship discussed",copay support` — free text captured for a copay-support purpose contains diagnosis, employment and family/financial detail far beyond that purpose | FDE5 | `data/patient_support_cases.csv` |
| Is this in AEGIS's scope or upstream? | **DECISION**: the over-collection happened upstream (patient support programme intake), not inside AEGIS — but AEGIS must not compound it by retrieving/surfacing PSP free text as evidence in a batch or PV response without purpose-scoping it first; flagged as a gap (R-001) since no container currently reads `patient_support_cases.csv` | FDE5 | `06-c4/c4_containers.md` (no PSP-reading container exists) |

## 2. Permission/consent assumptions

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What does the consent evidence show? | **FACT**: `data/consents.csv` — `C-044,S-301-044,trial_and_biomarker,withdrawn_biomarker,2026-07-20`; `C-118,S-301-118,trial,active,2026-01-11` — one subject has partially withdrawn consent (biomarker use specifically, trial use unaffected) | FDE5 | `data/consents.csv` |
| What must a consumer of this data do? | **DECISION**: per K-011 ("propagate consent and withdrawal changes to downstream processing"), any AEGIS output touching subject `S-301-044`'s biomarker data must reflect the withdrawal — this is a per-purpose state, not a single consent flag, so any design assuming binary consent is wrong | FDE5 | E-003 |
| Does AEGIS assume consent, or check it? | **DECISION**: AEGIS must treat `consents.csv`-class data as an evidence source to check, not a static fact to assume — same discipline as INV-09's knowledge-status check, applied to consent state instead of document trust | FDE5 | `04-ddd/domain_model.md` (pattern reused, no new invariant needed) |

## 3. Minimisation and pseudonymisation

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the INJ-059 finding? | **FACT**: `data/genomic_data.csv` — `G-001,ultra_rare_X,chr7:rare,DE,17,101` (disease, variant, country, age, postal prefix); `data/privacy_risk.csv` — `genomic_data.csv,singling_out,high,high` — the combination of a rare disease, a specific variant, country and postal prefix is a singling-out risk even though no direct identifier (name) is present | FDE5 | `data/genomic_data.csv`; `data/privacy_risk.csv` |
| Is "pseudonymised" a sufficient claim here? | **INTERPRETATION**: no — `privacy_risk.csv` already scores this `high`/`high` despite pseudonymisation, consistent with K-013's requirement for *enhanced* controls on rare-disease/genomic data specifically (ordinary pseudonymisation is stated as insufficient by the package's own risk register, not just by this artefact's judgement) | FDE5 | E-004; `data/privacy_risk.csv` |
| What is the control? | **DECISION**: AEGIS's Evidence-Resolver must never surface `age`+`postal_prefix`+`variant` together for a rare-disease case in a human-readable response without an explicit re-identification-risk flag attached — a new evidence-handling rule, not yet a numbered INV/POL (flagged R-002) | FDE5 | §Risks below |

## 4. Secondary use and re-identification

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the INJ-060 finding? | **FACT**: `data/data_exports.csv` `EX-77,NCB204 trial biomarker,EU,US,global model training,approved=no` — an EU-to-US export for a purpose (global model training) that is explicitly *not* approved | FDE5 | `data/data_exports.csv` |
| What is the INJ-063 finding? | **FACT**: `data/data_licenses.csv` `LIC-OMX-4,research only,commercial_use=no,model_training=restricted`; `data/commercial_use_requests.csv` `CU-11,LIC-OMX-4,HCP segmentation,status=pending` — a research-only-licensed dataset has a pending request for a commercial (HCP segmentation) use it was not licensed for | FDE5 | `data/data_licenses.csv`; `data/commercial_use_requests.csv` |
| What is the common control? | **DECISION**: both are the same pattern — a license/consent/approval scope must be checked against the requested purpose before use, never assumed compatible; AEGIS's role is strictly advisory here too — it must surface the `approved=no` / `pending` state, never silently proceed or silently deny (the actual decision belongs to Data Steward/Legal per `03_STAKEHOLDER_DECISION_RIGHTS.md`) | FDE5 | `03_STAKEHOLDER_DECISION_RIGHTS.md` |

## 5. Residency and cross-border controls

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the INJ-064 finding? | **FACT**: `data/data_residency.csv` `EU trial personal data,approved_regions=EU,observed_region=SG,source=backup_replica`; `data/backup_inventory.csv` `ClinicalLake,primary=DE,backup=SG,encryption=yes,approval=missing` — a backup replica already places EU personal data in Singapore without the required approval | FDE5 | `data/data_residency.csv`; `data/backup_inventory.csv` |
| Does encryption resolve the residency issue? | **INTERPRETATION**: no — `encryption=yes` addresses confidentiality-in-transit/at-rest, not the residency/jurisdiction obligation, which is about *where* the data is, not whether it is protected there; the missing `approval` field is the actual gap | FDE5 | `data/backup_inventory.csv` |
| Is this an AEGIS design responsibility? | **DECISION**: AEGIS does not own backup infrastructure (out of the three workflows' scope) — but if AEGIS's own Evidence-Resolver or Audit Store ever needs a backup/DR design (Track B, ADR-008 trigger), this finding is the evidence that residency approval must be a named precondition, not an afterthought | FDE3/FDE5 | `11_ADR_REGISTER.md` ADR-008 |

## 6. Rights, retention and legal hold

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the INJ-061/INJ-035 finding, concretely? | **FACT**: subject `S-301-044` (trial `NCB204-301`) has an **open** deletion request (`deletion_requests.csv` `DSR-17,S-301-044,all biomarker and AI data,open`) for the *same trial* that is under an **active** legal hold (`legal_holds.csv` `LH-44,NCB204-301 and NCB204-B24071,active`) — a genuine three-way conflict: privacy deletion right, legal hold (retain), and GxP retention rule (`retention_rules.csv`: "clinical_trial_source, 25 years EU minimum scenario, retain") | FDE5 | E-005; `data/retention_rules.csv` |
| Is this conflict AEGIS's to resolve? | **FACT**: no — per the governing plan's own declared-conflict table, this is explicitly named as a conflict this engagement tracks, not silently resolves (line 260) | FDE1/FDE5 | `AEGIS_PROJECT_PLAN_FINAL.md` line 260 |
| What must AEGIS do instead? | **DECISION**: surface all three competing obligations (legal hold, GxP retention, deletion request) together whenever evidence touching `S-301-044`/`NCB204-301` is assembled, and abstain from implying which wins — resolution requires named Legal + Quality + Privacy accountable owners, none of whom are an AI system; this is a direct instance of the CLAUDE.md guardrail "abstain when... jurisdiction... cannot be resolved" | FDE1/FDE4/FDE5 | `CLAUDE.md` Guardrails |
| What about the AI-specific retention rule? | **FACT**: `retention_rules.csv` also states `AI prompt logs, privacy minimisation, delete after 90 days unless evidence hold` — this is a rule AEGIS's own Audit Store (ADR-005) must implement for its own operational logs, distinct from the clinical-record retention question above | FDE5 | `data/retention_rules.csv`; `11_ADR_REGISTER.md` ADR-005 |

## 7. Ethical trade-offs and oversight

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Where else does an ethics-of-allocation question arise? | **FACT**: `knowledge/SUPPLY_ALLOCATION_ETHICS.md` (K-029, approved) requires shortage-allocation planning to make trial/compassionate-use/patient/contractual constraints *visible* and to require accountable governance — this is Workflow C's ethical-oversight anchor, distinct from privacy but sharing the same "surface, do not decide" discipline | FDE1/FDE4 | `knowledge/SUPPLY_ALLOCATION_ETHICS.md` |
| Is there a role-conflict dimension? | **FACT**: INJ-074 ("Role conflict" — a global process owner wants uniform automation while local Qualified Persons/safety officers retain legal accountability) is analyzed in artefact 18 §1, not duplicated here — flagged as a cross-reference only | FDE1 | `18_RESPONSIBLE_AI_HUMAN_FACTORS.md` §1 |
| What is the overarching ethical stance this artefact takes? | **DECISION**: AEGIS's advisory-only design (never disposition, never final PV decision, never allocate/ship) is itself the primary ethical control for every trade-off in this section — every scenario above resolves to "surface the conflict/constraint to the accountable named human," never to a system-made trade-off | FDE1/FDE4/FDE5 | `01_BUSINESS_CASE.md` §5 (prohibited actions) |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Gap | No container in `06-c4/c4_containers.md` currently reads `patient_support_cases.csv`-class data at all | INJ-062 is structurally out of scope by omission, not by a deliberate exclusion decision — needs an explicit DECISION at Prompt 08 (technical design) whether PSP data enters Workflow B evidence assembly | FDE2/FDE3 | P5 technical design | Open |
| R-002 | Gap | No numbered INV/POL yet covers the genomic-quasi-identifier-combination rule (§3) | Residual re-identification risk for rare-disease cases if not formalized before build | FDE4/FDE5 | Before P5 build of the PV container | Open |
| R-003 | Risk | INJ-035 three-way conflict (legal hold vs GxP retention vs deletion right) has no resolution mechanism designed yet, only a surfacing obligation | If unaddressed, a human reviewer could be shown the conflict with no workflow for escalating it | FDE1/FDE4/FDE5 | P5/P7 (runbooks) | Open — explicitly not this artefact's job to resolve |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| Every D09 inject (059-064) plus INJ-035 is addressed with a named finding | §1–§6 | Manual cross-check against `data/injects.json` | `04-ddd/inject_register_84.md` | Done — 7/7 |
| No privacy finding contradicts artefact 15 QRM or the ADR register | Cross-check | Manual review | `15_QUALITY_RISK_MANAGEMENT.md`; `11_ADR_REGISTER.md` | Done — zero contradictions |
| The INJ-035 conflict is tracked, not silently resolved | §6 | Reviewed at G4 | This document; `AEGIS_PROJECT_PLAN_FINAL.md` line 260 | Done |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| — | FDE4/FDE2 (pending) | Not yet reviewed | — | — |
