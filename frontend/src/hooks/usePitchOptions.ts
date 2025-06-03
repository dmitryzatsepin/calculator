// frontend/src/hooks/usePitchOptions.ts
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { graphQLClient } from '../services/graphqlClient';
import { GET_PITCH_OPTIONS_BY_LOCATION } from '../graphql/calculator.gql';
// Вместо импорта кастомного типа ответа, будем использовать тип, сгенерированный graphql-codegen
import type {
  GetPitchOptionsByLocationQuery, // Тип полного ответа от graphql-codegen
  Pitch as GqlPitch, // Тип для одного элемента Pitch
  // Maybe, // Не нужен, если возвращаем очищенный массив
} from "../generated/graphql/graphql";

// Тип для "чистых" данных одного питча, которые мы хотим использовать
// GqlPitch уже должен содержать code и pitchValue из фрагмента PitchFields
export type ProcessedPitchOption = GqlPitch;

// Тип для полного возвращаемого значения хука
export interface PitchOptionsHookResult {
  pitches: ProcessedPitchOption[]; // Массив без Maybe для элементов
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
    data: rawData, // Это будет тип GetPitchOptionsByLocationQuery | undefined
    isLoading,
    isError,
    error,
  } = useQuery<GetPitchOptionsByLocationQuery, Error, GetPitchOptionsByLocationQuery>({
    queryKey: ["pitchOptionsByLocation", locationCode], // Изменил ключ для большей ясности
    queryFn: () => {
      if (!locationCode) {
        return Promise.reject(new Error("Location code is required to fetch pitch options."));
      }
      return fetchPitchOptionsQuery(locationCode);
    },
    enabled,
    staleTime: 1000 * 60 * 10, // 10 минут
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