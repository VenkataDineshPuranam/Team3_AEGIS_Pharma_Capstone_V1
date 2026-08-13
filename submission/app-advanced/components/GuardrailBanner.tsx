export function GuardrailBanner() {
  return (
    <div className="w-full border-b border-border bg-[color-mix(in_srgb,var(--warn)_12%,var(--background))] px-4 py-2 text-center text-xs text-[var(--warn)] sm:text-sm">
      Decision-support demonstrator, not an execution system. Non-offline, build-required
      companion — <strong>not</strong> the graded/compliant artifact. That artifact is{" "}
      <code className="font-mono">submission/app/index.html</code> (static HTML/JS, offline).
    </div>
  );
}
