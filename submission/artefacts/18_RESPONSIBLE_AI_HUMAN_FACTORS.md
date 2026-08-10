# Responsible AI and Human Factors

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

Scope: the 4 D11 human-factors injects (INJ-071…074), plus the automation-bias hazard first flagged in artefact 15 (HAZ-02) — this artefact is where that hazard gets its actual mitigation design, not just its risk statement.

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE1 (Product/Value Lead) |
| Version / date | v0.1 — 2026-08-10 |
| Reviewers | FDE4, FDE5 |
| Status | Draft |
| Related requirements / ADRs | `04-ddd/gen_ai_boundaries.md` §3; `15_QUALITY_RISK_MANAGEMENT.md` HAZ-02 |

## Purpose

Designs the human-accountability, automation-bias, subgroup-performance, accessibility and monitoring controls around the two optional AI agents (Evidence Summarizer, Duplicate-Similarity Scorer). Accountable owner: FDE1, with FDE4 (GxP) and FDE5 (Security/Eval) as material reviewers.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `data/injects.json` INJ-071…074 (D11) | Package | 4 disclosed human-factors injects | — |
| E-002 | `data/candidate_outputs.csv`, `data/reviewer_feedback.csv` | Current | `CO-1`: an AI summary omitted a critical sterility excursion; reviewer `QR-11` accepted it in 19 seconds with comment "looked complete" | Already-occurred, single documented instance — see §2 for what this can/cannot support |
| E-003 | `data/model_performance.csv` | Current | `PV-NER-4` entity F1: English 0.91, Hindi 0.67, Arabic 0.63 — a 24-30 point gap by language | — |
| E-004 | `data/usability_findings.csv` | Current | Keyboard navigation: fail (high severity); colour-only hold warning: fail (high severity) | Findings against a not-yet-built UI — see §5 |
| E-005 | `data/decision_rights.csv`, `data/stakeholders.csv` | Current | `ai_authority` is `none` for batch certification and ICSR reportability, `draft only` for stock allocation — across all three named accountable roles | — |
| E-006 | `knowledge/PV_MULTILINGUAL_REVIEW.md` (K-023, approved) | NovaCura Global Policy, 2026-05-20 | Mandatory: retain original+translated text with provenance; language-qualified review for material uncertainty; evaluate performance by language/subgroup | — |

## 1. Human accountability

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the INJ-074 finding? | **FACT**: `data/injects.json` INJ-074 — "A global process owner wants uniform automation while local Qualified Persons and safety officers retain legal accountability"; `data/decision_rights.csv` confirms `ai_authority: none` for the EU Qualified Person (batch certification) and Safety Physician (ICSR reportability) roles specifically | FDE1 | `data/decision_rights.csv` |
| Does the architecture already resolve this? | **FACT**: yes, structurally — `04-ddd/domain_model.md` INV-01/POL-03 make it impossible for `readiness_state` to carry a disposition value, and no ADR grants the AI agents write authority; the *organizational* tension (global uniformity ambition vs local legal accountability) is a real, unresolved stakeholder conflict this artefact tracks rather than architecture alone can close | FDE1 | `03_STAKEHOLDER_DECISION_RIGHTS.md` |
| What is the human-factors-specific control beyond the architecture? | **DECISION**: every AI-agent output must be labeled with its accountable-human owner inline (not just enforced at the schema level) — the UI's Human-Review Formatter (`06-c4/c4_components.md`) must display "EU QP decides" / "Safety Physician decides" next to any AI-drafted content, making the accountability boundary visible to the reviewer at the point of use, not just true in the backend | FDE1 | `06-c4/c4_components.md` (HITL component) |

