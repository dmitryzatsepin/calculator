// frontend/src/hooks/useFilteredBrightnesses.ts
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { graphQLClient } from '../services/graphqlClient';
import { GET_FILTERED_BRIGHTNESS_OPTIONS } from '../graphql/calculator.gql';
import type {
  GetFilteredBrightnessOptionsQuery, // Тип полного ответа от graphql-codegen
  Brightness as GqlBrightness, // Тип для одного элемента Brightness
  // Maybe, // Не нужен, если возвращаем очищенный массив
} from "../generated/graphql/graphql";

// GqlBrightness уже должен содержать code и value из фрагмента BrightnessFields
export type ProcessedBrightnessOption = GqlBrightness;

export interface FilteredBrightnessesHookResult {
  brightnesses: ProcessedBrightnessOption[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

const fetchFilteredBrightnessesQuery = async (
  locationCode: string,
  pitchCode: string,
  refreshRateCode: string,
  isFlex: boolean
): Promise<GetFilteredBrightnessOptionsQuery> => {
  const variables = {
    locationCode,
    pitchCode,
    refreshRateCode,
    isFlex,
    onlyActive: true,
  };
  return graphQLClient.request<GetFilteredBrightnessOptionsQuery>(
    GET_FILTERED_BRIGHTNESS_OPTIONS,
    variables
  );
};

export function useFilteredBrightnesses(
  locationCode: string | null,
  pitchCode: string | null,
  refreshRateCode: string | null,
  isFlex: boolean // isFlex не может быть null, передаем его всегда
): FilteredBrightnessesHookResult {
  // Запрос активен только если ВСЕ необходимые параметры предоставлены
  const enabled = !!locationCode && !!pitchCode && !!refreshRateCode;

  const {
    data: rawData,
    isLoading,
    isError,
    error,
  } = useQuery<GetFilteredBrightnessOptionsQuery, Error, GetFilteredBrightnessOptionsQuery>({
    queryKey: ["filteredBrightnessOptions", locationCode, pitchCode, refreshRateCode, isFlex],
    queryFn: () => {
      if (!locationCode || !pitchCode || !refreshRateCode) {
        return Promise.reject(
          new Error("Location, Pitch, and RefreshRate codes are required to fetch brightness options.")
        );
      }
      return fetchFilteredBrightnessesQuery(locationCode, pitchCode, refreshRateCode, isFlex);
    },
    enabled,
    staleTime: 1000 * 60 * 10, // 10 минут
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