export default function PlansLoading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-64 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-80 animate-pulse rounded bg-muted/60" />
        </div>
      </div>

      <div className="h-16 w-full animate-pulse rounded-2xl border border-border/50 bg-muted/40" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 13 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-2xl border border-border/50 bg-muted/30" />
        ))}
      </div>
    </div>
  );
}
