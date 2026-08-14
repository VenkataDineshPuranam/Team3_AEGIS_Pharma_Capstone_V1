"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/workflow-a", label: "A · Batch" },
  { href: "/workflow-b", label: "B · PV" },
  { href: "/workflow-c", label: "C · Supply" },
  { href: "/injects", label: "Injects" },
  { href: "/evaluation", label: "Evaluation" },
  { href: "/tour", label: "Tour" },
  { href: "/roadmap", label: "Roadmap" },
];

export function NavBar() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap items-center gap-1 border-b border-border bg-background/80 px-4 py-2 text-sm backdrop-blur supports-[backdrop-filter]:sticky supports-[backdrop-filter]:top-0 supports-[backdrop-filter]:z-40">
      {LINKS.map((l) => {
        const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
              active && "bg-accent text-foreground",
            )}
          >
            {l.label}
          </Link>
        );
      })}
      <button
        onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
        className="ml-auto hidden items-center gap-2 rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent sm:flex"
      >
        Search <kbd className="rounded border border-border bg-muted px-1 font-mono">⌘K</kbd>
      </button>
      <ThemeToggle />
    </nav>
  );
}
