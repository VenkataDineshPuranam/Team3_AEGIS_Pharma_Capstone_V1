# Repository Overview — Project AEGIS-PHARMA

This file orients a new reader (human or AI) to what this repository is, how it is organized, what is immutable vs. writable, and what work is actually required. It complements, but does not replace, `START_HERE.md`, `PACKAGE_SCOPE_AND_ASSUMPTIONS.md`, and `DEFINITION_OF_DONE.md`.

## 1. What this is

A challenge-only, fully synthetic, offline-capable AI Forward Deployed Engineering (FDE) capstone for a fictional pharmaceutical company. There is no reference solution, answer key, or golden architecture. The participant designs and builds a defensible intervention entirely inside `submission/`, using the evidence and constraints supplied in the rest of the package.

## 2. The three mandatory workflows

Each is decision-**support** only. Each has one prohibited terminal action that must fail closed:

| Workflow | Purpose | Prohibited |
|---|---|---|
| **A — GxP batch review** | Identify evidence completeness, conflicts, gaps | release, reject, reprocess, relabel, recall |
| **B — Pharmacovigilance** | Case intake and signal support | final seriousness, causality, expectedness, reportability, or signal decisions |
| **C — Supply / cold-chain** | Non-executing recovery options | reserve, allocate, ship, change quality status, initiate recall |

Every response requires provenance, authority, as-of time, uncertainty, abstention, human-review state, and audit evidence.

## 3. Repository map

| Path | Status | Contents |
|---|---|---|
| `case/` | Immutable | Master scenario (`INTEGRATED_CASE.md`), 15 stakeholders with conflicting incentives (`STAKEHOLDER_PACK.md`), brownfield system landscape (`SOURCE_SYSTEM_FACT_PACK.md`), non-binding regulatory anchors (`REGULATORY_BOUNDARY_PACK.md`) |
| `data/` | Immutable | 143 CSVs + `injects.json` (84 disclosed injects, `INJ-001`…`INJ-084`, dimensions D01–D13) — the traceability spine, cross-linked via `inject_evidence_map.csv` and `INJECT_TEST_COVERAGE.csv` |
| `knowledge/` | Immutable | 32 policy docs — a knowledge-authority test bed. Status matters: most `approved`, some `superseded` (`BATCH_RELEASE_POLICY_OLD`), some `untrusted`/poisoned (`FAKE_PV_EXPEDITED_RULE`, `MALICIOUS_SUPPLIER_DEVIATION`), one `draft`, one jurisdiction-local |
| `source_documents/` | Immutable | Source-of-truth documents (protocols, CCDS, audit commitments, regulator letters) at conflicting versions |
| `evaluation/` | Immutable | `EVALUATION_PLAN.md`, JSON-Schema contracts (`contracts/`), positive/negative contract samples, 15 public fixtures (`PUB-01`…`PUB-15`) |
| `requirements/` | Immutable | `ASSESSMENT_RUBRIC.csv` (17 criteria, ~180 pts, 6 hard-gates), `FINAL_DEFENCE.md`, `SCORING_MODEL.md`, `SUBMISSION_EVIDENCE_STANDARD.md`, `ARTEFACT_EXPECTATIONS.md` |
| `starter/` | Immutable | Deliberately broken brownfield code (`legacy_pharma.py`, `legacy_portal.js`) to diagnose and replace, not extend; `baseline_diagnostics.py` gives a shallow starting clue only |
| `templates/` | Immutable | 30 numbered participant artefact scaffolds (`01_BUSINESS_CASE.md` … `30_ELEVATOR_PITCH.md`) |
| `app/` | Immutable | Offline inject/evidence explorer (`index.html`, `app.js`, generated `data.js`) |
| `tools/` | Immutable | `verify_package.py`, `check_submission_structure.py`, `test_contracts.py`, `hash_submission.py`, `rebuild_explorer_data.py` |
| `submission/` | **Writable — all participant work goes here** | `app/`, `src/`, `tests/`, `evaluation/`, `artefacts/`, `evidence/`, `runbooks/`, `scripts/` |
| `prompts/` | Writable (not challenge evidence) | 13-stage FDE engagement prompts (`01_discovery.md` … `13_solution_proposal.md`) driving artefact production |
| `.claude/` | Writable (tooling) | Claude Code native agents, commands, skills, and rules for this engagement |
| `CLAUDE.md` | Writable (tooling) | Always-loaded guardrails and architecture map for Claude Code sessions |

