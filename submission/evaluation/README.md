# submission/evaluation — offline eval framework (P6 TEVV)

Reusable offline-first evaluation framework per `AEGIS_PROJECT_PLAN_FINAL.md`
§11.8 ("Cursor evaluation architecture, mandatory shape"). Distinct from,
and complementary to, `submission/tests/` (35 unittest-style prohibited-
action / fail-closed specs): this package runs the 12 required suites
(`evaluation/EVALUATION_PLAN.md`) against the 15 disclosed public fixtures
plus a small number of participant-authored scenarios, through deterministic
graders and release-gate policies, and emits a machine-readable report set.

## Layout

| Path | Role |
|---|---|
| `datasets/S01…S12_*.json` | One file per required suite (§11.4); each lists scenarios with a `category` (normal/edge/adversarial/outage), the injects it covers, and which graders apply |
| `adapters/workflow_adapter.py` | Connects scenarios to the real `submission/src/workflows/*` (regression) and to unmodified `starter/legacy_pharma.py` (baseline); captures input, output, evidence used, tools called, retries, errors, approvals, side effects, latency |
| `graders/*.py` | 9 deterministic checks (schema, evidence, prohibited_action, authority, security, temporal_unit, trajectory, latency_cost, subgroup), each with positive+negative unit tests (`graders/test_graders.py`) |
| `policies/release_gates.py` | The ten automatic-failure gates (§11.5); a blocked gate is never averaged away by an overall pass rate |
| `runner.py` | Executes every suite, applies graders + gates, writes the report set |
| `reports/` | Generated: `summary.json`, `detailed_results.jsonl`, `scorecard.csv`, `failed_cases.json`, `final_evaluation_report.md` |

## Run it

```sh
python3 -B submission/evaluation/runner.py                       # full run, writes reports/
python3 -B -m pytest submission/evaluation/graders -q            # grader unit tests only
python3 -B -m pytest submission/tests submission/evaluation -q   # everything (56 tests)
```

Exit code is non-zero only if a **regression** scenario (real `submission/src` code) trips a release gate. Baseline scenarios (unmodified `starter/`) are expected to fail their underlying check — that failure is the documented brownfield defect, not a gate breach — and never affect the exit code.

## Design decisions worth knowing before reading the code

- **No answer key.** `evaluation/EVALUATION_PLAN.md` is explicit: fixtures are reproducible input bundles, `expected_answer_included: false` on every one. Every grader checks a structural invariant (schema, integrity hash, authority status, no-disposition, etc.), never a memorized "correct" output.
- **Baseline vs. regression, not baseline vs. golden.** Three scenarios (`S01-01`, `S03-baseline`, `S05-baseline`) deliberately call `starter/legacy_pharma.py` — the unmodified brownfield code the case package ships — to make the P5 rebuild's value falsifiable rather than asserted. See `reports/final_evaluation_report.md` §3.
- **Graders reuse service code, not a second definition of correctness.** E.g. `graders/authority_grader.py` calls `submission.src.services.knowledge_gateway.resolve_citation` — the same function the workflows call — so a grader can never silently drift from what the shipped code actually enforces.
- **Public fixtures are raw evidence, not pre-shaped contract objects.** `adapters/workflow_adapter.shape_evidence_item` reshapes each fixture's evidence block into the `evidence_item` contract shape (`evaluation/contracts/evidence_item.schema.json`); every field traces 1:1 to the fixture, and undisclosed fields (`authority`, `effective_at`) are left `"undisclosed"`/`null` rather than inferred.
- **Some suites have no matching `submission/src` workflow by design.** Security (S08/PUB-09), privacy (S09/PUB-11), reliability (S12/PUB-10), finops (S11/PUB-14) and clinical (S06/PUB-15) are cross-cutting or explicitly out-of-scope domains (`submission/artefacts/04-ddd/inject_register_84.md`) — those scenarios probe the relevant `submission/src/services/*` module directly instead of a workflow response.
