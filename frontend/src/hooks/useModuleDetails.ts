// frontend/src/hooks/useModuleDetails.ts
import { useQuery, QueryKey } from '@tanstack/react-query';
import { useMemo } from 'react';
import { graphQLClient } from '../services/graphqlClient';
import { GET_MODULE_DETAILS } from '../graphql/calculator.gql';
import type {
  ModuleDetailsQueryResult,
  ModuleDetailsData,
} from '../graphql/calculator.types';

export interface ModuleDetailsHookResult {
  moduleDetails: ModuleDetailsData | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
}

const fetchModuleDetailsQuery = async (moduleCode: string): Promise<ModuleDetailsQueryResult> => {
  // console.log(`[useModuleDetails] Fetching details for module: ${moduleCode}`);
  const variables = { code: moduleCode };
  return graphQLClient.request<ModuleDetailsQueryResult>(GET_MODULE_DETAILS, variables);
};

export function useModuleDetails(moduleCode: string | null): ModuleDetailsHookResult {
  const enabled = !!moduleCode;

  const {
    data: rawData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery<ModuleDetailsQueryResult, Error, ModuleDetailsQueryResult, QueryKey>({
    queryKey: ["moduleDetails", moduleCode],
    queryFn: () => {
      if (!moduleCode) {
        return Promise.reject(new Error("Module code is required to fetch details."));
      }
      return fetchModuleDetailsQuery(moduleCode);
    },
    enabled,
    staleTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Используем useMemo для возврата moduleDetails из rawData
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