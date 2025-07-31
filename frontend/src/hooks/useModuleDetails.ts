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

export function useModuleDetails(moduleCode: string | null): ModuleDetailsHookResult {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery<ModuleDetailsQueryResult, Error, ModuleDetailsQueryResult, QueryKey>({
    queryKey: ["moduleDetails", moduleCode],
    queryFn: () => {
      if (!moduleCode) {
        return Promise.resolve({ moduleDetails: null });
      }
      console.log('>>> [useModuleDetails] ОТПРАВКА ЗАПРОСА С КОДОМ:', moduleCode);
      return graphQLClient.request(GET_MODULE_DETAILS, { code: moduleCode });
    },

    enabled: !!moduleCode,

    staleTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const moduleDetails = useMemo((): ModuleDetailsData | null => {
    return data?.moduleDetails ?? null;
  }, [data]);

  return {
    moduleDetails,
    isLoading,
    isFetching,
    isError,
    error,
  };
}