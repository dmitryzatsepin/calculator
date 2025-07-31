// backend/src/graphql/builder.ts
import SchemaBuilder from '@pothos/core';
import PrismaPlugin from '@pothos/plugin-prisma';
import PrismaTypes from '../prisma/pothos-types.js';
import RelayPlugin from '@pothos/plugin-relay';
import { prisma } from '../lib/prisma.js';
import { DateResolver, DateTimeResolver } from 'graphql-scalars';
import { User as PrismaUser } from '@prisma/client';

// --- Импортируем типы наших сервисов ---
import { AuthService } from '../services/authService.js';
import { CabinetService } from '../services/cabinetService.js';
import { ItemService } from '../services/itemService.js';
import { LocationService } from '../services/locationService.js';
import { MaterialService } from '../services/materialService.js';
import { ModuleService } from '../services/moduleService.js';
import { ModuleSizeService } from '../services/moduleSizeService.js';
import { ModuleItemComponentService } from '../services/moduleItemComponentService.js';
import { ModulePriceService } from '../services/modulePriceService.js';
import { OptionService } from '../services/optionService.js';
import { PitchService } from '../services/pitchService.js';
import { PriceService } from '../services/priceService.js';
import { RefreshRateService } from '../services/refreshRateService.js';
import { ScreenTypeService } from '../services/screenTypeService.js';
import { SensorService } from '../services/sensorService.js';
import { BrightnessService } from '../services/brightnessService.js';
import { ControlTypeService } from '../services/controlTypeService.js';
import { IpProtectionService } from '../services/ipProtectionService.js';
import { ItemCategoryService } from '../services/itemCategoryService.js';
import { ItemSubcategoryService } from '../services/itemSubcategoryService.js';
import { ManufacturerService } from '../services/manufacturerService.js';
import { PlacementService } from '../services/placementService.js';
import { SupplierService } from '../services/supplierService.js';
import { CabinetItemComponentService } from '../services/cabinetItemComponentService.js';
import { CabinetPriceService } from '../services/cabinetPriceService.js';
import { CabinetSizeService } from '../services/cabinetSizeService.js';
import { VideoProcessorService } from '../services/videoProcessorService.js';

// --- Определяем интерфейс для объекта сервисов ---
export interface Services {
  authService: AuthService;
  cabinetService: CabinetService;
  itemService: ItemService;
  locationService: LocationService;
  materialService: MaterialService;
  moduleService: ModuleService;
  moduleSizeService: ModuleSizeService;
  moduleItemComponentService: ModuleItemComponentService;
  modulePriceService: ModulePriceService;
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
  videoProcessorService: VideoProcessorService;
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