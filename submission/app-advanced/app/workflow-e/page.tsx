"use client";

import { useMemo, useState } from "react";
import {
  assembleDiscoveryResponse,
  DISCOVERY_SCENARIOS,
} from "@/lib/workflows/discovery_translational_science";
import { AuthBanner, GuardrailBadges, ListBlock, RawJson, Section } from "@/components/ResponseCard";

export default function WorkflowEPage() {
  const [scenario, setScenario] = useState<string>("assayAndSubgroup");
  const response = useMemo(() => assembleDiscoveryResponse(scenario), [scenario]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">
          Workflow E — Discovery / Translational Science{" "}
          <span className="ml-2 rounded bg-zinc-800 px-2 py-0.5 text-xs align-middle text-zinc-400">
            additional scope
          </span>
        </h1>
        <p className="text-sm text-zinc-400">
          Not one of the three mandated workflows. Never renders assay_disposition,
          model_approval, image_authenticity, model_status_change or
          target_validation_conclusion.
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
          {Object.keys(DISCOVERY_SCENARIOS).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
        <span className="text-xs text-zinc-500">subject_ref: {response.subject_ref || "(none)"}</span>
      </div>

      <AuthBanner authorization={response.authorization} />
      <GuardrailBadges
        executionStatus={response.execution_status}
        reviewRole={response.human_review.role}
      />

      <Section title="Contradictions (never accepted/rejected/certified/resolved)">
        <ListBlock
          items={response.contradictions}
          tone="warn"
          emptyLabel="No contradictions surfaced."
          render={(c: { type: string }) => (
            <span className="font-mono text-xs">{c.type}: {JSON.stringify(c)}</span>
          )}
        />
      </Section>

      <Section title="Assay quality flags">
        <ListBlock
          items={response.assay_quality_flags}
          tone="warn"
          emptyLabel="No assay quality flags."
          render={(f: { assay_id: string; instrument: string; reagent_lot: string; reasons: string[] }) => (
            <span>
              {f.assay_id} (instrument={f.instrument}, lot={f.reagent_lot}): {f.reasons.join(", ")}
            </span>
          )}
        />
      </Section>

      <Section title="Gaps (never promoted to decision-grade)">
        <ListBlock
          items={response.gaps}
          tone="gap"
          emptyLabel="No gaps."
          render={(g: { gap_type: string; model_id?: string; status?: string }) => (
            <span>
              {g.gap_type}
              {g.model_id ? `: ${g.model_id} (${g.status})` : ""}
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
