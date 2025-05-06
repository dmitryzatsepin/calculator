// src/graphql/types/Pitch.ts
import { builder } from '../builder';
import { Prisma } from '../../../prisma/generated/client';

builder.prismaNode('Pitch', {
  id: { field: 'id' },
  fields: (t) => ({
    code: t.exposeString('code'),
    // Используем t.field и select для преобразования Decimal в Float
    pitchValue: t.field({
      type: 'Float',
      select: { pitchValue: true },
      resolve: (parent) => parent.pitchValue.toNumber()
    }),
    active: t.exposeBoolean('active'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),

    // --- ДОБАВЛЕНО: Связь с модулями ---
    modules: t.prismaField({
        type: ['Module'], // Массив модулей
        description: "Модули, имеющие данный шаг пикселя.",
        args: { // Аргумент для фильтрации модулей по активности
             onlyActive: t.arg.boolean({ defaultValue: true })
        },
        resolve: async (query, parent, args, ctx) => {
            // Находим связи
            const relations = await ctx.prisma.modulePitch.findMany({
                 where: { pitchCode: parent.code },
                 select: { moduleCode: true }
            });
            const moduleCodes = relations.map(r => r.moduleCode);
            if (moduleCodes.length === 0) return [];

            // Собираем условие для поиска модулей
            const where: Prisma.ModuleWhereInput = { code: { in: moduleCodes } };
            if (args.onlyActive !== null && args.onlyActive !== undefined) {
                where.active = args.onlyActive;
            }

            // Ищем сами модули
            return ctx.prisma.module.findMany({ ...query, where });
        }
    }),
    // --- КОНЕЦ ДОБАВЛЕНИЯ ---

    // Связь с Cabinet будет в Cabinet.ts
  }),
});