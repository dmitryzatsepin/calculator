// src/graphql/queries/moduleQueries.ts
import { builder } from '../builder';
import { Prisma } from '../../../prisma/generated/client';

// Input тип для фильтров Модулей
const ModuleFilterInput = builder.inputType('ModuleFilterInput', {
  fields: (t) => ({
      locationCode: t.string({ required: false }),
      pitchCode:    t.string({ required: false }),
      brightnessCode: t.string({ required: false }),
      refreshRateCode: t.string({ required: false }),
      isFlex: t.boolean({ required: false })
  }),
});

builder.queryFields((t) => ({

  // --- ЗАПРОС ДЛЯ ВЫПАДАЮЩЕГО СПИСКА МОДУЛЕЙ (ЕДИНСТВЕННОЕ ОПРЕДЕЛЕНИЕ) ---
  moduleOptions: t.prismaField({
    type: ['Module'],
    description: 'Получить отфильтрованный список модулей для выбора.',
    args: {
        filters: t.arg({ type: ModuleFilterInput, required: false }),
        onlyActive: t.arg.boolean({ defaultValue: true, required: false }),
    },
    resolve: async (query, _parent, args, ctx) => {
        const filters = args.filters as {
            locationCode?: string | null;
            pitchCode?: string | null;
            brightnessCode?: string | null;
            refreshRateCode?: string | null;
            isFlex?: boolean | null;
        } | null | undefined;
        const onlyActive = args.onlyActive;
        console.log('[moduleOptions] Fetching with filters:', JSON.stringify(filters));

        const where: Prisma.ModuleWhereInput = {
            active: onlyActive ?? undefined,
        };

        // Добавляем фильтры по связям, если они переданы
        if (filters) {
          if (typeof filters.locationCode === 'string' && filters.locationCode) {
              where.locations = { some: { locationCode: filters.locationCode } };
          }
          if (typeof filters.pitchCode === 'string' && filters.pitchCode) {
              where.pitches = { some: { pitchCode: filters.pitchCode } };
          }
          if (typeof filters.brightnessCode === 'string' && filters.brightnessCode) {
              where.brightnesses = { some: { brightnessCode: filters.brightnessCode } };
          }
          if (typeof filters.refreshRateCode === 'string' && filters.refreshRateCode) {
              where.refreshRates = { some: { refreshRateCode: filters.refreshRateCode } };
          }
          if (typeof filters.isFlex === 'boolean') {
            where.options = filters.isFlex
               ? { some: { optionCode: 'flex' } }
               : { none: { optionCode: 'flex' } };
          } else {
              where.options = { none: { optionCode: 'flex' } };
          }
        } else {
            where.options = { none: { optionCode: 'flex' } };
        }
        

        console.log(`[moduleOptions] Final where clause:`, JSON.stringify(where));
        return ctx.prisma.module.findMany({
            ...query,
            where,
            orderBy: [ { sku: 'asc' }, { name: 'asc' }, { code: 'asc' } ]
        });
    }
  }),

  // --- Получить Module по коду ---
  moduleByCode: t.prismaField({
    type: 'Module',
    nullable: true,
    args: {
      code: t.arg.string({ required: true }),
    },
    resolve: (query, _parent, args, ctx) => {
        const codeArg = args.code as string;
        return ctx.prisma.module.findUnique({
            ...query,
            where: { code: codeArg },
        });
    }
  }),

  // --- Получить ДЕТАЛИ Модуля по коду ---
  moduleDetails: t.prismaField({
    type: 'Module',
    nullable: true,
    args: { code: t.arg.string({ required: true }) },
    resolve: async (_query, _parent, args, ctx) => {
        const codeArg = args.code as string;
        console.log(`[moduleDetails - SIMPLEST RESOLVER] Fetching module ${codeArg}`);
        // Просто ищем модуль, Pothos должен сам разрешить связи
        return ctx.prisma.module.findUnique({ where: { code: codeArg } });
    }
  }),
}));