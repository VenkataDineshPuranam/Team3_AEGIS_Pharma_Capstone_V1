"use client";

import { useMemo, useState } from "react";
import {
  assembleSupplyResponse,
  assembleSupplyResponseFromScenario,
  SUPPLY_SCENARIOS,
  type InventoryRow,
  type SupplyScenario,
} from "@/lib/workflows/supply_options";
import { AuthBanner, GuardrailBadges, ListBlock, RawJson, Section } from "@/components/ResponseCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const QUALITY_STATUSES = ["released", "quarantine", "in_test", "rejected"];

function CannedTab() {
  const [scenario, setScenario] = useState<string>("withQuarantine");
  const response = useMemo(() => assembleSupplyResponse(scenario), [scenario]);
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
          {Object.keys(SUPPLY_SCENARIOS).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
        <Badge variant="outline">event_id: {response.event_id}</Badge>
      </div>
      <ResponseView response={response} />
    </div>
  );
}

function AdvancedTab() {
  const [scenario, setScenario] = useState<SupplyScenario>(() =>
    structuredClone(SUPPLY_SCENARIOS.withQuarantine),
  );
  const response = useMemo(() => assembleSupplyResponseFromScenario(scenario), [scenario]);

  function updateRow(idx: number, patch: Partial<InventoryRow>) {
    setScenario((p) => ({
      ...p,
      inventory: p.inventory.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
    }));
  }

  function addRow() {
    setScenario((p) => ({
      ...p,
      inventory: [...p.inventory, { product: "NCB-204", market: "New market", quality_status: "released", units: 1000 }],
    }));
  }

  function removeRow(idx: number) {
    setScenario((p) => ({ ...p, inventory: p.inventory.filter((_, i) => i !== idx) }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[26rem_1fr]">
      <Card>
        <CardContent className="space-y-4 pt-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Edit inventory rows — recomputes live
          </div>
          {scenario.inventory.map((row, idx) => (
            <div key={idx} className="space-y-2 rounded-md border border-border p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">row {idx + 1}</span>
                <Button variant="ghost" size="sm" onClick={() => removeRow(idx)}>
                  remove
                </Button>
              </div>
              <Input
                value={row.product}
                onChange={(e) => updateRow(idx, { product: e.target.value })}
                placeholder="product"
              />
              <Input
                value={row.market}
                onChange={(e) => updateRow(idx, { market: e.target.value })}
                placeholder="market"
              />
              <select
                value={row.quality_status}
                onChange={(e) => updateRow(idx, { quality_status: e.target.value })}
                className="h-8 w-full rounded-md border border-border bg-transparent px-2 text-sm"
              >
                {QUALITY_STATUSES.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                value={row.units}
                onChange={(e) => updateRow(idx, { units: Number(e.target.value) })}
                placeholder="units"
              />
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addRow}>
            + add inventory row
          </Button>
        </CardContent>
      </Card>
      <ResponseView response={response} />
    </div>
  );
}

function ResponseView({ response }: { response: ReturnType<typeof assembleSupplyResponse> }) {
  return (
    <div className="space-y-6">
      <AuthBanner authorization={response.authorization} />
      <GuardrailBadges executionStatus={response.execution_status} reviewRole={response.human_review.role} />
      <Badge variant="outline" className="font-mono">
        no_side_effects: {String(response.no_side_effects)}
      </Badge>

      <Section title="Draft options (quarantined stock excluded)">
        <ListBlock
          items={response.options}
          animateNew
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
          animateNew
          emptyLabel="No quality holds."
          render={(h: { product: string; market: string; units: number }) => (
            <span>
              {h.product} / {h.market}: {h.units} units held
            </span>
          )}
        />
      </Section>

      <Section title="Approvals required">
        <ListBlock items={response.approvals_required} render={(a: string) => <span>{a}</span>} />
      </Section>

      <RawJson value={response} />
    </div>
  );
}

export default function WorkflowCPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Workflow C — Supply / Cold-Chain</h1>
        <p className="text-sm text-muted-foreground">
          Produces non-executing recovery options. Never reserves, allocates, changes
          quality status, ships, or initiates a recall.
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
