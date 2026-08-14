"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import injectsData from "@/data/injects.json";
import workflowMap from "@/data/inject_workflow_map.json";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

interface Inject {
  id: string;
  dimension: string;
  title: string;
  scenario: string;
  evidence: string;
}
interface WorkflowMapRow {
  id: string;
  workflow: string;
}

const injects = injectsData as Inject[];
const workflowById = new Map((workflowMap as WorkflowMapRow[]).map((r) => [r.id, r.workflow]));

const STATIC_PAGES = [
  { href: "/", label: "Home" },
  { href: "/injects", label: "Inject Explorer (all 84 injects)" },
  { href: "/evaluation", label: "Evaluation Dashboard" },
  { href: "/workflow-a", label: "Workflow A — GxP Batch Review" },
  { href: "/workflow-b", label: "Workflow B — Pharmacovigilance" },
  { href: "/workflow-c", label: "Workflow C — Supply / Cold-Chain" },
];

// Simple substring/startsWith scoring — no fuzzy-match dependency needed.
function score(haystack: string, query: string): number {
  const h = haystack.toLowerCase();
  const q = query.toLowerCase();
  if (!q) return 1;
  if (h === q) return 100;
  if (h.startsWith(q)) return 50;
  if (h.includes(q)) return 10;
  return 0;
}

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const matchedInjects = React.useMemo(() => {
    return injects
      .map((inj) => ({
        inj,
        s: Math.max(
          score(inj.id, query),
          score(inj.title, query),
          score(inj.dimension, query),
          score(inj.scenario, query) * 0.5,
        ),
      }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 8)
      .map((r) => r.inj);
  }, [query]);

  const matchedPages = React.useMemo(
    () => STATIC_PAGES.filter((p) => score(p.label, query) > 0 || score(p.href, query) > 0),
    [query],
  );

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search injects, workflows, evaluation…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        {matchedPages.length > 0 && (
          <CommandGroup heading="Pages">
            {matchedPages.map((p) => (
              <CommandItem key={p.href} value={p.href} onSelect={() => go(p.href)}>
                {p.label}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {matchedInjects.length > 0 && (
          <CommandGroup heading="Injects">
            {matchedInjects.map((inj) => {
              const wf = workflowById.get(inj.id);
              return (
                <CommandItem key={inj.id} value={inj.id} onSelect={() => go(`/injects/${inj.id}`)}>
                  <span className="font-mono text-xs text-muted-foreground">{inj.id}</span>
                  <span className="truncate">{inj.title}</span>
                  {wf && <span className="ml-auto shrink-0 text-xs text-muted-foreground">{wf}</span>}
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
