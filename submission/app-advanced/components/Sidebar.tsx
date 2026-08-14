"use client";

import * as React from "react";
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
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  // Reset the mobile drawer to closed whenever the route changes, without a
  // setState-in-effect: track the pathname we last rendered for and close
  // synchronously during render if it moved (the React-recommended pattern).
  const [renderedFor, setRenderedFor] = React.useState(pathname);
  if (pathname !== renderedFor) {
    setRenderedFor(pathname);
    if (open) setOpen(false);
  }

  return (
    <>
      {/* Mobile top bar: hamburger + brand, sidebar becomes a drawer below md */}
      <div className="flex items-center justify-between border-b border-border bg-background/80 px-4 py-2 backdrop-blur md:hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
          aria-expanded={open}
          className="rounded-md border border-border px-2.5 py-1.5 text-sm text-foreground hover:bg-accent"
        >
          <span className="sr-only">Toggle navigation</span>
          ☰
        </button>
        <span className="text-sm font-semibold tracking-tight">AEGIS-PHARMA</span>
        <button
          onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
          aria-label="Open search"
          className="rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent"
        >
          ⌘K
        </button>
      </div>

      {/* Backdrop for mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-border bg-background transition-transform md:sticky md:top-0 md:z-30 md:h-screen md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            AP
          </span>
          <span className="text-sm font-semibold tracking-tight">AEGIS-PHARMA</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 text-sm">
          {LINKS.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "block rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                  active && "bg-accent font-medium text-foreground",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-3">
          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
            className="flex flex-1 items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent"
          >
            Search <kbd className="ml-auto rounded border border-border bg-muted px-1 font-mono">⌘K</kbd>
          </button>
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
