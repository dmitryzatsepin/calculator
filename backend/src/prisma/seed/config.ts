// prisma/seed/config.ts
import { PrismaClient, Prisma } from "@prisma/client";
import { Decimal } from '@prisma/client/runtime/library';
import { safeBoolean, safeInt, safeDecimal } from "./utils";

// Получаем типы моделей Prisma
type PrismaModels = keyof Omit<PrismaClient, `$${string}` | symbol | "user">; // Исключаем User и методы

// --- Типы для Конфигурации ---
interface FieldMapping {
  excelCol: string;
  prismaField: string;
  transform?: (value: any, context: string) => any;
  isUnique?: boolean; // Используется для определения ключа справочника
  defaultValue?: any;
}
interface ReferenceConfig {
  sheetName: string;
  modelName: PrismaModels;
  // codeField теперь основной идентификатор для всех справочников
  codeField: FieldMapping & { isUnique: true };
  nameField?: FieldMapping; // Имя может быть не уникальным
  valueField?: FieldMapping; // Поле для числового значения (RefreshRate, Brightness)
  activeField: FieldMapping;
  otherFields?: FieldMapping[];
}
interface EntityConfig {
  sheetName: string;
  modelName: PrismaModels;
  codeField: FieldMapping & { isUnique: true }; // code - основной ключ сущности
  skuField?: FieldMapping & { isUnique?: true }; // sku может быть уникальным
  nameField?: FieldMapping;
  activeField: FieldMapping;
  otherFields?: FieldMapping[];
}
// Используем mapRef (имя модели для поиска карты) и mapKey (поле для поиска в карте)
interface RelationMNConfig {
  sheetName: string;
  modelName: PrismaModels;
  field1: {
    excelCol: string;
    prismaField: string;
    mapRef: PrismaModels;
    mapKey: "code" | "name";
  };
  field2: {
    excelCol: string;
    prismaField: string;
    mapRef: PrismaModels;
    mapKey: "code" | "name";
  };
}
// Используем mapRef для поиска карты основной сущности и для item
interface RelationCountConfig {
  sheetName: string;
  modelName: PrismaModels;
  entityField: {
    excelCol: string;
    prismaField: string;
    mapRef: "cabinet" | "module";
  };
  itemField: { excelCol: string; prismaField: string; mapRef: "item" };
  countField: {
    excelCol: string;
    prismaField: string;
    transform: (value: any, context: string) => number | null;
  };
}
// Новый тип для конфигурации цен
interface PriceConfig {
  sheetName: string;
  modelName: PrismaModels; // Имя модели Price (e.g., 'cabinetPrice')
  entityField: {
    excelCol: string;
    prismaField: string;
    mapRef: "cabinet" | "module" | "item";
  }; // Ссылка на сущность
  usdField: {
    excelCol: string;
    prismaField: string;
    transform: (v: any, c: string) => Decimal | null;
  };
  rubField?: {
    excelCol: string;
    prismaField: string;
    transform: (v: any, c: string) => Decimal | null;
  }; // Опционально
}

// --- КОНФИГУРАЦИИ ---

