# Context Map — DDD (Prompt 04)

**Artifact status: `provisional`** (see `domain_model.md` §0).

## Bounded-context canvases

One canvas per context, per the `domain-and-architecture` skill's required fields.

### Batch Evidence & Release Readiness (Core)

| Field | Value |
|---|---|
| Business purpose | Assemble and adjudicate-for-completeness batch/lot evidence so the EU QP can certify with full information |
| Primary human participants | EU Qualified Person, Quality reviewer, Manufacturing VP (operations only) |
| Owned language | `readiness_state`, `OOS`/`OOT`, `insufficient_evidence`, `conflicted_evidence` |
| Owned information/statuses | Genealogy completeness, environmental monitoring results, deviation/CAPA linkage, release-packet completeness |
| **Decisions owned** | None — classification only (`readiness_state`) |
| **Decisions NOT owned** | Batch release, reject, reprocess, relabel, recall (`case/INTEGRATED_CASE.md` §4) |
| Upstream inputs | Evidence & Provenance (hashes/authority), Product & Substance Master (identity ACL) |
| Downstream outputs | Structured evidence response to EU QP; no downstream system writes |
| Policies/rules respected | POL-01, POL-02, POL-03 |
| Anti-corruption/translation needs | Product identity ACL; quality-status ACL toward Supply context |
| Known gaps touching it | INJ-021 genealogy break, INJ-028 missing audit commitment, INJ-031 validation-state ambiguity |
| Audit/evidence needs | Full evidence-resolver trail (hash, source, as-of time) per response |
| **Safety-authority risk if misunderstood** | If this context's `readiness_state` is mistaken for a release decision, GxP accountability is silently transferred to the AI system — the single most severe boundary failure in this design |

### PV Case Intake & Signal Support (Core)

| Field | Value |
|---|---|
| Business purpose | Intake, dedupe-candidate, normalize (without destroying verbatim), and reconstruct clocks for a safety case |
| Primary human participants | Safety Physician, PV case processor |
| Owned language | `awareness_date`, `duplicate_candidate`, `listedness`, `source_facts` |
| Owned information/statuses | Case source, clock evidence, terminology version, listedness context, sensitive-segment flags |
| **Decisions owned** | None — extraction/normalization/clustering only |
| **Decisions NOT owned** | Final seriousness, causality, expectedness, reportability, signal confirmation |
| Upstream inputs | Evidence & Provenance, Product & Substance Master (product-name ACL for `icsr_cases.product`) |
| Downstream outputs | Structured case-support response to Safety Physician |
| Policies/rules respected | POL-01, POL-02, POL-04 |
| Anti-corruption/translation needs | Product-name ACL; MedDRA-version ACL (INJ-039) |
| Known gaps touching it | INJ-037 duplicate cluster, INJ-038 clock conflict, INJ-041 sensitive segment in general queue |
| Audit/evidence needs | Verbatim preservation record; duplicate-candidate similarity score and reason |
| **Safety-authority risk if misunderstood** | If `duplicate_candidate` is treated as `duplicate` and auto-merged, an irreversible case merge occurs — an explicit governing-plan STOP condition |

### Supply & Cold-Chain Option Planning (Core)

