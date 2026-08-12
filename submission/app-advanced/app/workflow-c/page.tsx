"use client";

import { useMemo, useState } from "react";
import { assembleSupplyResponse, SUPPLY_SCENARIOS } from "@/lib/workflows/supply_options";
import { AuthBanner, GuardrailBadges, ListBlock, RawJson, Section } from "@/components/ResponseCard";

export default function WorkflowCPage() {
  const [scenario, setScenario] = useState<string>("withQuarantine");
  const response = useMemo(() => assembleSupplyResponse(scenario), [scenario]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">Workflow C — Supply / Cold-Chain</h1>
        <p className="text-sm text-zinc-400">
          Produces non-executing recovery options. Never reserves, allocates, changes
          quality status, ships, or initiates a recall.
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
          {Object.keys(SUPPLY_SCENARIOS).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
        <span className="text-xs text-zinc-500">event_id: {response.event_id}</span>
      </div>

      <AuthBanner authorization={response.authorization} />
      <GuardrailBadges
        executionStatus={response.execution_status}
        reviewRole={response.human_review.role}
      />
      <span className="inline-block rounded bg-zinc-800 px-2 py-1 text-xs font-mono text-zinc-300">
        no_side_effects: {String(response.no_side_effects)}
      </span>

      <Section title="Draft options (quarantined stock excluded)">
        <ListBlock
          items={response.options}
          emptyLabel="No draft options — no released inventory available."
          render={(o: { option_id: string; units: number; status: string }) => (
            <span>
              {o.option_id} — {o.units} units, status={o.status}
            </span>
          )}
        />
      </Section>

      <Section title="Quality holds (visible, not hidden)">
        <ListBlock
          items={response.quality_holds}
          tone="warn"
          emptyLabel="No quality holds."
          render={(h: { product: string; market: string; units: number }) => (
            <span>
              {h.product} / {h.market}: {h.units} units held
            </span>
          )}
        />
      </Section>

      <Section title="Approvals required">
        <ListBlock
          items={response.approvals_required}
          render={(a: string) => <span>{a}</span>}
        />
      </Section>

      <RawJson value={response} />
    </div>
  );
}
