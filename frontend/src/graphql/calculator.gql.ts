// frontend/src/graphql/calculator.gql.ts
import { gql } from "graphql-request";

// --- GraphQL Фрагменты ---
export const OptionFields = gql`
  fragment OptionFields on Option {
    id
    code
    name
    active
  }
`;
export const LocationFields = gql`
  fragment LocationFields on Location {
    id
    code
    name
    active
  }
`;
export const MaterialFields = gql`
  fragment MaterialFields on Material {
    id
    code
    name
    active
  }
`;
export const PitchFields = gql`
  fragment PitchFields on Pitch {
    id
    code
    pitchValue
    active
  }
`;
export const BrightnessFields = gql`
  fragment BrightnessFields on Brightness {
    id
    code
    value
    active
  }
`;
export const RefreshRateFields = gql`
  fragment RefreshRateFields on RefreshRate {
    id
    code
    value
    active
  }
`;
export const SensorFields = gql`
  fragment SensorFields on Sensor {
    id
    code
    name
    active
  }
`;
export const ControlTypeFields = gql`
  fragment ControlTypeFields on ControlType {
    id
    code
    name
    active
  }
`;
export const ModuleOptionFields = gql`
  fragment ModuleOptionFields on Module {
    id
    code
    sku
    name
    active
    brightnesses {
      brightnessCode
    }
    refreshRates {
      refreshRateCode
    }
  }
`;
export const CabinetOptionFields = gql`
  fragment CabinetOptionFields on Cabinet {
    id
    code
    sku
    name
    active
  }
`;

// --- GraphQL Запросы ---
export const GET_INITIAL_DATA = gql`
  ${LocationFields}
  ${MaterialFields}
  ${SensorFields}
  ${ControlTypeFields}

  query GetInitialData {
    screenTypes(onlyActive: true) {
      id
      code
      name
    }
    locations {
      ...LocationFields
    }
    materials {
      ...MaterialFields
    }
    ipProtections(onlyActive: true) {
      id
      code
    }
    sensors(onlyActive: true) {
      ...SensorFields
    }
    controlTypes(onlyActive: true) {
      ...ControlTypeFields
    }
  }
`;
export const GET_SCREEN_TYPE_OPTIONS = gql`
  ${OptionFields}
  query GetScreenTypeOptions($screenTypeCode: String!, $onlyActive: Boolean) {
    optionsByScreenType(
      screenTypeCode: $screenTypeCode
      onlyActive: $onlyActive
    ) {
      ...OptionFields
    }
  }
`;
export const GET_PITCH_OPTIONS_BY_LOCATION = gql`
  ${PitchFields}
  query GetPitchOptionsByLocation(
    $locationCode: String!
    $onlyActive: Boolean
  ) {
    pitchOptionsByLocation(
      locationCode: $locationCode
      onlyActive: $onlyActive
    ) {
      ...PitchFields
    }
  }
`;
export const GET_FILTERED_REFRESH_RATE_OPTIONS = gql`
  ${RefreshRateFields}
  query GetFilteredRefreshRateOptions(
    $locationCode: String!
    $pitchCode: String!
    $onlyActive: Boolean
    $isFlex: Boolean
  ) {
    getFilteredRefreshRateOptions(
      locationCode: $locationCode
      pitchCode: $pitchCode
      onlyActive: $onlyActive
      isFlex: $isFlex
    ) {
      ...RefreshRateFields
    }
  }
`;
export const GET_FILTERED_BRIGHTNESS_OPTIONS = gql`
  ${BrightnessFields}
  query GetFilteredBrightnessOptions(
    $locationCode: String!
    $pitchCode: String!
    $refreshRateCode: String!
    $onlyActive: Boolean
    $isFlex: Boolean
  ) {
    getFilteredBrightnessOptions(
      locationCode: $locationCode
      pitchCode: $pitchCode
      refreshRateCode: $refreshRateCode
      onlyActive: $onlyActive
      isFlex: $isFlex
    ) {
      ...BrightnessFields
    }
  }
`;
export const GET_MODULE_OPTIONS = gql`
  ${ModuleOptionFields}
  query GetModuleOptions($filters: ModuleFilterInput, $onlyActive: Boolean) {
    moduleOptions(filters: $filters, onlyActive: $onlyActive) {
      edges {
        node {
          ...ModuleOptionFields
        }
      }
    }
  }
`;
export const GET_CABINET_OPTIONS = gql`
  ${CabinetOptionFields}
  query GetCabinetOptions($filters: CabinetFilterInput, $onlyActive: Boolean) {
    cabinetOptions(filters: $filters, onlyActive: $onlyActive) {
      ...CabinetOptionFields
    }
  }
`;
export const GET_DOLLAR_RATE = gql`
  query GetDollarRate {
    getCurrentDollarRate
  }
`;
export const GET_MODULE_DETAILS = gql`
  query GetModuleDetails($code: String!) {
    moduleDetails(code: $code) {
      code
      sku
      name
      moduleOption
      active
      sizes {
        width
        height
      }
      brightness
      refreshRate
      # items { quantity item { code name sku } }
      # powerConsumptionAvg
      # powerConsumptionMax
    }
  }
`;
export const GET_CABINET_DETAILS = gql`
  query GetCabinetDetails($code: String!) {
    cabinetDetails(code: $code) {
      code
      sku
      name
      active
      # createdAt
      # updatedAt
      sizes {
        size {
          width
          height
        }
      }
    }
  }
`;
export const GET_PRICES_BY_CODES = gql`
  query GetPricesByCodes($codes: PriceRequestInput!) {
    getPricesByCodes(codes: $codes) {
      code
      priceUsd
      priceRub
    }
  }
`;


export const VideoProcessorFields = gql`
  fragment VideoProcessorFields on VideoProcessor {
    id
    code
    name
    maxResolutionX
    maxResolutionY
    priceUsd
    priceRub
  }
`;

export const GET_VIDEO_PROCESSORS = gql`
  ${VideoProcessorFields}
  query GetVideoProcessors {
    videoProcessors(onlyActive: true) {
      ...VideoProcessorFields
    }
  }
`;