// -- Справочники --
// !! Убедись, что у всех справочников в Excel ЕСТЬ уникальный КОД в указанной codeField.excelCol !!
export const referenceConfigs: ReferenceConfig[] = [
  {
    sheetName: "screen_type",
    modelName: "screenType",
    codeField: {
      excelCol: "screen_type_code",
      prismaField: "code",
      isUnique: true,
    },
    nameField: { excelCol: "screen_type_name", prismaField: "name" },
    activeField: {
      excelCol: "active",
      prismaField: "active",
      transform: safeBoolean,
    },
  },
  {
    sheetName: "location",
    modelName: "location",
    codeField: {
      excelCol: "location_code",
      prismaField: "code",
      isUnique: true,
    },
    nameField: { excelCol: "location_name", prismaField: "name" },
    activeField: {
      excelCol: "active",
      prismaField: "active",
      transform: safeBoolean,
    },
  },
  {
    sheetName: "placement",
    modelName: "placement",
    codeField: {
      excelCol: "placement_code",
      prismaField: "code",
      isUnique: true,
    },
    nameField: { excelCol: "placement_name", prismaField: "name" },
    activeField: {
      excelCol: "active",
      prismaField: "active",
      transform: safeBoolean,
    },
  },
  {
    sheetName: "material",
    modelName: "material",
    codeField: {
      excelCol: "material_code",
      prismaField: "code",
      isUnique: true,
    },
    nameField: { excelCol: "material_name", prismaField: "name" },
    activeField: {
      excelCol: "active",
      prismaField: "active",
      transform: safeBoolean,
    },
  },
  {
    sheetName: "supplier",
    modelName: "supplier",
    codeField: {
      excelCol: "supplier_code",
      prismaField: "code",
      isUnique: true,
    },
    nameField: { excelCol: "supplier_name", prismaField: "name" },
    activeField: {
      excelCol: "active",
      prismaField: "active",
      transform: safeBoolean,
    },
  },
  {
    sheetName: "manufacturer",
    modelName: "manufacturer",
    codeField: {
      excelCol: "manufacturer_code",
      prismaField: "code",
      isUnique: true,
    },
    nameField: { excelCol: "manufacturer_name", prismaField: "name" },
    activeField: {
      excelCol: "active",
      prismaField: "active",
      transform: safeBoolean,
    },
  },
  {
    sheetName: "ip_protection",
    modelName: "ipProtection",
    codeField: { excelCol: "ip_code", prismaField: "code", isUnique: true },
    activeField: {
      excelCol: "active",
      prismaField: "active",
      transform: safeBoolean,
    },
    otherFields: [
      { excelCol: "protection_solid", prismaField: "protectionSolid" },
      { excelCol: "protection_water", prismaField: "protectionWater" },
    ],
  },
  {
    sheetName: "pitch",
    modelName: "pitch",
    codeField: { excelCol: "pitch_code", prismaField: "code", isUnique: true },
    activeField: {
      excelCol: "active",
      prismaField: "active",
      transform: safeBoolean,
    },
    otherFields: [
      { excelCol: "pitch", prismaField: "pitchValue", transform: safeDecimal },
    ],
  },
  {
    sheetName: "refresh_rate",
    modelName: "refreshRate",
    codeField: {
      excelCol: "refresh_rate_code",
      prismaField: "code",
      isUnique: true,
    },
    activeField: {
      excelCol: "active",
      prismaField: "active",
      transform: safeBoolean,
    },
    valueField: {
      excelCol: "refresh_rate",
      prismaField: "value",
      transform: (v, c) => safeInt(v, c, false, false),
    },
  },
  {
    sheetName: "brightness",
    modelName: "brightness",
    codeField: {
      excelCol: "brightness_code",
      prismaField: "code",
      isUnique: true,
    },
    activeField: {
      excelCol: "active",
      prismaField: "active",
      transform: safeBoolean,
    },
    valueField: {
      excelCol: "brightness",
      prismaField: "value",
      transform: (v, c) => safeInt(v, c, false, false),
    },
  },
  {
    sheetName: "option",
    modelName: "option",
    codeField: { excelCol: "option_code", prismaField: "code", isUnique: true },
    nameField: { excelCol: "option_name", prismaField: "name" },
    activeField: {
      excelCol: "active",
      prismaField: "active",
      transform: safeBoolean,
    },
  },
  {
    sheetName: "sensor",
    modelName: "sensor",
    codeField: { excelCol: "sensor_code", prismaField: "code", isUnique: true },
    nameField: { excelCol: "sensor", prismaField: "name" },
    activeField: {
      excelCol: "active",
      prismaField: "active",
      transform: safeBoolean,
    },
  },
  {
    sheetName: "control_type",
    modelName: "controlType",
    codeField: {
      excelCol: "control_type_code",
      prismaField: "code",
      isUnique: true,
    },
    nameField: { excelCol: "control_type", prismaField: "name" },
    activeField: {
      excelCol: "active",
      prismaField: "active",
      transform: safeBoolean,
    },
  },
  {
    sheetName: "module_size",
    modelName: "moduleSize",
    codeField: {
      excelCol: "module_size_code",
      prismaField: "code",
      isUnique: true,
    },
    activeField: {
      excelCol: "active",
      prismaField: "active",
      transform: safeBoolean,
    },
    otherFields: [
      { excelCol: "module_size", prismaField: "size" },
      {
        excelCol: "width",
        prismaField: "width",
        transform: (v, c) => safeInt(v, c, false, false),
      },
      {
        excelCol: "height",
        prismaField: "height",
        transform: (v, c) => safeInt(v, c, false, false),
      },
    ],
  },
  {
    sheetName: "cabinet_size",
    modelName: "cabinetSize",
    codeField: {
      excelCol: "cabinet_size_code",
      prismaField: "code",
      isUnique: true,
    },
    activeField: {
      excelCol: "active",
      prismaField: "active",
      transform: safeBoolean,
    },
    otherFields: [
      { excelCol: "cabinet_size", prismaField: "size" },
      {
        excelCol: "width",
        prismaField: "width",
        transform: (v, c) => safeInt(v, c, false, false),
      },
      {
        excelCol: "height",
        prismaField: "height",
        transform: (v, c) => safeInt(v, c, false, false),
      },
    ],
  },
  {
    sheetName: "item_category",
    modelName: "itemCategory",
    codeField: {
      excelCol: "item_category_code",
      prismaField: "code",
      isUnique: true,
    },
    nameField: { excelCol: "item_category_name", prismaField: "name" },
    activeField: {
      excelCol: "active",
      prismaField: "active",
      transform: safeBoolean,
    },
  },
  {
    sheetName: "item_subcategory",
    modelName: "itemSubcategory",
    codeField: {
      excelCol: "item_subcategory_code",
      prismaField: "code",
      isUnique: true,
    },
    nameField: { excelCol: "item_subcategory_name", prismaField: "name" },
    activeField: {
      excelCol: "active",
      prismaField: "active",
      transform: safeBoolean,
    },
  },
];