## 2. Automation bias and contestability

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What exactly happened (INJ-071)? | **FACT**: `candidate_outputs.csv` `CO-1,batch_review,"All critical evidence complete; recommend progression",omitted_fact="open sterility excursion",status=unsafe_candidate`; `reviewer_feedback.csv` `CO-1,QR-11,accepted,19,"looked complete"` — a human reviewer accepted an AI-generated summary that omitted a critical open sterility excursion, in 19 seconds, explicitly because it "looked complete" | FDE1/FDE4 | E-002 |
| Can this single case support a general design conclusion? | **INTERPRETATION**: partially — one documented instance cannot establish a failure rate, but it is sufficient to establish that the failure mode *exists* and to design against it; treating this as `inconclusive (data scarcity)` for "does this happen" would be wrong (it demonstrably did), but claiming a frequency from n=1 would also be wrong — the correct claim is narrower: "this failure mode is real, not hypothetical" | FDE1 | E-002 |
| What design change follows? | **DECISION**: the Evidence Summarizer Agent (`06-c4/c4_components.md`) must not produce a single-line completeness verdict at all — its output contract must force a structured breakdown (evidence present / evidence absent / contradictions) so "looked complete" is not achievable from the UI alone; this directly answers `gen_ai_boundaries.md` §3's stop condition ("any omitted material fact detected... halts and flags") by making omission structurally visible rather than relying on the agent to self-detect it | FDE1/FDE3 | `04-ddd/gen_ai_boundaries.md` §3 |
| Is contestability designed? | **DECISION**: every AI-drafted field must carry a visible "disagree / flag" affordance routed to the Audit Store (ADR-005) — a reviewer's override is itself evidence (feeds `reviewer_feedback.csv`-class data back into `data/candidate_outputs.csv`-class monitoring, §7 below), not a silent UI action | FDE1/FDE5 | `11_ADR_REGISTER.md` ADR-005 |

## 3. Uncertainty and abstention UX

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Does the contract already support abstention? | **FACT**: yes — `evaluation/contracts/batch_response.schema.json`, `pv_response.schema.json` and `supply_response.schema.json` all require an `abstentions` array as a top-level field, already enforced by `tools/test_contracts.py` | FDE1/FDE5 | `evaluation/contracts/*.schema.json` |
| What is the UX-level gap? | **DECISION**: the schema requiring an `abstentions` field does not by itself guarantee a reviewer *notices* a populated one — the Human-Review Formatter must render abstentions with equal or greater visual prominence than the main evidence body, directly counter-designed against the INJ-071 pattern (a clean-looking summary suppressing a critical gap) | FDE1 | `06-c4/c4_components.md` |
| What about confidence/uncertainty language? | **DECISION**: AI-drafted text must never use certainty language ("complete," "clear," "confirmed") for anything the agent itself flagged as uncertain or did not check — a lint-style check on agent output templates, owned by FDE1 for UX copy and FDE5 for the check mechanism | FDE1/FDE5 | Backlog → Prompt 08/11 (technical design/build) |

## 4. Language/subgroup performance

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the INJ-072 finding? | **FACT**: `data/model_performance.csv` — `PV-NER-4` entity extraction F1: English 0.91, Hindi 0.67, Arabic 0.63; `data/model_registry.csv` confirms `PV-NER-4` status is `validated_scope_en_de` — i.e. the model's *validated* scope is English/German only, yet performance data exists (and is worse) for Hindi and Arabic, implying it is being used, or evaluated for use, outside its validated scope | FDE1/FDE4 | E-003; `data/model_registry.csv` |
| Does the case data corroborate this? | **FACT**: yes — `data/icsr_cases.csv` includes real cases in German (`PV-1001`) and Arabic (`PV-1014`), both DE-jurisdiction, both awaiting the same extraction pipeline | FDE1 | `data/icsr_cases.csv` |
| What is the control? | **DECISION**: per K-023 (PV_MULTILINGUAL_REVIEW), any case in a language outside `PV-NER-4`'s validated scope (`en_de`) must route to mandatory language-qualified human review, not receive an unflagged AI extraction — this is a **hard gate**, not a quality suggestion, given the 24-30 point F1 gap is a patient-safety-relevant signal-extraction risk, not a cosmetic one | FDE1/FDE4 | E-006; `data/model_performance.csv` |
| Is this already an invariant? | **DECISION**: no numbered POL exists yet for validated-scope enforcement — flagged as a gap (R-001), since it is architecturally adjacent to but distinct from POL-04 (duplicate detection) and INV-04 (verbatim preservation) | FDE1/FDE4 | §Risks below |

