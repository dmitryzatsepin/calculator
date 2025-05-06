// src/graphql/types/Cabinet.ts
import { builder } from '../builder';
import { Prisma } from '../../../prisma/generated/client';

// Определяем тип CabinetPrice
const CabinetPriceRelay = builder.prismaNode('CabinetPrice', {
    id: { field: 'cabinetCode' },
    fields: (t) => ({
        cabinetCode: t.exposeString('cabinetCode'),
        priceUsd: t.field({
            type: 'Float', nullable: true, select: { priceUsd: true },
            resolve: (parent) => parent.priceUsd ? parent.priceUsd.toNumber() : null
        }),
        priceRub: t.field({
            type: 'Float', nullable: true, select: { priceRub: true },
            resolve: (parent) => parent.priceRub ? parent.priceRub.toNumber() : null
        }),
    }),
});

builder.prismaNode('Cabinet', {
  id: { field: 'id' },
  fields: (t) => ({
    code: t.exposeString('code'),
    sku: t.exposeString('sku', { nullable: true }),
    name: t.exposeString('name', { nullable: true }),
    sizes: t.relation('sizes', {
        query: {
            where: {
                size: {
                    active: true
                }
            }
        }
    }),
    active: t.exposeBoolean('active'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),

    // --- Связи M-N ---
    categories: t.prismaField({
        type: ['ItemCategory'],
        resolve: async (query, parent, args, ctx) => {
            const relations = await ctx.prisma.cabinetCategory.findMany({ where: { cabinetCode: parent.code }, select: { categoryCode: true } });
            return ctx.prisma.itemCategory.findMany({ ...query, where: { code: { in: relations.map(r => r.categoryCode) } } });
        }
    }),
    subcategories: t.prismaField({
        type: ['ItemSubcategory'],
        resolve: async (query, parent, args, ctx) => {
            const relations = await ctx.prisma.cabinetSubcategory.findMany({ where: { cabinetCode: parent.code }, select: { subcategoryCode: true } });
            return ctx.prisma.itemSubcategory.findMany({ ...query, where: { code: { in: relations.map(r => r.subcategoryCode) } } });
        }
    }),
    locations: t.prismaField({
        type: ['Location'],
        resolve: async (query, parent, args, ctx) => {
            const relations = await ctx.prisma.cabinetLocation.findMany({ where: { cabinetCode: parent.code }, select: { locationCode: true } });
            return ctx.prisma.location.findMany({ ...query, where: { code: { in: relations.map(r => r.locationCode) } } });
        }
    }),
    placements: t.prismaField({
        type: ['Placement'],
        resolve: async (query, parent, args, ctx) => {
            const relations = await ctx.prisma.cabinetPlacement.findMany({ where: { cabinetCode: parent.code }, select: { placementCode: true } });
            return ctx.prisma.placement.findMany({ ...query, where: { code: { in: relations.map(r => r.placementCode) } } });
        }
    }),
    materials: t.prismaField({
        type: ['Material'],
        resolve: async (query, parent, args, ctx) => {
            const relations = await ctx.prisma.cabinetMaterial.findMany({ where: { cabinetCode: parent.code }, select: { materialCode: true } });
            return ctx.prisma.material.findMany({ ...query, where: { code: { in: relations.map(r => r.materialCode) } } });
        }
    }),
    pitches: t.prismaField({
        type: ['Pitch'],
        resolve: async (query, parent, args, ctx) => {
            const relations = await ctx.prisma.cabinetPitch.findMany({ where: { cabinetCode: parent.code }, select: { pitchCode: true } });
            return ctx.prisma.pitch.findMany({ ...query, where: { code: { in: relations.map(r => r.pitchCode) } } });
        }
    }),
    manufacturers: t.prismaField({
        type: ['Manufacturer'],
        resolve: async (query, parent, args, ctx) => {
            const relations = await ctx.prisma.cabinetManufacturer.findMany({ where: { cabinetCode: parent.code }, select: { manufacturerCode: true } });
            return ctx.prisma.manufacturer.findMany({ ...query, where: { code: { in: relations.map(r => r.manufacturerCode) } } });
        }
    }),
    suppliers: t.prismaField({
        type: ['Supplier'],
        resolve: async (query, parent, args, ctx) => {
            const relations = await ctx.prisma.cabinetSupplier.findMany({ where: { cabinetCode: parent.code }, select: { supplierCode: true } });
            return ctx.prisma.supplier.findMany({ ...query, where: { code: { in: relations.map(r => r.supplierCode) } } });
        }
    }),

// Компоненты кабинета (CabinetItemComponent)
items: t.prismaConnection({
    type: 'CabinetItemComponent',
    cursor: 'cabinetCode_itemCode',
    totalCount: (parent, args, ctx, info) =>
        ctx.prisma.cabinetItemComponent.count({
            where: {
                cabinetCode: parent.code
            }
        }),
    resolve: (query, parent, args, ctx, info) =>
        ctx.prisma.cabinetItemComponent.findMany({
             ...query,
             where: { cabinetCode: parent.code }
         })
}),

// Цена кабинета (CabinetPrice)
price: t.prismaField({
    type: 'CabinetPrice',
    nullable: true,
    resolve: (query, parent, args, ctx, info) => ctx.prisma.cabinetPrice.findUnique({
         ...query,
         where: { cabinetCode: parent.code }
     })
}),
  }),
});