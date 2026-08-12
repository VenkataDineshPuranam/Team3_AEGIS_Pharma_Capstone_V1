"use client";

import { useMemo, useState } from "react";
import injectsData from "@/data/injects.json";
import workflowMap from "@/data/inject_workflow_map.json";

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
        <h1 className="text-2xl font-semibold text-white">Inject Explorer</h1>
        <p className="text-sm text-zinc-400">
          All {injects.length} disclosed injects from{" "}
          <code className="font-mono">data/injects.json</code>, cross-referenced with{" "}
          <code className="font-mono">
            submission/artefacts/INJECT_WORKFLOW_CATEGORIZATION.md
          </code>{" "}
          (parsed mechanically, not hand-typed).
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search title / scenario / evidence…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-64 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100"
        />
        <select
          value={dimension}
          onChange={(e) => setDimension(e.target.value)}
          className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100"
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
          className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100"
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
          className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : s}
            </option>
          ))}
        </select>
        <span className="self-center text-xs text-zinc-500">
          {filtered.length} / {injects.length} shown
        </span>
      </div>

      <div className="space-y-2">
        {filtered.map((inj) => {
          const wf = workflowById.get(inj.id);
          return (
            <div
              key={inj.id}
              className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-300">
                  {inj.id}
                </span>
                <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-300">
                  {inj.dimension}
                </span>
                {wf && (
                  <>
                    <span className="rounded bg-sky-900/40 border border-sky-700/40 px-2 py-0.5 text-xs text-sky-200">
                      {wf.workflow}
                    </span>
                    <span className="rounded bg-emerald-900/40 border border-emerald-700/40 px-2 py-0.5 text-xs text-emerald-200">
                      {wf.status}
                    </span>
                  </>
                )}
                <span className="font-medium text-white">{inj.title}</span>
              </div>
              <p className="mt-2 text-sm text-zinc-300">{inj.scenario}</p>
              <p className="mt-1 text-xs text-zinc-500">Evidence: {inj.evidence}</p>
              {wf && <p className="mt-1 text-xs text-zinc-500">Where addressed: {wf.where}</p>}
            </div>
          );
        })}
        {!filtered.length && (
          <p className="text-sm text-zinc-500">No injects match the current filters.</p>
        )}
      </div>
    </div>
  );
}
