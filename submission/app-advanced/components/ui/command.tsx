"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      className={cn("flex h-full w-full flex-col overflow-hidden bg-card text-card-foreground", className)}
      {...props}
    />
  );
}

function CommandDialog({ children, open, onOpenChange }: { children: React.ReactNode; open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0">
        <Command shouldFilter={false}>{children}</Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div className="flex items-center gap-2 border-b border-border px-4">
      <span className="text-muted-foreground text-sm">⌘K</span>
      <CommandPrimitive.Input
        className={cn(
          "flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      className={cn("thin-scroll max-h-[60vh] overflow-y-auto overflow-x-hidden p-2", className)}
      {...props}
    />
  );
}

function CommandEmpty(props: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty className="py-8 text-center text-sm text-muted-foreground" {...props} />;
}

function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      className={cn(
        "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-2 text-sm outline-none data-[selected=true]:bg-accent data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem };
