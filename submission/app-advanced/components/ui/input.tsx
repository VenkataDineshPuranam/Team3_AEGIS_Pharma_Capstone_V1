import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-8 w-full rounded-md border border-border bg-transparent px-2.5 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-foreground/20",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
