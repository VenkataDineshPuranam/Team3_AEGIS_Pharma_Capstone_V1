// The 14 injects only ever demonstrated by workflows not included in this
// app (source of truth: submission/artefacts/INJECT_WORKFLOW_CATEGORIZATION.md,
// rows where the workflow column names a workflow beyond the three shipped
// here). This app's own inject_workflow_map.json collapses their workflow
// label to the same bare "Cross-cutting" as every other cross-cutting row,
// so this list is what lets the UI still tell them apart honestly.
export const NOT_IN_THIS_RELEASE_IDS = new Set([
  "INJ-007", "INJ-008", "INJ-009", "INJ-010", "INJ-011", "INJ-012",
  "INJ-013", "INJ-014", "INJ-015", "INJ-016", "INJ-017", "INJ-018", "INJ-019", "INJ-020",
]);

export const NOT_IN_THIS_RELEASE_STATUS = "not in this release";

export function displayStatus(id: string, realStatus: string): string {
  return NOT_IN_THIS_RELEASE_IDS.has(id) ? NOT_IN_THIS_RELEASE_STATUS : realStatus;
}
