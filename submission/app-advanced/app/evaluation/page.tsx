import evalDataRaw from "@/data/eval_data.json";

interface EvalData {
  tests: {
    run_at: string;
    total_tests: number;
    passed: number;
    failed: number;
    errors: number;
    modules: { name: string; count: number; note: string }[];
  };
  evaluation: {
    run_at: string;
    total_scenarios: number;
    regression_scenarios: number;
    regression_passed: number;
    regression_failed: number;
    release_gates_blocked: number;
    baseline_scenarios: number;
    baseline_defects_confirmed: number;
    suites_covered: string[];
  };
  injectCoverage: {
    total: number;
    addressed: number;
    in_scope_open: number;
    out_of_scope: number;
    byWorkflow: { label: string; count: number }[];
  };
}

const evalData = evalDataRaw as EvalData;

function StatTile({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 text-center">
      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-xs text-zinc-500">{label}</div>
    </div>
  );
}

function Bar({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max ? Math.round((count / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-zinc-400">
        <span>{label}</span>
        <span>{count}</span>
      </div>
      <div className="h-2 w-full rounded bg-zinc-800">
        <div className="h-2 rounded bg-sky-600" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function EvaluationPage() {
  const maxCount = Math.max(...evalData.injectCoverage.byWorkflow.map((r) => r.count));

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">Evaluation Dashboard</h1>
        <p className="text-sm text-zinc-400">
          Static snapshot only — mirrors <code className="font-mono">submission/app/eval_data.js</code>.
          This page never re-runs tests or the evaluation harness.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Tests — snapshot run_at {evalData.tests.run_at}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile value={evalData.tests.total_tests} label="total tests" />
          <StatTile value={`${evalData.tests.passed}/${evalData.tests.total_tests}`} label="pass rate" />
          <StatTile value={evalData.tests.failed} label="failed" />
          <StatTile value={evalData.tests.errors} label="errors" />
        </div>
        <ul className="space-y-1 text-sm text-zinc-300">
          {evalData.tests.modules.map((m) => (
            <li key={m.name} className="rounded border border-zinc-800 bg-zinc-900/40 px-3 py-1.5">
              <span className="font-mono text-zinc-200">{m.name}</span>: {m.count} — {m.note}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Evaluation — snapshot run_at {evalData.evaluation.run_at}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile value={evalData.evaluation.total_scenarios} label="total eval scenarios" />
          <StatTile
            value={`${evalData.evaluation.regression_passed}/${evalData.evaluation.regression_scenarios}`}
            label="regression pass rate"
          />
          <StatTile value={evalData.evaluation.release_gates_blocked} label="release gates blocked" />
          <StatTile value={evalData.evaluation.suites_covered.length} label="suites covered" />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Inject coverage
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <StatTile
            value={`${evalData.injectCoverage.addressed}/${evalData.injectCoverage.total}`}
            label="addressed"
          />
          <StatTile value={evalData.injectCoverage.in_scope_open} label="open" />
          <StatTile value={evalData.injectCoverage.out_of_scope} label="out of scope" />
        </div>
        <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
          {evalData.injectCoverage.byWorkflow.map((row) => (
            <Bar key={row.label} label={row.label} count={row.count} max={maxCount} />
          ))}
        </div>
      </section>

      <p className="text-xs text-zinc-600">
        Regenerate <code className="font-mono">submission/app-advanced/data/eval_data.json</code> after
        any change to the underlying evidence files, same discipline as the static app&apos;s{" "}
        <code className="font-mono">eval_data.js</code>.
      </p>
    </div>
  );
}
