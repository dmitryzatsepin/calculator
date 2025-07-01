// frontend/src/hooks/useFilteredRefreshRates.ts
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { graphQLClient } from '../services/graphqlClient';
import { GET_FILTERED_REFRESH_RATE_OPTIONS } from '../graphql/calculator.gql';
import type {
  GetFilteredRefreshRateOptionsQuery,
  RefreshRate as GqlRefreshRate,
} from "../generated/graphql/graphql";

// GqlRefreshRate уже должен содержать code и value из фрагмента RefreshRateFields
export type ProcessedRefreshRateOption = GqlRefreshRate;

export interface FilteredRefreshRatesHookResult {
  refreshRates: ProcessedRefreshRateOption[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

const fetchFilteredRefreshRatesQuery = async (
  locationCode: string,
  pitchCode: string,
  isFlex: boolean
): Promise<GetFilteredRefreshRateOptionsQuery> => {
  const variables = {
    locationCode,
    pitchCode,
    isFlex,
    onlyActive: true,
  };
  return graphQLClient.request<GetFilteredRefreshRateOptionsQuery>(
    GET_FILTERED_REFRESH_RATE_OPTIONS,
    variables
  );
};

export function useFilteredRefreshRates(
  locationCode: string | null,
  pitchCode: string | null,
  isFlex: boolean
): FilteredRefreshRatesHookResult {
  const enabled = !!locationCode && !!pitchCode;

  const {
    data: rawData,
    isLoading,
    isError,
    error,
  } = useQuery<GetFilteredRefreshRateOptionsQuery, Error, GetFilteredRefreshRateOptionsQuery>({
    queryKey: ["filteredRefreshRateOptions", locationCode, pitchCode, isFlex],
    queryFn: () => {
      if (!locationCode || !pitchCode) {
        return Promise.reject(
          new Error("Location code and Pitch code are required to fetch refresh rates.")
        );
      }
      return fetchFilteredRefreshRatesQuery(locationCode, pitchCode, isFlex);
    },
    enabled,
    staleTime: 1000 * 60 * 10, // 10 минут
    refetchOnWindowFocus: false,
  });

  const processedRefreshRates = useMemo((): ProcessedRefreshRateOption[] => {
    return rawData?.getFilteredRefreshRateOptions?.filter((rr): rr is GqlRefreshRate => !!rr) ?? [];
  }, [rawData]);

  return {
    refreshRates: processedRefreshRates,
    isLoading,
    isError,
    error,
  };
}