export default function IncomeHistoryLoading() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-2 border-b border-border pb-4">
        <div className="h-7 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded bg-muted/60" />
      </div>
      <div className="h-80 w-full animate-pulse rounded-2xl border border-border/50 bg-muted/30" />
    </div>
  );
}
