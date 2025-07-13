// backend/src/graphql/types/Cabinet.ts

import { builder } from '../builder.js';
import type { Prisma } from '@prisma/client';
import type { GraphQLContext } from '../builder.js';

// --- Типизация ---
type Cabinet = Prisma.CabinetGetPayload<{}>;
type CabinetPrice = Prisma.CabinetPriceGetPayload<{}>;

type CabinetFieldBuilder = Parameters<Parameters<typeof builder.prismaNode>[1]['fields']>[0];
type CabinetPriceFieldBuilder = Parameters<Parameters<typeof builder.prismaNode>[1]['fields']>[0];

// --- Типизированные вспомогательные функции ---
const getItemCategoryService = (ctx: GraphQLContext) => ctx.services.itemCategoryService;
const getItemSubcategoryService = (ctx: GraphQLContext) => ctx.services.itemSubcategoryService;
const getLocationService = (ctx: GraphQLContext) => ctx.services.locationService;
const getPlacementService = (ctx: GraphQLContext) => ctx.services.placementService;
const getMaterialService = (ctx: GraphQLContext) => ctx.services.materialService;
const getPitchService = (ctx: GraphQLContext) => ctx.services.pitchService;
const getManufacturerService = (ctx: GraphQLContext) => ctx.services.manufacturerService;
const getSupplierService = (ctx: GraphQLContext) => ctx.services.supplierService;
const getCabinetItemComponentService = (ctx: GraphQLContext) => ctx.services.cabinetItemComponentService;
const getCabinetPriceService = (ctx: GraphQLContext) => ctx.services.cabinetPriceService;


// --- Тип CabinetPriceRelay ---
const CabinetPriceRelay = builder.prismaNode('CabinetPrice', {
    id: { field: 'cabinetCode' },
    findUnique: (id: string, { prisma }: GraphQLContext) =>
        prisma.cabinetPrice.findUnique({
            where: { cabinetCode: id },
        }),
    fields: (t: CabinetPriceFieldBuilder) => ({
        priceUsd: t.float({ nullable: true, resolve: (p: CabinetPrice) => p.priceUsd?.toNumber() ?? null }),
        priceRub: t.float({ nullable: true, resolve: (p: CabinetPrice) => p.priceRub?.toNumber() ?? null }),
    }),
});

// --- Тип Cabinet ---
builder.prismaNode('Cabinet', {
    id: { field: 'id' },
    findUnique: (id: string, { prisma }: GraphQLContext) =>
        prisma.cabinet.findUnique({
            where: { id: parseInt(id, 10) },
        }),
    fields: (t: CabinetFieldBuilder) => ({
        // Простые поля
        code: t.exposeString('code'),
        sku: t.exposeString('sku', { nullable: true }),
        name: t.exposeString('name', { nullable: true }),
        active: t.exposeBoolean('active'),
        createdAt: t.expose('createdAt', { type: 'DateTime' }),
        updatedAt: t.expose('updatedAt', { type: 'DateTime' }),

        // Простые связи
        sizes: t.relation('sizes', {
            query: { where: { active: true } },
        }),

        // --- Связи M-N с ЯВНОЙ ТИПИЗАЦИЕЙ ---
        categories: t.prismaField({
            type: ['ItemCategory'],
            resolve: (query: Prisma.ItemCategoryFindManyArgs, parent: Cabinet, _args: {}, ctx: GraphQLContext) =>
                getItemCategoryService(ctx).findByCabinetCode(query, parent.code)
        }),
        subcategories: t.prismaField({
            type: ['ItemSubcategory'],
            resolve: (query: Prisma.ItemSubcategoryFindManyArgs, parent: Cabinet, _args: {}, ctx: GraphQLContext) =>
                getItemSubcategoryService(ctx).findByCabinetCode(query, parent.code)
        }),
        locations: t.prismaField({
            type: ['Location'],
            resolve: (query: Prisma.LocationFindManyArgs, parent: Cabinet, _args: {}, ctx: GraphQLContext) =>
                getLocationService(ctx).findByCabinetCode(query, parent.code)
        }),
        placements: t.prismaField({
            type: ['Placement'],
            resolve: (query: Prisma.PlacementFindManyArgs, parent: Cabinet, _args: {}, ctx: GraphQLContext) =>
                getPlacementService(ctx).findByCabinetCode(query, parent.code)
        }),
        materials: t.prismaField({
            type: ['Material'],
            resolve: (query: Prisma.MaterialFindManyArgs, parent: Cabinet, _args: {}, ctx: GraphQLContext) =>
                getMaterialService(ctx).findByCabinetCode(query, parent.code)
        }),
        pitches: t.prismaField({
            type: ['Pitch'],
            resolve: (query: Prisma.PitchFindManyArgs, parent: Cabinet, _args: {}, ctx: GraphQLContext) =>
                getPitchService(ctx).findByCabinetCode(query, parent.code)
        }),
        manufacturers: t.prismaField({
            type: ['Manufacturer'],
            resolve: (query: Prisma.ManufacturerFindManyArgs, parent: Cabinet, _args: {}, ctx: GraphQLContext) =>
                getManufacturerService(ctx).findByCabinetCode(query, parent.code)
        }),
        suppliers: t.prismaField({
            type: ['Supplier'],
            resolve: (query: Prisma.SupplierFindManyArgs, parent: Cabinet, _args: {}, ctx: GraphQLContext) =>
                getSupplierService(ctx).findByCabinetCode(query, parent.code)
        }),

        // Компоненты кабинета
        items: t.prismaConnection({
            type: 'CabinetItemComponent',
            cursor: 'cabinetCode_itemCode',
            totalCount: (parent: Cabinet, _args: {}, ctx: GraphQLContext) =>
                ctx.prisma.cabinetItemComponent.count({ where: { cabinetCode: parent.code } }),
            resolve: (query: Prisma.CabinetItemComponentFindManyArgs, parent: Cabinet, _args: {}, ctx: GraphQLContext) =>
                getCabinetItemComponentService(ctx).findByCabinetCode(query, parent.code)
        }),

        // Цена кабинета
        price: t.prismaField({
            type: 'CabinetPrice',
            nullable: true,
            resolve: (query: Prisma.CabinetPriceFindFirstArgs, parent: Cabinet, _args: {}, ctx: GraphQLContext) =>
                getCabinetPriceService(ctx).findByCabinetCode(query, parent.code)
        }),
    }),
});