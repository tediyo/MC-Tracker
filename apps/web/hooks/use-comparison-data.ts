import { useQuery, keepPreviousData, type UseQueryResult } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { getComparisonData, type ComparisonData, type GetComparisonParams } from "@/lib/dashboard/get-comparison-data";

export function useComparisonData(
  userId: string,
  params: GetComparisonParams,
): UseQueryResult<ComparisonData> {
  return useQuery({
    queryKey: ["comparison-data", userId, params],
    queryFn: () => getComparisonData(createClient(), userId, params),
    placeholderData: keepPreviousData,
  });
}
