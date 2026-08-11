export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-40 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg border bg-muted/50" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-lg border bg-muted/50" />
    </div>
  );
}