// -- Основные сущности --
export const entityConfigs: EntityConfig[] = [
  {
    sheetName: "item",
    modelName: "item",
    codeField: { excelCol: "item_code", prismaField: "code", isUnique: true },
    skuField: { excelCol: "item_sku", prismaField: "sku" },
    nameField: { excelCol: "item_name", prismaField: "name" },
    activeField: {
      excelCol: "active",
      prismaField: "active",
      transform: safeBoolean,
    },
    otherFields: [{ excelCol: "comment", prismaField: "comment" }],
  },
  {
    sheetName: "cabinet",
    modelName: "cabinet",
    codeField: {
      excelCol: "cabinet_code",
      prismaField: "code",
      isUnique: true,
    },
    skuField: { excelCol: "cabinet_sku", prismaField: "sku", isUnique: true },
    nameField: { excelCol: "cabinet_name", prismaField: "name" },
    activeField: {
      excelCol: "active",
      prismaField: "active",
      transform: safeBoolean,
    },
  },
  {
    sheetName: "module",
    modelName: "module",
    codeField: { excelCol: "module_code", prismaField: "code", isUnique: true },
    skuField: { excelCol: "module_sku", prismaField: "sku", isUnique: true },
    activeField: {
      excelCol: "active",
      prismaField: "active",
      transform: safeBoolean,
    },
    nameField: { excelCol: "module_name", prismaField: "name" },
    otherFields: [{ excelCol: "module_option", prismaField: "moduleOption" }],
  },
];

