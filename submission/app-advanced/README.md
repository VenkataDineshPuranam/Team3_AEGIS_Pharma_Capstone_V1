# AEGIS-PHARMA — Advanced Companion (`submission/app-advanced/`)

## What this is

A richer, exploratory Next.js/TypeScript/Tailwind companion to the AEGIS-PHARMA
static demonstrator. It ports the same five workflow response-assembly
functions (Workflow A batch evidence, B pharmacovigilance, C supply/cold-chain,
D clinical trial context, E discovery/translational science) into TypeScript,
reusing the exact invariant discipline, field names, and guardrail behavior
already established in:

- `submission/src/workflows/*.py` (the Python reference implementation)
- `submission/app/app.js` (the static demonstrator's JS mirror)

No new decision logic is introduced. This app renders the same
`execution_status: "not_executed"`, `human_review.required` badges, and
never surfaces a prohibited-field value (batch disposition, PV final
decision, allocation/shipment decision, eligibility/treatment-arm,
assay/model disposition, etc.) — see each workflow's
`submission/evaluation/contracts/*.schema.json` for the definitive
forbidden-field list via `additionalProperties: false`.

## Why this exists as a *separate* app

`submission/app/` (the static HTML/JS explorer) is the graded submission
artifact and must stay build-free and fully offline-capable per the
capstone's guardrails — `CLAUDE.md` states the offline-capability
requirement explicitly, and the static app is what satisfies it.

This Next.js app is **not** offline-capable (it requires `npm install` and a
build step) and is **not** the graded artifact. It was built as an
additional, clearly-labeled companion for a richer exploratory UI, after the
offline/no-build tradeoff was explained and the user confirmed they wanted
a separate Next.js app rather than modifying the compliant static app.

**`submission/app/index.html` remains the graded, offline, compliant
artifact.** Nothing under `submission/app/` was modified to build this.

## Structure

```
app-advanced/
  app/
    page.tsx                 home page — explains the app, links to workflows
    layout.tsx                root layout: guardrail banner + nav
    workflow-a/page.tsx        Workflow A — GxP batch review
    workflow-b/page.tsx        Workflow B — pharmacovigilance
    workflow-c/page.tsx        Workflow C — supply/cold-chain
    workflow-d/page.tsx        Workflow D — clinical trial context (additional scope)
    workflow-e/page.tsx        Workflow E — discovery/translational science (additional scope)
    injects/page.tsx           inject explorer (search/filter over all 84 injects)
    evaluation/page.tsx        evaluation dashboard (static snapshot)
  lib/workflows/
    common.ts                  shared authorization + evidence-ref types
    batch_evidence.ts           ported from app/app.js assembleBatchResponse
    pv_intake.ts                 ported from app/app.js assemblePvResponse
    supply_options.ts            ported from app/app.js assembleSupplyResponse
    clinical_trial_context.ts     ported from app/app.js assembleClinicalResponse
    discovery_translational_science.ts  ported from app/app.js assembleDiscoveryResponse
  components/
    GuardrailBanner.tsx          "decision-support, not execution" banner
    NavBar.tsx                    workflow/injects/evaluation nav
    ResponseCard.tsx              auth banner, guardrail badges, raw-JSON viewer
  data/
    injects.json                  read-only copy of data/injects.json (84 injects)
    inject_workflow_map.json      mechanically parsed from
                                   submission/artefacts/INJECT_WORKFLOW_CATEGORIZATION.md
    eval_data.json                 ported from submission/app/eval_data.js
```

## How to run

```sh
cd submission/app-advanced
npm install
npm run dev       # http://localhost:3000
```

Production build:

```sh
npm run build
npm start
```

Lint:

```sh
npm run lint
```

## Guardrails discipline

- Every workflow page shows `execution_status: "not_executed"` and the
  required human-reviewer role badge, exactly like the static app.
- No page computes or displays a prohibited-field value. Conflicts are
  always surfaced as flags/contradictions/gaps requiring human review, never
  resolved by the UI.
- The root layout renders a persistent banner: "Decision-support
  demonstrator, not an execution system... not the graded/compliant
  artifact."
- Workflow D and E pages are additionally labeled "additional scope" since
  they are not among the three mandated workflows (A/B/C).

## Data provenance

`data/injects.json` and `data/inject_workflow_map.json` are read-only
snapshots copied from the immutable challenge evidence (`data/injects.json`)
and mechanically parsed from `submission/artefacts/INJECT_WORKFLOW_CATEGORIZATION.md`
respectively — nothing under `data/` or `submission/artefacts/` was modified
to produce them. `data/eval_data.json` mirrors the same static snapshot as
`submission/app/eval_data.js`; regenerate both by hand whenever the
underlying evidence changes.
