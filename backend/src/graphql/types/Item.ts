// src/graphql/types/Item.ts
import { builder } from '../builder';

// Определяем тип ItemPrice (если он не используется в других местах, можно определить прямо здесь)
// Или вынести в отдельный файл types/ItemPrice.ts, если будет переиспользоваться
const ItemPriceRelay = builder.prismaNode('ItemPrice', {
    id: { field: 'itemCode' },
    fields: (t) => ({
        itemCode: t.exposeString('itemCode'),
        // --- ИЗМЕНЕНО: Используем t.field для priceUsd ---
        priceUsd: t.field({
            type: 'Float',
            nullable: true,
            select: { priceUsd: true },
            resolve: (parent) => parent.priceUsd ? parent.priceUsd.toNumber() : null
        }),
        // --- ИЗМЕНЕНО: Используем t.field для priceRub ---
        priceRub: t.field({
            type: 'Float',
            nullable: true,
            select: { priceRub: true },
            resolve: (parent) => parent.priceRub ? parent.priceRub.toNumber() : null
        }),
    }),
});


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

    // --- Связи ---

    // Связь с ItemCategory (через ItemCategoryRelation)
    categories: t.prismaField({
        type: ['ItemCategory'], // Массив категорий
        resolve: async (query, parent, args, ctx) => {
            const relations = await ctx.prisma.itemCategoryRelation.findMany({
                where: { itemCode: parent.code },
                select: { categoryCode: true }
            });
            return ctx.prisma.itemCategory.findMany({
                ...query,
                where: { code: { in: relations.map(r => r.categoryCode) } }
            });
        }
    }),

    // Связь с ItemSubcategory (через ItemSubcategoryRelation)
    subcategories: t.prismaField({
        type: ['ItemSubcategory'], // Массив подкатегорий
        resolve: async (query, parent, args, ctx) => {
            const relations = await ctx.prisma.itemSubcategoryRelation.findMany({
                where: { itemCode: parent.code },
                select: { subcategoryCode: true }
            });
            return ctx.prisma.itemSubcategory.findMany({
                ...query,
                where: { code: { in: relations.map(r => r.subcategoryCode) } }
            });
        }
    }),

    // Связь с Supplier (через ItemSupplier)
    suppliers: t.prismaField({
        type: ['Supplier'], // Массив поставщиков
        resolve: async (query, parent, args, ctx) => {
            const relations = await ctx.prisma.itemSupplier.findMany({
                where: { itemCode: parent.code },
                select: { supplierCode: true }
            });
            return ctx.prisma.supplier.findMany({
                ...query,
                where: { code: { in: relations.map(r => r.supplierCode) } }
            });
        }
    }),

    // Связь с ItemPrice (один-к-одному или один-к-нулю)
    // Используем t.prismaField, так как это прямая связь в Prisma (хоть и по code)
    price: t.prismaField({
        type: 'ItemPrice', // Тип, который мы определили выше (или импортировали)
        nullable: true,    // Цена может отсутствовать
        // Pothos/Prisma разрешит эту связь автоматически, если она правильно настроена в schema.prisma
        // Если возникнут проблемы, можно добавить явный resolve:
         resolve: (query, parent, args, ctx) => ctx.prisma.itemPrice.findUnique({
             ...query,
             where: { itemCode: parent.code }
         })
    }),

    // Обратные связи на CabinetItemComponent и ModuleItemComponent
    // Их лучше определять как поля внутри типов Cabinet и Module,
    // чтобы получить список компонентов *для* конкретного кабинета/модуля.
  }),
});