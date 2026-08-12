import Link from "next/link";

const WORKFLOWS = [
  { href: "/workflow-a", label: "Workflow A — GxP Batch Review", desc: "Evidence completeness/conflicts/gaps. Never releases, rejects, reprocesses, relabels or recalls a batch." },
  { href: "/workflow-b", label: "Workflow B — Pharmacovigilance", desc: "Case intake and signal support. Never makes final seriousness/causality/expectedness/reportability/signal decisions." },
  { href: "/workflow-c", label: "Workflow C — Supply / Cold-Chain", desc: "Non-executing recovery options. Never reserves, allocates, changes quality status, ships or initiates a recall." },
  { href: "/workflow-d", label: "Workflow D — Clinical Trial Context", desc: "Additional scope. Never renders eligibility, treatment_arm or endpoint_conclusion." },
  { href: "/workflow-e", label: "Workflow E — Discovery / Translational Science", desc: "Additional scope. Never renders assay_disposition, model_approval, image_authenticity, or target_validation_conclusion." },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          AEGIS-PHARMA — Advanced Companion
        </h1>
        <p className="text-zinc-300 leading-relaxed">
          This is a richer, exploratory companion to the compliant offline static
          demonstrator at{" "}
          <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-sm">
            submission/app/index.html
          </code>
          . It requires Node.js/npm to build and run and is <strong>not</strong> the
          graded, offline-guardrail-compliant submission artifact — it exists purely to
          give a nicer exploratory surface over the same real workflow logic, real
          disclosed injects, and real evaluation evidence. The static app remains the
          artifact that is actually graded and that satisfies the capstone&apos;s
          offline-capability requirement.
        </p>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Every response shown here is produced by TypeScript ports of the same
          workflow-assembly functions used by the static app&apos;s JS mirror
          (<code className="font-mono">submission/app/app.js</code>) and by the Python
          reference implementation under{" "}
          <code className="font-mono">submission/src/workflows/</code>. No new decision
          logic is introduced — field names, invariants, and guardrail behavior are
          identical.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Mandated + additional-scope workflows</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {WORKFLOWS.map((w) => (
            <Link
              key={w.href}
              href={w.href}
              className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 transition-colors hover:border-zinc-600 hover:bg-zinc-900"
            >
              <div className="font-medium text-white">{w.label}</div>
              <div className="mt-1 text-sm text-zinc-400">{w.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/injects"
          className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 transition-colors hover:border-zinc-600 hover:bg-zinc-900"
        >
          <div className="font-medium text-white">Inject Explorer</div>
          <div className="mt-1 text-sm text-zinc-400">
            All 84 disclosed injects, searchable/filterable by dimension, workflow and
            status.
          </div>
        </Link>
        <Link
          href="/evaluation"
          className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 transition-colors hover:border-zinc-600 hover:bg-zinc-900"
        >
          <div className="font-medium text-white">Evaluation Dashboard</div>
          <div className="mt-1 text-sm text-zinc-400">
            Test results, evaluation scenarios and inject-coverage snapshot.
          </div>
        </Link>
      </section>
    </div>
  );
}
