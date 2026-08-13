"use client";

import { useMemo, useState } from "react";
import {
  assembleBatchResponse,
  assembleBatchResponseFromScenario,
  BATCH_SCENARIOS,
  type BatchScenario,
} from "@/lib/workflows/batch_evidence";
import { AuthBanner, GuardrailBadges, ListBlock, RawJson, Section } from "@/components/ResponseCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const LAB_STATE_OPTIONS = ["in_spec", "OOS", "OOT", "invalid", "pending"];

function CannedTab() {
  const [scenario, setScenario] = useState<string>("conflicted");
  const response = useMemo(() => assembleBatchResponse(scenario), [scenario]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-muted-foreground" htmlFor="scenario">
          Scenario
        </label>
        <select
          id="scenario"
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          className="h-8 rounded-md border border-border bg-transparent px-2 text-sm"
        >
          {Object.keys(BATCH_SCENARIOS).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
        <Badge variant="outline">batch_id: {response.batch_id}</Badge>
      </div>
      <ResponseView response={response} />
    </div>
  );
}

function AdvancedTab() {
  const [scenario, setScenario] = useState<BatchScenario>(() =>
    structuredClone(BATCH_SCENARIOS.conflicted),
  );
  const response = useMemo(() => assembleBatchResponseFromScenario(scenario), [scenario]);

  function setLabState(key: "lims_state" | "stats_state" | "notebook_state", value: string) {
    setScenario((prev) => ({
      ...prev,
      lab_states: { ...(prev.lab_states ?? { lims_state: "", stats_state: "", notebook_state: "" }), [key]: value },
    }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
      <Card>
        <CardContent className="space-y-4 pt-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Edit evidence — recomputes live
          </div>
          <label className="block space-y-1 text-sm">
            <span className="text-muted-foreground">batch_id</span>
            <Input
              value={scenario.batch_id}
              onChange={(e) => setScenario((p) => ({ ...p, batch_id: e.target.value }))}
            />
          </label>
          {(["lims_state", "stats_state", "notebook_state"] as const).map((key) => (
            <label key={key} className="block space-y-1 text-sm">
              <span className="text-muted-foreground">lab_states.{key}</span>
              <select
                value={scenario.lab_states?.[key] ?? ""}
                onChange={(e) => setLabState(key, e.target.value)}
                className="h-8 w-full rounded-md border border-border bg-transparent px-2 text-sm"
              >
                {LAB_STATE_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={scenario.evidence.length > 0}
              onChange={(e) =>
                setScenario((p) => ({
                  ...p,
                  evidence: e.target.checked ? [{ source: "data/genealogy.csv", record_id: "GEN-1" }] : [],
                }))
              }
            />
            <span className="text-muted-foreground">at least one evidence record attached</span>
          </label>
        </CardContent>
      </Card>
      <ResponseView response={response} />
    </div>
  );
}

function ResponseView({ response }: { response: ReturnType<typeof assembleBatchResponse> }) {
  return (
    <div className="space-y-6">
      <AuthBanner authorization={response.authorization} />
      <GuardrailBadges executionStatus={response.execution_status} reviewRole={response.human_review.role} />

      <Section title="Readiness state">
        <p className="text-sm">{response.readiness_state}</p>
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
          animateNew
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
          animateNew
          emptyLabel="No gaps."
          render={(g: { gap_type: string }) => <span>{g.gap_type}</span>}
        />
      </Section>

      <RawJson value={response} />
    </div>
  );
}

export default function WorkflowAPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Workflow A — GxP Batch Review</h1>
        <p className="text-sm text-muted-foreground">
          Identifies evidence completeness/conflicts/gaps. Never releases, rejects,
          reprocesses, relabels or recalls a batch.
        </p>
      </header>

      <Tabs defaultValue="canned">
        <TabsList>
          <TabsTrigger value="canned">Real disclosed scenario</TabsTrigger>
          <TabsTrigger value="advanced">Advanced / Edit evidence</TabsTrigger>
        </TabsList>
        <TabsContent value="canned">
          <CannedTab />
        </TabsContent>
        <TabsContent value="advanced">
          <AdvancedTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
