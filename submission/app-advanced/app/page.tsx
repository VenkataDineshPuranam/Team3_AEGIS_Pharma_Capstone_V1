import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const WORKFLOWS = [
  { href: "/workflow-a", tag: "A", label: "GxP Batch Review", desc: "Evidence completeness/conflicts/gaps. Never releases, rejects, reprocesses, relabels or recalls a batch.", mandatory: true },
  { href: "/workflow-b", tag: "B", label: "Pharmacovigilance", desc: "Case intake and signal support. Never makes final seriousness/causality/expectedness/reportability/signal decisions.", mandatory: true },
  { href: "/workflow-c", tag: "C", label: "Supply / Cold-Chain", desc: "Non-executing recovery options. Never reserves, allocates, changes quality status, ships or initiates a recall.", mandatory: true },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl space-y-14 px-6 py-16">
      <header className="space-y-5">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          AEGIS-PHARMA
          <span className="block text-2xl font-normal text-muted-foreground sm:text-3xl">Advanced Companion</span>
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-foreground/90">
          A decision-support surface over three safety-bounded pharma workflows — GxP
          batch review, pharmacovigilance case intake, and supply/cold-chain recovery
          options — built on the same real evidence and evaluation results as the
          graded submission.
        </p>
        <div className="max-w-2xl rounded-lg border border-[var(--warn)]/40 bg-[color-mix(in_srgb,var(--warn)_10%,var(--background))] px-4 py-3 text-sm leading-relaxed text-foreground/90">
          <strong>Decision-support only.</strong> Every workflow response below is
          advisory: it never releases, rejects, reprocesses, relabels or recalls a
          batch; never makes a final seriousness, causality, expectedness,
          reportability or signal decision; and never reserves, allocates, changes
          quality status, ships or initiates a recall. Every response carries an{" "}
          <code className="font-mono">execution_status: &quot;not_executed&quot;</code> flag and
          names the human reviewer role required to act on it.
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          The three mandated workflows
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

      <section className="grid gap-3 sm:grid-cols-2">
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
      </section>
    </div>
  );
}
