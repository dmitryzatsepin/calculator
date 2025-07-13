// prisma/seed/configs/price.configs.ts
import type { PriceConfig } from '../types.config.js';
import { safeDecimal } from "../utils.js";

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