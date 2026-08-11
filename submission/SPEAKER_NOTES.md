# Speaker Notes — Project AEGIS-PHARMA, All Phases (P1–P9)

Presentation companion to `30_ELEVATOR_PITCH.md` and `FINAL_DEFENCE_DOSSIER.md`. Those two are the graded artefacts; this document is the spoken-delivery layer on top of them — what to say, in what order, and which command to run live at each point. Every number and claim below cites a real generated file; nothing here is written for effect that isn't also written for evidence elsewhere in `submission/`.

**Suggested total time**: 20–25 minutes (5 min pitch + ~1–1.5 min per phase + 5 min live demo + Q&A buffer). Trim phase-by-phase detail first if time is short; never trim the live demo or the recommendation.

---

## 0. Opening (60 seconds) — read from `30_ELEVATOR_PITCH.md` §1

> "NovaCura's board wants release lead time down 14% without touching who signs off. The bottleneck isn't the sign-off — it's finding and reconciling evidence across a dozen disconnected systems first. AEGIS-PHARMA is three advisory-only workflows that do that reconciliation, and hands a complete, cited evidence packet to the same EU Qualified Person, Safety Physician, and Supply Governance Board who already own these decisions. It never certifies a batch, never confirms a PV signal, never ships or allocates stock. That boundary isn't a policy promise — it's structurally impossible in the code, and I can prove it live in a minute."

**Then say**: "I'll walk through what got built phase by phase, then show it running, then give you a clear recommendation."

---

## Phase-by-phase walkthrough

### P1 — Discovery (Gate G1)

**What**: `01_BUSINESS_CASE.md`, `02_DMAIC_WORKBOOK.md`, `03_STAKEHOLDER_DECISION_RIGHTS.md`, `04_PRODUCT_SERVICE_BLUEPRINT.md`.

**Say**: "We started by refusing to invent a baseline. The board's target is a real, disclosed 14% lead-time cut — but the *current* lead time isn't in the evidence, so instead of making up a number to look complete, we abstained and put it on the backlog. That discipline — never fabricate what isn't there — is the thread that runs through all nine phases."

**Number to cite**: `data/no_ai_baselines.csv` — three real disclosed alternatives compared (master-data repair 38%, rules/workflow 27%, GenAI-assist 51%), so the AI approach was chosen against real alternatives, not by default.

### P2 — Domain / DDD (Gate G2)

**What**: `05_DDD_CONTEXT_MAP.md` through `09_REQUIREMENTS_TRACEABILITY.md`, plus the 84-inject register.

**Say**: "This is where the three workflows' boundaries got defined as domain invariants — ten of them, INV-01 through INV-10 — not as prompt instructions. INV-01, for instance, says a disposition value can never even be *representable* in a batch response. That's the boundary this whole system is built around, and it's a data-modeling decision from phase 2, not a safety feature bolted on later."

**Number to cite**: 84 disclosed injects tracked from day one; register now stands at **61 addressed / 11 in_scope_open / 12 out_of_scope**, mechanically re-verified at every phase.

### P3 — Architecture (Gate G3)

**What**: `10_C4_ARCHITECTURE.md`, `11_ADR_REGISTER.md`, `12_INTEGRATION_CONTRACTS.md`, `13`–`15` (GxP lifecycle, CSA, QRM).

**Say**: "Ten architecture decisions got recorded as ADRs — including the one that matters most for everything that follows: a shared evidence-resolver kernel, so all three workflows check unit conversion, contradiction, and identity ambiguity through the same code, not three copies that could drift apart."

### P4 — Secure Design (Gate G4)

**What**: `16_THREAT_ABUSE_MODEL.md` through `21_ASSURANCE_CASE.md`, plus 35 tests written **before** the implementation existed and confirmed failing for the right reason.

**Say**: "We wrote the attack tests before we wrote the code they'd test. The threat model names six real security injects — a poisoned document, a poisoned tool manifest, a stale-cache authorization bypass — all grounded in data already sitting in the package, not hypothetical."

### P5 — POC Build (Gate G5)

**What**: `submission/src/` (3 workflows, 5 services), `submission/app/` (offline demonstrator), the AI-disabled proof.

**Say**: "This is where the 35 red tests turned green — and where we proved, not claimed, that this runs with zero network dependency. `socket.connect` is monkey-patched to raise for the whole run; if any code path tried to reach the network, the run would crash. It doesn't."

### P6 — TEVV (Gate G6)

**What**: `submission/evaluation/` — 9 graders, 10 release gates, 12 suites, 21 scenarios.

**Say**: "This is the phase with the finding I'm proudest of. Instead of just testing our new code, we also ran the *original, untouched* brownfield code from the case package against the same data. It actually mutates a reservation it shouldn't touch, returns a bare true/false with no audit trail, and hands back a poisoned document as if it were trustworthy. That's not a claim — we ran it and captured the output. That's the exact gap this project closes."

**Number to cite**: 18/18 regression scenarios pass, 0 release gates blocked, 3/3 baseline defects confirmed by execution.

