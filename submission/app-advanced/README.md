# AEGIS-PHARMA — Advanced Companion (`submission/app-advanced/`)

## What this is

A richer, exploratory Next.js/TypeScript/Tailwind companion to the AEGIS-PHARMA
static demonstrator. **Current scope**: this app's user-facing navigation and
routing expose only the three business-mandated workflows — A (batch
evidence), B (pharmacovigilance), C (supply/cold-chain). It ports their
response-assembly functions into TypeScript, reusing the exact invariant
discipline, field names, and guardrail behavior already established in:

- `submission/src/workflows/*.py` (the Python reference implementation)
- `submission/app/app.js` (the static demonstrator's JS mirror)

Workflow D (clinical trial context) and Workflow E (discovery/translational
science) TypeScript ports also exist in `lib/workflows/` — real, tested code,
built ahead of schedule as additional scope — but their pages
(`app/_roadmap-workflow-d/`, `app/_roadmap-workflow-e/`) are excluded from
Next.js routing via the underscore-prefix convention, so they 404 today. See
`app/roadmap/page.tsx` (linked from the nav bar) for the phased-scope
explainer. A future release will re-enable Workflow D's route, then
Workflow E's and the remaining cross-cutting injects.

No new decision logic is introduced. This app renders the same
`execution_status: "not_executed"`, `human_review.required` badges, and
never surfaces a prohibited-field value (batch disposition, PV final
decision, allocation/shipment decision, eligibility/treatment-arm,
assay/model disposition, etc.) — see each workflow's
`submission/evaluation/contracts/*.schema.json` for the definitive
forbidden-field list via `additionalProperties: false`.

## Design system

Restyled to a Linear/Vercel/Stripe-dashboard "modern clinical/enterprise"
aesthetic: hand-built shadcn-style primitives (`components/ui/`) on Radix
(`@radix-ui/react-dialog`, `-tabs`, `-slot`) + `class-variance-authority` +
`tailwind-merge`, a neutral/zinc token system in `app/globals.css` (light and
dark palettes as CSS variables, toggled via `next-themes` + `.dark` class —
`components/theme-toggle.tsx`), a real type scale, and subtle motion
(`motion` package, `components/Reveal.tsx`) rather than default Tailwind
sizes/spacing.

## Feature set (added on top of the original port)

1. **Command palette (`⌘K`)** — `components/command-palette.tsx`, built on
   `cmdk` (via a local `components/ui/command.tsx` wrapper). Searches all 84
   injects (by id/title/dimension/scenario) and all static pages
   (workflows, injects, evaluation, tour) with simple substring/startsWith
   scoring — no fuzzy-match dependency. Selecting an inject navigates to its
   detail route, `app/injects/[id]/page.tsx`, which offers a direct link
   into the mapped live workflow (`lib/workflow-links.ts`) when one exists.
2. **Live interactive workflow builder** — every workflow page now has two
   tabs: "Real disclosed scenario" (the original canned picker, unchanged
   in substance) and "Advanced / Edit evidence". The advanced tab holds a
   plain-React form bound to the same scenario shape the canned picker uses
   (e.g. Workflow A's `lab_states.{lims_state,stats_state,notebook_state}`,
   Workflow D's `eligibility_evidence.{value,central_uln,local_uln,edc_rule_uln}`,
   Workflow E's `assay_results[0].instrument_info.firmware`); every keystroke
   recomputes the response via `useMemo` calling the same
   `assemble*ResponseFromScenario` pure function the canned tab uses (added
   to each `lib/workflows/*.ts` file as a small refactor: `assemble*Response`
   now just looks up the canned scenario and delegates to
   `assemble*ResponseFromScenario`). New contradiction/gap rows fade/scale in
   (`animate-flag-in` in `app/globals.css`). No new decision logic — the
   invariants (never a prohibited field, always `execution_status` +
   `human_review`) hold identically in both tabs.
3. **Rich data visualization (Recharts)** — `app/evaluation/page.tsx`: a
   horizontal bar chart of inject coverage by workflow (from
   `data/eval_data.json` → `data/inject_workflow_map.json`), a radial
   pass-rate ring (from `submission/evidence/test_results.json`, mirrored
   into `eval_data.json`), and a bar chart of injects per D01–D13 dimension
   computed live from `data/injects.json` (not hardcoded). Colors use the
   validated categorical palette from the `dataviz` skill
   (`--series-1..6` in `app/globals.css`, distinct light/dark steps).
4. **Guided narrative tour** — `app/tour/page.tsx`, scroll-reveal
   (`components/Reveal.tsx`, `motion`/`whileInView`) walkthrough using only
   real disclosed text: INJ-001 (board pressure) → INJ-023 (OOS/OOT/invalid
   lab-state disagreement) and INJ-037 (ICSR duplicate cluster) → live
   Workflow A and Workflow B responses for those exact scenarios → a closing
   "human review required, always" section. No invented dialogue or events.

## Structure

```
app-advanced/
  app/
    page.tsx                 home page — explains the app, links to workflows
    layout.tsx                root layout: theme provider, guardrail banner, nav, command palette
    globals.css                design tokens (light/dark), type scale, motion keyframes
    tour/page.tsx               guided narrative scrollytelling walkthrough
    workflow-a/page.tsx        Workflow A — GxP batch review (canned + advanced-edit tabs)
    workflow-b/page.tsx        Workflow B — pharmacovigilance (canned + advanced-edit tabs)
    workflow-c/page.tsx        Workflow C — supply/cold-chain (canned + advanced-edit tabs)
    roadmap/page.tsx           phased-scope explainer, grounded in INJECT_WORKFLOW_CATEGORIZATION.md
    _roadmap-workflow-d/page.tsx  Workflow D — clinical trial context (not yet shipped, excluded from routing, underscore-prefixed)
    _roadmap-workflow-e/page.tsx  Workflow E — discovery/translational science (not yet shipped, excluded from routing, underscore-prefixed)
    injects/page.tsx           inject explorer (search/filter over all 84 injects)
    injects/[id]/page.tsx       inject detail route, links into its mapped live workflow
    evaluation/page.tsx        evaluation dashboard (Recharts: bar / radial / dimension bar)
  lib/workflows/
    common.ts                  shared authorization + evidence-ref types
    batch_evidence.ts           assembleBatchResponse(key) + assembleBatchResponseFromScenario(scenario)
    pv_intake.ts                 assemblePvResponse(key) + assemblePvResponseFromScenario(scenario)
    supply_options.ts            assembleSupplyResponse(key) + assembleSupplyResponseFromScenario(scenario)
    clinical_trial_context.ts     assembleClinicalResponse(key) + assembleClinicalResponseFromScenario(scenario)
    discovery_translational_science.ts  assembleDiscoveryResponse(key) + assembleDiscoveryResponseFromScenario(scenario)
  lib/workflow-links.ts        maps an inject's workflow label to a live workflow route
  lib/utils.ts                  cn() class-merge helper
  components/
    GuardrailBanner.tsx          "decision-support, not execution" banner
    NavBar.tsx                    workflow/injects/evaluation/tour nav + theme toggle + ⌘K hint
    ResponseCard.tsx              auth banner, guardrail badges (now visually prominent), raw-JSON viewer
    command-palette.tsx            ⌘K global search over injects + pages
    theme-provider.tsx / theme-toggle.tsx   next-themes wiring
    Reveal.tsx                     scroll-triggered fade/slide-in wrapper (motion)
    ui/                            button, badge, card, tabs, dialog, command, input
  data/
    injects.json                  read-only copy of data/injects.json (84 injects)
    inject_workflow_map.json      mechanically parsed from
                                   submission/artefacts/INJECT_WORKFLOW_CATEGORIZATION.md
    eval_data.json                 ported from submission/app/eval_data.js
```

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
- Workflow D and E pages live under the Next.js underscore-prefix convention
  (`app/_roadmap-workflow-d/`, `app/_roadmap-workflow-e/`), which excludes
  them from routing — they 404 at runtime, are not linked from nav/command
  palette/home page, and are not part of the current user-facing surface.
  Their library code (`lib/workflows/clinical_trial_context.ts`,
  `discovery_translational_science.ts`) is untouched and ready for a future
  release.
- The "Advanced / Edit evidence" live-editing tabs on every workflow page
  reuse the exact same `assemble*ResponseFromScenario` functions as the
  canned tabs — editing values can change *which* contradictions/gaps
  surface, but can never add a prohibited-field key to the response shape,
  since the TypeScript response interfaces (`BatchResponse`, `PvResponse`,
  `SupplyResponse`, `ClinicalResponse`, `DiscoveryResponse`) are fixed and
  the form only edits scenario *inputs*, never the response-assembly logic.

## Data provenance

`data/injects.json` and `data/inject_workflow_map.json` are read-only
snapshots copied from the immutable challenge evidence (`data/injects.json`)
and mechanically parsed from `submission/artefacts/INJECT_WORKFLOW_CATEGORIZATION.md`
respectively — nothing under `data/` or `submission/artefacts/` was modified
to produce them. `data/eval_data.json` mirrors the same static snapshot as
`submission/app/eval_data.js`; regenerate both by hand whenever the
underlying evidence changes.
