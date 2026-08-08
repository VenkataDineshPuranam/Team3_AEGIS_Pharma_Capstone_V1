# Decision Index (Prompt 07)

One-page index linking each ADR to C4 elements, DDD contexts, and backlog blockers.

| ADR | Title | C4 element(s) | DDD context(s) | Status | Blocked on evidence-acquisition backlog? |
|---|---|---|---|---|---|
| ADR-001 | Evidence-Resolver as shared kernel | Evidence-Resolver Service | Evidence & Provenance | proposed | No |
| ADR-002 | Product identity resolve-per-request | Product & Substance ACL | Product & Substance Master | proposed | Backlog item 2 (validation-state conflict rule) partially overlaps |
| ADR-003 | AI agents in-process, not separate runtime | Batch/PV workflow containers | Batch Evidence; PV Case Intake | proposed | No |
| ADR-004 | Contract validation build-time + runtime | Contract Validator | Cross-cutting | proposed | No |
| ADR-005 | Audit Store: hash-chained file, no DB | Audit / Evidence Store | Evidence & Provenance | proposed | No |
| ADR-006 | AuthZ live IAM check, no cache trust | Authorization Service | Decision Authority & Accountability | proposed | No |
| ADR-007 | Knowledge Gateway live status check | Knowledge Authority Gateway | Regulatory & Knowledge Authority | proposed | Backlog item 3 (which docs citable by default) directly feeds this |
| ADR-008 | Single offline-capable process | All 9 containers | All 7 contexts | proposed | No |
| ADR-009 | Explicit health/SLO checks | Resolver, ACL, Knowledge Gateway, AuthZ, Audit Store | Cross-cutting | proposed | No |
| ADR-010 | Adopt package fixture pattern | Contract Validator; test infrastructure | Cross-cutting | proposed | No |

## Backlog linkage summary

Of the 6 open items in `01-discovery/evidence_acquisition_backlog.md`, 2 (items 2 and 3) directly feed pending ADR refinement (ADR-002, ADR-007); the remaining 4 (team seat names, jurisdiction statements, KG-vs-simpler-alternative — already resolved in artefact 08 — and current-state process map) do not block any ADR here, consistent with Discovery's original assessment that none of the backlog blocks framing/design, only production-claim readiness.

## All ADRs remain `proposed`, not `accepted`

Per the prompt's rule: C4/DDD status is `provisional`, so no ADR here is marked `accepted` — each has an explicit revisit trigger (see `adrs.md`) rather than a false claim of finality.
