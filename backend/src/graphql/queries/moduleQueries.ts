// src/graphql/queries/moduleQueries.ts
import { builder } from '../builder';
import { Prisma } from '@prisma/client';

// Input тип для фильтров Модулей
const ModuleFilterInput = builder.inputType('ModuleFilterInput', {
  fields: (t) => ({
      locationCode: t.string({ required: false }),
      pitchCode:    t.string({ required: false }),
      brightnessCode: t.string({ required: false }), // Оставляем, если нужно будет фильтровать
      refreshRateCode: t.string({ required: false }), // Оставляем, если нужно будет фильтровать
  }),
});

builder.queryFields((t) => ({

  // --- ЗАПРОС ДЛЯ ВЫПАДАЮЩЕГО СПИСКА МОДУЛЕЙ (ЕДИНСТВЕННОЕ ОПРЕДЕЛЕНИЕ) ---
  moduleOptions: t.prismaField({
    type: ['Module'],
    description: 'Получить отфильтрованный список модулей для выбора.',
    args: {
        // Используем Input тип для фильтров
        filters: t.arg({ type: ModuleFilterInput, required: false }),
        onlyActive: t.arg.boolean({ defaultValue: true, required: false }),
    },
    resolve: async (query, _parent, args, ctx) => {
        const { filters, onlyActive } = args;
        console.log('[moduleOptions] Fetching with filters:', JSON.stringify(filters));

        const where: Prisma.ModuleWhereInput = {
            active: onlyActive ?? undefined,
        };

        // Применяем фильтры
        if (filters) {
            if (filters.locationCode) {
                where.locations = { some: { locationCode: filters.locationCode } };
            }
            if (filters.pitchCode) {
                where.pitches = { some: { pitchCode: filters.pitchCode } };
            }
            // Добавляем фильтры по яркости и частоте, если они переданы
            if (filters.brightnessCode) {
                where.brightnesses = { some: { brightnessCode: filters.brightnessCode } };
            }
            if (filters.refreshRateCode) {
                where.refreshRates = { some: { refreshRateCode: filters.refreshRateCode } };
            }
        }

        console.log(`[moduleOptions] Final where clause:`, JSON.stringify(where));
        return ctx.prisma.module.findMany({
            ...query, // Важно для code, sku, name и для связей!
            where,
            orderBy: [ { sku: 'asc' }, { name: 'asc' }, { code: 'asc' } ]
        });
    }
  }), // --- Конец запроса moduleOptions ---

  // --- Получить Module по коду (оставляем) ---
  moduleByCode: t.prismaField({
    type: 'Module',
    nullable: true,
    args: {
      code: t.arg.string({ required: true }),
    },
    resolve: (query, _parent, args, ctx) =>
      ctx.prisma.module.findUnique({
        ...query,
        where: { code: args.code },
      }),
  }),

  // Старый запрос `modules` (connection) можно оставить, если он нужен для других целей,
  // либо удалить, если `moduleOptions` его полностью заменяет.
  // modules: t.prismaConnection({ /* ... */ }),

}));