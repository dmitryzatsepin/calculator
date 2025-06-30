// backend/src/graphql/builder.ts
import SchemaBuilder from '@pothos/core';
import PrismaPlugin from '@pothos/plugin-prisma';
import type PrismaTypes from '../../prisma/pothos-types';
import RelayPlugin from '@pothos/plugin-relay';
import { prisma } from '../lib/prisma';
import { DateResolver, DateTimeResolver } from 'graphql-scalars';
import { User as PrismaUser } from '../../prisma/generated/client';

// --- Импортируем типы наших сервисов ---
import { AuthService } from '../services/authService';
import { CabinetService } from '../services/cabinetService';
import { ItemService } from '../services/itemService';
import { LocationService } from '../services/locationService';
import { MaterialService } from '../services/materialService';
import { ModuleService } from '../services/moduleService';
import { OptionService } from '../services/optionService';
import { PitchService } from '../services/pitchService';
import { PriceService } from '../services/priceService';
import { RefreshRateService } from '../services/refreshRateService';
import { ScreenTypeService } from '../services/screenTypeService';
import { SensorService } from '../services/sensorService';
import { BrightnessService } from '../services/brightnessService';
import { ControlTypeService } from '../services/controlTypeService';
import { IpProtectionService } from '../services/ipProtectionService';
import { ItemCategoryService } from '../services/itemCategoryService';
import { ItemSubcategoryService } from '../services/itemSubcategoryService';
import { ManufacturerService } from '../services/manufacturerService';
import { PlacementService } from '../services/placementService';
import { SupplierService } from '../services/supplierService';
import { CabinetItemComponentService } from '../services/cabinetItemComponentService';
import { CabinetPriceService } from '../services/cabinetPriceService';
import { CabinetSizeService } from '../services/cabinetSizeService';

// --- Определяем интерфейс для объекта сервисов ---
export interface Services {
  authService: AuthService;
  cabinetService: CabinetService;
  itemService: ItemService;
  locationService: LocationService;
  materialService: MaterialService;
  moduleService: ModuleService;
  optionService: OptionService;
  pitchService: PitchService;
  priceService: PriceService;
  refreshRateService: RefreshRateService;
  screenTypeService: ScreenTypeService;
  sensorService: SensorService;
  brightnessService: BrightnessService;
  controlTypeService: ControlTypeService;
  ipProtectionService: IpProtectionService;
  itemCategoryService: ItemCategoryService;
  itemSubcategoryService: ItemSubcategoryService;
  manufacturerService: ManufacturerService;
  placementService: PlacementService;
  supplierService: SupplierService;
  cabinetItemComponentService: CabinetItemComponentService;
  cabinetPriceService: CabinetPriceService;
  cabinetSizeService: CabinetSizeService;
}

// --- Расширяем GraphQLContext ---
export interface GraphQLContext {
  prisma: typeof prisma;
  currentUser?: PrismaUser | null;
  auth?: string | null;
  services: Services; // Добавляем объект сервисов в контекст
}

// --- Инициализация SchemaBuilder ---
export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Context: GraphQLContext; // Используем расширенный контекст
  Scalars: {
    Date: { Input: Date; Output: Date };
    DateTime: { Input: Date; Output: Date };
  };
}>({
  plugins: [PrismaPlugin, RelayPlugin],
  prisma: {
    client: prisma,
    exposeDescriptions: true,
    filterConnectionTotalCount: true,
  },
  relay: {
    clientMutationId: 'omit',
    cursorType: 'String',
  },
});

// --- Добавление скаляров и базовых типов ---
builder.addScalarType('Date', DateResolver, {});
builder.addScalarType('DateTime', DateTimeResolver, {});

builder.queryType({});
builder.mutationType({});