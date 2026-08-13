"use client";

import { useMemo, useState } from "react";
import {
  assemblePvResponse,
  assemblePvResponseFromScenario,
  PV_SCENARIOS,
  type PvScenario,
} from "@/lib/workflows/pv_intake";
import { AuthBanner, GuardrailBadges, ListBlock, RawJson, Section } from "@/components/ResponseCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

function CannedTab() {
  const [scenario, setScenario] = useState<string>("highSimilarity");
  const response = useMemo(() => assemblePvResponse(scenario), [scenario]);
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
          {Object.keys(PV_SCENARIOS).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
        <Badge variant="outline">case_ids: {response.case_ids.join(", ")}</Badge>
      </div>
      <ResponseView response={response} />
    </div>
  );
}

function AdvancedTab() {
  const [scenario, setScenario] = useState<PvScenario>(() => structuredClone(PV_SCENARIOS.highSimilarity));
  const response = useMemo(() => assemblePvResponseFromScenario(scenario), [scenario]);

  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
      <Card>
        <CardContent className="space-y-4 pt-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Edit duplicate-candidate pair — recomputes live
          </div>
          <label className="block space-y-1 text-sm">
            <span className="text-muted-foreground">case_a</span>
            <Input
              value={scenario.pair.case_a}
              onChange={(e) =>
                setScenario((p) => ({
                  ...p,
                  case_ids: [e.target.value, p.case_ids[1]],
                  pair: { ...p.pair, case_a: e.target.value },
                }))
              }
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-muted-foreground">case_b</span>
            <Input
              value={scenario.pair.case_b}
              onChange={(e) =>
                setScenario((p) => ({
                  ...p,
                  case_ids: [p.case_ids[0], e.target.value],
                  pair: { ...p.pair, case_b: e.target.value },
                }))
              }
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-muted-foreground">similarity (0–1, surfaced ≥ 0.5)</span>
            <Input
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={scenario.pair.similarity}
              onChange={(e) =>
                setScenario((p) => ({ ...p, pair: { ...p.pair, similarity: Number(e.target.value) } }))
              }
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-muted-foreground">reason</span>
            <Input
              value={scenario.pair.reason}
              onChange={(e) => setScenario((p) => ({ ...p, pair: { ...p.pair, reason: e.target.value } }))}
            />
          </label>
        </CardContent>
      </Card>
      <ResponseView response={response} />
    </div>
  );
}

function ResponseView({ response }: { response: ReturnType<typeof assemblePvResponse> }) {
  return (
    <div className="space-y-6">
      <AuthBanner authorization={response.authorization} />
      <GuardrailBadges executionStatus={response.execution_status} reviewRole={response.human_review.role} />

      <Section title="Duplicate candidates (never auto-merged)">
        <ListBlock
          items={response.duplicate_candidates}
          animateNew
          emptyLabel="No duplicate candidates surfaced."
          render={(d: { case_a: string; case_b: string; similarity: number; reason: string }) => (
            <span>
              {d.case_a} &lt;-&gt; {d.case_b}: similarity {d.similarity} ({d.reason})
            </span>
          )}
        />
      </Section>

      <Section title="Required reviews">
        <ListBlock items={response.required_reviews} emptyLabel="None." render={(r: string) => <span>{r}</span>} />
      </Section>

      <RawJson value={response} />
    </div>
  );
}

export default function WorkflowBPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Workflow B — Pharmacovigilance</h1>
        <p className="text-sm text-muted-foreground">
          Supports case intake and signal analysis. Never makes final seriousness,
          causality, expectedness, reportability or signal decisions.
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
