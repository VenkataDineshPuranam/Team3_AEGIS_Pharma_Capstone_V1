"use client";

import { useMemo, useState } from "react";
import { assembleBatchResponse, BATCH_SCENARIOS } from "@/lib/workflows/batch_evidence";
import { AuthBanner, GuardrailBadges, ListBlock, RawJson, Section } from "@/components/ResponseCard";

export default function WorkflowAPage() {
  const [scenario, setScenario] = useState<string>("conflicted");
  const response = useMemo(() => assembleBatchResponse(scenario), [scenario]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">Workflow A — GxP Batch Review</h1>
        <p className="text-sm text-zinc-400">
          Identifies evidence completeness/conflicts/gaps. Never releases, rejects,
          reprocesses, relabels or recalls a batch.
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
          {Object.keys(BATCH_SCENARIOS).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
        <span className="text-xs text-zinc-500">batch_id: {response.batch_id}</span>
      </div>

      <AuthBanner authorization={response.authorization} />
      <GuardrailBadges
        executionStatus={response.execution_status}
        reviewRole={response.human_review.role}
      />

      <Section title="Readiness state">
        <p className="text-sm text-zinc-200">{response.readiness_state}</p>
      </Section>

      <Section title="Evidence">
        <ListBlock
          items={response.evidence}
          emptyLabel="No evidence provided."
          render={(item: { source: string; record_id: string }) => (
            <span>
              {item.source} — {item.record_id}
            </span>
          )}
        />
      </Section>

      <Section title="Contradictions">
        <ListBlock
          items={response.contradictions}
          tone="warn"
          emptyLabel="No contradictions surfaced."
          render={(c: { lims_state: string; stats_state: string; notebook_state: string }) => (
            <span>
              lims={c.lims_state} vs stats={c.stats_state} vs notebook={c.notebook_state}
            </span>
          )}
        />
      </Section>

      <Section title="Gaps">
        <ListBlock
          items={response.gaps}
          tone="gap"
          emptyLabel="No gaps."
          render={(g: { gap_type: string }) => <span>{g.gap_type}</span>}
        />
      </Section>

      <RawJson value={response} />
    </div>
  );
}
