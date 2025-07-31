import { builder } from '../builder.js';
import type { Prisma } from '@prisma/client';
import type { GraphQLContext } from '../builder.js';

type Module = Prisma.ModuleGetPayload<{}>;

type ModuleFieldBuilder = Parameters<
    Parameters<typeof builder.prismaNode>[1]['fields']
>[0];

const getItemCategoryService = (ctx: GraphQLContext) => ctx.services.itemCategoryService;
const getItemSubcategoryService = (ctx: GraphQLContext) => ctx.services.itemSubcategoryService;
const getLocationService = (ctx: GraphQLContext) => ctx.services.locationService;
const getModuleSizeService = (ctx: GraphQLContext) => ctx.services.moduleSizeService;
const getModuleItemComponentService = (ctx: GraphQLContext) => ctx.services.moduleItemComponentService;
const getPitchService = (ctx: GraphQLContext) => ctx.services.pitchService;
const getManufacturerService = (ctx: GraphQLContext) => ctx.services.manufacturerService;
const getOptionService = (ctx: GraphQLContext) => ctx.services.optionService;
const getModulePriceService = (ctx: GraphQLContext) => ctx.services.modulePriceService;

builder.prismaNode('Module', {
    id: { field: 'id' },
    findUnique: (id: string, { prisma }: GraphQLContext) =>
        prisma.module.findUnique({
            where: { id: parseInt(id, 10) },
        }),
    fields: (t: ModuleFieldBuilder) => ({
        code: t.exposeString('code'),
        sku: t.exposeString('sku', { nullable: true }),
        name: t.exposeString('name', { nullable: true }),
        moduleOption: t.exposeString('moduleOption', { nullable: true }),
        active: t.exposeBoolean('active'),
        createdAt: t.expose('createdAt', { type: 'DateTime' }),
        updatedAt: t.expose('updatedAt', { type: 'DateTime' }),

        // Измененный резолвер с логами
        brightness: t.int({
            nullable: true,
            resolve: async (parent: Module, _args: {}, ctx: GraphQLContext) => {
                console.log(`[DEBUG] Ищем яркость для модуля: ${parent.code}`);

                const relation = await ctx.prisma.moduleBrightness.findFirst({
                    where: { moduleCode: parent.code },
                    include: { brightness: true }
                });

                console.log(`[DEBUG] Результат из базы (relation):`, relation);

                if (relation && relation.brightness) {
                    console.log(`[DEBUG] Найдено значение яркости:`, relation.brightness.value);
                    return relation.brightness.value;
                } else {
                    console.log(`[DEBUG] Связь или значение яркости не найдены.`);
                    return null;
                }
            }
        }),
        refreshRate: t.int({
            nullable: true,
            resolve: async (parent: Module, _args: {}, ctx: GraphQLContext) => {
                const relation = await ctx.prisma.moduleRefreshRate.findFirst({
                    where: { moduleCode: parent.code },
                    include: { refreshRate: true }
                });
                return relation?.refreshRate.value ?? null;
            }
        }),

        categories: t.prismaField({
            type: ['ItemCategory'],
            resolve: (query: Prisma.ItemCategoryFindManyArgs, parent: Module, _args: {}, ctx: GraphQLContext) =>
                getItemCategoryService(ctx).findByModuleCode(query, parent.code)
        }),
        subcategories: t.prismaField({
            type: ['ItemSubcategory'],
            resolve: (query: Prisma.ItemSubcategoryFindManyArgs, parent: Module, _args: {}, ctx: GraphQLContext) =>
                getItemSubcategoryService(ctx).findByModuleCode(query, parent.code)
        }),
        locations: t.prismaField({
            type: ['Location'],
            resolve: (query: Prisma.LocationFindManyArgs, parent: Module, _args: {}, ctx: GraphQLContext) =>
                getLocationService(ctx).findByModuleCode(query, parent.code)
        }),
        sizes: t.prismaField({
            type: ['ModuleSize'],
            args: { onlyActive: t.arg.boolean({ defaultValue: true }) },
            resolve: async (query: Prisma.ModuleSizeFindManyArgs, parent: Module, args: { onlyActive: boolean }, ctx: GraphQLContext) => {
                return getModuleSizeService(ctx).findByModuleCode(query, parent.code, args.onlyActive ?? null);
            }
        }),
        items: t.prismaField({
            type: ['ModuleItemComponent'],
            resolve: (query: Prisma.ModuleItemComponentFindManyArgs, parent: Module, _args: {}, ctx: GraphQLContext) =>
                getModuleItemComponentService(ctx).findByModuleCode(query, parent.code)
        }),
        pitches: t.prismaField({
            type: ['Pitch'],
            resolve: (query: Prisma.PitchFindManyArgs, parent: Module, _args: {}, ctx: GraphQLContext) =>
                getPitchService(ctx).findByModuleCode(query, parent.code)
        }),
        manufacturers: t.prismaField({
            type: ['Manufacturer'],
            resolve: (query: Prisma.ManufacturerFindManyArgs, parent: Module, _args: {}, ctx: GraphQLContext) =>
                getManufacturerService(ctx).findByModuleCode(query, parent.code)
        }),
        options: t.prismaField({
            type: ['Option'],
            resolve: (query: Prisma.OptionFindManyArgs, parent: Module, _args: {}, ctx: GraphQLContext) =>
                getOptionService(ctx).findByModuleCode(query, parent.code)
        }),
        price: t.prismaField({
            type: 'ModulePrice',
            nullable: true,
            resolve: (query: Prisma.ModulePriceFindFirstArgs, parent: Module, _args: {}, ctx: GraphQLContext) =>
                getModulePriceService(ctx).findByModuleCode(query, parent.code)
        }),

        brightnesses: t.relation('brightnesses'),
        refreshRates: t.relation('refreshRates'),
    }),
});