| Field | Value |
|---|---|
| Business purpose | Generate traceable, non-committing options for a shortage or cold-chain event |
| Primary human participants | Supply Governance Board, Supply Chain VP (planning only) |
| Owned language | `draft` option status, `no_side_effects`, `quality_holds`, `allocation_constraints` |
| Owned information/statuses | Available (non-held) inventory, demand, CMO capacity, cold-chain evidence |
| **Decisions owned** | None — draft-option generation only |
| **Decisions NOT owned** | Reserve, allocate, ship, change quality status, initiate recall |
| Upstream inputs | Evidence & Provenance, Product & Substance Master |
| Downstream outputs | Draft option set to Supply Governance Board; no reservation/allocation write |
| Policies/rules respected | POL-01, POL-02, POL-05 |
| Anti-corruption/translation needs | Quality-status ACL toward Batch context |
| Known gaps touching it | INJ-051 disputed cold-chain excursion, INJ-054 excipient shortage, INJ-056 allocation ethics, INJ-058 incomplete recall genealogy |
| Audit/evidence needs | `no_side_effects: true` proof on every path including errors; constraint list per option |
| **Safety-authority risk if misunderstood** | If a "draft" option is executed against by a downstream system (e.g. `starter/legacy_pharma.py`'s known `plan_supply()` defect silently mutating a reservation), the prohibited action occurs by omission, not by AI intent |

### Evidence & Provenance (Generic, shared kernel)

| Field | Value |
|---|---|
| Business purpose | Compute integrity hashes, preserve source, stamp as-of time — identical logic reused by all three core contexts |
| Primary human participants | Data Steward (cross-functional) |
| Owned language | `EvidenceItem`, `source_preserved`, `integrity{sha256}`, `as_of` |
| Owned information/statuses | Hash values, source paths, retrieval timestamps |
| **Decisions owned** | None |
| **Decisions NOT owned** | Any business decision — purely infrastructural |
| Upstream inputs | Raw records from all source systems (read-only) |
| Downstream outputs | `EvidenceItem` objects consumed identically by Batch/PV/Supply |
| Policies/rules respected | INV-08 |
| Known gaps touching it | INJ-029 audit-trail gap (47 min) |
| Audit/evidence needs | Self-auditing — hash computation must itself be logged |
| **Safety-authority risk if misunderstood** | If treated as a core context with its own business judgement rather than a shared kernel, hash/authority logic could drift between workflows, breaking the "identical rule enforcement" guarantee |

### Decision Authority & Accountability (Generic, published language)

| Field | Value |
|---|---|
| Business purpose | Name the accountable human role and AI authority level for every decision every response touches |
| Primary human participants | EU QP, Safety Physician, Supply Governance Board (as named accountable roles, not as domain logic owners) |
| Owned language | `accountable_role`, `ai_authority` (`none`/`draft only`) |
| Owned information/statuses | `decision_rights.csv`, `regional_rules.csv` |
| **Decisions owned** | None |
| **Decisions NOT owned** | Everything — this context's entire purpose is to name who decides, never to decide |
| Upstream inputs | `data/decision_rights.csv`, `data/regional_rules.csv`, `data/ai_use_boundaries.csv` |
| Downstream outputs | `authorization{user, purpose, checked_at, decision}` block embedded in every response |
| Policies/rules respected | POL-01 |
| Known gaps touching it | INJ-067 stale entitlement cache |
| Audit/evidence needs | Authorization check logged at execution time, not session start |
| **Safety-authority risk if misunderstood** | If this context's output is treated as advisory rather than a hard gate, every other invariant in the system becomes unenforceable |

### Product & Substance Master (Supporting, anti-corruption layer)

| Field | Value |
|---|---|
| Business purpose | Resolve product/substance identity across RIM/ERP/regional-registration disagreement before any core context cites "the product" |
| Primary human participants | Regulatory Affairs |
| Owned language | `canonical_product`, `idmp_product`, `ambiguous_strength_presentation` |
| Owned information/statuses | `substance_master.csv`, `medicinal_products.csv`, `idmp_mappings.csv`, `product_master_aliases.csv` |
| **Decisions owned** | None — identity mapping only, conflicts surfaced not resolved |
| **Decisions NOT owned** | Which identity is "correct" when ambiguous |
| Upstream inputs | RIM, ERP, regional registrations (read-only) |
| Downstream outputs | Canonical-or-flagged product reference to Batch/PV/Supply |
| Known gaps touching it | INJ-008 compound collision, INJ-045 IDMP identity conflict |
| Audit/evidence needs | Mapping-status field always surfaced when ambiguous |
| **Safety-authority risk if misunderstood** | Wrong product cited in a batch, PV, or supply response is a direct patient-safety and regulatory-integrity risk |

### Regulatory & Knowledge Authority (Supporting, published language)

| Field | Value |
|---|---|
| Business purpose | Gate every knowledge-document citation by status/authority, independent of content quality |
| Primary human participants | Data Steward, Regulatory Affairs |
| Owned language | `trust`, `status` (`approved`/`superseded`/`draft`/`untrusted`/`local_approved`), `supersedes` |
| Owned information/statuses | `knowledge_catalog.csv` (32 documents, each with doc_id/authority/effective/status/trust/jurisdiction/sha256) |
| **Decisions owned** | None — status gating only |
| **Decisions NOT owned** | Whether a policy's *content* is correct |
| Upstream inputs | `knowledge/*.md` files |
| Downstream outputs | Status-gated citation list to all three core contexts |
| Known gaps touching it | INJ-065 poisoned document (K-998/K-999 untrusted), `LOCAL_WORK_INSTRUCTION_DE.md` (K-016, jurisdiction-local), `RESEARCH_NOTE_UNAPPROVED.md` (K-026, draft) |
| Audit/evidence needs | Every citation logged with the source document's status at time of use |
| **Safety-authority risk if misunderstood** | Direct path to INJ-065-class prompt injection if content is trusted ahead of status |

## Context map — relationships (defended)

```text
Product & Substance Master ──ACL──▶ Batch Evidence & Release Readiness
Product & Substance Master ──ACL──▶ PV Case Intake & Signal Support
Product & Substance Master ──ACL──▶ Supply & Cold-Chain Option Planning

Regulatory & Knowledge Authority ──published language──▶ Batch Evidence & Release Readiness
Regulatory & Knowledge Authority ──published language──▶ PV Case Intake & Signal Support
Regulatory & Knowledge Authority ──published language──▶ Supply & Cold-Chain Option Planning

Evidence & Provenance ──shared kernel──▶ Batch Evidence & Release Readiness
Evidence & Provenance ──shared kernel──▶ PV Case Intake & Signal Support
Evidence & Provenance ──shared kernel──▶ Supply & Cold-Chain Option Planning

Decision Authority & Accountability ──published language──▶ Batch Evidence & Release Readiness
Decision Authority & Accountability ──published language──▶ PV Case Intake & Signal Support
Decision Authority & Accountability ──published language──▶ Supply & Cold-Chain Option Planning

Batch Evidence & Release Readiness ──ACL (quality-status vocabulary only)──▶ Supply & Cold-Chain Option Planning
```

**Defence, one line per relationship type:**

- **Product & Substance Master → ACL, not shared kernel**: three source systems (RIM/ERP/regional) actively disagree (INJ-008, INJ-045); a shared kernel would require them to agree on one model, which they do not — the ACL's job is precisely to carry the disagreement forward as a flagged gap rather than force premature agreement.
- **Regulatory & Knowledge Authority → published language, not ACL**: `knowledge_catalog.csv`'s schema (doc_id/status/trust/authority/effective/supersedes) is already a single, well-formed contract every context can consume identically — no translation is needed, only gating.
- **Evidence & Provenance → shared kernel**: hash computation, source preservation, and as-of stamping are byte-identical logic regardless of which core context calls it; splitting this into three copies would risk the three workflows silently drifting on integrity semantics — the one relationship in this map deliberately optimized for zero divergence.
- **Decision Authority & Accountability → published language**: `decision_rights.csv`'s three-column schema is the single accountable-role contract; each core context reads it, none of them owns or edits it.
- **Batch → Supply, ACL on quality-status vocabulary only**: `batches.status` and `inventory.quality_status` describe related-but-distinct concepts (INV/ACL note in `domain_model.md` §7); this is the **only** direct relationship between two core contexts, deliberately narrow (vocabulary translation only, no shared decision logic) — Batch and PV have **no** direct relationship, and Supply and PV have **no** direct relationship, by design, to prevent authority leakage across workflows that the case does not link (batch-quality and safety-case information cross only through a human, e.g. via the open question in `domain_model.md` §8 on `product_complaints`).

## Event-storming board

One row per domain event.

| Domain event | Triggering command/activity | Primary human actor | Bounded context | Governing policy/rule | Evidence source | Failure/exception condition | Audit need |
|---|---|---|---|---|---|---|---|
| `BatchEvidenceRequested` | QP or delegate requests readiness view for a batch ID | EU Qualified Person | Batch Evidence & Release Readiness | POL-03 | `batches.csv` | Batch ID not found / genealogy incomplete (INJ-021) | Request logged with `as_of` |
| `EvidenceConflictDetected` | Evidence-resolver finds disagreeing states across sources | (system, surfaced to) Quality reviewer | Batch Evidence & Release Readiness | INV-03, POL-03 | `oos_investigations.csv` | Unresolved after surfacing — remains `conflicted_evidence` | Contradiction entry with both source states |
| `PVCaseReceived` | New case arrives via patient programme / literature / call centre | Safety Physician's delegate | PV Case Intake & Signal Support | POL-04 | `icsr_cases.csv` | Duplicate cluster detected (INJ-037) | `duplicate_candidates` populated |
| `ReportingClockReconstructed` | Case-support workflow resolves candidate awareness dates | Safety Physician | PV Case Intake & Signal Support | — | `safety_receipts.csv` | Channels disagree (INJ-038) | All candidate dates retained, not overwritten |
| `SupplyShortageEventOpened` | Shortage or cold-chain excursion logged | Supply Chain VP delegate | Supply & Cold-Chain Option Planning | POL-05 | `supplier_risks.csv`, `shipments.csv` | Disputed logger/pallet association (INJ-051) | Constraint list attached to event |
| `DraftOptionSetGenerated` | System proposes non-committing options | (system, reviewed by) Supply Governance Board | Supply & Cold-Chain Option Planning | INV-06, INV-07, POL-05 | `inventory.csv`, `allocation_constraints.csv` | Held/quarantined stock present in candidate set | `quality_holds` field non-empty if excluded stock existed |
| `KnowledgeDocumentCited` | Any core context retrieves a policy/SOP for citation | (system, logged for) Data Steward | Regulatory & Knowledge Authority | POL-02, INV-09 | `knowledge_catalog.csv` | Untrusted/superseded/draft document matched (INJ-065) | Citation includes status at time of use |
| `AuthorizationChecked` | Any workflow invocation | (system, logged for) CISO | Decision Authority & Accountability | POL-01 | `users_entitlements.csv` | Stale IAM-vs-gateway state (INJ-067) | `authorization.checked_at` timestamp present |

**Note**: per the `domain-and-architecture` skill's instruction, exceptions above (genealogy incomplete, duplicate cluster, clock disagreement, disputed logger, untrusted document, stale authorization) are recorded as **failure/exception conditions to be surfaced**, not resolved by this domain model.
