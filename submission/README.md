# Participant Submission Workspace

Do not modify challenge evidence. Store all work here.

- `app/`: participant-facing application or demonstrator.
- `src/`: implementation code.
- `tests/`: deterministic, adversarial, subgroup, outage and recovery tests.
- `evaluation/`: datasets, graders, scorecards, thresholds and results.
- `artefacts/`: completed 30 templates or equivalent mapped deliverables.
- `evidence/`: submission manifest, hashes, machine-readable test/evaluation results and exported audit evidence.
- `runbooks/`: setup, operations, incident response and AI-disabled continuity.
- `scripts/`: setup, run, test, evaluate, reset and evidence-export commands.

Use `python tools/check_submission_structure.py --scaffold` during work and `--final` before defence.

## Phased scope

This release ships the three business-mandated workflows: A (GxP batch review), B (pharmacovigilance), C (supply/cold-chain). Workflow D (clinical trial context) and Workflow E (discovery/translational science) are additional scope, not yet included in this release. All five workflows' Python implementations (`src/workflows/`) and TypeScript ports (`app-advanced/lib/workflows/`) already exist and are tested; the app UIs (`app/`, `app-advanced/`) expose only A/B/C — D/E have no live route, no nav entry and no mention anywhere in either app's UI. 70 of the 84 disclosed injects are addressed by the three shipped workflows and the cross-cutting design work; the remaining 14 are addressed in the wider repository but not demonstrated by either app in this release (see `app-advanced/app/evaluation/page.tsx` and `app-advanced/lib/release-scope.ts`).

## Architecture reference

`artefacts/REPO_ARCHITECTURE_GRAPH.html` (self-contained interactive diagram) and `artefacts/repo_architecture_graph.json` (same graph, machine-readable for AI agents) document the real components, relationships and request-lifecycle flows across data, shared kernel, workflows, contracts, tests, evaluation and apps.