### P7 — Ops + Clean-Room (Gate G7)

**What**: 4 runbooks, a 6-script suite (`setup/run/test/evaluate/reset/export`), `submission_manifest.csv`/`file_hashes.csv`.

**Say**: "Everything you're about to see me run, I've already run from a completely separate copy of this repository — extracted fresh, outside my working directory — twice. That's what 'clean-room' means here: not 'it works on my machine,' but 'it works from a machine that's never seen this before.'"

### P8 — Defence (Gate G8)

**What**: `30_ELEVATOR_PITCH.md`, `FINAL_DEFENCE_DOSSIER.md` (13 elements), the inspection-response demo (closes INJ-050).

**Say**: "Every one of the 13 required defence elements has a real command behind it, not a bullet point. I'll run two of the sharpest ones live in a minute: a poisoned tool call, and a regulator-style evidence request that verifies its own citations actually exist on disk before it hands them over."

### P9 — Production Hardening (Gate G9, optional Track B)

**What**: RC `v1.0.0-rc1`, security retest, rollback rehearsal, soak test, accessibility fix, SLO/error budget, a real kill switch.

**Say**: "This last phase is the one most teams skip because it's optional for the capstone score. We didn't skip it. We tagged a release candidate, re-ran a security-scoped test pass against it specifically, rehearsed an actual rollback — cloned the repo, checked out the previous commit, and re-ran its tests to prove it still works, not just that the checkout succeeded — and soaked all three workflows 200 times each with zero drift."

**Number to cite**: rollback RTO ~1.4 seconds; RPO = 0 by construction (no server-side state to lose); 38/38 security-scoped tests on the RC; 0 execution-status violations across 600 soak iterations.

---

## Live demo script (run in this order)

```sh
# 1. Prove it works from scratch (P1 says nothing here is a live server dependency)
submission/scripts/setup.sh

# 2. Run all three workflows offline — the AI-disabled proof (P5/P9)
submission/scripts/run.sh

# 3. The brownfield-vs-rebuild contrast (P6) — the single strongest before/after moment
python3 -B -c "
import legacy_pharma
print('BEFORE (unmodified brownfield):', legacy_pharma.plan_supply('NCB-204'))
"
# then point at submission/evaluation/reports/final_evaluation_report.md §3 for the AFTER

# 4. The poisoned-tool attack (P8 element 5) — denied even when forced 'approved'
python3 -B -c "
import json
from submission.src.services.tool_gateway import invoke_tool
manifest = json.load(open('data/tool_manifest_poisoned.json'))
print(invoke_tool({'tool_id': 'batch_status_plus', 'approved': 'yes', 'manifest': manifest}))
"

# 5. The inspection-request response (P8 element 11 / INJ-050) — verifies its own citations
python3 -B submission/scripts/inspection_response_demo.py

# 6. The kill switch (P9) — and prove it un-blocks cleanly
touch submission/evidence/KILL_SWITCH
submission/scripts/run.sh; echo "exit=$?"
rm submission/evidence/KILL_SWITCH

# 7. Full evidence in one shot, for the "show me everything" ask
submission/scripts/test.sh && submission/scripts/evaluate.sh
```

---

## Anticipated tough questions, with prepared answers

| Question | Answer |
|---|---|
| "How do I know this isn't cherry-picked demo data?" | Every fixture traces to a real row in `data/*.csv` or `evaluation/public_fixtures/`, disclosed by the case package before any of this was built — nothing in the demo was invented for the pitch. |
| "What happens if the model vendor changes pricing again?" | Already happened in the disclosed data — a real +70% price shock (`23_TOKEN_FINOPS.md` §7) — and the system has zero live inference dependency in its shipped code path, so the shock affects a future optional feature, not what's running today. |
| "Is this actually production-ready?" | No, and we say so explicitly — Track A (G1–G8) is defence-ready; Track B (P9, this phase) adds hardening evidence but the recommendation is Go *with conditions* (`28_PRODUCTION_READINESS.md` §7), not an unqualified production claim. |
| "What's the biggest thing still open?" | 11 injects remain `in_scope_open` — named, owned, and dated in `29_NINETY_DAY_ROADMAP_HANDOVER.md`, not hidden. Two live denial-of-wallet events are disclosed but not yet runtime-blocked (only evaluation-time capped). |
| "Who's accountable if this is wrong?" | Nobody new — every regulated decision stays with the role that already owns it (EU Qualified Person, Safety Physician, Supply Governance Board), per `data/decision_rights.csv`. This system never becomes the accountable party. |

---

## Closing — the recommendation (read from `FINAL_DEFENCE_DOSSIER.md` element 13)

> "Conditional Go, moving to Go now that P9 is complete: Track A's hard gates all hold, and Track B added real hardening evidence — a tagged RC, a rehearsed rollback, a security retest, a soak test, a kill switch. The condition is the same one we started with: close the 0–30-day roadmap items before any further work, not concurrently with it. Full reasoning and every citation is in `28_PRODUCTION_READINESS.md` §7."
