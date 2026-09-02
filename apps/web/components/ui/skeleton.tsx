import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted shimmer-effect animate-pulse",
        className
      )}
      {...props}
    />
  );
}

export function WebDashboardSkeleton() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-xl border border-border bg-card space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-36" />
          </div>
        ))}
      </div>

      {/* Analytics Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-border bg-card space-y-4">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <div className="p-6 rounded-xl border border-border bg-card space-y-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>

      {/* Recent Transactions Skeleton */}
      <div className="p-6 rounded-xl border border-border bg-card space-y-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function WebTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 w-full">
      <Skeleton className="h-10 w-full rounded-lg" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
          <div className="space-y-2 flex-1 max-w-sm">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      ))}
    </div>
  );
}
