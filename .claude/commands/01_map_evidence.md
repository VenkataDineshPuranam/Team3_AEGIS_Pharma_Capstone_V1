---
description: Map sources, authority, effective dates, lineage, conflicts and missing evidence for the selected workflow.
argument-hint: [workflow: batch|pv|supply]
---

Map sources, authority, effective dates, lineage, conflicts and missing evidence for workflow: $ARGUMENTS

Trace evidence via `data/injects.json`, `data/inject_evidence_map.csv` and the relevant CSVs in `data/`, cross-checked against `knowledge/` document status (approved/superseded/draft/untrusted/local). Use the `evidence-reviewer` agent for the systematic pass. Do not resolve conflicts silently — record the governed resolution per `PACKAGE_SCOPE_AND_ASSUMPTIONS.md`.
