# Target Operating Model

**Label key:** FACT = package-cited · INTERPRETATION = reasoned from facts · ASSUMPTION = unproven · DECISION = team choice.

## Document control

| Field | Entry |
|---|---|
| Team / owner | FDE1 (Product) |
| Version / date | v1.0 — 2026-08-11 |
| Reviewers | FDE4, FDE5 |
| Status | Draft |
| Related requirements / ADRs | RUB-16; `case/STAKEHOLDER_PACK.md`; `data/decision_rights.csv` |

## Purpose

States who operates, changes and governs the three workflows after handover — accountability, decision forums, service management and KPIs. Accountable owner: FDE1.

## Evidence register

| Evidence ID | Source path / record | Authority and effective time | Fact used | Integrity / limitation |
|---|---|---|---|---|
| E-001 | `data/decision_rights.csv` | Package | `batch certification` → EU Qualified Person, `ai_authority: none`. `ICSR reportability` → Safety Physician, `none`. `stock allocation` → Supply Governance Board, `draft only` | Real disclosed accountability map — the system never holds `ai_authority` beyond `none`/`draft only` for any listed decision |
| E-002 | `data/stakeholders.csv` | Package | `ST-01` EU Qualified Person (EU, priority: evidence completeness), `ST-02` Manufacturing VP (Global, supply continuity), `ST-03` Global Safety Head (Global, reporting timeliness) | Real disclosed stakeholder roles |
| E-003 | `AEGIS_PROJECT_PLAN_FINAL.md` §12 | Package | Five FDE seats (FDE1 Product, FDE2 Domain, FDE3 Architecture, FDE4 GxP/ISO, FDE5 Security/Privacy/Eval/Reliability) each own a named artefact set | Delivery-team RACI, reused here as the operating-team RACI shape |
| E-004 | `submission/src/services/authorization.py`, `tool_gateway.py` | Generated P5 | Deny-by-default authorization and unconditional disposition-write denial are code-enforced, not procedure-enforced | `submission/tests/test_authorization_fail_closed.py`, `test_replay_and_excessive_agency.py` |

## 1. Capabilities and ownership

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Who owns each workflow's regulated decision? | **FACT**: exactly as `decision_rights.csv` states — EU Qualified Person (batch), Safety Physician (PV), Supply Governance Board (supply) — the system's `human_review.role` field in every response (`submission/src/workflows/*.py`) is drawn directly from this table, not invented | FDE4 | E-001 |
| Who owns the system itself post-handover? | **DECISION**: the five-seat delivery structure (E-003) is proposed as the initial operating structure too — FDE1 (Product/TOM/roadmap), FDE3 (Architecture/code), FDE4 (GxP/compliance), FDE5 (Security/Eval/Reliability); a dedicated FDE2 (Domain) seat is not needed post-handover since domain modeling is complete, its responsibilities fold into FDE1 | FDE1 | E-003 |

## 2. Decision forums

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What forum approves a supply option? | **FACT**: Supply Governance Board — every `supply_options` response sets `approvals_required: ["Supply Governance Board"]` unconditionally (`submission/src/workflows/supply_options.py`), matching `decision_rights.csv`'s `stock allocation` row exactly | FDE1 | E-001 |
| What forum approves a model/routing change? | **DECISION**: no dedicated forum is disclosed in the package; proposed — the same body reviewing `23_TOKEN_FINOPS.md`/`27_VENDOR_EXIT_RETIREMENT.md` (FDE1+FDE5), since a routing change is both a cost and a subgroup-fidelity decision (§2 of both artefacts) | FDE1 | `23_TOKEN_FINOPS.md` §2 |

## 3. Run/change/control roles

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Who runs day-to-day operations? | **DECISION**: FDE3 (Architecture/code owner) for `run.sh`/`evaluate.sh` execution and incident first-response, per `OPERATIONS.md`/`INCIDENT.md` | FDE1 | `submission/runbooks/OPERATIONS.md` |
| Who approves a code/control change? | **FACT**: the invariant/policy set (INV-01…10, POL-01…06) is the change-control boundary — any change touching `submission/src/services/*` must keep all 56 tests green (`submission/scripts/test.sh`) and 0 release gates blocked (`submission/scripts/evaluate.sh`) before merge; this is enforced by the test/evaluate suite, not by a separate manual sign-off process | FDE5 | `submission/scripts/test.sh`, `evaluate.sh` |

