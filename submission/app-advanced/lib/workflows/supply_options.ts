// Workflow C: Supply Options (INV-06, INV-07, POL-05). Ported from
// submission/app/app.js assembleSupplyResponse / SUPPLY_SCENARIOS.
// Never reserves, allocates, changes quality status, ships, or initiates a recall.
import { Authorization, checkAuthorization } from "./common";

export interface InventoryRow {
  product: string;
  market: string;
  quality_status: string;
  units: number;
}

export interface SupplyScenario {
  event_id: string;
  inventory: InventoryRow[];
}

export const SUPPLY_SCENARIOS: Record<string, SupplyScenario> = {
  withQuarantine: {
    event_id: "EVT-DEMO-1",
    inventory: [
      { product: "NCB-204", market: "Global", quality_status: "quarantine", units: 5100 },
      { product: "NCB-204", market: "EU", quality_status: "released", units: 4300 },
    ],
  },
  releasedOnly: {
    event_id: "EVT-DEMO-2",
    inventory: [{ product: "NCB-204", market: "US", quality_status: "released", units: 2700 }],
  },
};

export interface DraftOption extends InventoryRow {
  option_id: string;
  status: "draft";
}

export interface SupplyResponse {
  workflow: "supply_options";
  event_id: string;
  authorization: Authorization;
  options: DraftOption[];
  quality_holds: InventoryRow[];
  approvals_required: string[];
  human_review: { required: true; role: string };
  execution_status: "not_executed";
  no_side_effects: true;
}

export function assembleSupplyResponse(scenarioKey: string): SupplyResponse {
  return assembleSupplyResponseFromScenario(SUPPLY_SCENARIOS[scenarioKey]);
}

export function assembleSupplyResponseFromScenario(s: SupplyScenario): SupplyResponse {
  const authorization = checkAuthorization("supply_options");
  const options: DraftOption[] = [];
  const quality_holds: InventoryRow[] = [];

  for (const row of s.inventory) {
    if (row.quality_status === "quarantine") quality_holds.push(row);
    else if (row.quality_status === "released") {
      options.push({ option_id: `OPT-${row.product}-${row.market}`, status: "draft", ...row });
    }
  }

  return {
    workflow: "supply_options",
    event_id: s.event_id,
    authorization,
    options,
    quality_holds,
    approvals_required: ["Supply Governance Board"],
    human_review: { required: true, role: "Supply Governance Board" },
    execution_status: "not_executed",
    no_side_effects: true,
  };
}
