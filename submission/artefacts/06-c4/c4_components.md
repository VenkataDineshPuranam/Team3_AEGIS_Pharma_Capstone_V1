# C4 Level 3 — Components (Prompt 06)

**Artifact status: `provisional`.** Depth follows the skill's guidance ("deepen Code level only where risk warrants") — components are detailed for the Evidence-Resolver and Batch containers (highest invariant density); PV and Supply are described at the same pattern, not re-drawn in full.

## Diagram — Evidence-Resolver Service (shared kernel, highest reuse risk)

```plantuml
@startuml
skinparam rectangle {
  BackgroundColor<<Container>> #FFF3E0
}

rectangle "Evidence-Resolver Service" <<Container>> {
  rectangle "Hash Engine\n(SHA-256, INV-08)" as Hash
  rectangle "As-Of Time Stamper" as AsOf
  rectangle "Source-Preservation Guard" as SourceGuard
  rectangle "Contradiction Detector\n(unit/state/identity mismatch, INV-02/03)" as ContraDetect
}

Hash --> SourceGuard
AsOf --> ContraDetect
ContraDetect --> SourceGuard
@enduml
```

## Diagram — Batch Evidence Container (Workflow A, worked example)

```plantuml
@startuml
rectangle "Batch Evidence Container" <<Container>> {
  rectangle "Evidence Assembler\n(genealogy, EM, lab, deviations, release packet)" as Assembler
  rectangle "Readiness Classifier\n(INV-01, POL-03 — enum only, never a disposition)" as Classifier
  rectangle "Contradiction Surface\n(INV-03: OOS/OOT/invalid triple-state)" as ContraSurface
  rectangle "Human-Review Formatter\n(HITL touchpoint, gen_ai_boundaries §4)" as HITL
  rectangle "Optional: Evidence Summarizer Agent\n(read-only, stop condition = omitted fact)" as Agent
}

Assembler --> Classifier
Classifier --> ContraSurface
ContraSurface --> HITL
Assembler ..> Agent : optional draft summary
Agent --> HITL : summary + stop-condition flag
@enduml
```

## Component ↔ FR mapping

| Component | FR-ID (`09_REQUIREMENTS_TRACEABILITY.md` §2) | Container |
|---|---|---|
| Hash Engine | FR-06 | Evidence-Resolver |
| Contradiction Detector | FR-09 | Evidence-Resolver |
| Evidence Assembler | FR-01 | Batch |
| Readiness Classifier | FR-01, FR-02 | Batch |
| Contradiction Surface | FR-09 | Batch |
| Evidence Summarizer Agent | — (optional, no FR mandates it) | Batch |
| *(PV pattern, not redrawn)* Duplicate-Candidate Detector | FR-03, FR-04 | PV |
| *(Supply pattern, not redrawn)* Option Generator + Quality-Hold Filter | FR-05 | Supply |

## Trust / privacy / authority boundaries at component level

- **Readiness Classifier** and equivalent PV/Supply classifiers are the components INV-01/06 bind hardest to — the schema `const`/`enum` constraints (`evaluation/contracts/batch_response.schema.json`) are enforced here, not just documented.
- **Evidence Summarizer Agent** is the only component in this view with a Model Endpoint edge — every other component is deterministic code, directly implementing `04-ddd/gen_ai_boundaries.md` §1's "rules vs. AI" split.
