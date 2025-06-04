// frontend/src/hooks/useDollarRate.ts
import { useQuery } from '@tanstack/react-query';
import { graphQLClient } from '../services/graphqlClient';
import { GET_DOLLAR_RATE } from '../graphql/calculator.gql';
import type { DollarRateQueryResult } from '../graphql/calculator.types';
import type { Maybe } from "../generated/graphql/graphql"; // Если getCurrentDollarRate может быть null

export interface DollarRateHookResult {
  dollarRate: Maybe<number>; // Может быть числом или null (или undefined, если Maybe это допускает)
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

const fetchDollarRateQuery = async (): Promise<DollarRateQueryResult> => {
  // console.log("[useDollarRate] Fetching dollar rate");
  return graphQLClient.request<DollarRateQueryResult>(GET_DOLLAR_RATE);
};

export function useDollarRate(): DollarRateHookResult {
  const {
    data: rawData, // Тип DollarRateQueryResult | undefined
    isLoading,
    isError,
    error,
  } = useQuery<DollarRateQueryResult, Error, DollarRateQueryResult>({
    queryKey: ["dollarRate"],
    queryFn: fetchDollarRateQuery,
    staleTime: 1000 * 60 * 60, // 1 час
    refetchOnWindowFocus: false, // Можно оставить true, если курс должен часто обновляться при фокусе
    refetchOnMount: true, // Запрашивать при монтировании
    retry: 2, // Попробовать 2 раза в случае ошибки
  });

  // Данные уже в нужном формате, дополнительная обработка useMemo не обязательна,
  // если только нет сложной логики извлечения или трансформации.
  // React Query сам мемоизирует результат `data`.
  const dollarRateValue = rawData?.getCurrentDollarRate ?? null; // Обеспечиваем null, если undefined

  return {
    dollarRate: dollarRateValue,
    isLoading,
    isError,
    error,
  };
}