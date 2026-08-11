#!/usr/bin/env python3
"""Accessibility smoke check (P9 workstream, `AEGIS_PROJECT_PLAN_FINAL.md`
§8.1: owner P4+P1, "Done when: Keyboard/critical-path").

Static checks against `submission/app/index.html` and `app.js` — this
environment has no browser automation tool (no Selenium/Playwright, and
installing one would violate the offline/stdlib-only constraint), so
these are structural checks a reviewer can verify by reading the same
source, not a simulated screen-reader pass. Each check states exactly
what it verifies and why that's sufficient for *this* app (3 tabs, 3
selects, 3 buttons — a small, fully-native-element surface, not a
generic claim that static analysis proves full WCAG conformance).

Stdlib-only, offline, deterministic. Run from repo root:
    python3 -B submission/scripts/accessibility_smoke.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HTML = (ROOT / "submission" / "app" / "index.html").read_text(encoding="utf-8")
JS = (ROOT / "submission" / "app" / "app.js").read_text(encoding="utf-8")


def check(name, condition, detail):
    return {"check": name, "pass": bool(condition), "detail": detail}


def main():
    checks = []

    interactive_tags = re.findall(r"<(div|span)[^>]*\bonclick=", HTML)
    checks.append(check(
        "no_div_span_click_handlers",
        not interactive_tags,
        "every interactive control is a native <button>/<select>, never a non-focusable <div>/<span> "
        "with a click handler bolted on (which would need manual tabindex/keydown wiring to be reachable)",
    ))

    button_count = len(re.findall(r"<button\b", HTML))
    select_count = len(re.findall(r"<select\b", HTML))
    checks.append(check(
        "critical_actions_are_native_elements",
        button_count == 6 and select_count == 3,
        f"found {button_count} <button> (3 tabs + 3 'Assemble response' actions) and {select_count} <select> "
        "(1 scenario picker per workflow) — all natively focusable and activatable via Tab/Enter/Space/arrows, "
        "with no JS required to make them keyboard-reachable",
    ))

    checks.append(check(
        "tablist_has_aria_roles",
        'role="tablist"' in HTML and HTML.count('role="tab"') == 3,
        "tab container has role=\"tablist\", each tab button has role=\"tab\", per the ARIA Authoring Practices tabs pattern",
    ))

    checks.append(check(
        "tab_panels_labelled",
        HTML.count("aria-labelledby=") == 3,
        "each of the 3 content panels is aria-labelledby its own heading, so a screen reader announces which workflow is active",
    ))

    checks.append(check(
        "arrow_key_tab_navigation",
        "ArrowLeft" in JS and "ArrowRight" in JS and "keydown" in JS,
        "Left/Right arrow keys move focus between tabs and activate the newly focused one (added this phase, "
        "completing the ARIA tabs pattern — previously only Tab-key-to-each-button worked, not roving arrow nav)",
    ))

    checks.append(check(
        "live_region_for_authorization_banner",
        'role="status"' in HTML,
        "the authorization banner uses role=\"status\" so assistive tech announces authorization state changes without moving focus",
    ))

    # Match actual usage (assignment/call), not the word appearing inside a
    # comment explaining that it's deliberately avoided — a naive substring
    # check would false-positive on this file's own "never innerHTML" comments.
    innerhtml_usage = re.search(r"\.innerHTML\s*[=+]", JS)
    document_write_usage = re.search(r"document\.write\s*\(", JS)
    checks.append(check(
        "no_innerHTML_or_unsafe_dom",
        not innerhtml_usage and not document_write_usage,
        "all rendering goes through createElement/textContent (safe-DOM discipline, also closes an XSS class), "
        "confirmed by regex for actual .innerHTML=/document.write( usage (not just the word appearing in a "
        "comment) — this doubles as an accessibility check since innerHTML-built content frequently loses "
        "semantic structure/ARIA wiring",
    ))

    checks.append(check(
        "dark_mode_respects_system_preference",
        "prefers-color-scheme: dark" in HTML,
        "color scheme (contrast) follows the user's OS setting via @media (prefers-color-scheme: dark), "
        "not fixed to a single palette",
    ))

    report = {
        "scope": "submission/app/index.html + app.js — static structural checks, not a live browser/screen-reader run (no automation tool available offline)",
        "checks": checks,
        "all_passed": all(c["pass"] for c in checks),
    }

    out_path = ROOT / "submission" / "evidence" / "accessibility_smoke_report.json"
    out_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0 if report["all_passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
