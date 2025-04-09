// src/types/api.ts

// --- Базовые Справочники ---

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: number;
  email: string;
  role: Role;
  createdAt: string;
  name: string;
}

export interface ScreenType {
  id: number;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: number;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  id: number;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Manufacturer {
  id: number;
  code: string;
  name:string;
  createdAt: string;
  updatedAt: string;
}

export interface CabinetPlacement {
  id: number;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pitch {
  id: number;
  code: string;
  pitchValue: string;
  moduleWidth: number;
  moduleHeight: number;
  createdAt: string;
  updatedAt: string;
}

export interface PitchType {
  id: number;
  name: string; // 'eco', 'pro'
  createdAt: string;
  updatedAt: string;
}

export interface IpProtection {
  id: number;
  code: string;
  protectionSolid: string;
  protectionWater: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComponentService {
  id: number;
  category: string | null;
  code: string;
  name: string;
  priceUsd: string | null;
  priceRub: string | null;
  createdAt: string;
  updatedAt: string;
}


// --- Основные Сущности (Зависимые) ---

export interface Module {
  id: number;
  sku: string;
  type: string | null;
  priceUsd: string | null;
  manufacturerCode: string | null;
  locationCode: string | null;
  pitchCode: string;
  refreshRateValue: number | null;
  brightnessValue: number | null;
  createdAt: string;
  updatedAt: string;

  manufacturer?: Manufacturer;
  location?: Location;
  pitch?: Pitch;
}

// Уточненный тип Cabinet для связей
export interface CabinetNested {
  id: number;
  sku: string;
  name: string | null;
  width: number | null;
  height: number | null;
  moduleWidth: number | null;
  moduleHeight: number | null;
  modulesCount: number | null;
  priceUsd: string | null;
  createdAt: string;
  updatedAt: string;
}

// Уточненный тип ComponentService для связей
export interface ComponentServiceNested {
    id: number;
    category: string | null;
    code: string;
    name: string;
    priceUsd: string | null;
    priceRub: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Cabinet {
  id: number;
  sku: string;
  name: string | null;
  width: number | null;
  height: number | null;
  moduleWidth: number | null;
  moduleHeight: number | null;
  modulesCount: number | null;
  priceUsd: string | null;
  createdAt: string;
  updatedAt: string;
  // Опциональные связи
  locations?: LocationCabinetRelation[];
  materials?: MaterialCabinetRelation[];
  placements?: CabinetPlacementCabinetRelation[];
  components?: CabinetComponentRelation[];
}


// --- Связующие таблицы M-N ---

export interface ScreenTypeLocationRelation {
  screenTypeCode: string;
  locationCode: string;
  screenType: ScreenType;
  location: Location;
}

export interface ScreenTypePitchRelation {
  screenTypeCode: string;
  pitchCode: string;
  screenType?: ScreenType;
  pitch?: Pitch;
}

export interface LocationMaterialRelation {
  locationCode: string;
  materialCode: string;
  location: Location;
  material: Material;
}

export interface LocationPitchRelation {
  locationCode: string;
  pitchCode: string;
  location?: Location;
  pitch?: Pitch;
}

export interface LocationCabinetRelation {
  locationCode: string;
  cabinetSku: string; // Связь по Sku кабинета
  location: Location;
  cabinet: CabinetNested; // Используем Nested тип
}

export interface MaterialCabinetRelation {
  materialCode: string;
  cabinetSku: string; // Связь по Sku кабинета
  material: Material;
  cabinet: CabinetNested; // Используем Nested тип
}

export interface CabinetPlacementCabinetRelation {
  cabinetPlacementCode: string;
  cabinetSku: string;
  placement: CabinetPlacement;
  cabinet: CabinetNested;
}

export interface PitchTypePitchRelation {
  pitchTypeName: string; // Связь по имени типа ('eco', 'pro')
  pitchCode: string;
  pitchType?: PitchType;
  pitch?: Pitch;
}

export interface CabinetComponentRelation {
  cabinetId: number;
  componentId: number;
  quantity: number;
  cabinet: CabinetNested;
  component: ComponentServiceNested;
}