"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Deliberately console-only: this is a demonstrator, no telemetry backend.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 py-24 text-center">
      <span className="text-sm font-semibold uppercase tracking-wide text-[var(--danger)]">
        Something went wrong
      </span>
      <h1 className="text-2xl font-semibold tracking-tight">This page hit an error</h1>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        No workflow decision was made and nothing was executed. Try again, or head back
        to Home.
      </p>
      {error.digest && (
        <p className="font-mono text-xs text-muted-foreground">digest: {error.digest}</p>
      )}
      <div className="flex gap-2">
        <Button onClick={() => reset()}>Try again</Button>
        <Button variant="ghost" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
