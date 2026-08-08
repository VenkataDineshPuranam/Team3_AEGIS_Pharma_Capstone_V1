# Early Waste Signals — Prompt 01 Discovery (superseded — kept as historical seed)

**Superseded.** Discovery was upgraded to a full-DMAIC stage; this preview list has been expanded into the full 8-category registers at `waste_register_downtime.md` and `waste_register_ai_specific.md`. Kept in place, unmodified, as the historical seed those registers were built from — do not cite this file as current.

| # | Waste | DOWNTIME / AI-specific | Observed or hypothesized | Evidence |
|---|---|---|---|---|
| 1 | Manual evidence assembly across 5+ systems (MES, LIMS, eQMS, supplier-quality, warehouse) before a QP can even begin the certification judgement | Extra processing / Motion | **Observed** — implied directly by BR-01's framing (−14% *lead time*, not −14% *review depth*) and by the system fragmentation in `SOURCE_SYSTEM_FACT_PACK.md` | `board_requests.csv`; `case/SOURCE_SYSTEM_FACT_PACK.md` |
| 2 | Rework from unit/terminology mismatches (mg/L vs µg/mL; two MedDRA versions live at once) | Defects | **Observed** — both are concrete, already-occurred conditions in the evidence, not projected risks | INJ-024, INJ-039 |
| 3 | Waiting on cross-system reconciliation before a human can act (genealogy break, audit-trail gap, disputed cold-chain logger association) | Waiting | **Observed** — each is a named, dated inject with a specific evidence trail, not a general concern | INJ-021, INJ-029, INJ-051 |
| 4 | Token/retrieval waste risk if a future retrieval layer treats all `knowledge/` documents as equally trustworthy by default | Token/Retrieval waste (AI-specific) | **Hypothesized** — no retrieval system exists yet; this is a design risk to prevent, evidenced by the *presence* of untrusted/poisoned documents already seeded in the estate (INJ-065) | `knowledge/FAKE_PV_EXPEDITED_RULE.md`; `MALICIOUS_SUPPLIER_DEVIATION.md` |
| 5 | Hidden non-inference cost (human quality/medical review) excluded from the visible cost model, which would understate true cost-to-serve of any AI-assisted redesign | Over-processing / mis-costed value | **Observed** — the $0 line items are present in the data, not inferred | `cost_model.csv`; INJ-077 |
| 6 | Duplicate PV case handling across patient-programme, literature-vendor and call-centre channels before dedup | Overproduction (duplicate work product) | **Observed** — named cluster with linked evidence | INJ-037 |

**Note:** none of the above are treated as measured baselines. `dmaic_lens.md` records what can and cannot yet be measured.
