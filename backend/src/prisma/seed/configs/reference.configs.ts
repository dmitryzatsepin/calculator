// prisma/seed/configs/reference.configs.ts
import type { ReferenceConfig } from '../types.config';
import { safeBoolean, safeInt, safeDecimal } from "../utils";

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