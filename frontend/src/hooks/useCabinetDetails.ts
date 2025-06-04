// frontend/src/hooks/useCabinetDetails.ts
import { useQuery, QueryKey } from '@tanstack/react-query';
import { useMemo } from 'react';
import { graphQLClient } from '../services/graphqlClient';
import { GET_CABINET_DETAILS } from '../graphql/calculator.gql';
import type {
  CabinetDetailsQueryResult,
  CabinetDetailsData,
} from '../graphql/calculator.types';

export interface CabinetDetailsHookResult {
  cabinetDetails: CabinetDetailsData | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
}

const fetchCabinetDetailsQuery = async (cabinetCode: string): Promise<CabinetDetailsQueryResult> => {
  const variables = { code: cabinetCode };
  return graphQLClient.request<CabinetDetailsQueryResult>(GET_CABINET_DETAILS, variables);
};

export function useCabinetDetails(
  cabinetCode: string | null,
  isCabinetScreenTypeSelected: boolean
): CabinetDetailsHookResult {
  const enabled = isCabinetScreenTypeSelected && !!cabinetCode;
  const {
    data: rawData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery<CabinetDetailsQueryResult, Error, CabinetDetailsQueryResult, QueryKey>({
    queryKey: ["cabinetDetails", cabinetCode],
    queryFn: () => {
      if (!cabinetCode) {
        return Promise.reject(new Error("Cabinet code is required to fetch details."));
      }
      return fetchCabinetDetailsQuery(cabinetCode);
    },
    enabled,
    staleTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const cabinetDetailsData = useMemo((): CabinetDetailsData | null => {
    return rawData?.cabinetDetails ?? null;
  }, [rawData]);

  return {
    cabinetDetails: cabinetDetailsData,
    isLoading,
    isFetching,
    isError,
    error,
  };
}