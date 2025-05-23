// src/graphql/types/Module.ts
import { builder } from '../builder';
import { Prisma } from '../../../prisma/generated/client';

 // Определяем тип ModulePrice
const ModulePriceRelay = builder.prismaNode('ModulePrice', {
    id: { field: 'moduleCode' },
    fields: (t) => ({
        moduleCode: t.exposeString('moduleCode'),
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

 // Определяем тип ModuleItemComponent
builder.prismaObject('ModuleItemComponent', {
    fields: (t) => ({
        quantity: t.exposeInt('quantity'),
        item: t.prismaField({
            type: 'Item',
            resolve: (query, parent, _args, ctx) =>
                ctx.prisma.item.findUniqueOrThrow({ ...query, where: { code: parent.itemCode } })
        }),
    })
});

// Определяем тип для связующей модели ModuleBrightness
builder.prismaObject('ModuleBrightness', {
    fields: (t) => ({
      moduleCode: t.exposeString('moduleCode'),
      brightnessCode: t.exposeString('brightnessCode'),
    })
});

// Определяем тип для связующей модели ModuleRefreshRate
builder.prismaObject('ModuleRefreshRate', {
    fields: (t) => ({
      moduleCode: t.exposeString('moduleCode'),
      refreshRateCode: t.exposeString('refreshRateCode'),
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
         resolve: async (query, parent, _args, ctx) => {
            const relations = await ctx.prisma.moduleCategory.findMany({ where: { moduleCode: parent.code }, select: { categoryCode: true } });
            const categoryCodes = relations.map(r => r.categoryCode);
            if (categoryCodes.length === 0) return [];
            return ctx.prisma.itemCategory.findMany({ ...query, where: { code: { in: categoryCodes } } });
        }
    }),
    subcategories: t.prismaField({
        type: ['ItemSubcategory'],
         resolve: async (query, parent, _args, ctx) => {
            const relations = await ctx.prisma.moduleSubcategory.findMany({ where: { moduleCode: parent.code }, select: { subcategoryCode: true } });
            const subcategoryCodes = relations.map(r => r.subcategoryCode);
             if (subcategoryCodes.length === 0) return [];
            return ctx.prisma.itemSubcategory.findMany({ ...query, where: { code: { in: subcategoryCodes } } });
        }
    }),
    locations: t.prismaField({
         type: ['Location'],
         resolve: async (query, parent, _args, ctx) => {
            const relations = await ctx.prisma.moduleLocation.findMany({ where: { moduleCode: parent.code }, select: { locationCode: true } });
            const locationCodes = relations.map(r => r.locationCode);
             if (locationCodes.length === 0) return [];
            return ctx.prisma.location.findMany({ ...query, where: { code: { in: locationCodes } } });
        }
    }),

    sizes: t.prismaField({
        type: ['ModuleSize'],
        resolve: async (query, parent, args, ctx) => {
            console.log(`[Module.sizes resolver V2] Resolving sizes for module: ${parent.code}`);
            try {
                return ctx.prisma.moduleSize.findMany({
                    ...query,
                    where: {
                        modules: {
                            some: {
                                moduleCode: parent.code
                            }
                        },
                        active: true
                    }
                });
            } catch (error: any) {
                 console.error(`[Module.sizes resolver V2] Error resolving sizes for module ${parent.code}:`, error);
                 return [];
             }
        }
    }),

    items: t.prismaField({
        type: ['ModuleItemComponent'],
        resolve: async (query, parent, _args, ctx) => {
            console.log(`[Module.items resolver] Resolving items for module: ${parent.code}`);
             return ctx.prisma.moduleItemComponent.findMany({
                ...query,
                where: {
                    moduleCode: parent.code,
                    item: { active: true }
                }
            });
        }
    }),

    // Связь с Яркостью через промежуточную модель ---
    brightnesses: t.relation('brightnesses'),
    refreshRates: t.relation('refreshRates'),

     pitches: t.prismaField({
         type: ['Pitch'],
         resolve: async (query, parent, _args, ctx) => {
            const relations = await ctx.prisma.modulePitch.findMany({ where: { moduleCode: parent.code }, select: { pitchCode: true } });
            const pitchCodes = relations.map(r => r.pitchCode);
             if (pitchCodes.length === 0) return [];
            return ctx.prisma.pitch.findMany({ ...query, where: { code: { in: pitchCodes } } });
        }
    }),
     manufacturers: t.prismaField({
         type: ['Manufacturer'],
         resolve: async (query, parent, _args, ctx) => {
            const relations = await ctx.prisma.moduleManufacturer.findMany({ where: { moduleCode: parent.code }, select: { manufacturerCode: true } });
            const manufacturerCodes = relations.map(r => r.manufacturerCode);
             if (manufacturerCodes.length === 0) return [];
            return ctx.prisma.manufacturer.findMany({ ...query, where: { code: { in: manufacturerCodes } } });
        }
    }),
     options: t.prismaField({
         type: ['Option'],
         resolve: async (query, parent, _args, ctx) => {
            const relations = await ctx.prisma.moduleOption.findMany({ where: { moduleCode: parent.code }, select: { optionCode: true } });
            const optionCodes = relations.map(r => r.optionCode);
            if (optionCodes.length === 0) return [];
            return ctx.prisma.option.findMany({ ...query, where: { code: { in: optionCodes } } });
        }
    }),

    // Цена модуля (ModulePrice)
     price: t.prismaField({
        type: 'ModulePrice',
        nullable: true,
        resolve: (query, parent, _args, ctx) => ctx.prisma.modulePrice.findUnique({
             ...query,
             where: { moduleCode: parent.code }
         })
    }),
  }),
});