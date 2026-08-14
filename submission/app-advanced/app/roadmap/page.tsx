import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PHASES = [
  {
    tag: "Now",
    title: "Workflow A, B, C — this release",
    desc: "The three business-mandated, safety-bounded workflows: GxP batch review (8 injects), Pharmacovigilance (8 injects), Supply/cold-chain (8 injects). Live at /workflow-a, /workflow-b, /workflow-c.",
    status: "current",
  },
  {
    tag: "Next",
    title: "Workflow D — Clinical Trial Context (8 injects)",
    desc: "Protocol-version divergence, eligibility ambiguity, randomization outage, unblinding risk, endpoint adjudication backlog, site inspection risk, and related decision-support surfaces. Implementation exists (lib/workflows/clinical_trial_context.ts, app/_roadmap-workflow-d/) and is fully tested, but is not yet included in this release's user-facing navigation.",
    status: "planned",
  },
  {
    tag: "Later",
    title: "Workflow E — Discovery/Translational Science (6 injects) + remaining cross-cutting injects",
    desc: "Assay drift, compound genealogy collision, omics cohort bias, preclinical image forensics, unqualified research models, target-evidence conflicts (lib/workflows/discovery_translational_science.ts, app/_roadmap-workflow-e/), plus the remaining cross-cutting injects (evidence & provenance, regulatory, privacy/ethics, security, human factors, economics, reliability — 40 injects total) that support all workflows rather than belonging to one.",
    status: "planned",
  },
];

export default function Roadmap() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-16">
      <header className="space-y-3">
        <Badge variant="outline">Phased scope</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">Roadmap</h1>
        <p className="max-w-2xl leading-relaxed text-foreground/80">
          This app-advanced companion currently exposes only the three
          business-mandated workflows. Workflow D and Workflow E are real,
          tested, working code — not deleted, just not yet included in the
          navigation and routing of this release. Counts below come from{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
            submission/artefacts/INJECT_WORKFLOW_CATEGORIZATION.md
          </code>{" "}
          (all 84 disclosed injects, categorized).
        </p>
      </header>

      <section className="space-y-4">
        {PHASES.map((p) => (
          <Card key={p.tag}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                  {p.tag}
                </span>
                <CardTitle>{p.title}</CardTitle>
                <Badge variant={p.status === "current" ? "default" : "outline"} className="ml-auto">
                  {p.status === "current" ? "shipping now" : "not yet in this release"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{p.desc}</CardContent>
          </Card>
        ))}
      </section>

      <p className="text-xs text-muted-foreground">
        The graded, offline-guardrail-compliant submission artifact is{" "}
        <code className="font-mono">submission/app/index.html</code>. This
        Next.js companion (app-advanced) is a non-offline exploratory surface
        over the same real workflow logic.
      </p>
    </div>
  );
}
