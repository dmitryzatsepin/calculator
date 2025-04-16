// src/graphql/types/Module.ts
import { builder } from '../builder';
import { Prisma } from '@prisma/client'; // Импорт для Decimal

 // Определяем тип ModulePrice
const ModulePriceRelay = builder.prismaNode('ModulePrice', {
    id: { field: 'moduleCode' },
    fields: (t) => ({
        moduleCode: t.exposeString('moduleCode'),
        // --- ИСПРАВЛЕНО: Используем t.field для priceUsd ---
        priceUsd: t.field({
            type: 'Float', nullable: true, select: { priceUsd: true },
            resolve: (parent) => parent.priceUsd ? parent.priceUsd.toNumber() : null
        }),
        // --- ИСПРАВЛЕНО: Используем t.field для priceRub ---
        priceRub: t.field({
            type: 'Float', nullable: true, select: { priceRub: true },
            resolve: (parent) => parent.priceRub ? parent.priceRub.toNumber() : null
        }),
    }),
});

 // Определяем тип ModuleItemComponent (аналогично CabinetItemComponent)
 // --- ИЗМЕНЕНО: Используем prismaObject ---
builder.prismaObject('ModuleItemComponent', {
    // ID не определяем
    fields: (t) => ({
        quantity: t.exposeInt('quantity'),
        item: t.prismaField({
            type: 'Item',
            resolve: (query, parent, args, ctx) =>
                ctx.prisma.item.findUniqueOrThrow({ ...query, where: { code: parent.itemCode } })
        }),
        // module: t.prismaField({ type: 'Module', ... }) // Обратная связь
    })
});


builder.prismaNode('Module', {
  id: { field: 'id' },
  fields: (t) => ({
    code: t.exposeString('code'),
    sku: t.exposeString('sku', { nullable: true }),
    name: t.exposeString('name', { nullable: true }),
    moduleOption: t.exposeString('moduleOption', { nullable: true }),
    active: t.exposeBoolean('active'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),

    // --- Связи M-N ---
    categories: t.prismaField({
        type: ['ItemCategory'],
         resolve: async (query, parent, args, ctx) => {
            const relations = await ctx.prisma.moduleCategory.findMany({ where: { moduleCode: parent.code }, select: { categoryCode: true } });
            return ctx.prisma.itemCategory.findMany({ ...query, where: { code: { in: relations.map(r => r.categoryCode) } } });
        }
    }),
    subcategories: t.prismaField({
        type: ['ItemSubcategory'],
         resolve: async (query, parent, args, ctx) => {
            const relations = await ctx.prisma.moduleSubcategory.findMany({ where: { moduleCode: parent.code }, select: { subcategoryCode: true } });
            return ctx.prisma.itemSubcategory.findMany({ ...query, where: { code: { in: relations.map(r => r.subcategoryCode) } } });
        }
    }),
    locations: t.prismaField({
         type: ['Location'],
         resolve: async (query, parent, args, ctx) => {
            const relations = await ctx.prisma.moduleLocation.findMany({ where: { moduleCode: parent.code }, select: { locationCode: true } });
            return ctx.prisma.location.findMany({ ...query, where: { code: { in: relations.map(r => r.locationCode) } } });
        }
    }),
     refreshRates: t.prismaField({
         type: ['RefreshRate'],
         resolve: async (query, parent, args, ctx) => {
            const relations = await ctx.prisma.moduleRefreshRate.findMany({ where: { moduleCode: parent.code }, select: { refreshRateCode: true } });
            return ctx.prisma.refreshRate.findMany({ ...query, where: { code: { in: relations.map(r => r.refreshRateCode) } } });
        }
    }),
     brightnesses: t.prismaField({
         type: ['Brightness'],
         resolve: async (query, parent, args, ctx) => {
            const relations = await ctx.prisma.moduleBrightness.findMany({ where: { moduleCode: parent.code }, select: { brightnessCode: true } });
            return ctx.prisma.brightness.findMany({ ...query, where: { code: { in: relations.map(r => r.brightnessCode) } } });
        }
    }),
     sizes: t.prismaField({
         type: ['ModuleSize'],
         resolve: async (query, parent, args, ctx) => {
            const relations = await ctx.prisma.moduleModuleSize.findMany({ where: { moduleCode: parent.code }, select: { moduleSizeCode: true } });
            return ctx.prisma.moduleSize.findMany({ ...query, where: { code: { in: relations.map(r => r.moduleSizeCode) } } });
        }
    }),
     pitches: t.prismaField({
         type: ['Pitch'],
         resolve: async (query, parent, args, ctx) => {
            const relations = await ctx.prisma.modulePitch.findMany({ where: { moduleCode: parent.code }, select: { pitchCode: true } });
            return ctx.prisma.pitch.findMany({ ...query, where: { code: { in: relations.map(r => r.pitchCode) } } });
        }
    }),
     manufacturers: t.prismaField({
         type: ['Manufacturer'],
         resolve: async (query, parent, args, ctx) => {
            const relations = await ctx.prisma.moduleManufacturer.findMany({ where: { moduleCode: parent.code }, select: { manufacturerCode: true } });
            return ctx.prisma.manufacturer.findMany({ ...query, where: { code: { in: relations.map(r => r.manufacturerCode) } } });
        }
    }),
     options: t.prismaField({
         type: ['Option'],
         resolve: async (query, parent, args, ctx) => {
            const relations = await ctx.prisma.moduleOption.findMany({ where: { moduleCode: parent.code }, select: { optionCode: true } });
            return ctx.prisma.option.findMany({ ...query, where: { code: { in: relations.map(r => r.optionCode) } } });
        }
    }),

    // Компоненты модуля (ModuleItemComponent)
     items: t.prismaConnection({
        type: 'ModuleItemComponent', // Ссылка на тип ModuleItemComponent
        cursor: 'moduleCode_itemCode',
        resolve: (query, parent, args, ctx) =>
            ctx.prisma.moduleItemComponent.findMany({ ...query, where: { moduleCode: parent.code } })
    }),

    // Цена модуля (ModulePrice)
     price: t.prismaField({
        type: 'ModulePrice', // Ссылка на тип ModulePrice
        nullable: true,
        resolve: (query, parent, args, ctx) => ctx.prisma.modulePrice.findUnique({
             ...query,
             where: { moduleCode: parent.code }
         })
    }),
  }),
});