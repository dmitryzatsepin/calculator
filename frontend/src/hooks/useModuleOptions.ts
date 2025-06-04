// frontend/src/hooks/useModuleOptions.ts
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { graphQLClient } from '../services/graphqlClient';
import { GET_MODULE_OPTIONS } from '../graphql/calculator.gql';
import type { ModuleOptionsQueryResult } from '../graphql/calculator.types'; // Наш кастомный тип ответа
import type {
  Module as GqlModule, // Тип для одного элемента Module
  ModuleFilterInput,
  // Maybe, // Не нужен, если возвращаем очищенный массив
} from "../generated/graphql/graphql";

// GqlModule должен содержать поля из фрагмента ModuleOptionFields
export type ProcessedModuleOption = GqlModule;

export interface ModuleOptionsHookResult {
  modules: ProcessedModuleOption[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

// Определяем тип для фильтров, которые принимает хук
// Он может быть немного проще, чем ModuleFilterInput, если какие-то поля всегда onlyActive:true
export interface UseModuleOptionsFilters {
  locationCode?: string | null;
  pitchCode?: string | null;
  brightnessCode?: string | null;
  refreshRateCode?: string | null;
  isFlex?: boolean; // isFlex как отдельный параметр, а не часть filters для GraphQL
}

const fetchModuleOptionsQuery = async (
  filters: ModuleFilterInput, // Тип для GraphQL переменных
  isFlex: boolean // Передаем isFlex отдельно для ясности
): Promise<ModuleOptionsQueryResult> => {
  // Добавляем isFlex в объект filters, если он будет частью ModuleFilterInput в GraphQL схеме
  // Если isFlex - это отдельный параметр на верхнем уровне запроса, то переменные нужно формировать соответственно
  const gqlFilters: ModuleFilterInput & { isFlex?: boolean } = { ...filters };
  if (isFlex !== undefined) { // Или если isFlex всегда передается
    gqlFilters.isFlex = isFlex;
  }

  const variables = {
    filters: gqlFilters,
    onlyActive: true,
  };
  // console.log("[useModuleOptions] Fetching module options with variables:", variables);
  return graphQLClient.request<ModuleOptionsQueryResult>(GET_MODULE_OPTIONS, variables);
};

export function useModuleOptions(
  filters: UseModuleOptionsFilters | null, // Фильтры, которые приходят из контекста
  isFlex: boolean // isFlex всегда передаем
): ModuleOptionsHookResult {
  // Запрос активен, только если ВСЕ НЕОБХОДИМЫЕ фильтры переданы
  // В вашем CalculatorContext areModuleDepsSelected проверял:
  // !!(selectedLocationCode && selectedPitchCode && selectedBrightnessCode && selectedRefreshRateCode)
  const enabled = !!(
    filters?.locationCode &&
    filters?.pitchCode &&
    filters?.brightnessCode &&
    filters?.refreshRateCode
  );

  // Формируем filters для GraphQL запроса только если хук активен
  const queryFilters: ModuleFilterInput | undefined = useMemo(() => {
    if (!enabled || !filters) return undefined;
    return {
      locationCode: filters.locationCode || undefined,
      pitchCode: filters.pitchCode || undefined,
      brightnessCode: filters.brightnessCode || undefined,
      refreshRateCode: filters.refreshRateCode || undefined,
      // isFlex будет добавлен в fetchModuleOptionsQuery, если это часть ModuleFilterInput
      // или передан как отдельный параметр GraphQL запроса
    };
  }, [enabled, filters]);


  const {
    data: rawData,
    isLoading,
    isError,
    error,
  } = useQuery<ModuleOptionsQueryResult, Error, ModuleOptionsQueryResult>({
    // Ключ должен включать все параметры фильтрации, чтобы обеспечить уникальность и правильный refetch
    queryKey: ["moduleOptions", queryFilters, isFlex],
    queryFn: () => {
      if (!queryFilters) { // Должно быть покрыто флагом enabled
        return Promise.reject(
          new Error("Filters are required to fetch module options.")
        );
      }
      return fetchModuleOptionsQuery(queryFilters, isFlex);
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 минут
    refetchOnWindowFocus: false,
  });

  const processedModules = useMemo((): ProcessedModuleOption[] => {
    return rawData?.moduleOptions?.filter((mod): mod is GqlModule => !!mod) ?? [];
  }, [rawData]);

  return {
    modules: processedModules,
    isLoading,
    isError,
    error,
  };
}