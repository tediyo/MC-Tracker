import { useQuery, keepPreviousData, type UseQueryResult } from "@tanstack/react-query";
import type { TimeFrame } from "@mc-tracker/shared-types";
import { createClient } from "@/lib/supabase/client";
import { getDashboardData, type DashboardData } from "@/lib/dashboard/get-dashboard-data";

/**
 * Keyed on [userId, timeframe, referenceDate] so switching either
 * refetches directly against Supabase from the browser client - no Route
 * Handler proxy. `initialData` (seeded from the server-rendered first
 * paint) avoids a refetch flash for the default key. `placeholderData:
 * keepPreviousData` means switching timeframe/period keeps showing the
 * PREVIOUS period's numbers (dimmed via `isFetching` in the caller) while
 * the new period loads, rather than either a blank screen or - worse -
 * silently mismatched data from a different period.
 */
export function useDashboardData(
  userId: string,
  timeframe: TimeFrame,
  referenceDate: Date,
  initialData?: DashboardData,
): UseQueryResult<DashboardData> {
  const referenceDateIso = referenceDate.toISOString().slice(0, 10);

  return useQuery({
    queryKey: ["dashboard", userId, timeframe, referenceDateIso],
    queryFn: () => getDashboardData(createClient(), userId, timeframe, referenceDate),
    initialData,
    placeholderData: keepPreviousData,
  });
}
