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

export interface UseModuleOptionsFilters {
  locationCode?: string | null;
  pitchCode?: string | null;
}

export function useModuleOptions(
  filters: UseModuleOptionsFilters | null,
  isFlex: boolean
): ModuleOptionsHookResult {
  // Условие для запуска запроса: должны быть выбраны и локация, и шаг пикселя
  const enabled = !!(filters?.locationCode && filters?.pitchCode);

  const {
    data: rawData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery<ModuleOptionsQueryResult, Error>({
    queryKey: ["moduleOptions", filters, isFlex],

    queryFn: () => {
      const gqlFilters: ModuleFilterInput = {
        locationCode: filters!.locationCode,
        pitchCode: filters!.pitchCode,
      };

      if (isFlex) {
        gqlFilters.isFlex = true;
      }

      const variables = {
        filters: gqlFilters,
        onlyActive: true,
      };

      return graphQLClient.request<ModuleOptionsQueryResult>(GET_MODULE_OPTIONS, variables);
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