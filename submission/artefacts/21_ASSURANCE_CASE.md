# Assurance Case

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

GSN-style claim/argument/evidence structure, synthesizing artefacts 01-20 into a single defensible case for gate G4. This is the capstone-closing artefact for Phase 4 (`AEGIS_PROJECT_PLAN_FINAL.md` row "P4 Secure design... 16–21; **G4**").

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE4 (GxP/Quality/ISO/Assurance Lead) |
| Version / date | v0.1 — 2026-08-10 |
| Reviewers | FDE5, FDE1 |
| Status | Draft |
| Related requirements / ADRs | All of `07-adr/adrs.md`; `11_ADR_REGISTER.md`; artefacts 13-20 |

## Purpose

States and defends the single top claim this entire engagement stands or falls on, with named subclaims, evidence, defeaters and residual risk, so that G4 sign-off is based on an explicit argument rather than an accumulation of documents. Accountable owner: FDE4.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `submission/tests/` (8 files, 35 tests) | This engagement, run 2026-08-10 | `python3 -m unittest discover -s submission/tests` → `FAILED (failures=35)` — confirmed red, zero skips, zero unexpected errors | Expected/correct state at G4; must turn green only via real P5 implementation |
| E-002 | `07-adr/architecture_review.md` | This engagement | Review status `conditional`, no true blocker, 3 named go-forward conditions | Not `pass` — deliberately, since C4/DDD remain `provisional` |
| E-003 | `evaluation/contracts/*.schema.json` + `evaluation/contract_samples/` | Package, immutable | `execution_status: "not_executed"` is a schema `const` on all 3 response contracts — structurally, not just procedurally, enforced | Confirmed PASS via `tools/test_contracts.py` this engagement |
| E-004 | `04-ddd/inject_register_84.md` | This engagement | 84/84 injects accounted for (addressed / in_scope_open / out_of_scope), mechanically cross-checked, not self-assessed | Last corrected 2026-08-08 (arithmetic fix), re-verified stable since |

## 1. Top claim

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the top claim (G1)? | **DECISION**: "AEGIS-PHARMA, as designed through artefacts 01-20, provides evidence-grounded decision support across Workflow A (batch evidence), B (PV intake) and C (supply options) **without ever executing the prohibited terminal action** in any of the three, and its residual risks are named, owned and tracked rather than hidden or minimized." | FDE1/FDE4/FDE5 | This document, in full |
| Why this claim and not a stronger one (e.g. "the system is safe")? | **DECISION**: a stronger claim would be indefensible at this phase — nothing is built yet (`submission/src`: 0 files). The claim is deliberately scoped to what Phase 4 can actually support: the *design* structurally prevents the prohibited action and the *risks* are honestly surfaced, not that the *implementation* has been proven safe (that claim belongs to Prompt 12/artefact-22 evaluation, a later phase) | FDE4 | `14_COMPUTER_SOFTWARE_ASSURANCE.md` §6 |

## 2. Context and assumptions

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What context does this claim depend on? | **FACT**: Track A capstone scope (offline, synthetic, no real patients/regulators); the three workflows and their prohibited actions as fixed by `CLAUDE.md`/`case/INTEGRATED_CASE.md` §4, not by this team's own design choice | FDE1 | `CLAUDE.md` |
| What assumptions does the claim rest on? | **ASSUMPTION**: (a) `submission/src` will be built to match, not deviate from, artefacts 10-20's contracts and invariants (an assurance case about a design, not yet about code); (b) the two optional AI agents remain capped at 2 (`gen_ai_boundaries.md` §3) through P5 build; (c) EU AI Act classification (`19_EU_AI_ACT_APPLICABILITY.md` §3) resolves at or more conservatively than the provisional working assumption | FDE1/FDE3/FDE4 | `04-ddd/gen_ai_boundaries.md` §3 |

