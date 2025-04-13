// src/graphql/types/ModuleSize.ts
import { builder } from '../builder';
import { Prisma } from '@prisma/client'; // Для WhereInput

builder.prismaNode('ModuleSize', {
  id: { field: 'id' },
  fields: (t) => ({
    code: t.exposeString('code'),
    size: t.exposeString('size'),
    width: t.exposeInt('width'),
    height: t.exposeInt('height'),
    active: t.exposeBoolean('active'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),

    // Связь с модулями этого размера (как была)
    modules: t.prismaField({
        type: ['Module'],
        description: "Модули, имеющие данный размер.",
        args: { onlyActive: t.arg.boolean({ defaultValue: true }) },
        resolve: async (query, parent, args, ctx) => {
            const relations = await ctx.prisma.moduleModuleSize.findMany({
                where: { moduleSizeCode: parent.code }, select: { moduleCode: true } });
            const moduleCodes = relations.map(r => r.moduleCode);
            if (moduleCodes.length === 0) { return []; }
            const where: Prisma.ModuleWhereInput = { code: { in: moduleCodes } };
            if (args.onlyActive !== null && args.onlyActive !== undefined) { where.active = args.onlyActive; }
            return ctx.prisma.module.findMany({ ...query, where: where });
        }
    }),

    // --- ДОБАВЛЕНО: Связь с совместимыми размерами кабинетов ---
    compatibleCabinetSizes: t.prismaField({
        type: ['CabinetSize'], // Массив размеров кабинетов
        description: "Размеры кабинетов, совместимые с данным размером модуля.",
        args: { // Аргумент для фильтрации по активности размера кабинета
            onlyActive: t.arg.boolean({ defaultValue: true })
        },
        resolve: async (query, parent, args, ctx) => {
            // Находим связи в CabinetSizeModuleSize
            const relations = await ctx.prisma.cabinetSizeModuleSize.findMany({
                where: { moduleSizeCode: parent.code }, // Ищем по коду текущего размера модуля
                select: { cabinetSizeCode: true } // Нужны коды размеров кабинетов
            });
            const cabinetSizeCodes = relations.map(r => r.cabinetSizeCode);
            if (cabinetSizeCodes.length === 0) return [];

            // Собираем условие для поиска CabinetSize
            const where: Prisma.CabinetSizeWhereInput = { code: { in: cabinetSizeCodes } };
            if (args.onlyActive !== null && args.onlyActive !== undefined) {
                 where.active = args.onlyActive;
            }
            // Ищем сами объекты CabinetSize
            return ctx.prisma.cabinetSize.findMany({ ...query, where });
        }
    }),
    // --- КОНЕЦ ДОБАВЛЕНИЯ ---

  }),
});