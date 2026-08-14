# AEGIS-PHARMA — Advanced Companion

A Next.js/TypeScript/Tailwind companion to the AEGIS-PHARMA static demonstrator, exposing the three business-mandated workflows through a richer, exploratory UI.

> **This is not the graded submission artifact.** `submission/app/index.html` (static HTML/JS, no build step, fully offline) is the compliant, graded deliverable. This app requires `npm install` and a build step, and exists purely as an additional, clearly-labeled companion for exploration.

## What ships in this release

| Workflow | Covers | Never |
|---|---|---|
| **A — GxP Batch Review** | Evidence completeness, conflicts, gaps for a batch | Releases, rejects, reprocesses, relabels or recalls a batch |
| **B — Pharmacovigilance** | Case intake and signal support | Makes a final seriousness, causality, expectedness, reportability or signal decision |
| **C — Supply / Cold-Chain** | Non-executing recovery options | Reserves, allocates, changes quality status, ships or initiates a recall |

Every response carries `execution_status: "not_executed"` and names the human reviewer role required to act on it — that guardrail is structural, not cosmetic: each workflow's response type (`BatchResponse`, `PvResponse`, `SupplyResponse`) has a fixed shape that cannot express a prohibited field, matching the `additionalProperties: false` discipline in `submission/evaluation/contracts/*.schema.json`.

Response logic is a direct TypeScript port of the Python reference implementation (`submission/src/workflows/*.py`) and the static demonstrator's JS mirror (`submission/app/app.js`) — no new decision logic is introduced.

### Not in this release

Workflow D (clinical trial context) and Workflow E (discovery/translational science) are real, tested, working code — TypeScript ports live in `lib/workflows/`, their pages exist at `app/_roadmap-workflow-d/` and `app/_roadmap-workflow-e/` — but are excluded from routing (Next.js's underscore-prefix convention; both 404 at runtime) and are not named anywhere in the live UI: not the sidebar, not the home page, not the command palette, not the injects page, not the evaluation dashboard.

Of the 84 disclosed injects, **70 are addressed by what this app demonstrates**; the remaining 14 are addressed elsewhere in the repository but not shown here. The injects page marks those 14 `not in this release` rather than `addressed` (`lib/release-scope.ts`), and the evaluation dashboard states the same split plainly — see `data/eval_data.json`'s `injectCoverage.note`.

## Running it

```sh
cd submission/app-advanced
npm install
npm run dev      # http://localhost:9000
```

```sh
npm run build && npm start    # production build, same port
npm run lint                  # eslint
```

## Design

Modern clinical/enterprise dashboard aesthetic — shadcn-style primitives (`components/ui/`) on Radix + `class-variance-authority` + `tailwind-merge`, a light-first token system in `app/globals.css` (`--background: #ffffff`), a persistent left sidebar for navigation (`components/Sidebar.tsx`, collapses to a drawer under `md`), and a real type scale. Opens in light mode regardless of OS theme (`defaultTheme="light"`, `enableSystem={false}` in `components/theme-provider.tsx`); a manual toggle is available.

## Features

**Command palette (`⌘K`)** — `components/command-palette.tsx`, built on `cmdk`. Searches all 84 injects (id, title, dimension, scenario) and every live page. Selecting an inject opens its detail route (`app/injects/[id]/page.tsx`), which links into its mapped live workflow when one exists (`lib/workflow-links.ts`).

**Live evidence editor** — every workflow page has two tabs: *Real disclosed scenario* (the original canned picker, drawn from real CSV rows) and *Advanced / Edit evidence*, where the underlying fields are editable and every keystroke recomputes the response via the same pure `assemble*ResponseFromScenario` function the canned tab uses. New contradictions/gaps fade in (`animate-flag-in`). The invariants hold identically in both tabs — editing values can change *which* conflicts surface, never add a prohibited field to the response shape.

**Evaluation dashboard** — `app/evaluation/page.tsx`: Recharts bar chart of inject coverage by workflow, a radial test-pass-rate ring, and a bar chart of injects per dimension (D01–D13) computed live from `data/injects.json`. Colors use the validated categorical palette from the `dataviz` skill.

**Inject explorer** — `app/injects/page.tsx` and `app/injects/[id]/page.tsx`: search and filter across all 84 injects by dimension, workflow and status.

## Structure

```
app-advanced/
  app/
    page.tsx                    home page
    layout.tsx                  root layout — theme provider, sidebar, command palette
    globals.css                 design tokens, type scale, motion keyframes
    workflow-a/page.tsx         Workflow A
    workflow-b/page.tsx         Workflow B
    workflow-c/page.tsx         Workflow C
    _roadmap-workflow-d/        Workflow D — built, tested, not routed
    _roadmap-workflow-e/        Workflow E — built, tested, not routed
    injects/page.tsx            inject explorer
    injects/[id]/page.tsx       inject detail
    evaluation/page.tsx         evaluation dashboard
    loading.tsx / error.tsx / not-found.tsx
  lib/
    workflows/                  TypeScript ports (5 workflows, incl. D/E)
    workflow-links.ts           inject workflow label → live route
    release-scope.ts            which injects are "not in this release"
    utils.ts                    cn() class-merge helper
  components/
    Sidebar.tsx                 persistent left nav, theme toggle, ⌘K trigger
    ResponseCard.tsx            auth banner, guardrail badges, raw-JSON viewer
    command-palette.tsx         ⌘K global search
    theme-provider.tsx / theme-toggle.tsx
    ui/                         button, badge, card, tabs, dialog, command, input
  data/
    injects.json                 read-only copy of data/injects.json
    inject_workflow_map.json     parsed from INJECT_WORKFLOW_CATEGORIZATION.md
    eval_data.json                test/eval snapshot
```

## Data provenance

`data/injects.json` and `data/inject_workflow_map.json` are read-only snapshots — nothing under the immutable `data/` or `submission/artefacts/` was modified to produce them. `data/eval_data.json` mirrors the same snapshot as `submission/app/eval_data.js`; regenerate both by hand when the underlying evidence changes.
