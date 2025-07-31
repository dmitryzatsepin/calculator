// frontend/src/graphql/calculator.types.ts
import type {
  ScreenType as GqlScreenType,
  Option as GqlOption,
  Location as GqlLocation,
  Material as GqlMaterial,
  IpProtection as GqlIpProtection,
  Sensor as GqlSensor,
  ControlType as GqlControlType,
  Module as GqlModule,
  Cabinet as GqlCabinet,
  Maybe,
  VideoProcessor as GqlVideoProcessor,
} from "../generated/graphql/graphql";

// --- Типы для ответов GraphQL из calculator.gql.ts ---

export type VideoProcessor = GqlVideoProcessor;

export type InitialDataQueryResult = {
  screenTypes: Maybe<Array<Maybe<Pick<GqlScreenType, "id" | "code" | "name">>>>;
  locations: Maybe<Array<Maybe<GqlLocation>>>;
  materials: Maybe<Array<Maybe<GqlMaterial>>>;
  ipProtections: Maybe<Array<Maybe<Pick<GqlIpProtection, "id" | "code">>>>;
  sensors: Maybe<Array<Maybe<GqlSensor>>>;
  controlTypes: Maybe<Array<Maybe<GqlControlType>>>;
};
export type ScreenTypeOptionsQueryResult = {
  optionsByScreenType: Maybe<Array<Maybe<Pick<GqlOption, "id" | "code" | "name" | "active">>>>;
};
export type ModuleOptionsQueryResult = {
  moduleOptions: Maybe<{
    edges: Array<{
      node: Maybe<GqlModule>
    }>
  }>
};
export type CabinetOptionsQueryResult = {
  cabinetOptions: Maybe<Array<Maybe<GqlCabinet>>>;
};
export type DollarRateQueryResult = {
  getCurrentDollarRate: Maybe<number>;
};
export type PriceQueryResultItem = {
  code: string;
  priceUsd: Maybe<number>;
  priceRub: Maybe<number>;
};
export type PricesQueryResult = {
  getPricesByCodes: Maybe<Array<Maybe<PriceQueryResultItem>>>;
};
export type ModuleDetailsGqlItemComponentData = {
  quantity: number;
  item: { code: string; name: string; sku?: string | null };
};
export type ModuleDetailsSizeData = {
  width: number;
  height: number;
};
export type ModuleDetailsData = {
  code: string;
  sku?: string | null;
  name?: string | null;
  moduleOption?: string | null;
  active?: boolean;
  sizes?: Maybe<Array<Maybe<ModuleDetailsSizeData>>>;
  items?: Maybe<Array<Maybe<ModuleDetailsGqlItemComponentData>>>;
  powerConsumptionAvg?: number | null;
  powerConsumptionMax?: number | null;
  brightness?: number | null;
  refreshRate?: number | null;
};
export type ModuleDetailsQueryResult = {
  moduleDetails: Maybe<ModuleDetailsData>;
};
export type CabinetDetailsSizeInfoData = {
  width: number;
  height: number;
};
export type CabinetDetailsSizeLinkData = {
  size?: Maybe<CabinetDetailsSizeInfoData>;
};
export type CabinetDetailsData = {
  code: string;
  sku?: string | null;
  name?: string | null;
  active?: boolean;
  sizes?: Maybe<Array<Maybe<CabinetDetailsSizeLinkData>>>;
};

export type CabinetDetailsQueryResult = {
  cabinetDetails: Maybe<CabinetDetailsData>;
};