import type { Authorization } from "@/lib/workflows/common";
import { Badge } from "@/components/ui/badge";

/**
 * Shared guardrail-visible rendering for every workflow response: authorization
 * banner, execution-status badge, human-review badge, and the raw JSON so
 * nothing is hidden. Mirrors submission/app/app.js's renderAuthBanner /
 * renderCommon pattern (same fields, same "never a disposition field" note).
 */
export function AuthBanner({ authorization }: { authorization: Authorization }) {
  const allow = authorization.decision === "allow";
  return (
    <div
      className={`flex flex-wrap items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm ${
        allow
          ? "border-[color-mix(in_srgb,var(--ok)_35%,var(--border))] bg-[color-mix(in_srgb,var(--ok)_8%,transparent)]"
          : "border-[color-mix(in_srgb,var(--danger)_35%,var(--border))] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)]"
      }`}
    >
      <Badge variant={allow ? "ok" : "danger"}>{allow ? "ALLOW" : "DENY"}</Badge>
      <span className="text-foreground/90">
        Authorization for <strong>{authorization.user}</strong> — {authorization.reason}
      </span>
    </div>
  );
}

// This is the non-negotiable guardrail surface: execution_status and the
// required human-reviewer role. Must render prominently on every workflow
// response view (canned, live-edited, or embedded in the tour) — never a
// small forgettable badge.
export function GuardrailBadges({
  executionStatus,
  reviewRole,
}: {
  executionStatus: string;
  reviewRole: string;
}) {
  return (
    <div className="grid gap-2 rounded-lg border-2 border-[var(--warn)]/50 bg-[color-mix(in_srgb,var(--warn)_10%,transparent)] p-3.5 sm:grid-cols-2">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--warn)]" />
        <span className="font-mono text-sm font-semibold text-[var(--warn)]">
          execution_status: {executionStatus}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--warn)]" />
        <span className="text-sm font-semibold text-[var(--warn)]">
          Human review required — {reviewRole}
        </span>
      </div>
    </div>
  );
}

export function RawJson({ value }: { value: unknown }) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Full response (never a disposition field)
      </div>
      <pre className="thin-scroll max-h-[32rem] overflow-auto rounded-lg border border-border bg-muted p-3 font-mono text-xs text-foreground/80">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}

export function ListBlock({
  items,
  render,
  emptyLabel,
  tone,
  animateNew,
}: {
  items: unknown[];
  render: (item: never, idx: number) => React.ReactNode;
  emptyLabel?: string;
  tone?: "warn" | "gap" | "default";
  animateNew?: boolean;
}) {
  if (!items.length) {
    return emptyLabel ? <p className="text-sm text-muted-foreground">{emptyLabel}</p> : null;
  }
  const toneClass =
    tone === "warn"
      ? "border-[color-mix(in_srgb,var(--danger)_35%,var(--border))] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] text-foreground"
      : tone === "gap"
        ? "border-[color-mix(in_srgb,var(--warn)_35%,var(--border))] bg-[color-mix(in_srgb,var(--warn)_8%,transparent)] text-foreground"
        : "border-border bg-muted/40 text-foreground";
  return (
    <ul className="space-y-1.5">
      {items.map((item, idx) => (
        <li
          key={idx}
          className={`rounded-md border px-2.5 py-1.5 text-sm ${toneClass} ${animateNew ? "animate-flag-in" : ""}`}
        >
          {render(item as never, idx)}
        </li>
      ))}
    </ul>
  );
}
