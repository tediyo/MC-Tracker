export default function IncomeLoading() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-44 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded bg-muted/60" />
        </div>
        <div className="h-9 w-40 animate-pulse rounded-lg bg-muted/60" />
      </div>

      <div className="h-96 w-full animate-pulse rounded-2xl border border-border/50 bg-muted/30" />
    </div>
  );
}
