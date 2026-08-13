"use client";

import { useMemo, useState } from "react";
import {
  assembleClinicalResponse,
  assembleClinicalResponseFromScenario,
  CLINICAL_SCENARIOS,
  type ClinicalScenario,
} from "@/lib/workflows/clinical_trial_context";
import { AuthBanner, GuardrailBadges, ListBlock, RawJson, Section } from "@/components/ResponseCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

function CannedTab() {
  const [scenario, setScenario] = useState<string>("eligibilityAndUnblinding");
  const response = useMemo(() => assembleClinicalResponse(scenario), [scenario]);
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
          {Object.keys(CLINICAL_SCENARIOS).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
        <Badge variant="outline">
          trial_id: {response.trial_id} · subject_id: {response.subject_id || "(none)"}
        </Badge>
      </div>
      <ResponseView response={response} />
    </div>
  );
}

function AdvancedTab() {
  const [scenario, setScenario] = useState<ClinicalScenario>(() =>
    structuredClone(CLINICAL_SCENARIOS.eligibilityAndUnblinding),
  );
  const response = useMemo(() => assembleClinicalResponseFromScenario(scenario), [scenario]);
  const elig = scenario.eligibility_evidence;

  return (
    <div className="grid gap-6 lg:grid-cols-[24rem_1fr]">
      <Card>
        <CardContent className="space-y-4 pt-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Eligibility evidence (INV-11) — recomputes live
          </div>
          {elig && (
            <>
              <label className="block space-y-1 text-sm">
                <span className="text-muted-foreground">value ({elig.test})</span>
                <Input
                  type="number"
                  value={elig.value}
                  onChange={(e) =>
                    setScenario((p) => ({
                      ...p,
                      eligibility_evidence: { ...p.eligibility_evidence!, value: Number(e.target.value) },
                    }))
                  }
                />
              </label>
              {(["central_uln", "local_uln", "edc_rule_uln"] as const).map((key) => (
                <label key={key} className="block space-y-1 text-sm">
                  <span className="text-muted-foreground">eligibility_evidence.{key}</span>
                  <Input
                    type="number"
                    value={elig[key]}
                    onChange={(e) =>
                      setScenario((p) => ({
                        ...p,
                        eligibility_evidence: { ...p.eligibility_evidence!, [key]: Number(e.target.value) },
                      }))
                    }
                  />
                </label>
              ))}
            </>
          )}

          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-2">
            Support ticket text (INV-12)
          </div>
          {scenario.support_tickets.map((t, idx) => (
            <label key={t.ticket_id} className="block space-y-1 text-sm">
              <span className="text-muted-foreground">{t.ticket_id} text</span>
              <Input
                value={t.text}
                onChange={(e) =>
                  setScenario((p) => ({
                    ...p,
                    support_tickets: p.support_tickets.map((tk, i) =>
                      i === idx ? { ...tk, text: e.target.value } : tk,
                    ),
                  }))
                }
              />
            </label>
          ))}

          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pt-2">
            Protocol version context (POL-07)
          </div>
          {scenario.protocol_context ? (
            <>
              <label className="block space-y-1 text-sm">
                <span className="text-muted-foreground">site_approved_version</span>
                <Input
                  value={scenario.protocol_context.site_approved_version}
                  onChange={(e) =>
                    setScenario((p) => ({
                      ...p,
                      protocol_context: { ...p.protocol_context!, site_approved_version: e.target.value },
                    }))
                  }
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="text-muted-foreground">global_current_version</span>
                <Input
                  value={scenario.protocol_context.global_current_version}
                  onChange={(e) =>
                    setScenario((p) => ({
                      ...p,
                      protocol_context: { ...p.protocol_context!, global_current_version: e.target.value },
                    }))
                  }
                />
              </label>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">No protocol_context in this base scenario.</p>
          )}
        </CardContent>
      </Card>
      <ResponseView response={response} />
    </div>
  );
}

function ResponseView({ response }: { response: ReturnType<typeof assembleClinicalResponse> }) {
  return (
    <div className="space-y-6">
      <AuthBanner authorization={response.authorization} />
      <GuardrailBadges executionStatus={response.execution_status} reviewRole={response.human_review.role} />

      <Section title="Contradictions">
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

      <Section title="Unblinding risk flags (never an arm-assignment statement)">
        <ListBlock
          items={response.unblinding_risk_flags}
          tone="warn"
          animateNew
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
          animateNew
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
          animateNew
          emptyLabel="No gaps."
          render={(g: { gap_type: string }) => <span>{g.gap_type}</span>}
        />
      </Section>

      <Section title="Required reviews">
        <ListBlock items={response.required_reviews} emptyLabel="None." render={(r: string) => <span>{r}</span>} />
      </Section>

      <RawJson value={response} />
    </div>
  );
}

export default function WorkflowDPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-10">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Workflow D — Clinical Trial Context</h1>
          <Badge variant="outline">additional scope</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Not one of the three mandated workflows. Never renders eligibility,
          treatment_arm or endpoint_conclusion.
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
