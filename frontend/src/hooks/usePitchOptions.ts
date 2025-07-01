// frontend/src/hooks/usePitchOptions.ts
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { graphQLClient } from '../services/graphqlClient';
import { GET_PITCH_OPTIONS_BY_LOCATION } from '../graphql/calculator.gql';
import type {
  GetPitchOptionsByLocationQuery,
  Pitch as GqlPitch,
} from "../generated/graphql/graphql";

// Тип для "чистых" данных одного питча, которые мы хотим использовать
export type ProcessedPitchOption = GqlPitch;

// Тип для полного возвращаемого значения хука
export interface PitchOptionsHookResult {
  pitches: ProcessedPitchOption[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

// Функция для выполнения запроса
const fetchPitchOptionsQuery = async (locationCode: string): Promise<GetPitchOptionsByLocationQuery> => {
  // console.log(`[usePitchOptions] Fetching pitch options for location: ${locationCode}`);
  const variables = { locationCode, onlyActive: true };
  return graphQLClient.request<GetPitchOptionsByLocationQuery>(GET_PITCH_OPTIONS_BY_LOCATION, variables);
};

export function usePitchOptions(locationCode: string | null): PitchOptionsHookResult {
  const enabled = !!locationCode;

  const {
    data: rawData,
    isLoading,
    isError,
    error,
  } = useQuery<GetPitchOptionsByLocationQuery, Error, GetPitchOptionsByLocationQuery>({
    queryKey: ["pitchOptionsByLocation", locationCode],
    queryFn: () => {
      if (!locationCode) {
        return Promise.reject(new Error("Location code is required to fetch pitch options."));
      }
      return fetchPitchOptionsQuery(locationCode);
    },
    enabled,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  // Обработка и мемоизация данных
  const processedPitches = useMemo((): ProcessedPitchOption[] => {
    // console.log("[usePitchOptions] Memoizing processedPitches, rawData changed:", rawData);
    return rawData?.pitchOptionsByLocation?.filter((pitch): pitch is GqlPitch => !!pitch) ?? [];
  }, [rawData]);

  return {
    pitches: processedPitches,
    isLoading,
    isError,
    error,
  };
}