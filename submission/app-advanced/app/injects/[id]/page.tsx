import Link from "next/link";
import { notFound } from "next/navigation";
import injectsData from "@/data/injects.json";
import workflowMap from "@/data/inject_workflow_map.json";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { workflowHref } from "@/lib/workflow-links";
import { displayStatus, NOT_IN_THIS_RELEASE_STATUS } from "@/lib/release-scope";

interface Inject {
  id: string;
  dimension: string;
  title: string;
  scenario: string;
  evidence: string;
}
interface WorkflowMapRow {
  id: string;
  dimension: string;
  workflow: string;
  title: string;
  status: string;
  where: string;
}

const injects = injectsData as Inject[];
const workflowRows = workflowMap as WorkflowMapRow[];

export function generateStaticParams() {
  return injects.map((i) => ({ id: i.id }));
}

export default async function InjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inject = injects.find((i) => i.id === id);
  if (!inject) notFound();
  const wf = workflowRows.find((r) => r.id === id);
  const href = wf ? workflowHref(wf.workflow) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <Link href="/injects" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to Inject Explorer
      </Link>

      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{inject.id}</Badge>
          <Badge variant="outline">{inject.dimension}</Badge>
          {wf && (() => {
            const s = displayStatus(wf.id, wf.status);
            return <Badge variant={s === NOT_IN_THIS_RELEASE_STATUS ? "outline" : "ok"}>{s}</Badge>;
          })()}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{inject.title}</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Scenario (disclosed, verbatim)</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-foreground/90">{inject.scenario}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evidence</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{inject.evidence}</CardContent>
      </Card>

      {wf && (
        <Card>
          <CardHeader>
            <CardTitle>Workflow mapping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="text-muted-foreground">
              <span className="font-medium text-foreground">{wf.workflow}</span>
              {" — "}
              {displayStatus(wf.id, wf.status) === NOT_IN_THIS_RELEASE_STATUS
                ? "addressed in the wider repository, not demonstrated by this app"
                : "addressed at"}{" "}
              <code className="font-mono text-xs">{wf.where}</code>
            </div>
            {href && (
              <Button asChild size="sm">
                <Link href={href}>Open live workflow scenario →</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
