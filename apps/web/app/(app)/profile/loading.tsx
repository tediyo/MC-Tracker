export default function ProfileLoading() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div className="h-8 w-36 animate-pulse rounded-lg bg-muted" />

      <div className="h-32 w-full animate-pulse rounded-2xl border border-border/50 bg-muted/40" />
      <div className="h-44 w-full animate-pulse rounded-2xl border border-border/50 bg-muted/30" />
      <div className="h-44 w-full animate-pulse rounded-2xl border border-border/50 bg-muted/30" />
    </div>
  );
}
