"use client";

import evalDataRaw from "@/data/eval_data.json";
import injectsData from "@/data/injects.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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
    not_in_this_release?: number;
    note?: string;
    byWorkflow: { label: string; count: number }[];
  };
}

interface Inject {
  id: string;
  dimension: string;
}

const evalData = evalDataRaw as EvalData;
const injects = injectsData as Inject[];

// Module-level: injects.json is a static import, so this never needs to
// recompute per-render — no useMemo required.
const DIMENSION_COUNTS = (() => {
  const counts = new Map<string, number>();
  for (const inj of injects) counts.set(inj.dimension, (counts.get(inj.dimension) ?? 0) + 1);
  return Array.from(counts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([dimension, count]) => ({ dimension, count }));
})();

const SERIES = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
  "var(--series-6)",
];

function StatTile({ value, label }: { value: string | number; label: string }) {
  return (
    <Card className="p-4 text-center">
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </Card>
  );
}

function chartTooltipStyle() {
  return {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    fontSize: 12,
    color: "var(--card-foreground)",
  };
}

export default function EvaluationPage() {
  const byWorkflowData = evalData.injectCoverage.byWorkflow.map((r, i) => ({
    name: r.label,
    count: r.count,
    fill: SERIES[i % SERIES.length],
  }));

  const dimensionCounts = DIMENSION_COUNTS;

  const passRatePct = Math.round((evalData.tests.passed / evalData.tests.total_tests) * 1000) / 10;
  const passRateData = [{ name: "pass rate", value: passRatePct, fill: "var(--ok)" }];

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Evaluation Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Static snapshot only — every number below traces to{" "}
          <code className="font-mono">submission/app-advanced/data/eval_data.json</code> (mirrored from{" "}
          <code className="font-mono">submission/evidence/test_results.json</code> and{" "}
          <code className="font-mono">submission/evidence/evaluation_results.json</code>) or is computed
          live from <code className="font-mono">data/injects.json</code>. This page never re-runs tests or
          the evaluation harness.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Tests — snapshot run_at {evalData.tests.run_at}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile value={evalData.tests.total_tests} label="total tests" />
          <StatTile value={`${evalData.tests.passed}/${evalData.tests.total_tests}`} label="pass rate" />
          <StatTile value={evalData.tests.failed} label="failed" />
          <StatTile value={evalData.tests.errors} label="errors" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Test pass rate</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <div className="relative h-48 w-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="72%"
                    outerRadius="100%"
                    data={passRateData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar dataKey="value" background={{ fill: "var(--muted)" }} cornerRadius={8} max={100} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-semibold tabular-nums text-[var(--ok)]">{passRatePct}%</span>
                  <span className="text-xs text-muted-foreground">
                    {evalData.tests.passed}/{evalData.tests.total_tests} passed
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test modules</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {evalData.tests.modules.map((m) => (
                  <li key={m.name} className="rounded-md border border-border bg-muted/40 px-3 py-2">
                    <span className="font-mono text-foreground">{m.name}</span>
                    <span className="ml-2 text-muted-foreground">{m.count} — {m.note}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
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
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Inject coverage by workflow
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            value={`${Math.round((evalData.injectCoverage.addressed / evalData.injectCoverage.total) * 1000) / 10}%`}
            label={`addressed (${evalData.injectCoverage.addressed}/${evalData.injectCoverage.total})`}
          />
          <StatTile value={evalData.injectCoverage.in_scope_open} label="open" />
          <StatTile value={evalData.injectCoverage.out_of_scope} label="out of scope" />
          <StatTile value={evalData.injectCoverage.not_in_this_release ?? 0} label="not in this release" />
        </div>
        {evalData.injectCoverage.note && (
          <p className="text-xs text-muted-foreground">{evalData.injectCoverage.note}</p>
        )}
        <Card>
          <CardContent className="pt-5">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byWorkflowData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={220}
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                />
                <Tooltip contentStyle={chartTooltipStyle()} cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {byWorkflowData.map((d, i) => (
                    <Cell key={d.name} fill={SERIES[i % SERIES.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Injects per dimension (D01–D13)
        </h2>
        <Card>
          <CardContent className="pt-5">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dimensionCounts} margin={{ top: 8, right: 8, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="dimension" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={chartTooltipStyle()} cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="count" fill="var(--series-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground">
          Computed live from <code className="font-mono">data/injects.json</code> ({injects.length} injects) — not
          a hardcoded figure.
        </p>
      </section>

      <p className="text-xs text-muted-foreground">
        Regenerate <code className="font-mono">submission/app-advanced/data/eval_data.json</code> after
        any change to the underlying evidence files, same discipline as the static app&apos;s{" "}
        <code className="font-mono">eval_data.js</code>.
      </p>
    </div>
  );
}
