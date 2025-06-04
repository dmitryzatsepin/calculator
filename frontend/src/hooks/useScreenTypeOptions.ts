// frontend/src/hooks/useScreenTypeOptions.ts
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react'; // Добавляем useMemo, так как будем его использовать
import { graphQLClient } from '../services/graphqlClient';
import { GET_SCREEN_TYPE_OPTIONS } from '../graphql/calculator.gql';
import type { ScreenTypeOptionsQueryResult } from '../graphql/calculator.types';
import type {
  Option as GqlOption,
} from "../generated/graphql/graphql";

// Тип для "чистых" данных опций
export type ProcessedScreenTypeOption = Pick<GqlOption, "id" | "code" | "name" | "active">;

// Тип для полного возвращаемого значения хука
export interface ScreenTypeOptionsHookResult {
  options: ProcessedScreenTypeOption[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

// Функция для выполнения запроса
const fetchScreenTypeOptionsQuery = async (screenTypeCode: string): Promise<ScreenTypeOptionsQueryResult> => {
  const variables = { screenTypeCode, onlyActive: true };
  return graphQLClient.request<ScreenTypeOptionsQueryResult>(GET_SCREEN_TYPE_OPTIONS, variables);
};

export function useScreenTypeOptions(screenTypeCode: string | null): ScreenTypeOptionsHookResult {
  const enabled = !!screenTypeCode;

  const {
    data: rawData,
    isLoading,
    isError,
    error,
  } = useQuery<ScreenTypeOptionsQueryResult, Error, ScreenTypeOptionsQueryResult>({
    queryKey: ["screenTypeOptions", screenTypeCode],
    queryFn: () => {
      if (!screenTypeCode) {
        return Promise.reject(new Error("Screen type code is required to fetch options."));
      }
      return fetchScreenTypeOptionsQuery(screenTypeCode);
    },
    enabled,
    staleTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
  });

  // Обработка и мемоизация данных
  const processedOptions = useMemo((): ProcessedScreenTypeOption[] => {
    return rawData?.optionsByScreenType?.filter((opt): opt is ProcessedScreenTypeOption => !!opt) ?? [];
  }, [rawData]);

  return {
    options: processedOptions,
    isLoading,
    isError,
    error,
  };
}