import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const WORKFLOWS = [
  { href: "/workflow-a", tag: "A", label: "GxP Batch Review", desc: "Evidence completeness/conflicts/gaps. Never releases, rejects, reprocesses, relabels or recalls a batch.", mandatory: true },
  { href: "/workflow-b", tag: "B", label: "Pharmacovigilance", desc: "Case intake and signal support. Never makes final seriousness/causality/expectedness/reportability/signal decisions.", mandatory: true },
  { href: "/workflow-c", tag: "C", label: "Supply / Cold-Chain", desc: "Non-executing recovery options. Never reserves, allocates, changes quality status, ships or initiates a recall.", mandatory: true },
  { href: "/workflow-d", tag: "D", label: "Clinical Trial Context", desc: "Additional scope. Never renders eligibility, treatment_arm or endpoint_conclusion.", mandatory: false },
  { href: "/workflow-e", tag: "E", label: "Discovery / Translational Science", desc: "Additional scope. Never renders assay_disposition, model_approval, image_authenticity, or target_validation_conclusion.", mandatory: false },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl space-y-14 px-6 py-16">
      <header className="space-y-5">
        <Badge variant="outline">Non-offline companion · build required</Badge>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          AEGIS-PHARMA
          <span className="block text-2xl font-normal text-muted-foreground sm:text-3xl">Advanced Companion</span>
        </h1>
        <p className="max-w-2xl leading-relaxed text-foreground/80">
          This is a richer, exploratory companion to the compliant offline static
          demonstrator at{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
            submission/app/index.html
          </code>
          . It requires Node.js/npm to build and run and is <strong>not</strong> the
          graded, offline-guardrail-compliant submission artifact — it exists purely to
          give a nicer exploratory surface over the same real workflow logic, real
          disclosed injects, and real evaluation evidence. The static app remains the
          artifact that is actually graded and that satisfies the capstone&apos;s
          offline-capability requirement.
        </p>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Every response shown here is produced by TypeScript ports of the same
          workflow-assembly functions used by the static app&apos;s JS mirror
          (<code className="font-mono">submission/app/app.js</code>) and by the Python
          reference implementation under{" "}
          <code className="font-mono">submission/src/workflows/</code>. No new decision
          logic is introduced — field names, invariants, and guardrail behavior are
          identical. Press <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">⌘K</kbd> to search.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Mandated + additional-scope workflows
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {WORKFLOWS.map((w) => (
            <Link key={w.href} href={w.href} className="group">
              <Card className="h-full transition-colors group-hover:border-foreground/30">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                      {w.tag}
                    </span>
                    <CardTitle>{w.label}</CardTitle>
                    {w.mandatory && <Badge variant="outline" className="ml-auto">mandatory</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{w.desc}</CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Link href="/injects" className="group">
          <Card className="h-full transition-colors group-hover:border-foreground/30">
            <CardHeader><CardTitle>Inject Explorer</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              All 84 disclosed injects, searchable/filterable by dimension, workflow and status.
            </CardContent>
          </Card>
        </Link>
        <Link href="/evaluation" className="group">
          <Card className="h-full transition-colors group-hover:border-foreground/30">
            <CardHeader><CardTitle>Evaluation Dashboard</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Test results, evaluation scenarios and inject-coverage, charted from real data.
            </CardContent>
          </Card>
        </Link>
        <Link href="/tour" className="group">
          <Card className="h-full transition-colors group-hover:border-foreground/30">
            <CardHeader><CardTitle>Guided Tour</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              A scrollytelling walkthrough of a real crisis inject, real conflicts, and the
              decision-support boundary.
            </CardContent>
          </Card>
        </Link>
      </section>
    </div>
  );
}