// -- Связующие таблицы M-N --
// mapRef - имя МОДЕЛИ справочника/сущности (для поиска карты ID)
// mapKey - поле ('code' или 'name'), по которому ищем значение из Excel в карте
export const relationMNConfigs: RelationMNConfig[] = [
  {
    sheetName: "item_category>item_subcategory",
    modelName: "itemCategorySubcategory",
    field1: {
      excelCol: "item_category_code",
      prismaField: "categoryCode",
      mapRef: "itemCategory",
      mapKey: "code",
    },
    field2: {
      excelCol: "item_subcategory_code",
      prismaField: "subcategoryCode",
      mapRef: "itemSubcategory",
      mapKey: "code",
    },
  },
  {
    sheetName: "cabinet_size>module_size",
    modelName: "cabinetSizeModuleSize",
    field1: {
      excelCol: "cabinet_size_code",
      prismaField: "cabinetSizeCode",
      mapRef: "cabinetSize",
      mapKey: "code",
    },
    field2: {
      excelCol: "module_size_code",
      prismaField: "moduleSizeCode",
      mapRef: "moduleSize",
      mapKey: "code",
    },
  },
  {
    sheetName: "screen_type>option",
    modelName: "screenTypeOption",
    field1: {
      excelCol: "screen_type_code",
      prismaField: "screenTypeCode",
      mapRef: "screenType",
      mapKey: "code",
    },
    field2: {
      excelCol: "option_code",
      prismaField: "optionCode",
      mapRef: "option",
      mapKey: "code",
    },
  },
  {
    sheetName: "screen_type>control_type",
    modelName: "screenTypeControlType",
    field1: {
      excelCol: "screen_type_code",
      prismaField: "screenTypeCode",
      mapRef: "screenType",
      mapKey: "code",
    },
    field2: {
      excelCol: "control_type_code",
      prismaField: "controlTypeCode",
      mapRef: "controlType",
      mapKey: "code",
    },
  },
  {
    sheetName: "screen_type>sensor",
    modelName: "screenTypeSensor",
    field1: {
      excelCol: "screen_type_code",
      prismaField: "screenTypeCode",
      mapRef: "screenType",
      mapKey: "code",
    },
    field2: {
      excelCol: "sensor_code",
      prismaField: "sensorCode",
      mapRef: "sensor",
      mapKey: "code",
    },
  },
  {
    sheetName: "item>category",
    modelName: "itemCategoryRelation",
    field1: {
      excelCol: "item_code",
      prismaField: "itemCode",
      mapRef: "item",
      mapKey: "code",
    },
    field2: {
      excelCol: "item_category_code",
      prismaField: "categoryCode",
      mapRef: "itemCategory",
      mapKey: "code",
    },
  },
  {
    sheetName: "item>subcategory",
    modelName: "itemSubcategoryRelation",
    field1: {
      excelCol: "item_code",
      prismaField: "itemCode",
      mapRef: "item",
      mapKey: "code",
    },
    field2: {
      excelCol: "item_subcategory_code",
      prismaField: "subcategoryCode",
      mapRef: "itemSubcategory",
      mapKey: "code",
    },
  },
  {
    sheetName: "item>supplier",
    modelName: "itemSupplier",
    field1: {
      excelCol: "item_code",
      prismaField: "itemCode",
      mapRef: "item",
      mapKey: "code",
    },
    field2: {
      excelCol: "supplier_code",
      prismaField: "supplierCode",
      mapRef: "supplier",
      mapKey: "code",
    },
  },
  {
    sheetName: "cabinet>category",
    modelName: "cabinetCategory",
    field1: {
      excelCol: "cabinet_code",
      prismaField: "cabinetCode",
      mapRef: "cabinet",
      mapKey: "code",
    },
    field2: {
      excelCol: "item_category_code",
      prismaField: "categoryCode",
      mapRef: "itemCategory",
      mapKey: "code",
    },
  },
  {
    sheetName: "cabinet>subcategory",
    modelName: "cabinetSubcategory",
    field1: {
      excelCol: "cabinet_code",
      prismaField: "cabinetCode",
      mapRef: "cabinet",
      mapKey: "code",
    },
    field2: {
      excelCol: "item_subcategory_code",
      prismaField: "subcategoryCode",
      mapRef: "itemSubcategory",
      mapKey: "code",
    },
  },
  {
    sheetName: "cabinet>location",
    modelName: "cabinetLocation",
    field1: {
      excelCol: "cabinet_code",
      prismaField: "cabinetCode",
      mapRef: "cabinet",
      mapKey: "code",
    },
    field2: {
      excelCol: "location_code",
      prismaField: "locationCode",
      mapRef: "location",
      mapKey: "code",
    },
  },
  {
    sheetName: "cabinet>placement",
    modelName: "cabinetPlacement",
    field1: {
      excelCol: "cabinet_code",
      prismaField: "cabinetCode",
      mapRef: "cabinet",
      mapKey: "code",
    },
    field2: {
      excelCol: "placement_code",
      prismaField: "placementCode",
      mapRef: "placement",
      mapKey: "code",
    },
  },
  {
    sheetName: "cabinet>material",
    modelName: "cabinetMaterial",
    field1: {
      excelCol: "cabinet_code",
      prismaField: "cabinetCode",
      mapRef: "cabinet",
      mapKey: "code",
    },
    field2: {
      excelCol: "material_code",
      prismaField: "materialCode",
      mapRef: "material",
      mapKey: "code",
    },
  },
  {
    sheetName: "cabinet>cabinet_size",
    modelName: "cabinetCabinetSize",
    field1: {
      excelCol: "cabinet_code",
      prismaField: "cabinetCode",
      mapRef: "cabinet",
      mapKey: "code",
    },
    field2: {
      excelCol: "size_code",
      prismaField: "cabinetSizeCode",
      mapRef: "cabinetSize",
      mapKey: "code",
    },
  },
  {
    sheetName: "cabinet>pitch",
    modelName: "cabinetPitch",
    field1: {
      excelCol: "cabinet_code",
      prismaField: "cabinetCode",
      mapRef: "cabinet",
      mapKey: "code",
    },
    field2: {
      excelCol: "pitch_code",
      prismaField: "pitchCode",
      mapRef: "pitch",
      mapKey: "code",
    },
  },
  {
    sheetName: "cabinet>manufacturer",
    modelName: "cabinetManufacturer",
    field1: {
      excelCol: "cabinet_code",
      prismaField: "cabinetCode",
      mapRef: "cabinet",
      mapKey: "code",
    },
    field2: {
      excelCol: "manufacturer_code",
      prismaField: "manufacturerCode",
      mapRef: "manufacturer",
      mapKey: "code",
    },
  },
  {
    sheetName: "cabinet>supplier",
    modelName: "cabinetSupplier",
    field1: {
      excelCol: "cabinet_code",
      prismaField: "cabinetCode",
      mapRef: "cabinet",
      mapKey: "code",
    },
    field2: {
      excelCol: "supplier_code",
      prismaField: "supplierCode",
      mapRef: "supplier",
      mapKey: "code",
    },
  },
  {
    sheetName: "module>category",
    modelName: "moduleCategory",
    field1: {
      excelCol: "module_code",
      prismaField: "moduleCode",
      mapRef: "module",
      mapKey: "code",
    },
    field2: {
      excelCol: "item_category_code",
      prismaField: "categoryCode",
      mapRef: "itemCategory",
      mapKey: "code",
    },
  },
  {
    sheetName: "module>subcategory",
    modelName: "moduleSubcategory",
    field1: {
      excelCol: "module_code",
      prismaField: "moduleCode",
      mapRef: "module",
      mapKey: "code",
    },
    field2: {
      excelCol: "item_subcategory_code",
      prismaField: "subcategoryCode",
      mapRef: "itemSubcategory",
      mapKey: "code",
    },
  },
  {
    sheetName: "module>location",
    modelName: "moduleLocation",
    field1: {
      excelCol: "module_code",
      prismaField: "moduleCode",
      mapRef: "module",
      mapKey: "code",
    },
    field2: {
      excelCol: "location_code",
      prismaField: "locationCode",
      mapRef: "location",
      mapKey: "code",
    },
  },
  {
    sheetName: "module>refresh_rate",
    modelName: "moduleRefreshRate",
    field1: {
      excelCol: "module_code",
      prismaField: "moduleCode",
      mapRef: "module",
      mapKey: "code",
    },
    field2: {
      excelCol: "refresh_rate_code",
      prismaField: "refreshRateCode",
      mapRef: "refreshRate",
      mapKey: "code",
    },
  },
  {
    sheetName: "module>brightness",
    modelName: "moduleBrightness",
    field1: {
      excelCol: "module_code",
      prismaField: "moduleCode",
      mapRef: "module",
      mapKey: "code",
    },
    field2: {
      excelCol: "brightness_code",
      prismaField: "brightnessCode",
      mapRef: "brightness",
      mapKey: "code",
    },
  },
  {
    sheetName: "module>module_size",
    modelName: "moduleModuleSize",
    field1: {
      excelCol: "module_code",
      prismaField: "moduleCode",
      mapRef: "module",
      mapKey: "code",
    },
    field2: {
      excelCol: "module_size_code",
      prismaField: "moduleSizeCode",
      mapRef: "moduleSize",
      mapKey: "code",
    },
  },
  {
    sheetName: "module>pitch",
    modelName: "modulePitch",
    field1: {
      excelCol: "module_code",
      prismaField: "moduleCode",
      mapRef: "module",
      mapKey: "code",
    },
    field2: {
      excelCol: "pitch_code",
      prismaField: "pitchCode",
      mapRef: "pitch",
      mapKey: "code",
    },
  },
  {
    sheetName: "module>manufacturer",
    modelName: "moduleManufacturer",
    field1: {
      excelCol: "module_code",
      prismaField: "moduleCode",
      mapRef: "module",
      mapKey: "code",
    },
    field2: {
      excelCol: "manufacturer_code",
      prismaField: "manufacturerCode",
      mapRef: "manufacturer",
      mapKey: "code",
    },
  },
  {
    sheetName: "module>option",
    modelName: "moduleOption",
    field1: {
      excelCol: "module_code",
      prismaField: "moduleCode",
      mapRef: "module",
      mapKey: "code",
    },
    field2: {
      excelCol: "option_code",
      prismaField: "optionCode",
      mapRef: "option",
      mapKey: "code",
    },
  },
];