## 4. Service management

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What is the support model? | **DECISION**: L1 (first response, run/observe) = FDE3; L2 (control/policy investigation) = FDE5; L3 (regulated-decision escalation) = the role named in `decision_rights.csv` for the affected workflow — a three-tier model matching the existing artefact ownership, not a new org chart | FDE1 | `INCIDENT.md` |

## 5. Model/data/prompt/tool governance

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| Is governance procedural or code-enforced? | **FACT**: code-enforced where it matters most — `authorization.py` denies by default, `tool_gateway.py` denies any disposition-write action unconditionally regardless of who approved the tool, `knowledge_gateway.py` gates citation on document `status` alone — none of these require a human to remember a procedure at execution time | FDE5 | E-004 |
| Who governs adding a new knowledge document or tool? | **DECISION**: the same authority that sets `status` in `knowledge_catalog.csv`/`tool_catalog.csv` today (not modeled as a named role in the disclosed data) — proposed: Regulatory Strategist for knowledge documents, FDE5 for tool manifests, both requiring the change to keep `test_knowledge_authority_gate.py` and `test_replay_and_excessive_agency.py` green | FDE4 | `submission/tests/test_knowledge_authority_gate.py` |

## 6. Competency and training

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What must an operator understand before running this system? | **DECISION**: (a) that every response is advisory-only and `execution_status` can never leave `not_executed` — this is a structural guarantee, not a policy the operator must remember; (b) how to read `submission/evaluation/reports/summary.json` and act on `release_gates_blocked > 0`; (c) the three runbooks (`SETUP`, `OPERATIONS`, `INCIDENT`, `AI_DISABLED`) | FDE1 | `submission/runbooks/` |

## 7. KPIs and continuous improvement

| Item / question | Evidence-based response | Decision / owner | Acceptance evidence |
|---|---|---|---|
| What are the operating KPIs? | **DECISION**, evidence-grounded: (1) `release_gates_blocked == 0` on every `evaluate.sh` run (currently 0/18, `summary.json`); (2) 56/56 tests passing on every `test.sh` run; (3) cost-per-successful-task within the declared \$0.20 cap (currently \$0.0613/\$0.0413, `23_TOKEN_FINOPS.md` §6); (4) 0 confirmed automation-bias incidents left unreviewed (`22_EVALUATION_SCORECARD.md` §6 already surfaces the `CO-1` sample) | FDE1 | `submission/evaluation/reports/summary.json` |

## Risks, assumptions and unresolved gaps

| ID | Type | Description | Impact | Owner | Due / trigger | Status |
|---|---|---|---|---|---|---|
| R-001 | Assumption | Post-handover operating structure (§1, §3) reuses the delivery-team seat model — no real operating org has confirmed this yet | Structure may not match the receiving team's actual staffing | FDE1 | Handover (`29_NINETY_DAY_ROADMAP_HANDOVER.md`) | Open |
| R-002 | Gap | No named forum for model/routing change approval is disclosed in the package (§2) — this artefact proposes one, not a confirmed decision | A real routing change could proceed without the intended review | FDE1 | Before any generative layer is built | Open |

## Traceability and acceptance

| Claim / requirement | Architecture or control | Test / evaluation | Evidence path | Result |
|---|---|---|---|---|
| System's `human_review.role` matches disclosed accountable roles exactly | `submission/src/workflows/*.py` | Code inspection | `data/decision_rights.csv` vs. workflow source | Confirmed match |
| Governance is code-enforced, not just documented | `authorization.py`, `tool_gateway.py`, `knowledge_gateway.py` | `submission/tests/` | `submission/evidence/test_results.json` | PASS (56/56) |

## Review record

| Reviewer | Role | Finding | Resolution | Date |
|---|---|---|---|---|
| FDE1 (self-review) | Product | R-001/R-002 are real open decisions for the receiving team, not resolved here | Recorded for handover | 2026-08-11 |
