"use client";

import { useMemo, useState } from "react";
import { assemblePvResponse, PV_SCENARIOS } from "@/lib/workflows/pv_intake";
import { AuthBanner, GuardrailBadges, ListBlock, RawJson, Section } from "@/components/ResponseCard";

export default function WorkflowBPage() {
  const [scenario, setScenario] = useState<string>("highSimilarity");
  const response = useMemo(() => assemblePvResponse(scenario), [scenario]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">Workflow B — Pharmacovigilance</h1>
        <p className="text-sm text-zinc-400">
          Supports case intake and signal analysis. Never makes final seriousness,
          causality, expectedness, reportability or signal decisions.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-zinc-400" htmlFor="scenario">
          Scenario
        </label>
        <select
          id="scenario"
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100"
        >
          {Object.keys(PV_SCENARIOS).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
        <span className="text-xs text-zinc-500">case_ids: {response.case_ids.join(", ")}</span>
      </div>

      <AuthBanner authorization={response.authorization} />
      <GuardrailBadges
        executionStatus={response.execution_status}
        reviewRole={response.human_review.role}
      />

      <Section title="Duplicate candidates (never auto-merged)">
        <ListBlock
          items={response.duplicate_candidates}
          emptyLabel="No duplicate candidates surfaced."
          render={(d: { case_a: string; case_b: string; similarity: number; reason: string }) => (
            <span>
              {d.case_a} &lt;-&gt; {d.case_b}: similarity {d.similarity} ({d.reason})
            </span>
          )}
        />
      </Section>

      <Section title="Required reviews">
        <ListBlock
          items={response.required_reviews}
          emptyLabel="None."
          render={(r: string) => <span>{r}</span>}
        />
      </Section>

      <RawJson value={response} />
    </div>
  );
}
