# Elevator Pitch and Defence

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE1 (Product) — pitch owner and presenter |
| Version / date | v1.0 — 2026-08-11 |
| Reviewers | FDE2, FDE3, FDE4, FDE5 |
| Status | Approved for defence |
| Related requirements / ADRs | `requirements/FINAL_DEFENCE.md`; `submission/artefacts/FINAL_DEFENCE_DOSSIER.md` (13-element rehearsal); RUB-17 |

## Purpose

The 60-second pitch and 5-minute executive case for the Readiness Board (G8), stating problem, bounded intervention, measurable value, strongest control boundary and the decision requested. This artefact is deliberately short — the 13-element rehearsal with live evidence lives in `FINAL_DEFENCE_DOSSIER.md`. Accountable owner: FDE1.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `submission/artefacts/01_BUSINESS_CASE.md` §1, §4 | P1 | Board target: −14% end-to-end release lead time, no spec/Quality-authority change (`data/board_requests.csv` BR-01) | Target only; current-state baseline not in evidence (R-001 there) |
| E-002 | `data/ai_use_boundaries.csv` | Package | Prohibited: batch release/reject/reprocess/recall; final PV causality/seriousness/reportability; stock reserve/allocate/ship | Binding, non-negotiable constraint on scope |
| E-003 | `submission/evidence/test_results.json`, `evaluation_results.json` | Generated P5–P7 | 56/56 tests passing; 18/18 regression scenarios passing; 0 release gates blocked | `submission/scripts/test.sh`, `evaluate.sh` |
| E-004 | `submission/artefacts/23_TOKEN_FINOPS.md` §6 | Generated P6 | Cost per successful task: \$0.0613 (batch), \$0.0413 (PV), both under the \$0.20 cap | `submission/evaluation/reports/detailed_results.jsonl` |
| E-005 | `submission/scripts/ai_disabled_offline_demo.py` | Generated P5 | All 3 workflows execute correctly with zero network calls, by construction | Exit 0 |
| E-006 | `04-ddd/inject_register_84.md` "Coverage summary" | Generated P2–P8 | 61/84 addressed, 11 in_scope_open (carried to `29_NINETY_DAY_ROADMAP_HANDOVER.md`), 12 out_of_scope (stated decision) | Mechanically re-verified each phase |

## 1. 60-second pitch

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| The pitch | **DECISION**: "NovaCura's board wants release lead time down 14% without touching who signs off. The bottleneck isn't the sign-off — it's finding and reconciling evidence across a dozen disconnected systems first. AEGIS-PHARMA is three advisory-only workflows that do that reconciliation — surfacing conflicts, gaps, and unit/authority mismatches instead of hiding them — and hands a complete, cited evidence packet to the same EU Qualified Person, Safety Physician, and Supply Governance Board who already own these decisions. It never certifies a batch, never confirms a PV signal, never ships or allocates stock. That boundary isn't a policy promise — it's structurally impossible in the code, and we can prove it live." | FDE1 | E-001, E-002 |

## 2. Five-minute executive narrative

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Problem → decisions → intervention → boundary → evidence → ask | **DECISION**, expanded: (1) Problem: board wants −14% release lead time (E-001), current baseline honestly not in evidence (abstained, not fabricated). (2) Affected decisions stay exactly where they are — EU QP, Safety Physician, Supply Governance Board, all `ai_authority: none` or `draft only` (`data/decision_rights.csv`). (3) Intervention: three deterministic-core workflows that reconcile evidence and surface conflicts — genealogy breaks, unit mismatches, duplicate PV cases, quarantine vs. released stock — never resolve them. (4) Boundary: every response is schema-locked to `execution_status: "not_executed"`; nine independent deterministic graders and 56 tests prove this holds under adversarial input, not just happy path (E-003). (5) Evidence: 0/18 release-gate failures, real brownfield-vs-rebuild comparison proving the old code actually had the gaps we describe (`22_EVALUATION_SCORECARD.md` §3), cost within budget (E-004), works with zero AI/network dependency (E-005). (6) Ask: see §7 below | FDE1 | Full evidence register |

