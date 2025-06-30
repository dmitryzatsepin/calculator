// backend/src/graphql/types/Module.ts
import { builder } from '../builder';

import { ItemCategoryService } from '../../services/itemCategoryService';
import { ItemSubcategoryService } from '../../services/itemSubcategoryService';
import { LocationService } from '../../services/locationService';
import { ModuleSizeService } from '../../services/moduleSizeService';
import { ModuleItemComponentService } from '../../services/moduleItemComponentService';
import { PitchService } from '../../services/pitchService';
import { ManufacturerService } from '../../services/manufacturerService';
import { OptionService } from '../../services/optionService';
import { ModulePriceService } from '../../services/modulePriceService';

const getItemCategoryService = (ctx: any) => new ItemCategoryService(ctx.prisma);
const getItemSubcategoryService = (ctx: any) => new ItemSubcategoryService(ctx.prisma);
const getLocationService = (ctx: any) => new LocationService(ctx.prisma);
const getModuleSizeService = (ctx: any) => new ModuleSizeService(ctx.prisma);
const getModuleItemComponentService = (ctx: any) => new ModuleItemComponentService(ctx.prisma);
const getPitchService = (ctx: any) => new PitchService(ctx.prisma);
const getManufacturerService = (ctx: any) => new ManufacturerService(ctx.prisma);
const getOptionService = (ctx: any) => new OptionService(ctx.prisma);
const getModulePriceService = (ctx: any) => new ModulePriceService(ctx.prisma);

builder.prismaNode('Module', {
    id: { field: 'id' },
    fields: (t) => ({
        // Простые поля
        code: t.exposeString('code'),
        sku: t.exposeString('sku', { nullable: true }),
        name: t.exposeString('name', { nullable: true }),
        moduleOption: t.exposeString('moduleOption', { nullable: true }),
        active: t.exposeBoolean('active'),
        createdAt: t.expose('createdAt', { type: 'DateTime' }),
        updatedAt: t.expose('updatedAt', { type: 'DateTime' }),

        // --- Связи, делегированные сервисам ---
        categories: t.prismaField({
            type: ['ItemCategory'],
            resolve: (query, parent, _args, ctx) => getItemCategoryService(ctx).findByModuleCode(query, parent.code)
        }),
        subcategories: t.prismaField({
            type: ['ItemSubcategory'],
            resolve: (query, parent, _args, ctx) => getItemSubcategoryService(ctx).findByModuleCode(query, parent.code)
        }),
        locations: t.prismaField({
            type: ['Location'],
            resolve: (query, parent, _args, ctx) => getLocationService(ctx).findByModuleCode(query, parent.code)
        }),
        sizes: t.prismaField({
            type: ['ModuleSize'],
            args: { onlyActive: t.arg.boolean({ defaultValue: true }) },
            resolve: async (query, parent, args, ctx) => {
                return getModuleSizeService(ctx).findByModuleCode(query, parent.code, args.onlyActive ?? null);
            }
        }),
        items: t.prismaField({
            type: ['ModuleItemComponent'],
            resolve: (query, parent, _args, ctx) => getModuleItemComponentService(ctx).findByModuleCode(query, parent.code)
        }),
        pitches: t.prismaField({
            type: ['Pitch'],
            resolve: (query, parent, _args, ctx) => getPitchService(ctx).findByModuleCode(query, parent.code)
        }),
        manufacturers: t.prismaField({
            type: ['Manufacturer'],
            resolve: (query, parent, _args, ctx) => getManufacturerService(ctx).findByModuleCode(query, parent.code)
        }),
        options: t.prismaField({
            type: ['Option'],
            resolve: (query, parent, _args, ctx) => getOptionService(ctx).findByModuleCode(query, parent.code)
        }),
        price: t.prismaField({
            type: 'ModulePrice',
            nullable: true,
            resolve: (query, parent, _args, ctx) => getModulePriceService(ctx).findByModuleCode(query, parent.code)
        }),

        // Простые связи, которые Pothos может обработать сам
        brightnesses: t.relation('brightnesses'),
        refreshRates: t.relation('refreshRates'),
    }),
});