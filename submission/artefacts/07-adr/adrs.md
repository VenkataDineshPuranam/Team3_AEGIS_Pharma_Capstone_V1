# Architecture Decision Records (Prompt 07)

10 ADRs, all currently `proposed` (C4/DDD status is `provisional`), each with a revisit trigger per the prompt's rule ("required if status is `proposed` or evidence basis is assumption"). One file, ten records, per practical adaptation of the "one file per ADR" convention — each is a complete, independently-referenceable record.

---

## ADR-001: Evidence-Resolver as a shared kernel

- **Status**: proposed
- **Evidence basis**: fact + derivation — `data/RELATIONSHIP_MODEL.csv` and `evaluation/contracts/evidence_item.schema.json` already assume one integrity/provenance shape reused across objects; `04-ddd/context_map.md` derives the shared-kernel relationship from the zero-divergence requirement
- **Context**: three workflows each need identical hash/authority/as-of logic; DDD (Prompt 04) already decided this should not be reimplemented three times
- **Decision**: implement Evidence & Provenance as one shared service (container), called by all three workflow containers, not as three copies or a shared library with per-workflow forks
- **Alternatives considered**: (a) three independent implementations — rejected, directly reproduces the Extra-processing waste Discovery found; (b) shared library, no service — rejected for now, a service boundary makes the "identical logic" guarantee independently testable and auditable, a library could still drift per-caller
- **Drivers**: INV-08 (integrity hash), zero-divergence requirement, auditability
- **Consequences**: *Easier* — one place to test/patch integrity logic. *Harder* — single dependency all three workflows share; if it's down, all three degrade together (mitigated: it's deterministic code, not a network service with its own failure modes beyond the process itself). *Riskier* — none identified beyond the shared-dependency point already named
- **Guardrails**: traces to INV-08; must never itself write to a source system
- **Validation**: unit tests on hash computation and `source_preserved` flag; cross-check against `evaluation/contracts/evidence_item.schema.json` (already done at C4 stage — zero contradictions found)
- **Revisit trigger**: if the three workflows' evidence/authority needs diverge materially at Prompt 08 (Technical Design), reopen as three specialized implementations

---

## ADR-002: Product & Substance identity resolution — resolve-per-request, not precomputed

- **Status**: proposed
- **Evidence basis**: fact — `idmp_mappings.csv` shows a small, enumerable conflict set (`mapping_status=ambiguous_strength_presentation`), not a large fuzzy-matching problem
- **Context**: three identifier systems exist for "the same" product (`07_ONTOLOGY_SEMANTIC_LAYER.md` §3); a resolution strategy is needed
- **Decision**: resolve per-request against the current `product_master_aliases`/`idmp_mappings`/`substance_master` state, not a nightly precomputed cache
- **Alternatives considered**: (a) nightly precompute — rejected, risks serving a stale mapping across a change window, and the conflict set is small enough that per-request resolution has negligible cost; (b) hybrid — deferred, no evidence yet justifies the added complexity
- **Drivers**: correctness over marginal latency, given the small data volume
- **Consequences**: *Easier* — always current. *Harder* — slightly more per-request work than a cache lookup (accepted, data volume is small)
- **Guardrails**: traces to INV-10 — ambiguity must be surfaced, never silently defaulted, regardless of resolution timing
- **Validation**: test against the known `ambiguous_strength_presentation` case (INJ-045) — must return a flagged gap, not a guess
- **Revisit trigger**: if product/substance master data volume grows enough that per-request resolution latency becomes measurable against NFR targets (Prompt 08)

---

## ADR-003: Optional AI agents run in-process, not as a separate tool-calling runtime

- **Status**: proposed
- **Evidence basis**: assumption + derivation — no evidence yet on actual latency/isolation needs; derived from the governing plan's agent-freeze rule and the two agents' narrow, read-only scope
- **Context**: `04-ddd/gen_ai_boundaries.md` §3 scopes exactly 2 optional agents (Summarizer, Similarity-scorer), both read-only, both with explicit stop conditions
- **Decision**: implement both as in-process function calls behind a feature flag, not a separate agent-runtime/tool-calling architecture, until evidence justifies more
- **Alternatives considered**: (a) full tool-calling agent runtime — rejected as premature given only 2 narrow, read-only agent candidates exist; (b) no agents at all (defer entirely) — rejected, the case's own scope allows constrained AI where justified, and both candidates have a named, bounded role
- **Drivers**: governing plan's agent-freeze until G4 PASS; minimize new AI-specific waste (Integration/Observability) per `06-c4/waste_register_ai_specific.md`
- **Consequences**: *Easier* — no new runtime dependency, no new tool-manifest surface beyond what's already modeled (POL-06). *Harder* — if agent scope grows later, this decision will need revisiting (explicit trigger below)
- **Guardrails**: traces to `04-ddd/gen_ai_boundaries.md` §3 stop conditions; must not gain write access, ever
- **Validation**: negative test confirming neither agent has a write-capable tool in its manifest
- **Revisit trigger**: if a third agent candidate is identified, or if either existing candidate needs a tool beyond read-only evidence access

