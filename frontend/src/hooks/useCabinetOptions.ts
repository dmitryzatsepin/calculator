// frontend/src/hooks/useCabinetOptions.ts
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { graphQLClient } from '../services/graphqlClient';
import { GET_CABINET_OPTIONS } from '../graphql/calculator.gql';
import type { CabinetOptionsQueryResult } from '../graphql/calculator.types'; // Наш кастомный тип ответа
import type {
  Cabinet as GqlCabinet, // Тип для одного элемента Cabinet
  CabinetFilterInput,
  // Maybe, // Не нужен, если возвращаем очищенный массив
} from "../generated/graphql/graphql";

// GqlCabinet должен содержать поля из фрагмента CabinetOptionFields
export type ProcessedCabinetOption = GqlCabinet;

export interface CabinetOptionsHookResult {
  cabinets: ProcessedCabinetOption[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

// Определяем тип для фильтров, которые принимает хук
export interface UseCabinetOptionsFilters {
  locationCode?: string | null;
  materialCode?: string | null;
  pitchCode?: string | null;
  moduleCode?: string | null; // Кабинеты зависят от выбранного модуля
}

const fetchCabinetOptionsQuery = async (
  filters: CabinetFilterInput
): Promise<CabinetOptionsQueryResult> => {
  const variables = {
    filters,
    onlyActive: true,
  };
  // console.log("[useCabinetOptions] Fetching cabinet options with variables:", variables);
  return graphQLClient.request<CabinetOptionsQueryResult>(GET_CABINET_OPTIONS, variables);
};

export function useCabinetOptions(
  filters: UseCabinetOptionsFilters | null,
  isCabinetScreenTypeSelected: boolean // Флаг, что выбран тип экрана "кабинетный"
): CabinetOptionsHookResult {
  // Запрос активен, только если выбран кабинетный тип экрана И ВСЕ НЕОБХОДИМЫЕ фильтры переданы
  // В вашем CalculatorContext areCabinetDepsSelected проверял:
  // !!(selectedLocationCode && selectedMaterialCode && selectedPitchCode && selectedModuleCode)
  const enabled = !!(
    isCabinetScreenTypeSelected &&
    filters?.locationCode &&
    filters?.materialCode &&
    filters?.pitchCode &&
    filters?.moduleCode // Важно: кабинетные опции зависят от модуля
  );

  // Формируем filters для GraphQL запроса только если хук активен
  const queryFilters: CabinetFilterInput | undefined = useMemo(() => {
    if (!enabled || !filters) return undefined;
    return {
      locationCode: filters.locationCode || undefined,
      materialCode: filters.materialCode || undefined,
      pitchCode: filters.pitchCode || undefined,
      moduleCode: filters.moduleCode || undefined,
    };
  }, [enabled, filters]);

  const {
    data: rawData,
    isLoading,
    isError,
    error,
  } = useQuery<CabinetOptionsQueryResult, Error, CabinetOptionsQueryResult>({
    queryKey: ["cabinetOptions", queryFilters], // isCabinetScreenTypeSelected не нужен в ключе, т.к. enabled им управляет
    queryFn: () => {
      if (!queryFilters) {
        return Promise.reject(
          new Error("Filters are required to fetch cabinet options.")
        );
      }
      return fetchCabinetOptionsQuery(queryFilters);
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 минут
    refetchOnWindowFocus: false,
  });

  const processedCabinets = useMemo((): ProcessedCabinetOption[] => {
    return rawData?.cabinetOptions?.filter((cab): cab is GqlCabinet => !!cab) ?? [];
  }, [rawData]);

  return {
    cabinets: processedCabinets,
    isLoading,
    isError,
    error,
  };
}