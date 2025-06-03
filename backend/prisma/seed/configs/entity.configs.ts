// prisma/seed/configs/entity.configs.ts
import type { EntityConfig } from '../types.config';
import { safeBoolean } from "../utils";

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