// -- Связующие таблицы с количеством --
export const relationCountConfigs: RelationCountConfig[] = [
  {
    sheetName: "cabinet>items_count",
    modelName: "cabinetItemComponent",
    entityField: {
      excelCol: "cabinet_code",
      prismaField: "cabinetCode",
      mapRef: "cabinet",
    },
    itemField: {
      excelCol: "item_code",
      prismaField: "itemCode",
      mapRef: "item",
    },
    countField: {
      excelCol: "item_count",
      prismaField: "quantity",
      transform: (v, c) => safeInt(v, c, true, false),
    },
  },
  {
    sheetName: "module>items_count",
    modelName: "moduleItemComponent",
    entityField: {
      excelCol: "module_code",
      prismaField: "moduleCode",
      mapRef: "module",
    },
    itemField: {
      excelCol: "item_code",
      prismaField: "itemCode",
      mapRef: "item",
    },
    countField: {
      excelCol: "item_count",
      prismaField: "quantity",
      transform: (v, c) => safeInt(v, c, true, false),
    },
  },
];

// -- Конфигурация для цен --
export const priceConfigs: PriceConfig[] = [
  {
    sheetName: "item>price",
    modelName: "itemPrice",
    entityField: {
      excelCol: "item_code",
      prismaField: "itemCode",
      mapRef: "item",
    },
    usdField: {
      excelCol: "price_usd",
      prismaField: "priceUsd",
      transform: safeDecimal,
    },
    rubField: {
      excelCol: "price_rub",
      prismaField: "priceRub",
      transform: safeDecimal,
    },
  },
  {
    sheetName: "cabinet>price",
    modelName: "cabinetPrice",
    entityField: {
      excelCol: "cabinet_code",
      prismaField: "cabinetCode",
      mapRef: "cabinet",
    },
    usdField: {
      excelCol: "price_usd",
      prismaField: "priceUsd",
      transform: safeDecimal,
    },
    rubField: {
      excelCol: "price_rub",
      prismaField: "priceRub",
      transform: safeDecimal,
    },
  },
  {
    sheetName: "module>price",
    modelName: "modulePrice",
    entityField: {
      excelCol: "module_code",
      prismaField: "moduleCode",
      mapRef: "module",
    },
    usdField: {
      excelCol: "price_usd",
      prismaField: "priceUsd",
      transform: safeDecimal,
    },
    rubField: {
      excelCol: "price_rub",
      prismaField: "priceRub",
      transform: safeDecimal,
    },
  },
];

