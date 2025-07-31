import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { graphQLClient } from '../services/graphqlClient';
import { GET_FILTERED_BRIGHTNESS_OPTIONS } from '../graphql/calculator.gql';
import type {
  Brightness as GqlBrightness,
  Maybe,
} from "../generated/graphql/graphql";

// Определяем тип для ответа GraphQL вручную
type FilteredBrightnessesQueryResult = {
  getFilteredBrightnessOptions?: Maybe<Array<Maybe<GqlBrightness>>>;
};

export type ProcessedBrightnessOption = GqlBrightness;

export interface FilteredBrightnessesHookResult {
  brightnesses: ProcessedBrightnessOption[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export function useFilteredBrightnesses(
  locationCode: string | null,
  pitchCode: string | null,
  refreshRateCode: string | null,
  isFlex: boolean
): FilteredBrightnessesHookResult {
  const enabled = !!locationCode && !!pitchCode && !!refreshRateCode;

  const {
    data: rawData,
    isLoading,
    isError,
    error,
  } = useQuery<FilteredBrightnessesQueryResult, Error>({
    queryKey: ["filteredBrightnessOptions", locationCode, pitchCode, refreshRateCode, isFlex],
    queryFn: () =>
      graphQLClient.request(
        GET_FILTERED_BRIGHTNESS_OPTIONS,
        { locationCode, pitchCode, refreshRateCode, isFlex, onlyActive: true }
      ),
    enabled,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const processedBrightnesses = useMemo((): ProcessedBrightnessOption[] => {
    return rawData?.getFilteredBrightnessOptions?.filter((br): br is GqlBrightness => !!br) ?? [];
  }, [rawData]);

  return {
    brightnesses: processedBrightnesses,
    isLoading,
    isError,
    error,
  };
}