## 5. Accessibility

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the INJ-073 finding? | **FACT**: `data/usability_findings.csv` — `keyboard navigation, high, fail`; `colour-only hold warning, high, fail` — both against "the proposed interface" per the inject's own scenario text, i.e. these are pre-existing findings against a design that predates this engagement, not a claim about `submission/app` (which does not exist yet — 0 files) | FDE1 | `data/usability_findings.csv`; governing plan §8 (`submission/app`: 0 files currently) |
| What does this require of the eventual build? | **DECISION**: `submission/app` (P5 build) must satisfy full keyboard operability and must never use colour as the sole signal for a quality-hold/contradiction/gap state (text label + icon + colour, minimum) — recorded here as a binding build requirement, not just a finding, tied to the governing plan's own accessibility-smoke line item (§8.1, P4+P1 owned) | FDE1/FDE3 | `AEGIS_PROJECT_PLAN_FINAL.md` §8.1 "Accessibility smoke" |
| Is this tested anywhere yet? | **FACT**: not yet — no `submission/tests/` accessibility test exists at time of writing (Phase 4 prohibited-action tests take priority per G4); flagged as a P5/P6 backlog item, not a Phase 4 gap, since accessibility testing requires a built UI to test against | FDE1 | §Risks R-002 below |

## 6. Training and competency

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Who needs training, on what? | **DECISION**: every named accountable role (EU QP, Safety Physician, Supply Governance Board, Data Steward, CISO — `06-c4/c4_context.md`) needs role-specific training on: (a) the automation-bias failure mode demonstrated by INJ-071 specifically (not generic "AI can be wrong" awareness); (b) how to read a populated `abstentions`/`contradictions` field; (c) the escalation path when a language-qualified reviewer is required (§4) | FDE1/FDE4 | `06-c4/c4_context.md` |
| Is this evidenced or asserted? | **ASSUMPTION**: no training-completion evidence exists in the package (no `training_records.csv`-class file was found) — this section is a design requirement for P7 runbooks, not a claim that training has occurred | FDE1 | — (absence confirmed by search) |

## 7. Monitoring and feedback

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What feedback loop already exists in the evidence? | **FACT**: `reviewer_feedback.csv`'s shape (`output_id, reviewer, action, review_seconds, comment`) is itself the right monitoring signal — `review_seconds` is a proxy for engagement depth (19 seconds on `CO-1` is the concrete red flag), and `action`/`comment` capture override/accept decisions | FDE1/FDE5 | `data/reviewer_feedback.csv` |
| What should AEGIS's own Audit Store add to this? | **DECISION**: log every AI-drafted-content review with the same shape (`review_seconds`, `action`, whether an abstention/contradiction was present and whether the reviewer engaged with it) as a standing operational metric, not a one-off finding — feeds `production_readiness.md`/`control_lens_rollup.md` at the Prompt 12 assurance stage (future phase), not built here | FDE1/FDE5 | `11_ADR_REGISTER.md` ADR-005 (Audit Store) |
| What triggers a re-review of this artefact? | **DECISION**: (a) any new `reviewer_feedback.csv`-class evidence showing a fast-accept pattern recurring; (b) `submission/app` reaching a testable state (closes R-002); (c) any language added to PV scope beyond `en_de` | FDE1 | — |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Gap | No numbered POL enforces validated-language-scope routing (§4) | A case in an unvalidated language could reach an AI extraction step unflagged if not formalized before build | FDE4/FDE5 | Before P5 build of the PV container | Open |
| R-002 | Gap | Accessibility requirements are named (§5) but untested — `submission/app` does not exist yet | Cannot claim closure until a UI exists to test | FDE1/FDE3 | P5 build + P6 accessibility smoke | Open — expected at this phase |
| R-003 | Risk | HAZ-02 (artefact 15) automation bias is given a concrete mitigation design here (§2), but the design itself is unvalidated — no usability test has run against it | The structured-breakdown output design could still be skimmed the same way `CO-1`'s single-line summary was | FDE1 | P6 TEVV (usability re-test) | Open — carried forward from artefact 15 §5 |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| Every D11 inject (071-074) is addressed with a named finding and design response | §1–§5 | Manual cross-check against `data/injects.json` | `04-ddd/inject_register_84.md` | Done — 4/4 |
| HAZ-02 (artefact 15) has a concrete, not just acknowledged, mitigation | §2 | Reviewed at G4 | `15_QUALITY_RISK_MANAGEMENT.md` §5/§6 | Done — design given, validation pending (R-003) |
| No finding here contradicts `gen_ai_boundaries.md` or the ADR register | Cross-check | Manual review | `04-ddd/gen_ai_boundaries.md`; `11_ADR_REGISTER.md` | Done — zero contradictions |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| — | FDE4/FDE5 (pending) | Not yet reviewed | — | — |