## 3. Subclaims and arguments

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| SC1 — Is the prohibited action structurally prevented, not just documented? | **FACT**: yes — `execution_status: "not_executed"` is a JSON Schema `const` (E-003), INV-01/05/06/07 and POL-03/04/05 are independent, non-overlapping structural constraints (`04-ddd/domain_model.md` §4), and 8 test files (35 tests, E-001) now spec every one of them as an executable, currently-failing requirement | FDE3/FDE5 | E-001, E-003 |
| SC2 — Is every material design decision evidence-grounded and defended? | **FACT**: yes — 10 ADRs (`07-adr/adrs.md`), each with a stated evidence basis, ≥1 rejected alternative, and a revisit trigger; architecture review is `conditional` with 3 named conditions, not silently `pass` (E-002) | FDE3 | `11_ADR_REGISTER.md` |
| SC3 — Are adversarial/security risks specified before implementation, not after? | **FACT**: yes — `16_THREAT_ABUSE_MODEL.md` covers all 6 D10 injects; the 3 injects the governing plan names explicitly at M4 (INJ-065/066/067) each have a dedicated failing test (E-001) | FDE5 | `16_THREAT_ABUSE_MODEL.md` §7 |
| SC4 — Are privacy/human-factors/regulatory risks named with accountable owners? | **FACT**: yes — `17_PRIVACY_ETHICS.md` (7/7 D09+INJ-035 findings), `18_RESPONSIBLE_AI_HUMAN_FACTORS.md` (4/4 D11 findings plus HAZ-02's concrete mitigation design), `19_EU_AI_ACT_APPLICABILITY.md`/`20_ISO42001_GOVERNANCE.md` (awareness-level, explicitly not a compliance claim, per `.claude/skills/trust-risk-security.md`) | FDE1/FDE4/FDE5 | Artefacts 17-20 |
| SC5 — Is residual risk honestly stated? | **FACT**: yes — `15_QUALITY_RISK_MANAGEMENT.md` names HAZ-02 (automation bias) as "the hazard with the weakest structural control" in its own words, not smoothed over; every artefact 13-20 carries an explicit, non-empty "Risks, assumptions and unresolved gaps" table | FDE4 | §6 below (rollup) |

## 4. Evidence references

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Where is the full evidence trail? | **DECISION**, indexed: SC1 → `04-ddd/domain_model.md` §4, `evaluation/contracts/`, `submission/tests/`; SC2 → `07-adr/adrs.md`, `11_ADR_REGISTER.md`; SC3 → `16_THREAT_ABUSE_MODEL.md`; SC4 → `17-20_*.md`; SC5 → this document §6 | FDE4 | This table |
| Is any evidence self-assessed rather than cross-checked? | **FACT**: no — the two highest-stakes checks (84-inject coverage, prohibited-test red status) were both mechanically verified this session (grep-based inject count, actual `unittest` run), not asserted from memory, consistent with the cross-verification discipline established across Phases 2-3 | FDE4/FDE5 | E-001, E-004 |

## 5. Defeaters and counterevidence

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What would falsify SC1? | **DECISION**: any P5 implementation that (a) adds a disposition-adjacent field not in the frozen schema, (b) grants either AI agent tool-write authority, or (c) makes any of the 35 tests pass by weakening the test's assertion rather than by correct implementation — all three are explicit "never do this" conditions carried into P5 | FDE3/FDE5 | `submission/tests/*.py` docstrings |
| What would falsify SC2? | **DECISION**: any ADR being silently reversed without a recorded revisit trigger firing (`11_ADR_REGISTER.md` §7) | FDE3 | `11_ADR_REGISTER.md` §7 |
| What would falsify SC3? | **DECISION**: discovery of a 7th D10-class abuse case with no control (would mean the threat model's scope, not just its depth, was wrong) — mitigated by the 84-inject cross-check (E-004) covering all disclosed injects, not just D10 | FDE5 | `04-ddd/inject_register_84.md` |
| What is the strongest counterevidence already on the table? | **FACT**: `15_QUALITY_RISK_MANAGEMENT.md`'s own HAZ-02 finding and `16_THREAT_ABUSE_MODEL.md`'s R-002 (INJ-068 cross-affiliate exfiltration has no named ADR) are both already-known weaknesses in the current design, not hypothetical defeaters — the top claim's "residual risks are named... not hidden" clause exists specifically to remain true even though these two exist | FDE4/FDE5 | `15_QUALITY_RISK_MANAGEMENT.md` §5; `16_THREAT_ABUSE_MODEL.md` §7 |

## 6. Residual risk

Consolidated rollup of open items across artefacts 13-20 (not a new list — an index into the authoritative ones):

| Source artefact | Highest-attention open item | Severity |
|---|---|---|
| `15_QUALITY_RISK_MANAGEMENT.md` | HAZ-02 automation bias — weakest structural control, UI-dependent, untested (`submission/app`: 0 files) | High uncertainty |
| `16_THREAT_ABUSE_MODEL.md` | R-002 — INJ-068 cross-affiliate exfiltration has no named ADR | Medium-High |
| `17_PRIVACY_ETHICS.md` | R-003 — INJ-035 three-way retention conflict has a surfacing obligation but no resolution workflow | Medium (explicitly not this team's to resolve) |
| `18_RESPONSIBLE_AI_HUMAN_FACTORS.md` | R-001 — no numbered POL yet for validated-language-scope routing | Medium |
| `19_EU_AI_ACT_APPLICABILITY.md` | R-001 — provider vs deployer role unresolved, needs Legal | Open, conservative default in place |
| `20_ISO42001_GOVERNANCE.md` | R-001 — AF-2 given a named control, not yet closed (`GXP-SUM-1` still `pilot`) | Open — expected at this phase |

**Honest headline**: the single item most likely to matter at defence (G8) is HAZ-02 — every other open item has either a named control awaiting build, or an explicit non-AEGIS owner (Legal, upstream PSP intake). HAZ-02 is the one residual risk this team's own design choices (universal HITL, structured-breakdown UI requirement) only partially close.

## 7. Invalidation and reapproval conditions

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What re-opens this assurance case? | **DECISION**: (a) any of the 10 ADR revisit triggers firing; (b) any of the 35 red tests turning green via a weakened assertion rather than a correct implementation (§5); (c) Legal's actual EU AI Act classification landing more permissively or more strictly than §3's provisional assumption; (d) `submission/app` reaching a testable state — at that point HAZ-02 (§6) must be re-reviewed, not assumed closed | FDE1/FDE3/FDE4/FDE5 | `11_ADR_REGISTER.md` §7; `19_EU_AI_ACT_APPLICABILITY.md` §7 |
| Who re-approves after invalidation? | **DECISION**: same author-≠-sole-approver rule as the rest of the engagement — FDE4 (GxP) and FDE5 (Security) jointly, per `03_STAKEHOLDER_DECISION_RIGHTS.md` §4 | FDE1 | `03_STAKEHOLDER_DECISION_RIGHTS.md` §4 |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Gap | This assurance case is a design-level argument; no code-level assurance (Prompt 12 evaluation) exists yet | Cannot claim implementation-level assurance until P5/P6 | FDE4/FDE5 | P6 TEVV | Open — expected at this phase |
| R-002 | Risk | HAZ-02 (automation bias) remains the case's single largest open defeater-in-waiting | Could undermine the top claim's defensibility at G8 if not closed before defence | FDE1/FDE4 | P5 build + P6 usability re-test | Open — carried forward, tracked |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| Top claim is scoped to what Phase 4 can defend, not overstated | §1 | Reviewed at G4 | This document | Done |
| Every subclaim (SC1-SC5) has cited, checkable evidence | §3 | Manual cross-check | Artefacts 10-20; `submission/tests/` | Done |
| Prohibited-action tests are confirmed red, not merely claimed red | §Evidence register E-001 | `python3 -m unittest discover -s submission/tests` | `submission/tests/` (8 files, 35 tests) | Done — `FAILED (failures=35)` confirmed 2026-08-10 |
| Residual risk rollup does not contradict any source artefact | §6 | Manual cross-check | Artefacts 15-20 | Done |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| — | FDE5/FDE1 (pending) | Not yet reviewed | — | — |
