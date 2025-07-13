import { builder } from '../builder.js';
import type { Prisma } from '@prisma/client';
import type { GraphQLContext } from '../builder.js';

type Item = Prisma.ItemGetPayload<{}>;
type ItemPrice = Prisma.ItemPriceGetPayload<{}>;

type ItemFieldBuilder = Parameters<Parameters<typeof builder.prismaNode>[1]['fields']>[0];
type ItemPriceFieldBuilder = Parameters<Parameters<typeof builder.prismaNode>[1]['fields']>[0];

const getItemCategoryService = (ctx: GraphQLContext) => ctx.services.itemCategoryService;
const getItemSubcategoryService = (ctx: GraphQLContext) => ctx.services.itemSubcategoryService;
const getSupplierService = (ctx: GraphQLContext) => ctx.services.supplierService;
const getItemPriceService = (ctx: GraphQLContext) => ctx.services.priceService;

const ItemPriceRelay = builder.prismaNode('ItemPrice', {
    id: { field: 'itemCode' },
    findUnique: (id: string, { prisma }: GraphQLContext) =>
        prisma.itemPrice.findUnique({
            where: { itemCode: id },
        }),
    fields: (t: ItemPriceFieldBuilder) => ({
        priceUsd: t.float({ nullable: true, resolve: (p: ItemPrice) => p.priceUsd?.toNumber() ?? null }),
        priceRub: t.float({ nullable: true, resolve: (p: ItemPrice) => p.priceRub?.toNumber() ?? null }),
    }),
});

builder.prismaNode('Item', {
    id: { field: 'id' },
    findUnique: (id: string, { prisma }: GraphQLContext) =>
        prisma.item.findUnique({
            where: { id: parseInt(id, 10) },
        }),
    fields: (t: ItemFieldBuilder) => ({
        code: t.exposeString('code'),
        sku: t.exposeString('sku', { nullable: true }),
        name: t.exposeString('name'),
        active: t.exposeBoolean('active'),
        comment: t.exposeString('comment', { nullable: true }),
        createdAt: t.expose('createdAt', { type: 'DateTime' }),
        updatedAt: t.expose('updatedAt', { type: 'DateTime' }),

        categories: t.prismaField({
            type: ['ItemCategory'],
            resolve: (query: Prisma.ItemCategoryFindManyArgs, parent: Item, _args: {}, ctx: GraphQLContext) =>
                getItemCategoryService(ctx).findByItemCode(query, parent.code)
        }),

        subcategories: t.prismaField({
            type: ['ItemSubcategory'],
            resolve: (query: Prisma.ItemSubcategoryFindManyArgs, parent: Item, _args: {}, ctx: GraphQLContext) =>
                getItemSubcategoryService(ctx).findByItemCode(query, parent.code)
        }),

        suppliers: t.prismaField({
            type: ['Supplier'],
            resolve: (query: Prisma.SupplierFindManyArgs, parent: Item, _args: {}, ctx: GraphQLContext) =>
                getSupplierService(ctx).findByItemCode(query, parent.code)
        }),

        price: t.field({
            type: ItemPriceRelay,
            nullable: true,
            resolve: async (parent: Item, _args: {}, ctx: GraphQLContext) => {
                const priceResults = await getItemPriceService(ctx).findPricesByCodes({
                    itemCodes: [parent.code]
                });
                const priceResult = priceResults[0];

                if (!priceResult || (priceResult.priceUsd === null && priceResult.priceRub === null)) {
                    return null;
                }

                return {
                    itemCode: priceResult.code,
                    priceUsd: priceResult.priceUsd,
                    priceRub: priceResult.priceRub,
                };
            },
        }),
    }),
});