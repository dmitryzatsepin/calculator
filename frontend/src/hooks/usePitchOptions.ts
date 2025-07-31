import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { graphQLClient } from '../services/graphqlClient';
import { GET_PITCH_OPTIONS_BY_LOCATION } from '../graphql/calculator.gql';
import type {
  Pitch as GqlPitch,
  Maybe,
} from "../generated/graphql/graphql";

type PitchOptionsQueryResult = {
  pitchOptionsByLocation?: Maybe<Array<Maybe<GqlPitch>>>;
};

export type ProcessedPitchOption = GqlPitch;

export interface PitchOptionsHookResult {
  pitches: ProcessedPitchOption[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export function usePitchOptions(locationCode: string | null): PitchOptionsHookResult {
  const enabled = !!locationCode;

  const {
    data: rawData,
    isLoading,
    isError,
    error,
  } = useQuery<PitchOptionsQueryResult, Error>({
    queryKey: ["pitchOptionsByLocation", locationCode],
    queryFn: () =>
      graphQLClient.request(
        GET_PITCH_OPTIONS_BY_LOCATION,
        { locationCode, onlyActive: true }
      ),
    enabled,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const processedPitches = useMemo((): ProcessedPitchOption[] => {
    // Явно указываем тип для pitch, чтобы TypeScript был спокоен
    return rawData?.pitchOptionsByLocation?.filter((pitch): pitch is GqlPitch => !!pitch) ?? [];
  }, [rawData]);

  return {
    pitches: processedPitches,
    isLoading,
    isError,
    error,
  };
}