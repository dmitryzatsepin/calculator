import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { graphQLClient } from '../services/graphqlClient';
import { GET_FILTERED_REFRESH_RATE_OPTIONS } from '../graphql/calculator.gql';
import type {
  RefreshRate as GqlRefreshRate,
  Maybe,
} from "../generated/graphql/graphql";

// Определяем тип для ответа GraphQL вручную
type FilteredRefreshRatesQueryResult = {
  getFilteredRefreshRateOptions?: Maybe<Array<Maybe<GqlRefreshRate>>>;
};

export type ProcessedRefreshRateOption = GqlRefreshRate;

export interface FilteredRefreshRatesHookResult {
  refreshRates: ProcessedRefreshRateOption[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

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
  } = useQuery<FilteredRefreshRatesQueryResult, Error>({
    queryKey: ["filteredRefreshRateOptions", locationCode, pitchCode, isFlex],
    queryFn: () =>
      graphQLClient.request(
        GET_FILTERED_REFRESH_RATE_OPTIONS,
        { locationCode, pitchCode, isFlex, onlyActive: true }
      ),
    enabled,
    staleTime: 1000 * 60 * 10,
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