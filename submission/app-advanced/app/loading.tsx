export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-foreground"
          aria-hidden="true"
        />
        Loading…
      </div>
    </div>
  );
}
