"use client";

import { useMemo } from "react";
import injectsData from "@/data/injects.json";
import { Reveal } from "@/components/Reveal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AuthBanner, GuardrailBadges, ListBlock, Section } from "@/components/ResponseCard";
import { assembleBatchResponse } from "@/lib/workflows/batch_evidence";
import { assemblePvResponse } from "@/lib/workflows/pv_intake";

interface Inject {
  id: string;
  dimension: string;
  title: string;
  scenario: string;
  evidence: string;
}

const injects = injectsData as Inject[];
const byId = new Map(injects.map((i) => [i.id, i]));

function InjectQuote({ id }: { id: string }) {
  const inj = byId.get(id);
  if (!inj) return null;
  return (
    <Card className="border-l-4 border-l-[var(--warn)]">
      <CardContent className="space-y-2 pt-5">
        <div className="flex items-center gap-2">
          <Badge>{inj.id}</Badge>
          <Badge variant="outline">{inj.dimension}</Badge>
          <span className="text-sm font-medium">{inj.title}</span>
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">&ldquo;{inj.scenario}&rdquo;</p>
        <p className="text-xs text-muted-foreground">Evidence: {inj.evidence} — disclosed, verbatim.</p>
      </CardContent>
    </Card>
  );
}

function BoundaryLine({ role }: { role: string }) {
  return (
    <p className="mx-auto max-w-lg text-center text-sm font-medium text-[var(--warn)]">
      This system never decides. It surfaces the conflict and stops — the {role} reviews and decides.
    </p>
  );
}

export default function TourPage() {
  const batch = useMemo(() => assembleBatchResponse("conflicted"), []);
  const pv = useMemo(() => assemblePvResponse("highSimilarity"), []);

  return (
    <div className="mx-auto max-w-2xl space-y-28 px-6 py-16">
      <Reveal>
        <header className="space-y-4 text-center">
          <Badge variant="outline">Guided narrative — real disclosed data only</Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            A crisis converges on NovaCura Therapeutics
          </h1>
          <p className="text-muted-foreground">
            Scroll to walk through the pressure, the conflicting evidence, and how each mandated
            workflow responds — without ever crossing into a prohibited terminal action.
          </p>
        </header>
      </Reveal>

      <section className="space-y-6">
        <Reveal>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            1 · Board pressure
          </h2>
        </Reveal>
        <Reveal delay={0.05}>
          <InjectQuote id="INJ-001" />
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-sm leading-relaxed text-foreground/80">
            A 14% lead-time cut, demanded without touching registered specifications or Quality
            independence, is the pressure that makes every shortcut downstream tempting — and why
            each workflow below is built to abstain and surface conflicts rather than quietly
            resolve them under time pressure.
          </p>
        </Reveal>
      </section>

      <section className="space-y-6">
        <Reveal>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            2 · Evidence conflicts appear
          </h2>
        </Reveal>
        <Reveal delay={0.05}>
          <InjectQuote id="INJ-023" />
        </Reveal>
        <Reveal delay={0.1}>
          <InjectQuote id="INJ-037" />
        </Reveal>
      </section>

      <section className="space-y-6">
        <Reveal>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            3 · Workflow A responds — live
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Rendered by the same <code className="font-mono">assembleBatchResponse</code> used on the
            Workflow A page, for the real INJ-023 lab-state disagreement.
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="space-y-4">
            <AuthBanner authorization={batch.authorization} />
            <GuardrailBadges executionStatus={batch.execution_status} reviewRole={batch.human_review.role} />
            <Section title="Contradictions">
              <ListBlock
                items={batch.contradictions}
                tone="warn"
                render={(c: { lims_state: string; stats_state: string; notebook_state: string }) => (
                  <span>
                    lims={c.lims_state} vs stats={c.stats_state} vs notebook={c.notebook_state}
                  </span>
                )}
              />
            </Section>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <BoundaryLine role="EU Qualified Person" />
        </Reveal>
      </section>

      <section className="space-y-6">
        <Reveal>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            4 · Workflow B responds — live
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The INJ-037 duplicate cluster, surfaced as a candidate pair — never auto-merged, never
            a seriousness/causality/reportability decision.
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="space-y-4">
            <AuthBanner authorization={pv.authorization} />
            <GuardrailBadges executionStatus={pv.execution_status} reviewRole={pv.human_review.role} />
            <Section title="Duplicate candidates">
              <ListBlock
                items={pv.duplicate_candidates}
                render={(d: { case_a: string; case_b: string; similarity: number; reason: string }) => (
                  <span>
                    {d.case_a} &lt;-&gt; {d.case_b}: similarity {d.similarity} ({d.reason})
                  </span>
                )}
              />
            </Section>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <BoundaryLine role="Safety Physician" />
        </Reveal>
      </section>

      <Reveal>
        <footer className="space-y-3 rounded-xl border-2 border-[var(--warn)]/50 bg-[color-mix(in_srgb,var(--warn)_10%,transparent)] p-6 text-center">
          <h2 className="text-lg font-semibold">Human review required — always</h2>
          <p className="text-sm text-foreground/80">
            Every response on this tour, and every response in this application, carries{" "}
            <code className="font-mono">execution_status: &quot;not_executed&quot;</code> and a named
            human-reviewer role. No workflow here releases a batch, decides PV seriousness/causality,
            allocates supply, determines eligibility, or certifies a discovery result. Explore the
            live workflows and full inject set from the navigation bar or{" "}
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">⌘K</kbd>.
          </p>
        </footer>
      </Reveal>
    </div>
  );
}
