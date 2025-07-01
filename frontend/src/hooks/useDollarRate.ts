import { useQuery } from '@tanstack/react-query';
import { graphQLClient } from '../services/graphqlClient';
import { GET_DOLLAR_RATE } from '../graphql/calculator.gql';
import type { DollarRateQueryResult } from '../graphql/calculator.types';
import type { Maybe } from "../generated/graphql/graphql";

export interface DollarRateHookResult {
  dollarRate: Maybe<number>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

const fetchDollarRateQuery = async (): Promise<DollarRateQueryResult> => {
  return graphQLClient.request<DollarRateQueryResult>(GET_DOLLAR_RATE);
};

export function useDollarRate(enabled: boolean): DollarRateHookResult {
  const {
    data: rawData,
    isLoading,
    isError,
    error,
  } = useQuery<DollarRateQueryResult, Error, DollarRateQueryResult>({
    queryKey: ["dollarRate"],
    queryFn: fetchDollarRateQuery,
    enabled,
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  });

  const dollarRateValue = rawData?.getCurrentDollarRate ?? null;

  return {
    dollarRate: dollarRateValue,
    isLoading,
    isError,
    error,
  };
}