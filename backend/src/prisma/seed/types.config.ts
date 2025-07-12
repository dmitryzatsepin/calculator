// prisma/seed/types.config.ts
import { PrismaClient } from "@prisma/client";
import { Decimal } from '@prisma/client/runtime/library';

export type SeedPrismaModelName = keyof Omit<PrismaClient, `$${string}` | symbol | "user">;

export interface FieldMapping {
  excelCol: string;
  prismaField: string;
  transform?: (value: any, context: string) => any;
  isUnique?: boolean;
  defaultValue?: any;
}

export interface BaseItemConfig {
  sheetName: string;
  modelName: SeedPrismaModelName;
  codeField: FieldMapping & { isUnique: true };
  nameField?: FieldMapping;
  activeField: FieldMapping;
  otherFields?: FieldMapping[];
}

export interface ReferenceConfig extends BaseItemConfig {
  valueField?: FieldMapping;
}

export interface EntityConfig extends BaseItemConfig {
  skuField?: FieldMapping & { isUnique?: true };
}

export interface RelationMNConfig {
  sheetName: string;
  modelName: SeedPrismaModelName;
  field1: {
    excelCol: string;
    prismaField: string;
    mapRef: SeedPrismaModelName;
    mapKey: "code" | "name";
  };
  field2: {
    excelCol: string;
    prismaField: string;
    mapRef: SeedPrismaModelName;
    mapKey: "code" | "name";
  };
}

export type EntityMapRef = "cabinet" | "module" | "item";

export interface RelationCountConfig {
  sheetName: string;
  modelName: SeedPrismaModelName;
  entityField: {
    excelCol: string;
    prismaField: string;
    mapRef: EntityMapRef;
  };
  itemField: { excelCol: string; prismaField: string; mapRef: "item" };
  countField: {
    excelCol: string;
    prismaField: string;
    transform: (value: any, context: string) => number | null;
  };
}

export interface PriceConfig {
  sheetName: string;
  modelName: SeedPrismaModelName;
  entityField: {
    excelCol: string;
    prismaField: string;
    mapRef: EntityMapRef;
  };
  usdField: {
    excelCol: string;
    prismaField: string;
    transform: (v: any, c: string) => Decimal | null;
  };
  rubField?: {
    excelCol: string;
    prismaField: string;
    transform: (v: any, c: string) => Decimal | null;
  };
}

export type IdMapKeys = Extract<SeedPrismaModelName,
  | "screenType" | "material" | "location" | "placement" | "option"
  | "sensor" | "controlType" | "pitch" | "refreshRate" | "brightness"
  | "manufacturer" | "supplier" | "ipProtection" | "moduleSize" | "cabinetSize"
  | "itemCategory" | "itemSubcategory" | "cabinet" | "module" | "item"
>;

export type IdMaps = {
  [K in IdMapKeys]: Map<string, number>;
};