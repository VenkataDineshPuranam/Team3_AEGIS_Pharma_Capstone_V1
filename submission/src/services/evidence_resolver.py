"""Evidence-Resolver shared kernel — INV-02 (no silent unit conversion),
INV-03 (conflicted states surfaced, never auto-resolved), INV-08 (hash
integrity), INV-10 (identity ambiguity surfaced, never defaulted).

Specs closed by this module: `submission/tests/test_evidence_integrity.py`.
Design basis: `submission/artefacts/04-ddd/domain_model.md` INV-02/03/08/10;
`submission/artefacts/11_ADR_REGISTER.md` ADR-001 (shared kernel).
"""

import re

_SHA256_RE = re.compile(r"^[a-f0-9]{64}$")


def verify_integrity(item):
    """INV-08: a real SHA-256 hash and source_preserved: true, both required."""
    integrity = item.get("integrity", {})
    sha256 = integrity.get("sha256", "")
    source_preserved = integrity.get("source_preserved", False)
    valid = bool(_SHA256_RE.match(sha256)) and source_preserved is True
    return {"valid": valid}


def check_unit_conversion(mapping):
    """INV-02: an unapproved conversion rule is flagged, never applied."""
    approved = mapping.get("approved") == "yes"
    if approved:
        return {"action": "convert"}
    return {"action": "flag_mismatch"}


def surface_contradiction(states):
    """INV-03: disagreeing lims/stats/notebook states are surfaced as a
    contradiction entry, never silently reconciled to a single value."""
    values = {states.get("lims_state"), states.get("stats_state"), states.get("notebook_state")}
    values.discard(None)
    is_conflicted = len(values) > 1
    entries = []
    if is_conflicted:
        entries.append({
            "type": "lab_state_disagreement",
            "lims_state": states.get("lims_state"),
            "stats_state": states.get("stats_state"),
            "notebook_state": states.get("notebook_state"),
        })
    return {"is_conflicted": is_conflicted, "contradiction_entries": entries}


def resolve_identity(mapping):
    """INV-10: an ambiguous product/substance mapping is surfaced as a gap,
    never silently defaulted to one candidate."""
    status = mapping.get("mapping_status", "")
    is_ambiguous = "ambiguous" in status
    resolved_product = None if is_ambiguous else mapping.get("idmp_product")
    return {"is_ambiguous": is_ambiguous, "resolved_product": resolved_product}
