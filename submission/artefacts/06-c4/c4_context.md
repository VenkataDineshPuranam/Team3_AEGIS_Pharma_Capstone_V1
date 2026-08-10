# C4 Level 1 — System Context (Prompt 06)

**Artifact status: `provisional`** (inherited from Prompt 04 `domain_model.md`; DDD SoT/language questions remain open — `04-ddd/domain_model.md` §8).

**Note on entry criteria**: Prompt 06 formally requires "Prompt 05 feature index." The AEGIS 30-artefact scheme has no dedicated Feature Specs template — its role is filled by artefact 09's functional-requirements table (`09_REQUIREMENTS_TRACEABILITY.md` §2, FR-01…FR-10), used here as the feature index.

## Diagram

*(Mermaid — renders natively in VS Code's built-in Markdown preview and on GitHub with no extension; see `.claude/skills/domain-and-architecture.md` "Diagram conventions" for the notation rules this follows.)*

```mermaid
flowchart TD
  classDef person fill:#E8F0FE,stroke:#333,color:#111;
  classDef system fill:#FFF3E0,stroke:#333,color:#111;
  classDef external fill:#F5F5F5,stroke:#333,color:#111;

  QP["EU Qualified Person<br/>«Person»"]:::person
  SafetyPhys["Safety Physician<br/>«Person»"]:::person
  SupplyBoard["Supply Governance Board<br/>«Person»"]:::person
  Steward["Data Steward<br/>«Person»"]:::person
  CISO["CISO / Security Reviewer<br/>«Person»"]:::person

  AEGIS["AEGIS-PHARMA Evidence Advisory System<br/>«System»"]:::system

  SourceSystems["LIMS / MES / eQMS<br/>(source of record, read-only)<br/>«External»"]:::external
  SafetyDB["Global Safety Database<br/>(source of record, read-only)<br/>«External»"]:::external
  SupplySystems["ERP / Warehouse / CMO Portals<br/>(source of record, read-only)<br/>«External»"]:::external
  KnowledgeCorpus["knowledge/*.md Policy Corpus<br/>«External»"]:::external
  ModelEndpoint["AI Model Endpoint<br/>(optional, scoped)<br/>«External»"]:::external

  QP -->|requests batch evidence view| AEGIS
  SafetyPhys -->|requests PV case support| AEGIS
  SupplyBoard -->|requests supply options| AEGIS
  Steward -->|maintains knowledge catalog status| AEGIS
  CISO -->|reviews security/audit evidence| AEGIS

  AEGIS -->|read-only evidence retrieval| SourceSystems
  AEGIS -->|read-only evidence retrieval| SafetyDB
  AEGIS -->|read-only evidence retrieval| SupplySystems
  AEGIS -->|status-gated citation retrieval| KnowledgeCorpus
  AEGIS -->|scoped drafting/scoring calls, optional| ModelEndpoint

  AEGIS -.->|"PROHIBITED: disposition write-back"| SourceSystems
  AEGIS -.->|"PROHIBITED: case decision write-back"| SafetyDB
  AEGIS -.->|"PROHIBITED: reservation/allocation write-back"| SupplySystems

  linkStyle 10 stroke:#d32f2f,stroke-width:2px
  linkStyle 11 stroke:#d32f2f,stroke-width:2px
  linkStyle 12 stroke:#d32f2f,stroke-width:2px
```

## Notes

- **People**: the three accountable roles named in `04-ddd/context_map.md` (EU QP, Safety Physician, Supply Governance Board), plus Data Steward and CISO as operational/security participants (no decision authority).
- **External systems**: all read-only, per INV-01/06/07's prohibited-write invariants. The AI Model Endpoint is drawn as optional/scoped, reflecting `04-ddd/gen_ai_boundaries.md` §3 (agent freeze until architecture review passes).
- **PROHIBITED write paths are drawn explicitly** (red dashed, per `domain-and-architecture` skill convention) — the single most important fact this diagram must communicate: no arrow into a source system that isn't drawn PROHIBITED actually exists in the design.

## Mapping to bounded contexts

| System-context element | Bounded context (`04-ddd/`) |
|---|---|
| AEGIS-PHARMA system (as a whole) | All 7 contexts, composed |
| EU Qualified Person interaction | Batch Evidence & Release Readiness |
| Safety Physician interaction | PV Case Intake & Signal Support |
| Supply Governance Board interaction | Supply & Cold-Chain Option Planning |
| Data Steward interaction | Evidence & Provenance; Regulatory & Knowledge Authority |
| CISO interaction | Decision Authority & Accountability (audit view) |
