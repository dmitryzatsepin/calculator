/* eslint-disable */
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date string, such as 2007-12-03, compliant with the `full-date` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  Date: { input: any; output: any; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: any; output: any; }
};

/** Результат успешной аутентификации */
export type AuthPayload = {
  __typename?: 'AuthPayload';
  token?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
};

export type Brightness = Node & {
  __typename?: 'Brightness';
  active?: Maybe<Scalars['Boolean']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  value?: Maybe<Scalars['Int']['output']>;
};

export type Cabinet = Node & {
  __typename?: 'Cabinet';
  active?: Maybe<Scalars['Boolean']['output']>;
  categories?: Maybe<Array<ItemCategory>>;
  code?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  items?: Maybe<CabinetItemsConnection>;
  locations?: Maybe<Array<Location>>;
  manufacturers?: Maybe<Array<Manufacturer>>;
  materials?: Maybe<Array<Material>>;
  name?: Maybe<Scalars['String']['output']>;
  pitches?: Maybe<Array<Pitch>>;
  placements?: Maybe<Array<Placement>>;
  price?: Maybe<CabinetPrice>;
  sizes?: Maybe<Array<CabinetCabinetSize>>;
  sku?: Maybe<Scalars['String']['output']>;
  subcategories?: Maybe<Array<ItemSubcategory>>;
  suppliers?: Maybe<Array<Supplier>>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type CabinetItemsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type CabinetCabinetSize = {
  __typename?: 'CabinetCabinetSize';
  cabinet?: Maybe<Cabinet>;
  cabinetCode?: Maybe<Scalars['String']['output']>;
  cabinetSizeCode?: Maybe<Scalars['String']['output']>;
  size?: Maybe<CabinetSize>;
};

export type CabinetFilterInput = {
  locationCode?: InputMaybe<Scalars['String']['input']>;
  materialCode?: InputMaybe<Scalars['String']['input']>;
  moduleCode?: InputMaybe<Scalars['String']['input']>;
  pitchCode?: InputMaybe<Scalars['String']['input']>;
};

export type CabinetItemComponent = {
  __typename?: 'CabinetItemComponent';
  item?: Maybe<Item>;
  quantity?: Maybe<Scalars['Int']['output']>;
};

export type CabinetItemsConnection = {
  __typename?: 'CabinetItemsConnection';
  edges?: Maybe<Array<Maybe<CabinetItemsConnectionEdge>>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type CabinetItemsConnectionEdge = {
  __typename?: 'CabinetItemsConnectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<CabinetItemComponent>;
};

export type CabinetPrice = Node & {
  __typename?: 'CabinetPrice';
  id: Scalars['ID']['output'];
  priceRub?: Maybe<Scalars['Float']['output']>;
  priceUsd?: Maybe<Scalars['Float']['output']>;
};

export type CabinetSize = Node & {
  __typename?: 'CabinetSize';
  active?: Maybe<Scalars['Boolean']['output']>;
  /** Кабинеты, имеющие данный размер. */
  cabinets?: Maybe<Array<Cabinet>>;
  code?: Maybe<Scalars['String']['output']>;
  /** Размеры модулей, совместимые с данным размером кабинета. */
  compatibleModuleSizes?: Maybe<Array<ModuleSize>>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  height?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  size?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  width?: Maybe<Scalars['Int']['output']>;
};


export type CabinetSizeCabinetsArgs = {
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type CabinetSizeCompatibleModuleSizesArgs = {
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ControlType = Node & {
  __typename?: 'ControlType';
  active?: Maybe<Scalars['Boolean']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type IpProtection = Node & {
  __typename?: 'IpProtection';
  active?: Maybe<Scalars['Boolean']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  protectionSolid?: Maybe<Scalars['String']['output']>;
  protectionWater?: Maybe<Scalars['String']['output']>;
};

export type Item = Node & {
  __typename?: 'Item';
  active?: Maybe<Scalars['Boolean']['output']>;
  categories?: Maybe<Array<ItemCategory>>;
  code?: Maybe<Scalars['String']['output']>;
  comment?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  price?: Maybe<ItemPrice>;
  sku?: Maybe<Scalars['String']['output']>;
  subcategories?: Maybe<Array<ItemSubcategory>>;
  suppliers?: Maybe<Array<Supplier>>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type ItemCategory = Node & {
  __typename?: 'ItemCategory';
  active?: Maybe<Scalars['Boolean']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type ItemPrice = Node & {
  __typename?: 'ItemPrice';
  id: Scalars['ID']['output'];
  priceRub?: Maybe<Scalars['Float']['output']>;
  priceUsd?: Maybe<Scalars['Float']['output']>;
};

export type ItemSubcategory = Node & {
  __typename?: 'ItemSubcategory';
  active?: Maybe<Scalars['Boolean']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type Location = Node & {
  __typename?: 'Location';
  active?: Maybe<Scalars['Boolean']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

/** Данные для входа пользователя */
export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Manufacturer = Node & {
  __typename?: 'Manufacturer';
  active?: Maybe<Scalars['Boolean']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type Material = Node & {
  __typename?: 'Material';
  active?: Maybe<Scalars['Boolean']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type Module = Node & {
  __typename?: 'Module';
  active?: Maybe<Scalars['Boolean']['output']>;
  brightnesses?: Maybe<Array<ModuleBrightness>>;
  categories?: Maybe<Array<ItemCategory>>;
  code?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  items?: Maybe<Array<ModuleItemComponent>>;
  locations?: Maybe<Array<Location>>;
  manufacturers?: Maybe<Array<Manufacturer>>;
  moduleOption?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  options?: Maybe<Array<Option>>;
  pitches?: Maybe<Array<Pitch>>;
  price?: Maybe<ModulePrice>;
  refreshRates?: Maybe<Array<ModuleRefreshRate>>;
  sizes?: Maybe<Array<ModuleSize>>;
  sku?: Maybe<Scalars['String']['output']>;
  subcategories?: Maybe<Array<ItemSubcategory>>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type ModuleSizesArgs = {
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ModuleBrightness = {
  __typename?: 'ModuleBrightness';
  brightnessCode?: Maybe<Scalars['String']['output']>;
  moduleCode?: Maybe<Scalars['String']['output']>;
};

export type ModuleFilterInput = {
  brightnessCode?: InputMaybe<Scalars['String']['input']>;
  isFlex?: InputMaybe<Scalars['Boolean']['input']>;
  locationCode?: InputMaybe<Scalars['String']['input']>;
  pitchCode?: InputMaybe<Scalars['String']['input']>;
  refreshRateCode?: InputMaybe<Scalars['String']['input']>;
};

export type ModuleItemComponent = {
  __typename?: 'ModuleItemComponent';
  item?: Maybe<Item>;
  quantity?: Maybe<Scalars['Int']['output']>;
};

export type ModuleModuleSize = {
  __typename?: 'ModuleModuleSize';
  moduleCode?: Maybe<Scalars['String']['output']>;
  moduleSizeCode?: Maybe<Scalars['String']['output']>;
  size?: Maybe<ModuleSize>;
};

export type ModulePrice = Node & {
  __typename?: 'ModulePrice';
  id: Scalars['ID']['output'];
  module?: Maybe<Module>;
  moduleCode?: Maybe<Scalars['String']['output']>;
  priceRub?: Maybe<Scalars['Float']['output']>;
  priceUsd?: Maybe<Scalars['Float']['output']>;
};

export type ModuleRefreshRate = Node & {
  __typename?: 'ModuleRefreshRate';
  id: Scalars['ID']['output'];
  module?: Maybe<Module>;
  moduleCode?: Maybe<Scalars['String']['output']>;
  refreshRate?: Maybe<RefreshRate>;
  refreshRateCode?: Maybe<Scalars['String']['output']>;
};

export type ModuleSize = Node & {
  __typename?: 'ModuleSize';
  active?: Maybe<Scalars['Boolean']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  /** Размеры кабинетов, совместимые с данным размером модуля. */
  compatibleCabinetSizes?: Maybe<Array<CabinetSize>>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  height?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  /** Модули, имеющие данный размер. */
  modules?: Maybe<Array<Module>>;
  size?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  width?: Maybe<Scalars['Int']['output']>;
};


export type ModuleSizeCompatibleCabinetSizesArgs = {
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type ModuleSizeModulesArgs = {
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Аутентификация пользователя по email и паролю. */
  login?: Maybe<AuthPayload>;
  /** Регистрация нового пользователя. */
  register?: Maybe<User>;
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationRegisterArgs = {
  input: RegisterInput;
};

export type Node = {
  id: Scalars['ID']['output'];
};

export type Option = Node & {
  __typename?: 'Option';
  active?: Maybe<Scalars['Boolean']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Pitch = Node & {
  __typename?: 'Pitch';
  active?: Maybe<Scalars['Boolean']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  /** Модули, имеющие данный шаг пикселя. */
  modules?: Maybe<Array<Module>>;
  pitchValue?: Maybe<Scalars['Float']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};


export type PitchModulesArgs = {
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Placement = Node & {
  __typename?: 'Placement';
  active?: Maybe<Scalars['Boolean']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type PriceInfo = {
  __typename?: 'PriceInfo';
  code?: Maybe<Scalars['String']['output']>;
  priceRub?: Maybe<Scalars['Float']['output']>;
  priceUsd?: Maybe<Scalars['Float']['output']>;
};

export type PriceRequestInput = {
  cabinetCode?: InputMaybe<Scalars['String']['input']>;
  itemCodes?: InputMaybe<Array<Scalars['String']['input']>>;
  moduleCode?: InputMaybe<Scalars['String']['input']>;
};

export type Query = {
  __typename?: 'Query';
  /** Получить кабинет по коду */
  cabinetByCode?: Maybe<Cabinet>;
  /** Получить детальную информацию о кабинете */
  cabinetDetails?: Maybe<Cabinet>;
  /** Получить отфильтрованный список кабинетов */
  cabinetOptions?: Maybe<Array<Cabinet>>;
  /** Получить список всех кабинетов */
  cabinets?: Maybe<Array<Cabinet>>;
  /** [Устарело] Кабинеты по шагу пикселя */
  cabinetsByPitch?: Maybe<Array<Cabinet>>;
  /** Получить список всех доступных типов управления. */
  controlTypes?: Maybe<Array<ControlType>>;
  /** Получить текущий курс доллара США от ЦБ РФ. Ищет последний доступный курс за последние 7 дней. */
  getCurrentDollarRate?: Maybe<Scalars['Float']['output']>;
  /** Получить доступные значения яркости для модулей, подходящих под фильтры. */
  getFilteredBrightnessOptions?: Maybe<Array<Brightness>>;
  /** Получить доступные значения частоты обновления для модулей, подходящих под фильтры. */
  getFilteredRefreshRateOptions?: Maybe<Array<RefreshRate>>;
  /** Получить цены для списка кодов модулей, кабинетов и комплектующих. */
  getPricesByCodes?: Maybe<Array<PriceInfo>>;
  /** Получить одну степень IP-защиты по ее коду. */
  ipProtectionByCode?: Maybe<IpProtection>;
  /** Получить список всех степеней IP-защиты. */
  ipProtections?: Maybe<Array<IpProtection>>;
  itemByCode?: Maybe<Item>;
  items?: Maybe<QueryItemsConnection>;
  /** Получить одну локацию по ее уникальному коду. */
  locationByCode?: Maybe<Location>;
  /** Получить список всех активных локаций, отсортированных по имени. */
  locations?: Maybe<Array<Location>>;
  /** Получить один материал по его уникальному коду. */
  materialByCode?: Maybe<Material>;
  /** Получить список всех материалов. */
  materials?: Maybe<Array<Material>>;
  moduleByCode?: Maybe<Module>;
  /** Получить подробную информацию о модуле по его коду. */
  moduleDetails?: Maybe<Module>;
  /** Получить отфильтрованный список модулей для выбора. */
  moduleOptions?: Maybe<QueryModuleOptionsConnection>;
  node?: Maybe<Node>;
  nodes: Array<Maybe<Node>>;
  /** Получить список опций, доступных для указанного типа экрана. */
  optionsByScreenType?: Maybe<Array<Option>>;
  /** Получить один шаг пикселя по его коду. */
  pitchByCode?: Maybe<Pitch>;
  /** Получить доступные шаги пикселя для модулей, подходящих под указанное расположение. */
  pitchOptionsByLocation?: Maybe<Array<Pitch>>;
  /** Получить список всех шагов пикселя. */
  pitches?: Maybe<Array<Pitch>>;
  /** Получить список всех значений частоты обновления. */
  refreshRates?: Maybe<Array<RefreshRate>>;
  /** Получить один тип экрана по его уникальному коду. */
  screenTypeByCode?: Maybe<ScreenType>;
  /** Получить список всех типов экранов. */
  screenTypes?: Maybe<Array<ScreenType>>;
  /** Получить список всех доступных сенсоров. */
  sensors?: Maybe<Array<Sensor>>;
  /** Получить список всех активных видеопроцессоров, отсортированных по цене. */
  videoProcessors?: Maybe<Array<VideoProcessor>>;
};


export type QueryCabinetByCodeArgs = {
  code: Scalars['String']['input'];
};


export type QueryCabinetDetailsArgs = {
  code: Scalars['String']['input'];
};


export type QueryCabinetOptionsArgs = {
  filters?: InputMaybe<CabinetFilterInput>;
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryCabinetsArgs = {
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryCabinetsByPitchArgs = {
  pitchCode: Scalars['String']['input'];
};


export type QueryControlTypesArgs = {
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryGetFilteredBrightnessOptionsArgs = {
  isFlex?: InputMaybe<Scalars['Boolean']['input']>;
  locationCode: Scalars['String']['input'];
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
  pitchCode: Scalars['String']['input'];
  refreshRateCode: Scalars['String']['input'];
};


export type QueryGetFilteredRefreshRateOptionsArgs = {
  isFlex?: InputMaybe<Scalars['Boolean']['input']>;
  locationCode: Scalars['String']['input'];
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
  pitchCode: Scalars['String']['input'];
};


export type QueryGetPricesByCodesArgs = {
  codes: PriceRequestInput;
};


export type QueryIpProtectionByCodeArgs = {
  code: Scalars['String']['input'];
};


export type QueryIpProtectionsArgs = {
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryItemByCodeArgs = {
  code: Scalars['String']['input'];
};


export type QueryItemsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryLocationByCodeArgs = {
  code: Scalars['String']['input'];
};


export type QueryMaterialByCodeArgs = {
  code: Scalars['String']['input'];
};


export type QueryMaterialsArgs = {
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryModuleByCodeArgs = {
  code: Scalars['String']['input'];
};


export type QueryModuleDetailsArgs = {
  code: Scalars['String']['input'];
};


export type QueryModuleOptionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filters?: InputMaybe<ModuleFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryNodesArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type QueryOptionsByScreenTypeArgs = {
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
  screenTypeCode: Scalars['String']['input'];
};


export type QueryPitchByCodeArgs = {
  code: Scalars['String']['input'];
};


export type QueryPitchOptionsByLocationArgs = {
  locationCode: Scalars['String']['input'];
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryPitchesArgs = {
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryRefreshRatesArgs = {
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryScreenTypeByCodeArgs = {
  code: Scalars['String']['input'];
};


export type QueryScreenTypesArgs = {
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QuerySensorsArgs = {
  onlyActive?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryItemsConnection = {
  __typename?: 'QueryItemsConnection';
  edges?: Maybe<Array<Maybe<QueryItemsConnectionEdge>>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type QueryItemsConnectionEdge = {
  __typename?: 'QueryItemsConnectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Item>;
};

export type QueryModuleOptionsConnection = {
  __typename?: 'QueryModuleOptionsConnection';
  edges?: Maybe<Array<Maybe<QueryModuleOptionsConnectionEdge>>>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type QueryModuleOptionsConnectionEdge = {
  __typename?: 'QueryModuleOptionsConnectionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<Module>;
};

export type RefreshRate = Node & {
  __typename?: 'RefreshRate';
  active?: Maybe<Scalars['Boolean']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  value?: Maybe<Scalars['Int']['output']>;
};

/** Данные для регистрации нового пользователя */
export type RegisterInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

/** Роль пользователя в системе */
export enum Role {
  Admin = 'ADMIN',
  User = 'USER'
}

export type ScreenType = Node & {
  __typename?: 'ScreenType';
  active?: Maybe<Scalars['Boolean']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  controlTypes?: Maybe<Array<ControlType>>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  options?: Maybe<Array<Option>>;
  sensors?: Maybe<Array<Sensor>>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type Sensor = Node & {
  __typename?: 'Sensor';
  active?: Maybe<Scalars['Boolean']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type Supplier = Node & {
  __typename?: 'Supplier';
  active?: Maybe<Scalars['Boolean']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type User = {
  __typename?: 'User';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Role>;
};

export type VideoProcessor = Node & {
  __typename?: 'VideoProcessor';
  active?: Maybe<Scalars['Boolean']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  maxResolutionX?: Maybe<Scalars['Int']['output']>;
  maxResolutionY?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  priceRub?: Maybe<Scalars['Float']['output']>;
  priceUsd?: Maybe<Scalars['Float']['output']>;
};
