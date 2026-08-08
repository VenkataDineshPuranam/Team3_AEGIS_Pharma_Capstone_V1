# ADR Candidates (Prompt 06 → Prompt 07)

Architecture choices visible from C4 that need a decision record. Options are listed; decisions are made in Prompt 07, not here (per skill constraint: "do not deeply justify trade-offs here").

| # | Decision area | Options visible | Already evidence-constrained? |
|---|---|---|---|
| 1 | Evidence-Resolver: shared kernel vs. three independent implementations | (a) single shared service, (b) per-workflow copies, (c) shared library, no service | Yes — `04-ddd/context_map.md` already defends shared-kernel for zero-divergence; ADR should confirm/ratify, not re-open |
| 2 | Product & Substance ACL: real-time resolution vs. precomputed mapping table | (a) resolve per-request, (b) precompute/cache nightly, (c) hybrid | No — open |
| 3 | Optional AI agents: in-process function call vs. separate agent runtime/tool-call architecture | (a) in-process, (b) tool-calling agent runtime, (c) no agent (defer) | Partially — `04-ddd/gen_ai_boundaries.md` §3 already limits scope to 2 read-only agents; runtime choice still open |
| 4 | Contract validation: build-time only vs. build-time + runtime enforcement | (a) build-time test only, (b) runtime schema validation on every response, (c) both | Partially — governing plan implies runtime enforcement ("tests before inference"); ADR should confirm |
| 5 | Audit/Evidence Store: append-only log file vs. database vs. object storage with hash-chaining | (a) flat append-only file, (b) lightweight DB, (c) hash-chained object store | No — open, and directly affects offline/deterministic-mode claim (`PACKAGE_SCOPE_AND_ASSUMPTIONS.md` "no database... needed") |
| 6 | Authorization Service: check IAM directly per request vs. short-TTL cache with explicit invalidation | (a) direct check every time, (b) short-TTL cache | Yes — INJ-067 directly rules out any cache without explicit, fast invalidation; ADR should record why (not whether) |
| 7 | Knowledge Authority Gateway: full-text status re-check per citation vs. periodic catalog sync | (a) per-citation live check, (b) periodic sync with staleness bound | No — open |
| 8 | Deployment/runtime model: single offline-capable process vs. distributed services | (a) single process (aligns with `PACKAGE_SCOPE_AND_ASSUMPTIONS.md` "no hidden services" / offline mode), (b) distributed | Yes — package explicitly requires an offline deterministic mode; distributed adds a dependency that risks violating it |
| 9 | Degraded-mode detection: explicit health check vs. implicit (caller-observed) failure | (a) explicit health/SLO check per container, (b) implicit | No — open, ties to `boundary_and_degraded_mode.md` Control needs |
| 10 | Fixture/test-data strategy: shared deterministic fixtures vs. per-workflow fixtures | (a) shared (`evaluation/public_fixtures` pattern already exists in the package), (b) per-workflow | Yes — package already ships shared `PUB-01`…`PUB-15` fixtures; ADR should adopt this pattern, not invent a new one |

At least 10 candidates identified — meets the skill's "≥5 prototype-set ADR" floor with margin, appropriate for Track A scope (production-set ≥8 applies only if Track B is pursued).
