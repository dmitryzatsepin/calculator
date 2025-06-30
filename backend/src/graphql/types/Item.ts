// backend/src/graphql/types/Item.ts
import { builder } from '../builder';
import { ItemCategoryService } from '../../services/itemCategoryService';
import { ItemSubcategoryService } from '../../services/itemSubcategoryService';
import { SupplierService } from '../../services/supplierService';
import { ItemPriceService } from '../../services/itemPriceService';

const getItemCategoryService = (ctx: any) => new ItemCategoryService(ctx.prisma);
const getItemSubcategoryService = (ctx: any) => new ItemSubcategoryService(ctx.prisma);
const getSupplierService = (ctx: any) => new SupplierService(ctx.prisma);
const getItemPriceService = (ctx: any) => new ItemPriceService(ctx.prisma);

// Определение типа ItemPrice
const ItemPriceRelay = builder.prismaNode('ItemPrice', {
    id: { field: 'itemCode' },
    fields: (t) => ({
        itemCode: t.exposeString('itemCode'),
        priceUsd: t.float({ nullable: true, resolve: (p) => p.priceUsd?.toNumber() ?? null }),
        priceRub: t.float({ nullable: true, resolve: (p) => p.priceRub?.toNumber() ?? null }),
    }),
});

// Основное определение типа Item
builder.prismaNode('Item', {
    id: { field: 'id' },
    fields: (t) => ({
        code: t.exposeString('code'),
        sku: t.exposeString('sku', { nullable: true }),
        name: t.exposeString('name'),
        active: t.exposeBoolean('active'),
        comment: t.exposeString('comment', { nullable: true }),
        createdAt: t.expose('createdAt', { type: 'DateTime' }),
        updatedAt: t.expose('updatedAt', { type: 'DateTime' }),

        // --- Связи с логикой, вынесенной в сервисы ---
        categories: t.prismaField({
            type: ['ItemCategory'],
            resolve: (query, parent, _args, ctx) => getItemCategoryService(ctx).findByItemCode(query, parent.code)
        }),

        subcategories: t.prismaField({
            type: ['ItemSubcategory'],
            resolve: (query, parent, _args, ctx) => getItemSubcategoryService(ctx).findByItemCode(query, parent.code)
        }),

        suppliers: t.prismaField({
            type: ['Supplier'],
            resolve: (query, parent, _args, ctx) => getSupplierService(ctx).findByItemCode(query, parent.code)
        }),

        price: t.prismaField({
            type: 'ItemPrice',
            nullable: true,
            resolve: (query, parent, _args, ctx) => getItemPriceService(ctx).findByItemCode(query, parent.code)
        }),
    }),
});