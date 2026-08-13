"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import injectsData from "@/data/injects.json";
import workflowMap from "@/data/inject_workflow_map.json";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

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
const workflowById = new Map(workflowRows.map((r) => [r.id, r]));

export default function InjectsPage() {
  const [query, setQuery] = useState("");
  const [dimension, setDimension] = useState("all");
  const [workflow, setWorkflow] = useState("all");
  const [status, setStatus] = useState("all");

  const dimensions = useMemo(
    () => ["all", ...Array.from(new Set(injects.map((i) => i.dimension))).sort()],
    [],
  );
  const workflows = useMemo(
    () => ["all", ...Array.from(new Set(workflowRows.map((r) => r.workflow))).sort()],
    [],
  );
  const statuses = useMemo(
    () => ["all", ...Array.from(new Set(workflowRows.map((r) => r.status))).sort()],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return injects.filter((inj) => {
      const wf = workflowById.get(inj.id);
      if (dimension !== "all" && inj.dimension !== dimension) return false;
      if (workflow !== "all" && wf?.workflow !== workflow) return false;
      if (status !== "all" && wf?.status !== status) return false;
      if (q) {
        const hay = `${inj.id} ${inj.title} ${inj.scenario} ${inj.evidence}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, dimension, workflow, status]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Inject Explorer</h1>
        <p className="text-sm text-muted-foreground">
          All {injects.length} disclosed injects from{" "}
          <code className="font-mono">data/injects.json</code>, cross-referenced with{" "}
          <code className="font-mono">
            submission/artefacts/INJECT_WORKFLOW_CATEGORIZATION.md
          </code>{" "}
          (parsed mechanically, not hand-typed).
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <Input
          type="text"
          placeholder="Search title / scenario / evidence…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-64"
        />
        <select
          value={dimension}
          onChange={(e) => setDimension(e.target.value)}
          className="h-8 rounded-md border border-border bg-transparent px-2 text-sm"
        >
          {dimensions.map((d) => (
            <option key={d} value={d}>
              {d === "all" ? "All dimensions" : d}
            </option>
          ))}
        </select>
        <select
          value={workflow}
          onChange={(e) => setWorkflow(e.target.value)}
          className="h-8 rounded-md border border-border bg-transparent px-2 text-sm"
        >
          {workflows.map((w) => (
            <option key={w} value={w}>
              {w === "all" ? "All workflows" : w}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-8 rounded-md border border-border bg-transparent px-2 text-sm"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : s}
            </option>
          ))}
        </select>
        <span className="self-center text-xs text-muted-foreground">
          {filtered.length} / {injects.length} shown
        </span>
      </div>

      <div className="space-y-2">
        {filtered.map((inj) => {
          const wf = workflowById.get(inj.id);
          return (
            <Link key={inj.id} href={`/injects/${inj.id}`} className="block">
              <Card className="p-4 transition-colors hover:border-foreground/30">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{inj.id}</Badge>
                  <Badge variant="outline">{inj.dimension}</Badge>
                  {wf && (
                    <>
                      <Badge variant="outline">{wf.workflow}</Badge>
                      <Badge variant="ok">{wf.status}</Badge>
                    </>
                  )}
                  <span className="font-medium">{inj.title}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-foreground/80">{inj.scenario}</p>
              </Card>
            </Link>
          );
        })}
        {!filtered.length && (
          <p className="text-sm text-muted-foreground">No injects match the current filters.</p>
        )}
      </div>
    </div>
  );
}
