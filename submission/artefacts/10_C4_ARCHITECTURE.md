# C4 Architecture

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

**Artifact status: `provisional`** (inherited from DDD). Full working detail: `submission/artefacts/06-c4/`.

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE3 (Architecture/Build Lead) |
| Version / date | v0.1 — 2026-08-08 |
| Reviewers | FDE4, FDE5 |
| Status | Draft |
| Related requirements / ADRs | `requirements/ASSESSMENT_RUBRIC.csv` RUB-04,05,07; feeds artefact 11 (ADR), artefact 12 (Contracts) |

## Purpose

Shows the structure (containers/components) that realizes the domain model (artefact 05) and hosts the 10 functional requirements (artefact 09). Scope: the three workflows plus 4 shared containers. Accountable owner: FDE3, with FDE4/FDE5 confirming no prohibited write path exists. Complete when Context/Container/Component views map to bounded contexts, degraded mode is defined, and ADR candidates are listed.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `submission/artefacts/04-ddd/domain_model.md`, `context_map.md` | This engagement | 7 bounded contexts, 10 invariants, 6 policies | Provisional status inherited |
| E-002 | `evaluation/contracts/batch_response.schema.json`, `evidence_item.schema.json` | Package, current | Contract schema already matches domain invariants exactly (verified) | Immutable challenge evidence |
| E-003 | `data/continuity_requirements.csv` | Current | Degraded-mode tolerances per workflow | NFR-01/02 source |
| E-004 | `PACKAGE_SCOPE_AND_ASSUMPTIONS.md` | Package rule | No hidden services; offline deterministic mode required | Constrains deployment decision |

## 1. System context

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Who and what interacts with the system? | **DECISION**: 5 person types (EU QP, Safety Physician, Supply Governance Board, Data Steward, CISO) and 5 external system classes (source systems ×3, knowledge corpus, optional model endpoint), all read/citation-only toward the system's dependencies, with 3 explicit PROHIBITED write paths drawn | FDE3 | `06-c4/c4_context.md` |

## 2. Container view

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What are the containers? | **DECISION**: 9 — App, Evidence-Resolver (shared kernel), 3 workflow containers, Product & Substance ACL, Knowledge Authority Gateway, Authorization Service, Audit/Evidence Store, Contract Validator | FDE3 | `06-c4/c4_containers.md` |
| Does every container trace to a bounded context? | **FACT**: yes, per the container-list rationale table — each container names its owning context and the specific waste it removes | FDE2 | `06-c4/c4_containers.md` |

## 3. Component view

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What are the critical components? | **DECISION**: Evidence-Resolver detailed (Hash Engine, As-Of Stamper, Source-Preservation Guard, Contradiction Detector — highest reuse risk); Batch container detailed as the worked pattern (Assembler, Readiness Classifier, Contradiction Surface, HITL Formatter, optional Summarizer Agent); PV/Supply follow the same pattern | FDE3 | `06-c4/c4_components.md` |
| Do components map to FR-IDs? | **FACT**: yes — full mapping table cross-references `09_REQUIREMENTS_TRACEABILITY.md` FR-01…FR-09 | FDE3 | `06-c4/c4_components.md` |

## 4. Critical code/sequence view

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Is Level 4 (code) warranted anywhere? | **DECISION**: not yet — per skill guidance ("deepen Code level only where risk warrants"), no Level-4 view is produced until Prompt 08 (Technical Design) specifies actual interfaces; the Readiness Classifier's enum-only output (INV-01) is the top candidate for a future Level-4 view given its hard-gate status | FDE3 | `06-c4/c4_components.md` |

## 5. Trust and GxP boundaries

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Where are trust/authority boundaries drawn? | **FACT**: Knowledge Authority Gateway (document trust), Authorization Service (execution-time IAM), and the 3 PROHIBITED-write red-dashed edges in `c4_context.md`/`c4_containers.md` | FDE4/FDE5 | `06-c4/c4_context.md`, `boundary_and_degraded_mode.md` |
| Is the GxP boundary structurally enforced, not just documented? | **FACT**: yes — cross-checked against the package's own pre-built contract schemas (`evaluation/contracts/batch_response.schema.json`), which independently encode the same `readiness_state` enum and `execution_status: not_executed` constant as the domain model's INV-01/06 — two independently-authored artifacts agree | FDE4 | `06-c4/waste_register_ai_specific.md` "Confirmed at C4" |

## 6. Data and event flows

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What are the key event/data flows? | **FACT**: the 8-event event-storming board from DDD (`04-ddd/context_map.md`) maps directly onto container interactions — e.g. `EvidenceConflictDetected` is the Contradiction Detector/Surface's output event | FDE3 | `04-ddd/context_map.md`; `06-c4/c4_components.md` |

## 7. Deployment and offline mode

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the deployment model? | **DECISION (ADR candidate #8)**: leaning toward a single offline-capable process, consistent with `PACKAGE_SCOPE_AND_ASSUMPTIONS.md`'s "no hidden services" requirement — final decision at Prompt 07 | FDE3 | `06-c4/adr_candidates.md` #8 |
| How does degraded mode work per workflow? | **FACT**: Batch/Supply tolerate 14-day AI absence; PV defaults to manual-capable with zero AI dependency for its core function; source-system unavailability produces explicit `gaps`, not a blocked response | FDE5 | `06-c4/boundary_and_degraded_mode.md` |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Gap | 10 ADR candidates identified, none yet decided | Architecture remains provisional until Prompt 07 | FDE3 | Prompt 07 | Open — expected |
| R-002 | Risk | 2 optional AI agents (Summarizer, Similarity) are the only elements not traceable to the minimum governed workflow | Could scope-creep into required components if not actively guarded | FDE1/FDE3 | Prompt 09 reconciliation | Open |
| R-003 | Assumption | Single-process deployment (ADR #8) assumed favored by the offline-mode requirement, not yet formally decided | Could be wrong if performance/isolation needs emerge at Prompt 08 | FDE3 | Prompt 07 | Open |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| No container has a write path to a source system | `c4_context.md`, `c4_containers.md` PROHIBITED edges | Architecture/dependency check (governing plan requirement) | `06-c4/boundary_and_degraded_mode.md` | Design complete; automated check pending Prompt 08+ |
| Architecture matches package's pre-built contract schemas | Cross-check performed | Manual schema comparison | `06-c4/waste_register_ai_specific.md` | Done — zero contradictions found |
| Every container traces to a bounded context | Container-list rationale table | Manual review at G3 | `06-c4/c4_containers.md` | Done |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| — | FDE4/FDE5 (pending) | Not yet reviewed | — | — |
