import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-muted text-foreground",
        outline: "border-border bg-transparent text-muted-foreground",
        warn: "border-transparent bg-[color-mix(in_srgb,var(--warn)_18%,transparent)] text-[var(--warn)]",
        danger: "border-transparent bg-[color-mix(in_srgb,var(--danger)_18%,transparent)] text-[var(--danger)]",
        ok: "border-transparent bg-[color-mix(in_srgb,var(--ok)_18%,transparent)] text-[var(--ok)]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
