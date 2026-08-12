"use client";

import { useMemo, useState } from "react";
import { assembleClinicalResponse, CLINICAL_SCENARIOS } from "@/lib/workflows/clinical_trial_context";
import { AuthBanner, GuardrailBadges, ListBlock, RawJson, Section } from "@/components/ResponseCard";

export default function WorkflowDPage() {
  const [scenario, setScenario] = useState<string>("eligibilityAndUnblinding");
  const response = useMemo(() => assembleClinicalResponse(scenario), [scenario]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">
          Workflow D — Clinical Trial Context{" "}
          <span className="ml-2 rounded bg-zinc-800 px-2 py-0.5 text-xs align-middle text-zinc-400">
            additional scope
          </span>
        </h1>
        <p className="text-sm text-zinc-400">
          Not one of the three mandated workflows. Never renders eligibility,
          treatment_arm or endpoint_conclusion.
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
          {Object.keys(CLINICAL_SCENARIOS).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
        <span className="text-xs text-zinc-500">
          trial_id: {response.trial_id} · subject_id: {response.subject_id || "(none)"}
        </span>
      </div>

      <AuthBanner authorization={response.authorization} />
      <GuardrailBadges
        executionStatus={response.execution_status}
        reviewRole={response.human_review.role}
      />

      <Section title="Contradictions">
        <ListBlock
          items={response.contradictions}
          tone="warn"
          emptyLabel="No contradictions surfaced."
          render={(c: { type: string }) => (
            <span className="font-mono text-xs">{c.type}: {JSON.stringify(c)}</span>
          )}
        />
      </Section>

      <Section title="Unblinding risk flags (never an arm-assignment statement)">
        <ListBlock
          items={response.unblinding_risk_flags}
          tone="warn"
          emptyLabel="No unblinding risk flags."
          render={(f: { ticket_id: string; system: string; visibility: string; reason: string }) => (
            <span>
              {f.ticket_id} ({f.system}, visibility={f.visibility}): {f.reason}
            </span>
          )}
        />
      </Section>

      <Section title="Protocol-version conflicts (both versions surfaced, neither defaulted)">
        <ListBlock
          items={response.protocol_conflicts}
          tone="gap"
          emptyLabel="No protocol-version conflicts."
          render={(p: { trial_id: string; site_approved_version: string; global_current_version: string }) => (
            <span>
              {p.trial_id}: site_approved={p.site_approved_version} vs global_current=
              {p.global_current_version}
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
