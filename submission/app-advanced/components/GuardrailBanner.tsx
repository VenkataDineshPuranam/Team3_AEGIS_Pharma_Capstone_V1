export function GuardrailBanner() {
  return (
    <div className="w-full border-b border-amber-800/40 bg-amber-950/60 px-4 py-2 text-center text-xs text-amber-200 sm:text-sm">
      Decision-support demonstrator, not an execution system. Non-offline, build-required
      companion — <strong>not</strong> the graded/compliant artifact. That artifact is{" "}
      <code className="font-mono">submission/app/index.html</code> (static HTML/JS, offline).
    </div>
  );
}
