// Maps the free-text `workflow` label in data/inject_workflow_map.json to a
// live workflow route, where one exists. Cross-cutting rows have no single
// live workflow page and resolve to null.
export function workflowHref(label: string): string | null {
  if (label.startsWith("Workflow A")) return "/workflow-a";
  if (label.startsWith("Workflow B")) return "/workflow-b";
  if (label.startsWith("Workflow C")) return "/workflow-c";
  // Workflow D/E are not included in this release and have no live route — see /roadmap.
  return null;
}
