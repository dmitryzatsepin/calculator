// backend/src/graphql/types/Cabinet.ts
import { builder } from '../builder';

import { ItemCategoryService } from '../../services/itemCategoryService';
import { ItemSubcategoryService } from '../../services/itemSubcategoryService';
import { LocationService } from '../../services/locationService';
import { PlacementService } from '../../services/placementService';
import { MaterialService } from '../../services/materialService';
import { PitchService } from '../../services/pitchService';
import { ManufacturerService } from '../../services/manufacturerService';
import { SupplierService } from '../../services/supplierService';
import { CabinetItemComponentService } from '../../services/cabinetItemComponentService';
import { CabinetPriceService } from '../../services/cabinetPriceService';

// Вспомогательные функции для инициализации сервисов
const getItemCategoryService = (ctx: any) => new ItemCategoryService(ctx.prisma);
const getItemSubcategoryService = (ctx: any) => new ItemSubcategoryService(ctx.prisma);
const getLocationService = (ctx: any) => new LocationService(ctx.prisma);
const getPlacementService = (ctx: any) => new PlacementService(ctx.prisma);
const getMaterialService = (ctx: any) => new MaterialService(ctx.prisma);
const getPitchService = (ctx: any) => new PitchService(ctx.prisma);
const getManufacturerService = (ctx: any) => new ManufacturerService(ctx.prisma);
const getSupplierService = (ctx: any) => new SupplierService(ctx.prisma);
const getCabinetItemComponentService = (ctx: any) => new CabinetItemComponentService(ctx.prisma);
const getCabinetPriceService = (ctx: any) => new CabinetPriceService(ctx.prisma);

// Тип CabinetPriceRelay (CabinetPrice)
const CabinetPriceRelay = builder.prismaNode('CabinetPrice', {
  id: { field: 'cabinetCode' },
  fields: (t) => ({
    cabinetCode: t.exposeString('cabinetCode'),
    priceUsd: t.float({ nullable: true, resolve: (p) => p.priceUsd?.toNumber() ?? null }),
    priceRub: t.float({ nullable: true, resolve: (p) => p.priceRub?.toNumber() ?? null }),
  }),
});

builder.prismaNode('Cabinet', {
  id: { field: 'id' },
  fields: (t) => ({
    // Простые поля
    code: t.exposeString('code'),
    sku: t.exposeString('sku', { nullable: true }),
    name: t.exposeString('name', { nullable: true }),
    active: t.exposeBoolean('active'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),

    // Простые связи, управляемые Pothos
    sizes: t.relation('sizes', {
      query: { where: { size: { active: true } } },
    }),
    
    // --- Связи M-N с логикой, вынесенной в сервисы ---
    categories: t.prismaField({
        type: ['ItemCategory'],
        resolve: (query, parent, _args, ctx) => getItemCategoryService(ctx).findByCabinetCode(query, parent.code)
    }),
    subcategories: t.prismaField({
        type: ['ItemSubcategory'],
        resolve: (query, parent, _args, ctx) => getItemSubcategoryService(ctx).findByCabinetCode(query, parent.code)
    }),
    locations: t.prismaField({
        type: ['Location'],
        resolve: (query, parent, _args, ctx) => getLocationService(ctx).findByCabinetCode(query, parent.code)
    }),
    placements: t.prismaField({
        type: ['Placement'],
        resolve: (query, parent, _args, ctx) => getPlacementService(ctx).findByCabinetCode(query, parent.code)
    }),
    materials: t.prismaField({
        type: ['Material'],
        resolve: (query, parent, _args, ctx) => getMaterialService(ctx).findByCabinetCode(query, parent.code)
    }),
    pitches: t.prismaField({
        type: ['Pitch'],
        resolve: (query, parent, _args, ctx) => getPitchService(ctx).findByCabinetCode(query, parent.code)
    }),
    manufacturers: t.prismaField({
        type: ['Manufacturer'],
        resolve: (query, parent, _args, ctx) => getManufacturerService(ctx).findByCabinetCode(query, parent.code)
    }),
    suppliers: t.prismaField({
        type: ['Supplier'],
        resolve: (query, parent, _args, ctx) => getSupplierService(ctx).findByCabinetCode(query, parent.code)
    }),

    // Компоненты кабинета (CabinetItemComponent)
    items: t.prismaConnection({
        type: 'CabinetItemComponent',
        cursor: 'cabinetCode_itemCode',
        totalCount: (parent, _args, ctx) =>
            ctx.prisma.cabinetItemComponent.count({ where: { cabinetCode: parent.code } }),
        resolve: (query, parent, _args, ctx) => getCabinetItemComponentService(ctx).findByCabinetCode(query, parent.code)
    }),

    // Цена кабинета (CabinetPrice)
    price: t.prismaField({
        type: 'CabinetPrice',
        nullable: true,
        resolve: (query, parent, _args, ctx) => getCabinetPriceService(ctx).findByCabinetCode(query, parent.code)
    }),
  }),
});