---

## ADR-004: Contract validation enforced at build time AND runtime

- **Status**: proposed
- **Evidence basis**: fact + derivation — governing plan's "tests before inference" non-negotiable, and `evaluation/contracts/*.schema.json` already exist as runtime-checkable schemas, not just documentation
- **Context**: a malformed or prohibited-implying response must never reach a human reviewer
- **Decision**: validate every response against its schema (`batch_response.schema.json` etc.) both in the test suite (build time) and as a runtime gate before the response leaves the workflow container
- **Alternatives considered**: (a) build-time only — rejected, a runtime regression (e.g. a future code change) would only be caught at the next test run, not before it reaches a user; (b) runtime only — rejected, slower feedback loop during development
- **Drivers**: INV-01/06 hard-gate status; defence element 4 (prohibited-action test) needs both layers to be genuinely defensible
- **Consequences**: *Easier* — schema violations fail loudly and immediately at both layers. *Harder* — marginal runtime overhead (accepted, correctness over micro-latency here)
- **Guardrails**: schema `additionalProperties: false` and `const`/`enum` fields (already in the package's schemas) must never be loosened
- **Validation**: the package's own 6 contract samples (3 positive, 3 negative) already exercise this — `tools/test_contracts.py` currently PASSES against them
- **Revisit trigger**: none needed — this is evidence-constrained (schemas already exist), not assumption-based; revisit only if a schema itself changes

---

## ADR-005: Audit/Evidence Store — hash-chained append-only file, not a database

- **Status**: proposed
- **Evidence basis**: fact — `PACKAGE_SCOPE_AND_ASSUMPTIONS.md` requires "no cloud key, database, internet connection... needed to inspect the evidence, run public fixtures, validate contracts or execute the supplied checks"
- **Context**: audit trail must survive the INJ-029-class risk (audit capture disabled for a window) — needs to be tamper-evident, not just present
- **Decision**: append-only, hash-chained flat file (each entry includes the hash of the prior entry), no database dependency, consistent with the package's offline/no-hidden-services requirement
- **Alternatives considered**: (a) lightweight embedded DB — rejected, adds a dependency not required by the offline-mode constraint; (b) plain append-only log without hash-chaining — rejected, would not be tamper-evident, weaker than the ALCOA+ standard this system is meant to uphold
- **Drivers**: `PACKAGE_SCOPE_AND_ASSUMPTIONS.md` offline requirement; ALCOA+ (artefact 06 §4) applied to the system's own audit trail, not just source data
- **Consequences**: *Easier* — zero new infrastructure dependency, works in the offline deterministic mode. *Harder* — query/reporting over a flat file is less convenient than a DB (accepted; query tooling can be built on top without changing the storage decision)
- **Guardrails**: must be append-only in fact (no in-place edit path), and the hash chain must be verified as part of the AI-disabled continuity drill
- **Validation**: tamper-detection test — modify a past entry, confirm the hash chain breaks the check
- **Revisit trigger**: if audit query/reporting needs at Track B production scale exceed what a flat file can reasonably serve

---

## ADR-006: Authorization checked live against IAM state, never cached-gateway state

- **Status**: proposed
- **Evidence basis**: fact — INJ-067 is an already-occurred incident (contractor's IAM-revoked access remained `active_cached` in the AI gateway)
- **Context**: `04-ddd/domain_model.md` POL-01 requires deny-by-default on stale/ambiguous authorization
- **Decision**: the Authorization Service checks `iam_state` directly per request; any gateway-level cache is informational only and never authoritative for the allow/deny decision
- **Alternatives considered**: (a) short-TTL cache with invalidation webhook — rejected for Track A, adds a webhook-reliability dependency (itself a new failure mode) to close a gap a direct check closes with less complexity; revisit for Track B if latency demands it
- **Drivers**: INJ-067 is not hypothetical — it is the exact failure this decision closes
- **Consequences**: *Easier* — closes a real, already-evidenced security gap directly. *Harder* — marginally higher latency per request than a cache would give (accepted — security over speed)
- **Guardrails**: traces to POL-01 directly; `authorization.decision` must be computed fresh every request
- **Validation**: negative test reproducing the INJ-067 scenario (IAM revoked, gateway cache stale) — must deny
- **Revisit trigger**: if Track B latency budgets (Prompt 08 NFRs) cannot be met with live checks at scale

---

## ADR-007: Knowledge Authority Gateway performs a live per-citation status check

- **Status**: proposed
- **Evidence basis**: fact — INJ-065's poisoned document is well-formed prose; only a status check (not content inspection) reliably catches it, and status can change (a document can be superseded) between a periodic sync and use
- **Context**: `04-ddd/domain_model.md` INV-09/POL-02 require the trust/status gate before any citation
- **Decision**: check `knowledge_catalog.status`/`trust` live at citation time, not from a periodically-synced local copy
- **Alternatives considered**: (a) periodic sync with a staleness bound — rejected for Track A; a document superseded moments after the last sync could otherwise be cited as current, undermining the exact guarantee this gateway exists to provide
- **Drivers**: INV-09; the catalog is small (32 documents) so live-check cost is negligible
- **Consequences**: *Easier* — always-current status. *Harder* — negligible, given catalog size
- **Guardrails**: an `untrusted` or unresolvable status must produce a hard deny on citation, never a soft warning
- **Validation**: test citing K-998/K-999 (untrusted) — must be excluded from any citation list
- **Revisit trigger**: if catalog size grows enough that live-check cost becomes measurable against NFR targets

---

## ADR-008: Single offline-capable process for the deployment topology (Track A)

- **Status**: proposed
- **Evidence basis**: fact — `PACKAGE_SCOPE_AND_ASSUMPTIONS.md`: "No cloud key, database, internet connection, proprietary model, external API or instructor service is needed... Participant solutions that add such services must retain an offline deterministic mode"
- **Context**: 9 containers exist on the C4 map (`06-c4/c4_containers.md`); a deployment topology must be chosen
- **Decision**: for Track A, all 9 containers run within a single deployable process/application, satisfying the offline-deterministic-mode requirement by construction rather than by added infrastructure
- **Alternatives considered**: (a) distributed services (one deployable per container) — rejected for Track A, adds inter-service network dependencies that risk violating the offline-mode requirement and add Integration waste without a demonstrated need at this scale; revisit explicitly for Track B if a production-scale NFR demands it
- **Drivers**: package's own explicit offline/no-hidden-services rule; avoids adding Integration/Observability waste (per `06-c4/waste_register_downtime.md`) that a distributed topology would introduce
- **Consequences**: *Easier* — trivially satisfies "no hidden services"; simpler to clean-room-verify (governing plan §18). *Harder* — less independent scalability per container (acceptable for Track A's advisory-tool scale; explicit Track B revisit trigger below)
- **Guardrails**: must still preserve the container boundaries in code structure (module boundaries mirroring the C4 containers), even though deployed as one process — this keeps ADR-001 through 007's boundaries real, not just diagrammed
- **Validation**: clean-room procedure (`runbooks/REPO_EXECUTION.md`-style) run twice, confirming no network dependency is required
- **Revisit trigger**: **explicit Track B trigger** — if a production-readiness NFR (artefact 28) requires independent scaling or isolation per workflow

---

## ADR-009: Explicit health/SLO check per container, not implicit failure detection

- **Status**: proposed
- **Evidence basis**: derivation — no direct inject evidence, but directly follows from `06-c4/dmaic_lens.md` §5's Control finding that Authorization Service and Audit/Evidence Store failures must be actively detected, not merely theoretically prevented
- **Context**: a silent Authorization Service failure could fail open (violating POL-01's intent) without anyone noticing
- **Decision**: each of the 4 shared containers (Resolver, ACL, Knowledge Gateway, AuthZ) and the Audit Store exposes an explicit health check, monitored actively — not left to callers to notice a failure implicitly
- **Alternatives considered**: (a) implicit/caller-observed failure — rejected, directly risks the fail-open scenario this decision exists to prevent
- **Drivers**: `06-c4/dmaic_lens.md` §5 Control priorities
- **Consequences**: *Easier* — failures are visible, not silent. *Harder* — requires building and maintaining health-check logic (accepted, small marginal cost)
- **Guardrails**: an Authorization Service health-check failure must trigger deny-by-default system-wide, never fail-open
- **Validation**: chaos-style test — kill the Authorization Service, confirm all three workflows deny rather than silently bypass
- **Revisit trigger**: none needed at Track A scale; reconsider monitoring granularity at Track B (artefact 24, Reliability/Observability)

---

## ADR-010: Adopt the package's existing shared fixture pattern for deterministic tests

- **Status**: proposed
- **Evidence basis**: fact — `evaluation/public_fixtures/PUB-01`…`PUB-15` already exist as a shared, reusable fixture pattern across workflows and suites
- **Context**: a fixture strategy is needed for `submission/tests` and `submission/evaluation`
- **Decision**: adopt and extend the package's own `PUB-*` fixture pattern rather than inventing a per-workflow fixture format
- **Alternatives considered**: (a) per-workflow bespoke fixtures — rejected, duplicates a pattern the package already provides and validates against (`EVALUATION_PLAN.md`, `PUBLIC_FIXTURE_INDEX.csv`)
- **Drivers**: consistency with package-supplied evaluation infrastructure; avoids Overproduction waste (inventing a redundant format)
- **Consequences**: *Easier* — immediate compatibility with the package's own fixture index and evaluation plan. *Harder* — none identified
- **Guardrails**: fixtures remain `expected_answer_included=no` per the package's own evaluation design (governing plan §11.7) — never turn fixtures into an answer key
- **Validation**: `tools/rebuild_explorer_data.py --check` and fixture-index cross-reference already PASS against the immutable package
- **Revisit trigger**: none needed — evidence-constrained, not assumption-based