## 3. Problem and measurable impact

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the measurable problem? | **FACT**: −14% end-to-end release lead time, explicitly without changing registered specs or independent Quality authority (E-001) | FDE1 | `01_BUSINESS_CASE.md` §1 |
| Is the current baseline known? | **FACT — ABSTAIN**: no — `board_requests.csv` states the target only; the current-state number is not in evidence and this submission does not fabricate one (`01_BUSINESS_CASE.md` R-001) | FDE2 | `01_BUSINESS_CASE.md` §2 |
| What is the no-AI comparison? | **FACT**: `data/no_ai_baselines.csv` discloses three options — master-data repair (38% value, 10wk), rules/workflow automation (27%, 6wk), GenAI-assist (51%, 14wk) — GenAI-assist is the highest-value option on this disclosed estimate but also the slowest to deliver and the only one with a live hidden-cost gap (human review booked at \$0/mo, corrected in `23_TOKEN_FINOPS.md` §5) | FDE1 | `data/no_ai_baselines.csv`; `01_BUSINESS_CASE.md` §3 |

## 4. Bounded intervention

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What exactly does the system do? | **FACT**: reconciles evidence and surfaces `readiness_state`/`duplicate_candidates`/`options` — draft, advisory artefacts a human reviews — never a certified, reported, or executed outcome | FDE3 | `submission/src/workflows/*.py` |
| What does it explicitly never do? | **FACT**: release/reject/reprocess/recall a batch; confirm PV causality/seriousness/reportability; reserve/allocate/ship stock (E-002) — enforced by INV-01/05/06/07, not by a prompt instruction | FDE5 | `submission/tests/test_prohibited_*.py` |

## 5. Strongest control boundary

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the single strongest claim in this submission? | **DECISION**: `execution_status: "not_executed"` is a JSON Schema `const` on every one of the three response contracts (`evaluation/contracts/*.schema.json`) — this is not a value the code chooses to set correctly, it is a value the code is structurally incapable of setting to anything else without failing schema validation. `submission/evaluation/graders/schema_grader.py` proves this holds on every regression scenario (18/18 PASS), and the negative contract samples (`evaluation/contract_samples/negative_*.json`) prove the schema actually rejects a prohibited-shaped response when one is attempted | FDE5 | `evaluation/contracts/*.schema.json`; `tools/test_contracts.py` |

## 6. Evidence and residual risk

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the strongest evidence this actually works? | **FACT**: a real, executed brownfield-vs-rebuild comparison, not a claim — the unmodified `starter/legacy_pharma.py` was run against the same data and confirmed (by execution) to mutate a reservation, return a bare bool with no contract shape, and surface a poisoned document as an equally-trusted hit; the rebuild does none of these (`22_EVALUATION_SCORECARD.md` §3) | FDE5 | `submission/evaluation/reports/final_evaluation_report.md` §3 |
| What residual risk remains? | **FACT**, itemized: 11 injects still `in_scope_open` (E-006); no RC has been tagged/versioned yet (`28_PRODUCTION_READINESS.md`); the −14% target's current-state baseline is still unmeasured (R-001 above) | FDE1 | `29_NINETY_DAY_ROADMAP_HANDOVER.md` |

## 7. Decision requested

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is asked of the Board? | **DECISION**: **Conditional Go** — approve Track A (this submission, G1–G8) as defence-ready and authorize the 90-day backlog (`29_NINETY_DAY_ROADMAP_HANDOVER.md`) to close the 11 open injects and the denial-of-wallet/regulatory-notification gaps; commission Track B (P9, production hardening) only after that backlog's 0–30-day items land, not concurrently. Full reasoning in `FINAL_DEFENCE_DOSSIER.md` element 13 | FDE1 (recommendation); Board (decision) | `28_PRODUCTION_READINESS.md` §6; `29_NINETY_DAY_ROADMAP_HANDOVER.md` |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Gap | −14% target has no measured current-state baseline (carried from `01_BUSINESS_CASE.md` R-001, still open at defence) | Cannot yet claim the target is achievable or attributable to this system specifically | FDE2 | 90-day roadmap 0–30 day window | Open |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| Prohibited action is structurally impossible, not just policy | JSON Schema `const: "not_executed"` | `schema_grader`, `test_contracts.py` | `evaluation/contracts/*.schema.json` | PASS |
| Brownfield defect is real, not asserted | `starter/legacy_pharma.py` (unmodified) | 3 baseline scenarios | `submission/evaluation/reports/final_evaluation_report.md` | Confirmed |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| FDE1 (self-review) | Product / pitch owner | Pitch stays within what's evidenced; no baseline number invented | Accepted for defence | 2026-08-11 |
