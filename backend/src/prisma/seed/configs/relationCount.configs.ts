// prisma/seed/configs/relationCount.configs.ts
import type { RelationCountConfig } from '../types.config';
import { safeInt } from "../utils";

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