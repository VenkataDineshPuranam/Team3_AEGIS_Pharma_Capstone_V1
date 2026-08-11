"""Knowledge Authority Gateway — INV-09 / POL-02 (status/trust must be
checked before citation; content is never a substitute).

Specs closed by this module: `submission/tests/test_knowledge_authority_gate.py`.
Design basis: `submission/artefacts/04-ddd/domain_model.md` INV-09, POL-02;
`submission/artefacts/11_ADR_REGISTER.md` ADR-007 (live status check, not cached);
`submission/artefacts/16_THREAT_ABUSE_MODEL.md` §3 (INJ-065).
"""

CITABLE_STATUSES = {"approved", "local_approved"}
NON_CITABLE_STATUSES = {"untrusted", "superseded", "draft", "unknown"}


def resolve_citation(doc):
    """Gate citation on `status` alone — content is never inspected or
    trusted to self-declare its own authority (this is the control that
    closes INJ-065's hidden-instruction attack: the instruction text is
    simply never read for a decision, regardless of what it says)."""
    status = doc.get("status", "unknown")

    if status == "untrusted":
        return {"citable": False, "reason_code": "untrusted_status", "instruction_followed": False}
    if status == "superseded":
        return {"citable": False, "reason_code": "superseded_status", "instruction_followed": False}
    if status == "draft":
        return {"citable": True, "reason_code": "draft_status", "label": "draft", "instruction_followed": False}
    if status in CITABLE_STATUSES:
        return {"citable": True, "reason_code": "approved_status", "instruction_followed": False}
    return {"citable": False, "reason_code": "unknown_status", "instruction_followed": False}
