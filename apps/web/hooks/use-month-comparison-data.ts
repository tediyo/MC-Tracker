import { useQuery, keepPreviousData, type UseQueryResult } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getMonthComparisonData, type MonthComparisonData } from "@/lib/dashboard/get-month-comparison-data";

export function useMonthComparisonData(
  userId: string,
  yearA: number,
  monthA: number,
  yearB: number,
  monthB: number,
): UseQueryResult<MonthComparisonData> {
  return useQuery({
    queryKey: ["month-comparison", userId, yearA, monthA, yearB, monthB],
    queryFn: () => getMonthComparisonData(createClient(), userId, yearA, monthA, yearB, monthB),
    placeholderData: keepPreviousData,
  });
}
