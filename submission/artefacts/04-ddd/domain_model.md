# Domain Model — DDD (Prompt 04)

**Artifact status: `provisional`.** Narrative class from Prompt 02 is `decision-ready`, but critical ubiquitous-language and source-of-truth questions remain open (`01-discovery/evidence_acquisition_backlog.md` items 2–3, 6) — per `domain-and-architecture` skill, provisional under open SoT/language questions even in decision-ready framing mode. Prefer rules + HITL over autonomous AI throughout.

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

## 1. Frame restated in domain terms

**FACT/DECISION** (from `02-frame/scqa_minto_decision_narrative.md`): build a deterministic-first evidence-reconciliation capability for three workflows (batch evidence, PV intake, supply/cold-chain options), each producing cited, authority-checked, contradiction-surfacing output — never a disposition. In domain terms: the system's job is to **assemble and adjudicate-for-completeness** evidence within a bounded context, **never to exercise the decision authority** that context's human owner holds.

## 2. Domain and subdomains

| Subdomain class | Bounded contexts | Why |
|---|---|---|
| **Core** (where the engagement's value lives) | Batch Evidence & Release Readiness; PV Case Intake & Signal Support; Supply & Cold-Chain Option Planning | These are the three mandated workflows (`case/INTEGRATED_CASE.md` §4) — the reason this system exists |
| **Generic** (universal pharma-compliance pattern, not NTG-specific) | Evidence & Provenance; Decision Authority & Accountability | Required by the `domain-and-architecture` skill; every core context depends on both, and neither is unique to NTG |
| **Supporting** (needed by the core, not core itself) | Product & Substance Master; Regulatory & Knowledge Authority | Identity and document-trust resolution that all three core contexts need but none of them owns |

**DECISION**: no "Operations" or other catch-all context — each context above has a stated business reason (per skill: "No giant catch-all operations context").

## 3. Ubiquitous language

One row per term, scoped to **this case's usage**, not a universal dictionary.

| Term | Definition in this case | Bounded context | Owner role | Valid context | Ambiguity risk | Must not be used loosely |
|---|---|---|---|---|---|---|
| `readiness_state` | System-assigned classification (`insufficient_evidence` / `conflicted_evidence` / `ready_for_authorized_review`) — NOT a release decision | Batch Evidence & Release Readiness | EU Qualified Person (final act) | Workflow A output only | High | **Yes** — must never be presented or coded as `release_status` |
| `OOS` / `OOT` | Out-of-Specification / Out-of-Trend lab result classification | Batch Evidence & Release Readiness | Quality reviewer | Lab result adjudication | High — INJ-023 shows LIMS/stats/notebook disagreeing on the same result | **Yes** — three systems already disagree; never silently pick one |
| `quality_status` | Inventory-level status (e.g. `released`, `quarantine`) — distinct field from `batches.status` (`quality_hold` etc.) | Supply & Cold-Chain / Batch Evidence (shared-kernel term, different fields) | Supply Governance Board / QP respectively | Both, but never cross-assigned | High | **Yes** — same English word, two different systems of record, must not be merged into one field without an ACL |
| `awareness_date` | The date a safety event became known — differs by channel (vendor receipt, affiliate inbox, global DB) | PV Case Intake & Signal Support | Safety Physician | Reporting-clock reconstruction | High — INJ-038 | **Yes** — "the" awareness date does not exist without stating which channel |
| `duplicate_candidate` | An algorithmically-suggested possible duplicate — NOT a confirmed duplicate | PV Case Intake & Signal Support | Safety Physician (confirms) | Intake triage | Medium | **Yes** — "candidate" must never be dropped in downstream text |
| `listed` / `listedness` | Whether an event is expected per a specific reference document (IB / CDS / local label) — the three can disagree (INJ-040) | PV Case Intake & Signal Support | Safety Physician / Regulatory Affairs | Expectedness assessment | High | **Yes** — must always be stated relative to a named source document |
| `authority` | Overloaded — (a) `knowledge_catalog.authority` = issuing policy body, (b) `decision_rights.accountable_role` = who may decide, (c) plain English "a regulator" (e.g. EMA) | Regulatory & Knowledge Authority / Decision Authority & Accountability | Varies | Disambiguate per field, never per prose | **Very high** | **Yes** — three distinct meanings of one English word in this case |
| `trust` | `knowledge_catalog.trust` field (`approved`/`superseded`/`draft`/`untrusted`/`local_approved`) — a status, not a content-quality judgement | Regulatory & Knowledge Authority | Document owner | Any retrieval/citation | High — INJ-065 poisoned doc is well-formed prose | **Yes** — well-written ≠ trusted |
| `canonical_product` | `product_master_aliases.csv` field naming the single reference product ID for a set of aliases | Product & Substance Master | Regulatory Affairs | Identity resolution | High — collides with `idmp_product`, `product_id` | **Yes** — never assume any one source's product field is canonical without the alias/mapping table |
| `ambiguous_strength_presentation` | `idmp_mappings.mapping_status` value — a declared, unresolved identity state (INJ-045) | Product & Substance Master | Regulatory Affairs | Product identity resolution | High | **Yes** — must be surfaced as a gap, never silently resolved to one strength |
| `declared_exception` | `RELATIONSHIP_MODEL.csv` rule type marking an intentionally-absent or non-standard link (e.g. NCS310-S26031 not in batch master) | Evidence & Provenance | Data Steward | Referential-integrity checks | Medium | **Yes** — must not be "fixed" as if it were a data bug |
| `execution_status` | Contract field, always `not_executed` for these workflows | All three core contexts | — | Every response | Low, but safety-critical | **Yes** — the one field that must never vary by workflow |
| `no_side_effects` | Supply contract field asserting a draft option changed nothing | Supply & Cold-Chain | Supply Governance Board | Every Workflow C response, including error paths | High (INJ-080 checkpoint-corruption risk) | **Yes** |

## 4. Entities, value objects, aggregates & invariants

Classified per the skill's categories; stable `INV-*` IDs for downstream ADR traceability.

### Aggregates (one per core context, root entity)

| Aggregate root | Context | Key value objects | Source fields |
|---|---|---|---|
| `BatchEvidenceBundle` | Batch Evidence & Release Readiness | `Genealogy`, `EnvironmentalMonitoringResult`, `LabResult`, `DeviationRecord`, `ReleasePacketItem` | `batches.csv`, `material_genealogy.csv`, `environmental_monitoring.csv`, `lab_results.csv`, `deviations.csv`, `release_packets.csv` |
| `PVCaseBundle` | PV Case Intake & Signal Support | `SourceFact` (verbatim), `DuplicateCandidate`, `ClockEvidence`, `ListednessContext` | `icsr_cases.csv`, `adverse_events.csv`, `duplicate_candidates.csv`, `safety_receipts.csv`, `listedness_sources.csv` |
| `SupplyOptionSet` | Supply & Cold-Chain Option Planning | `DraftOption` (status always `draft`), `Constraint`, `QualityHoldReference` | `inventory.csv`, `demand_forecast.csv`, `allocation_constraints.csv`, `shipments.csv` |
| `EvidenceItem` | Evidence & Provenance (generic, referenced by all three) | `IntegrityHash`, `SourcePreservedFlag`, `AsOfTime` | integrity/hash fields across all datasets |

### Invariant register (`INV-*`)

| ID | Statement | Aggregate/context | Source rule or case fact | Human owner | Failure risk | Audit evidence required |
|---|---|---|---|---|---|---|
| INV-01 | A `BatchEvidenceBundle` must never carry a `readiness_state` value that implies disposition (`released`/`rejected`/etc.) | BatchEvidenceBundle | `ai_use_boundaries.csv`; `case/INTEGRATED_CASE.md` §4 | EU Qualified Person | Prohibited-action violation | Contract schema enum check; negative test |
| INV-02 | A unit value must never be silently converted between reported and target units | BatchEvidenceBundle | INJ-024; `interface_mappings.csv` (`conversion_rule=1:1_assumed`, `approved=no`) | Quality reviewer | Wrong evidence cited to QP | Evidence-resolver flags mismatched `unit` fields, never converts |
| INV-03 | A lab result with disagreeing `lims_state`/`stats_state`/`notebook_state` must be surfaced as `conflicted_evidence`, never auto-resolved | BatchEvidenceBundle | INJ-023; `oos_investigations.csv` | Quality reviewer | Wrong readiness classification | Contradiction entry in response contract |
| INV-04 | Every `PVCaseBundle` verbatim source text must be preserved unmodified alongside any normalized form | PVCaseBundle | `PHARMACOVIGILANCE_CASE_POLICY.md` (K-019, approved); GVP principle | Safety Physician | Loss of source fidelity | `source_facts` field always populated |
| INV-05 | `duplicate_candidate` status must never be silently promoted to a merge without qualified human confirmation | PVCaseBundle | INJ-037; `PV_DUPLICATE_MANAGEMENT.md` (K-021, approved) | Safety Physician | Irreversible case merge (hard stop condition per governing plan §3.4) | `required_reviews` field non-empty on any candidate |
| INV-06 | A `SupplyOptionSet` must carry `no_side_effects: true` on every path, including error/exception paths | SupplyOptionSet | INJ-056, INJ-080; `data/allocation_constraints.csv` | Supply Governance Board | Prohibited-action violation via error-path bypass | Negative test on error/exception path specifically |
| INV-07 | A `SupplyOptionSet` option must exclude quarantined/held inventory unless explicitly modeled as a constraint, never included as available stock | SupplyOptionSet | `starter/legacy_pharma.py` `plan_supply()` anti-pattern (known-broken baseline; INJ-056) | Supply Governance Board | Legacy defect repeated in new build | Contract requires `quality_holds` field |
| INV-08 | Every `EvidenceItem` must carry a real SHA-256 integrity hash and a `source_preserved: true` flag | Evidence & Provenance | `knowledge_catalog.csv` `sha256` column; governing plan §11.3 | Data Steward | Undetected tampering/poisoning | Hash verification test |
| INV-09 | A knowledge document's `trust`/`status` field must be checked before any citation; content quality is never a substitute | Regulatory & Knowledge Authority | INJ-065; `knowledge_catalog.csv` (K-998/K-999 untrusted) | Data Steward | Prompt-injection / poisoned-SOP bypass | Retrieval-layer status-check test |
| INV-10 | A product/substance identity conflict (`ambiguous_strength_presentation` or similar) must be surfaced, never silently defaulted to one candidate | Product & Substance Master | INJ-045; `idmp_mappings.csv` | Regulatory Affairs | Wrong product cited in a regulated response | Identity-resolution gap flagged in `gaps` field |

### Policy register (`POL-*`)

| ID | "When X then Y must happen" | Triggering domain event | Bounded context | Accountable human owner | Source rule/fact | Audit evidence required |
|---|---|---|---|---|---|---|
| POL-01 | When authorization state is stale or ambiguous, then deny the request by default | Any workflow invocation | Decision Authority & Accountability | All three accountable roles | INJ-067; `CLAUDE.md` guardrails | `authorization.decision` field logged |
| POL-02 | When a knowledge document's status is `untrusted`/`draft`/`superseded`, then it must not be cited as authoritative | Any retrieval | Regulatory & Knowledge Authority | Data Steward | `knowledge_catalog.csv`; INJ-065 | Citation list cross-checked against catalog status |
| POL-03 | When a batch evidence item is missing or contradictory, then `readiness_state` must be `insufficient_evidence` or `conflicted_evidence`, never `ready_for_authorized_review` | Batch evidence assembly | Batch Evidence & Release Readiness | EU Qualified Person | INJ-021, INJ-028; `AI_GXP_BOUNDARY.md` (K-003) | Contract enum + test |
| POL-04 | When two PV cases exceed a similarity threshold, then both must be surfaced as `duplicate_candidates` with a required human review, never auto-merged | PV intake | PV Case Intake & Signal Support | Safety Physician | INJ-037; `PV_DUPLICATE_MANAGEMENT.md` | `required_reviews` populated |
| POL-05 | When inventory is in `quarantine`/held status, then it must never appear as an available option in `SupplyOptionSet` | Supply option generation | Supply & Cold-Chain Option Planning | Supply Governance Board | INJ-056; `SUPPLY_ALLOCATION_ETHICS.md` (K-029) | `quality_holds` exclusion test |
| POL-06 | When a tool is not present in the approved/signed manifest, then it must be denied execution | Any agentic tool call | Evidence & Provenance / cross-cutting | CISO/Security | INJ-066; `data/tool_manifest_poisoned.json`; `ZERO_TRUST_AI_TOOLS.md` (K-032) | Tool-manifest signature check |

## 5. Gen AI boundary design (see also `gen_ai_boundaries.md` for full detail)

Rules vs. AI vs. HITL is decided **per invariant/policy above**, not globally: every `INV-*`/`POL-*` is enforced by a **deterministic rule**, never left to model judgement — consistent with Discovery's Analyze conclusion that control/process fragmentation, not model capability, is the root cause. AI (if used at all) is scoped to drafting citations/summaries from already-adjudicated evidence, never to evaluating the invariants themselves.

## 6. Minimum governed workflow

For each of the three core contexts: **(1)** accept object ID + user context + purpose + as-of time → **(2)** evidence-resolver assembles evidence, computing hashes and checking authority/status (Evidence & Provenance + Regulatory & Knowledge Authority) → **(3)** apply context-specific invariants/policies (INV-*/POL-* above) → **(4)** emit structured response with `execution_status: not_executed`, citations, contradictions, gaps, abstentions, `human_review` → **(5)** accountable human (per Decision Authority & Accountability) acts. No step writes to any source system.

## 7. Anti-corruption requirements

- **Product identity ACL** (Product & Substance Master → Batch/Supply): translate `product_id` / `idmp_product` / `canonical_product` / local aliases into one reference per request, surfacing (not resolving) any `ambiguous_strength_presentation`-class conflict (INV-10).
- **Knowledge-status ACL** (Regulatory & Knowledge Authority → all core contexts): translate raw document content into a status-gated citation list; content is never trusted independent of `knowledge_catalog` status (INV-09).
- **Quality-status ACL** (Batch ↔ Supply): `batches.status` and `inventory.quality_status` are related but distinct vocabularies; no direct field copy between contexts without an explicit translation step.

## 8. Boundary risks and unresolved questions (→ Prompt 05/06)

- Which context owns a `product_complaints` record that links to both a batch (quality) and a PV case (safety) (INJ-043)? **Open** — carried to Prompt 05 as a cross-context event, not resolved here (skill constraint: do not resolve operational exceptions).
- Whether `Evidence & Provenance` should be a shared kernel (all three core contexts see identical code) or three separate published-language consumers — **Open**, affects C4 (06) container boundaries.
- Backlog linkage: items 2 (validation-state conflict rule), 3 (which knowledge docs citable by default), 6 (KG vs simpler alternative) from `01-discovery/evidence_acquisition_backlog.md` directly determine whether this model can move from `provisional` to `stable`.

## 9. Pilot / refine notes (brief — executed fully in Prompt 11 `pilot_learnings.md`)

Under `provisional` status, the highest-value pilot learning would be: does the evidence-resolver's contradiction-surfacing (rather than resolution) actually reduce QP/Safety-Physician review time, or does it just relocate the reconciliation burden onto them? This directly tests the Improve hypothesis from `01-discovery/dmaic_lens.md` §4.

## 10. Production readiness concerns — domain view (brief — executed fully in Prompt 12/13)

Domain ownership for Evidence & Provenance and Decision Authority & Accountability (the two generic contexts) is not yet assigned to a named role — both are currently team-seat-owned (FDE3/FDE5) rather than business-owned, which is acceptable for Track A but would need a real business owner before any Track B production claim.
