// frontend/src/hooks/useModuleOptions.ts
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { graphQLClient } from '../services/graphqlClient';
import { GET_MODULE_OPTIONS } from '../graphql/calculator.gql';
import type { ModuleOptionsQueryResult } from '../graphql/calculator.types';
import type {
  Module as GqlModule,
  ModuleFilterInput,
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
  isFlex?: boolean;
}

const fetchModuleOptionsQuery = async (
  filters: ModuleFilterInput,
  isFlex: boolean
): Promise<ModuleOptionsQueryResult> => {
  const gqlFilters: ModuleFilterInput & { isFlex?: boolean } = { ...filters };
  if (isFlex !== undefined) {
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
  filters: UseModuleOptionsFilters | null,
  isFlex: boolean
): ModuleOptionsHookResult {
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
      if (!queryFilters) {
        return Promise.reject(
          new Error("Filters are required to fetch module options.")
        );
      }
      return fetchModuleOptionsQuery(queryFilters, isFlex);
    },
    enabled,
    staleTime: 1000 * 60 * 5,
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