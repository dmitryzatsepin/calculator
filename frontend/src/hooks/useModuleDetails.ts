// frontend/src/hooks/useModuleDetails.ts
import { useQuery, QueryKey } from '@tanstack/react-query'; // QueryKey нужен для типизации useQuery
import { useMemo } from 'react';
import { graphQLClient } from '../services/graphqlClient';
import { GET_MODULE_DETAILS } from '../graphql/calculator.gql';
import type {
  ModuleDetailsQueryResult,
  ModuleDetailsData, // Наш кастомный тип для обработанных данных
} from '../graphql/calculator.types';
// GqlModule не нужен здесь напрямую, если ModuleDetailsData его полностью описывает
// import type { Module as GqlModule } from "../generated/graphql/graphql";

export interface ModuleDetailsHookResult {
  moduleDetails: ModuleDetailsData | null; // Используем наш обработанный тип
  isLoading: boolean;
  isFetching: boolean; // Добавляем isFetching для индикации повторных запросов
  isError: boolean;
  error: Error | null;
}

const fetchModuleDetailsQuery = async (moduleCode: string): Promise<ModuleDetailsQueryResult> => {
  // console.log(`[useModuleDetails] Fetching details for module: ${moduleCode}`);
  const variables = { code: moduleCode };
  return graphQLClient.request<ModuleDetailsQueryResult>(GET_MODULE_DETAILS, variables);
};

export function useModuleDetails(moduleCode: string | null): ModuleDetailsHookResult {
  const enabled = !!moduleCode; // Запрос активен только если moduleCode предоставлен

  const {
    data: rawData, // Тип ModuleDetailsQueryResult | undefined
    isLoading,
    isFetching, // Полезно для отображения индикатора загрузки при refetch
    isError,
    error,
  } = useQuery<ModuleDetailsQueryResult, Error, ModuleDetailsQueryResult, QueryKey>({
    queryKey: ["moduleDetails", moduleCode], // moduleCode в ключе
    queryFn: () => {
      if (!moduleCode) {
        return Promise.reject(new Error("Module code is required to fetch details."));
      }
      return fetchModuleDetailsQuery(moduleCode);
    },
    enabled,
    staleTime: 1000 * 60 * 15, // 15 минут
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Обычно детали не нужно перезапрашивать при каждом монтировании, если код не изменился
  });

  // Используем useMemo для возврата moduleDetails из rawData,
  // чтобы ссылка на объект не менялась без необходимости.
  const moduleDetailsData = useMemo((): ModuleDetailsData | null => {
    return rawData?.moduleDetails ?? null;
  }, [rawData]);

  return {
    moduleDetails: moduleDetailsData,
    isLoading,
    isFetching,
    isError,
    error,
  };
}