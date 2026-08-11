"""Model supply-chain integrity gate — extends INV-08's hash-integrity
discipline to model artifacts specifically (INJ-070).

Specs closed by this module: `submission/tests/test_model_supply_chain_integrity.py`.
Design basis: `submission/artefacts/16_THREAT_ABUSE_MODEL.md` §6;
`submission/artefacts/20_ISO42001_GOVERNANCE.md` §4;
`knowledge/AI_MODEL_CHANGE_CONTROL.md` (K-005).
"""


def verify_model_integrity(model):
    registry_hash = model.get("registry_hash")
    deployed_hash = model.get("deployed_hash")
    signature = model.get("signature")
    status = model.get("status", "unknown")

    if deployed_hash != registry_hash:
        return {"may_serve": False, "reason_code": "hash_mismatch", "lifecycle_label": status}
    if signature != "present":
        return {"may_serve": False, "reason_code": "missing_signature", "lifecycle_label": status}
    return {"may_serve": True, "reason_code": "ok", "lifecycle_label": status}