## 4. Immutable vs. writable — the one rule that matters most

`case/`, `data/`, `knowledge/`, `source_documents/`, `evaluation/`, `requirements/`, `starter/`, `templates/` are protected by `FILE_HASHES.csv` and checked by `tools/verify_package.py`. Do not edit them, do not "clean up" records marked `referenced_missing`, `untrusted`, `draft`, `superseded`, or `unknown` — those are deliberate challenge conditions. All new work belongs under `submission/`.

## 5. Definition of done, in one paragraph

`DEFINITION_OF_DONE.md` requires: the problem and no-AI alternative evidenced; all three workflows implemented with versioned contracts, deterministic tests, and provable prohibited-action failure; reproducible setup/run/test/evaluate/reset/export commands; GxP, security, and privacy controls including adversarial testing (injection, poisoning, tool abuse, exfiltration); golden/edge/adversarial/subgroup/outage evaluation suites with measurable release thresholds; all 30 artefacts (or mapped equivalents) with a signed manifest and hashes; and a live defence covering happy/edge/attack/outage/recovery paths ending in a go/conditional-go/pivot/pause/stop recommendation. `tools/check_submission_structure.py --final` is the mechanical gate.

## 6. The delivery framework layered on top

This repository also carries a custom FDE delivery methodology (not part of the original challenge package, but built to execute it):

- **`submission/artefacts/ProjectPlan/AEGIS_PROJECT_PLAN_FINAL.md`** — the governing project plan. Dual-track: **Track A** (capstone-scored, 40h official / ~55–70h realistic, 5-person team) vs. **Track B** (optional production-ready claim, +16–24h, gated by **G9**). Nine gates **G1–G9** across phases **P0–P8** (+ **P9** for Track B), five seats (P1 Product/Value, P2 Domain/Evidence, P3 Architecture/Build, P4 GxP/Quality, P5 Security/Eval), and a rule that no agentic/model-inference code ships before **G4 PASS**.
- **`.claude/skills/` (portable FDE skill pack) + `prompts/01`–`13`** — a 13-stage engagement sequence (`Discovery → Frame(SCQA) → PRD → DDD → Feature Specs → C4 → ADRs → Technical Design → Lean/DMAIC → Tasks → Deliver → Assurance → Proposal`) that produces the 30 numbered artefacts.
- **`.claude/agents/`, `.claude/commands/`, `.claude/rules/`** — Claude Code native agents (`evidence-reviewer`, `security-reviewer`, `test-engineer`), slash commands (`/00_qualify_problem`, `/01_map_evidence`, `/02_build_tests_first`), and always-on engineering/GxP guardrails.

Known open item: `.claude/skills/gxp-evidence-reconciliation`, `pv-case-intake`, and `bounded-supply-planning` each exist twice — once as a proper Claude Code skill directory (`<name>/SKILL.md`) and once as a flat 2-line `<name>.md` duplicate. The flat files are inert for Claude Code's skill discovery and are pending cleanup.

## 7. Where things stand right now

As of the last structural check (`tools/check_submission_structure.py --final`), planning artefacts exist (the project plan and an architecture map under `submission/artefacts/`) but **no implementation exists yet**: 0 substantive files in `app/`, `src/`, `tests/`, `evaluation/`, `evidence/`, `runbooks/`, or `scripts/`, and 6 of the required 30 in `artefacts/`. The plan's own next action is Phase **P1 Discovery**, targeting artefacts 01–04 and gate **G1**.
