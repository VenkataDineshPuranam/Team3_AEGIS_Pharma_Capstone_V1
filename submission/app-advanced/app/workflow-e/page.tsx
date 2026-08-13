"use client";

import { useMemo, useState } from "react";
import {
  assembleDiscoveryResponse,
  assembleDiscoveryResponseFromScenario,
  DISCOVERY_SCENARIOS,
  type DiscoveryScenario,
} from "@/lib/workflows/discovery_translational_science";
import { AuthBanner, GuardrailBadges, ListBlock, RawJson, Section } from "@/components/ResponseCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

function CannedTab() {
  const [scenario, setScenario] = useState<string>("assayAndSubgroup");
  const response = useMemo(() => assembleDiscoveryResponse(scenario), [scenario]);
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
          {Object.keys(DISCOVERY_SCENARIOS).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
        <Badge variant="outline">subject_ref: {response.subject_ref || "(none)"}</Badge>
      </div>
      <ResponseView response={response} />
    </div>
  );
}

function AdvancedTab() {
  const [scenario, setScenario] = useState<DiscoveryScenario>(() =>
    structuredClone(DISCOVERY_SCENARIOS.assayAndSubgroup),
  );
  const response = useMemo(() => assembleDiscoveryResponseFromScenario(scenario), [scenario]);
  const assay = scenario.assay_results[0];
  const perf = scenario.model_performance_slices[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[24rem_1fr]">
      <Card>
        <CardContent className="space-y-4 pt-5">
          {assay && (
            <>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Assay {assay.assay_id} — instrument_info (INV-14)
              </div>
              <label className="block space-y-1 text-sm">
                <span className="text-muted-foreground">firmware</span>
                <Input
                  value={assay.instrument_info.firmware}
                  onChange={(e) =>
                    setScenario((p) => ({
                      ...p,
                      assay_results: p.assay_results.map((a, i) =>
                        i === 0 ? { ...a, instrument_info: { ...a.instrument_info, firmware: e.target.value } } : a,
                      ),
                    }))
                  }
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="text-muted-foreground">qualified_firmware</span>
                <Input
                  value={assay.instrument_info.qualified_firmware}
                  onChange={(e) =>
                    setScenario((p) => ({
                      ...p,
                      assay_results: p.assay_results.map((a, i) =>
                        i === 0
                          ? { ...a, instrument_info: { ...a.instrument_info, qualified_firmware: e.target.value } }
                          : a,
                      ),
                    }))
                  }
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="text-muted-foreground">reagent_lot_info.coa_status</span>
                <select
                  value={assay.reagent_lot_info.coa_status}
                  onChange={(e) =>
                    setScenario((p) => ({
                      ...p,
                      assay_results: p.assay_results.map((a, i) =>
                        i === 0
                          ? { ...a, reagent_lot_info: { ...a.reagent_lot_info, coa_status: e.target.value } }
                          : a,
                      ),
                    }))
                  }
                  className="h-8 w-full rounded-md border border-border bg-transparent px-2 text-sm"
                >
                  {["verified", "transcribed_only", "missing", "expired"].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}

          {perf && (
            <>
              <div className="pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Model {perf.model_id} — subgroup performance (INV-15)
              </div>
              {perf.slices.map((sl, i) => (
                <label key={sl.slice} className="block space-y-1 text-sm">
                  <span className="text-muted-foreground">
                    {sl.slice} — {sl.metric}
                  </span>
                  <Input
                    type="number"
                    step={0.01}
                    value={sl.value}
                    onChange={(e) =>
                      setScenario((p) => ({
                        ...p,
                        model_performance_slices: p.model_performance_slices.map((mp, mi) =>
                          mi === 0
                            ? {
                                ...mp,
                                slices: mp.slices.map((s, si) =>
                                  si === i ? { ...s, value: Number(e.target.value) } : s,
                                ),
                              }
                            : mp,
                        ),
                      }))
                    }
                  />
                </label>
              ))}
            </>
          )}
        </CardContent>
      </Card>
      <ResponseView response={response} />
    </div>
  );
}

function ResponseView({ response }: { response: ReturnType<typeof assembleDiscoveryResponse> }) {
  return (
    <div className="space-y-6">
      <AuthBanner authorization={response.authorization} />
      <GuardrailBadges executionStatus={response.execution_status} reviewRole={response.human_review.role} />

      <Section title="Contradictions (never accepted/rejected/certified/resolved)">
        <ListBlock
          items={response.contradictions}
          tone="warn"
          animateNew
          emptyLabel="No contradictions surfaced."
          render={(c: { type: string }) => (
            <span className="font-mono text-xs">
              {c.type}: {JSON.stringify(c)}
            </span>
          )}
        />
      </Section>

      <Section title="Assay quality flags">
        <ListBlock
          items={response.assay_quality_flags}
          tone="warn"
          animateNew
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
          animateNew
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
        <ListBlock items={response.required_reviews} emptyLabel="None." render={(r: string) => <span>{r}</span>} />
      </Section>

      <RawJson value={response} />
    </div>
  );
}

export default function WorkflowEPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-10">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Workflow E — Discovery / Translational Science</h1>
          <Badge variant="outline">additional scope</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Not one of the three mandated workflows. Never renders assay_disposition,
          model_approval, image_authenticity, model_status_change or
          target_validation_conclusion.
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
