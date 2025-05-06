// src/graphql/types/CabinetSize.ts
import { builder } from '../builder';
import { Prisma } from '../../../prisma/generated/client';

builder.prismaNode('CabinetSize', {
  id: { field: 'id' },
  fields: (t) => ({
    code: t.exposeString('code'),
    size: t.exposeString('size'),
    width: t.exposeInt('width'),
    height: t.exposeInt('height'),
    active: t.exposeBoolean('active'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),

    // Связь с совместимыми размерами модулей (как была)
    compatibleModuleSizes: t.prismaField({
        type: ['ModuleSize'],
        description: "Размеры модулей, совместимые с данным размером кабинета.",
        args: { onlyActive: t.arg.boolean({ defaultValue: true }) },
        resolve: async (query, parent, args, ctx) => {
            const relations = await ctx.prisma.cabinetSizeModuleSize.findMany({
                 where: { cabinetSizeCode: parent.code }, select: { moduleSizeCode: true } });
            const moduleSizeCodes = relations.map(r => r.moduleSizeCode);
            if (moduleSizeCodes.length === 0) return [];
            const where: Prisma.ModuleSizeWhereInput = { code: { in: moduleSizeCodes } };
             if (args.onlyActive !== null && args.onlyActive !== undefined) { where.active = args.onlyActive; }
            return ctx.prisma.moduleSize.findMany({ ...query, where });
        }
    }),

    // --- ДОБАВЛЕНО: Связь с кабинетами этого размера ---
    cabinets: t.prismaField({
        type: ['Cabinet'], // Массив кабинетов
        description: "Кабинеты, имеющие данный размер.",
        args: { // Фильтр по активности кабинета
            onlyActive: t.arg.boolean({ defaultValue: true })
        },
        resolve: async (query, parent, args, ctx) => {
            // Находим связи CabinetCabinetSize
            const relations = await ctx.prisma.cabinetCabinetSize.findMany({
                where: { cabinetSizeCode: parent.code }, // Ищем по коду текущего размера кабинета
                select: { cabinetCode: true } // Нужны коды кабинетов
            });
            const cabinetCodes = relations.map(r => r.cabinetCode);
            if (cabinetCodes.length === 0) return [];

            // Собираем условие для поиска Cabinet
            const where: Prisma.CabinetWhereInput = { code: { in: cabinetCodes } };
            if (args.onlyActive !== null && args.onlyActive !== undefined) {
                 where.active = args.onlyActive;
            }
            // Ищем сами объекты Cabinet
            return ctx.prisma.cabinet.findMany({ ...query, where });
        }
    }),
    // --- КОНЕЦ ДОБАВЛЕНИЯ ---

  }),
});