// -- Карты ID --
export interface IdMaps {
  screenType: Map<string, number>;
  material: Map<string, number>;
  location: Map<string, number>; // Ключ - code
  // locationName: Map<string, string>; // Больше не нужна
  placement: Map<string, number>;
  option: Map<string, number>;
  sensor: Map<string, number>;
  controlType: Map<string, number>;
  pitch: Map<string, number>;
  refreshRate: Map<string, number>;
  brightness: Map<string, number>;
  manufacturer: Map<string, number>; // Ключ - code
  // manufacturerName: Map<string, string>; // Больше не нужна
  supplier: Map<string, number>;
  ipProtection: Map<string, number>;
  moduleSize: Map<string, number>;
  cabinetSize: Map<string, number>;
  itemCategory: Map<string, number>;
  itemSubcategory: Map<string, number>;
  cabinet: Map<string, number>;
  module: Map<string, number>;
  item: Map<string, number>;
}

export function createIdMaps(): IdMaps {
  return {
    screenType: new Map(),
    material: new Map(),
    location: new Map(),
    placement: new Map(),
    option: new Map(),
    sensor: new Map(),
    controlType: new Map(),
    pitch: new Map(),
    refreshRate: new Map(),
    brightness: new Map(),
    manufacturer: new Map(),
    supplier: new Map(),
    ipProtection: new Map(),
    moduleSize: new Map(),
    cabinetSize: new Map(),
    itemCategory: new Map(),
    itemSubcategory: new Map(),
    cabinet: new Map(),
    module: new Map(),
    item: new Map(),
  };
}
