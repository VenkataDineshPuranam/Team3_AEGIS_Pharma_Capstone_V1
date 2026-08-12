import Link from "next/link";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/workflow-a", label: "A · Batch" },
  { href: "/workflow-b", label: "B · PV" },
  { href: "/workflow-c", label: "C · Supply" },
  { href: "/workflow-d", label: "D · Clinical" },
  { href: "/workflow-e", label: "E · Discovery" },
  { href: "/injects", label: "Injects" },
  { href: "/evaluation", label: "Evaluation" },
];

export function NavBar() {
  return (
    <nav className="flex flex-wrap gap-1 border-b border-zinc-800 bg-zinc-950 px-4 py-2 text-sm">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="rounded px-2 py-1 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
