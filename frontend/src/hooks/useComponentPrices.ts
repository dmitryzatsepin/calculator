// frontend/src/hooks/useComponentPrices.ts
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { graphQLClient } from '../services/graphqlClient';
import { GET_PRICES_BY_CODES } from '../graphql/calculator.gql';
import type { PricesQueryResult } from '../graphql/calculator.types';
import type { PriceMap } from '../types/calculationTypes';
// Поскольку PriceRequestInput не генерируется, определим его здесь
// или импортируем, если вы решите вынести его в calculator.types.ts

// Определяем структуру для переменной codes GraphQL запроса
interface GqlPriceRequestInput {
  moduleCode?: string; // Используем undefined для отсутствующих значений, как ожидает GraphQL
  cabinetCode?: string;
  itemCodes?: string[];
}

export interface ComponentPricesHookResult {
  priceMap: PriceMap;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
}

export interface PriceRequestArgs { // Тип аргументов, принимаемых хуком
  moduleCode?: string | null;
  cabinetCode?: string | null;
  itemCodes?: string[] | null;
}

const fetchComponentPricesQuery = async (
  codes: GqlPriceRequestInput // Используем наш локально определенный тип
): Promise<PricesQueryResult> => {
  if (
    !codes.moduleCode &&
    !codes.cabinetCode &&
    (!codes.itemCodes || codes.itemCodes.length === 0)
  ) {
    return { getPricesByCodes: [] };
  }
  const variables = { codes };
  return graphQLClient.request<PricesQueryResult>(GET_PRICES_BY_CODES, variables);
};

export function useComponentPrices(
  priceRequestArgs: PriceRequestArgs | null
): ComponentPricesHookResult {
  const enabled = !!(
    priceRequestArgs &&
    (priceRequestArgs.moduleCode ||
      priceRequestArgs.cabinetCode ||
      (priceRequestArgs.itemCodes && priceRequestArgs.itemCodes.length > 0))
  );

  const gqlPriceRequestInputArgs: GqlPriceRequestInput | undefined = useMemo(() => {
    if (!enabled || !priceRequestArgs) return undefined;
    // Преобразуем null в undefined для GraphQL
    return {
      moduleCode: priceRequestArgs.moduleCode ?? undefined,
      cabinetCode: priceRequestArgs.cabinetCode ?? undefined,
      itemCodes: priceRequestArgs.itemCodes ?? undefined,
    };
  }, [enabled, priceRequestArgs]);

  const {
    data: transformedData, // Переименовал, так как data после select будет PriceMap
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery<PricesQueryResult, Error, PriceMap>({
    queryKey: ["componentPrices", gqlPriceRequestInputArgs],
    queryFn: () => {
      if (!gqlPriceRequestInputArgs) {
        return Promise.reject(new Error("Price request input is required."));
      }
      return fetchComponentPricesQuery(gqlPriceRequestInputArgs);
    },
    enabled,
    staleTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    select: (data): PriceMap => {
      const priceMap: PriceMap = {};
      data?.getPricesByCodes?.forEach(item => {
        if (item?.code) {
          priceMap[item.code] = {
            usd: item.priceUsd ?? null,
            rub: item.priceRub ?? null,
          };
        }
      });
      return priceMap;
    },
  });

  return {
    priceMap: transformedData ?? {}, // transformedData здесь уже будет типа PriceMap
    isLoading,
    isFetching,
    isError,
    error,
  };
}