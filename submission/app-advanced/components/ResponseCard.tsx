import type { Authorization } from "@/lib/workflows/common";

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
      className={`flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-sm ${
        allow
          ? "border-emerald-700/40 bg-emerald-950/30 text-emerald-200"
          : "border-red-700/40 bg-red-950/30 text-red-200"
      }`}
    >
      <span
        className={`rounded px-2 py-0.5 text-xs font-semibold tracking-wide ${
          allow ? "bg-emerald-700 text-white" : "bg-red-700 text-white"
        }`}
      >
        {allow ? "ALLOW" : "DENY"}
      </span>
      <span>
        Authorization for <strong>{authorization.user}</strong> — {authorization.reason}
      </span>
    </div>
  );
}

export function GuardrailBadges({
  executionStatus,
  reviewRole,
}: {
  executionStatus: string;
  reviewRole: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="rounded bg-amber-900/40 border border-amber-700/40 px-2 py-1 text-xs font-mono text-amber-200">
        execution_status: {executionStatus}
      </span>
      <span className="rounded bg-sky-900/40 border border-sky-700/40 px-2 py-1 text-xs text-sky-200">
        human_review.required — {reviewRole} must review
      </span>
    </div>
  );
}

export function RawJson({ value }: { value: unknown }) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Full response (never a disposition field)
      </div>
      <pre className="max-h-[32rem] overflow-auto rounded-md border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-300">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{title}</div>
      {children}
    </div>
  );
}

export function ListBlock({
  items,
  render,
  emptyLabel,
  tone,
}: {
  items: unknown[];
  render: (item: never, idx: number) => React.ReactNode;
  emptyLabel?: string;
  tone?: "warn" | "gap" | "default";
}) {
  if (!items.length) {
    return emptyLabel ? <p className="text-sm text-zinc-500">{emptyLabel}</p> : null;
  }
  const toneClass =
    tone === "warn"
      ? "border-red-800/40 bg-red-950/20 text-red-200"
      : tone === "gap"
        ? "border-amber-800/40 bg-amber-950/20 text-amber-200"
        : "border-zinc-800 bg-zinc-900/40 text-zinc-200";
  return (
    <ul className="space-y-1">
      {items.map((item, idx) => (
        <li key={idx} className={`rounded border px-2 py-1 text-sm ${toneClass}`}>
          {render(item as never, idx)}
        </li>
      ))}
    </ul>
  );
}
