import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { graphQLClient } from '../services/graphqlClient';
import { GET_MODULE_OPTIONS } from '../graphql/calculator.gql';
import type { ModuleOptionsQueryResult } from '../graphql/calculator.types';
import type {
  Module as GqlModule,
  ModuleFilterInput,
} from "../generated/graphql/graphql";

export type ProcessedModuleOption = GqlModule;

export interface ModuleOptionsHookResult {
  modules: ProcessedModuleOption[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
}

// Теперь интерфейс фильтров содержит только то, что мы реально используем
export interface UseModuleOptionsFilters {
  locationCode?: string | null;
  pitchCode?: string | null;
}

const fetchModuleOptionsQuery = async (
  filters: ModuleFilterInput,
  isFlex: boolean
): Promise<ModuleOptionsQueryResult> => {
  const gqlFilters: ModuleFilterInput & { isFlex?: boolean } = { ...filters };
  if (isFlex) {
    gqlFilters.isFlex = isFlex;
  }

  const variables = {
    filters: gqlFilters,
    onlyActive: true,
  };
  return graphQLClient.request<ModuleOptionsQueryResult>(GET_MODULE_OPTIONS, variables);
};

export function useModuleOptions(
  filters: UseModuleOptionsFilters | null,
  isFlex: boolean
): ModuleOptionsHookResult {
  // Условие включения запроса осталось прежним
  const enabled = !!(filters?.locationCode && filters?.pitchCode);

  const queryFilters: ModuleFilterInput | undefined = useMemo(() => {
    if (!enabled || !filters) {
      return undefined;
    }
    // Создаем объект только с теми полями, которые нам нужны.
    // Отсутствующие ключи будут проигнорированы GraphQL, что нам и нужно.
    const finalFilters: ModuleFilterInput = {
      locationCode: filters.locationCode,
      pitchCode: filters.pitchCode,
    };
    return finalFilters;
  }, [enabled, filters]);


  const {
    data: rawData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery<ModuleOptionsQueryResult, Error, ModuleOptionsQueryResult>({
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
    return rawData?.moduleOptions?.edges?.map(edge => edge.node).filter((mod): mod is GqlModule => !!mod) ?? [];
  }, [rawData]);

  return {
    modules: processedModules,
    isLoading,
    isFetching,
    isError,
    error,
  };
}