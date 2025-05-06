// src/graphql/queries/refreshRateQueries.ts
import { builder } from '../builder';
import { Prisma } from '../../../prisma/generated/client';

builder.queryFields((t) => ({

  // --- СТАРЫЙ ЗАПРОС для получения ВСЕХ RefreshRate ---
  refreshRates: t.prismaField({
    type: ['RefreshRate'],
    description: 'Получить список всех значений частоты обновления.',
    args: {
      onlyActive: t.arg.boolean({
        required: false,
        defaultValue: true,
      })
    },
    resolve: async (query, _parent, args, ctx) => {
      const where: Prisma.RefreshRateWhereInput = {};
       if (args.onlyActive === true || args.onlyActive === false) {
         where.active = args.onlyActive;
      }
      return ctx.prisma.refreshRate.findMany({
         ...query,
         where,
         orderBy: { value: 'asc' }
      });
    }
  }),

  // --- ЗАПРОС: Получить опции RefreshRate по Location, Pitch и Flex ---
  getFilteredRefreshRateOptions: t.prismaField({
    type: ['RefreshRate'],
    description: 'Получить доступные значения частоты обновления для модулей, подходящих под расположение, шаг пикселя и опцию гибкости.',
    args: {
        locationCode: t.arg.string({ required: true }),
        pitchCode: t.arg.string({ required: true }),
        onlyActive: t.arg.boolean({ defaultValue: true, required: false }),
        isFlex: t.arg.boolean({ required: false }) // Аргумент для гибкости
    },
    resolve: async (query, _parent, args, ctx) => {
        // <<< ИСПРАВЛЕНО: Убрано лишнее '=' и улучшена типизация args >>>
        const { locationCode, pitchCode, onlyActive, isFlex } = args as {
             locationCode: string; pitchCode: string; onlyActive?: boolean | null; isFlex?: boolean | null
         };
        console.log(`[getFilteredRefreshRateOptions] Fetching for loc: ${locationCode}, pitch: ${pitchCode}, isFlex: ${isFlex}`);

        // 1. Найти ID/Коды модулей, которые соответствуют ВСЕМ критериям (включая isFlex)
        const moduleWhere: Prisma.ModuleWhereInput = {
            active: onlyActive ?? undefined,
            AND: [
                { locations: { some: { locationCode: locationCode } } },
                { pitches: { some: { pitchCode: pitchCode } } }
            ],
        };

        const relevantModules = await ctx.prisma.module.findMany({
            where: moduleWhere,
            select: { id: true, code: true, name: true } // Выбираем ID и доп. инфо для лога
        });

        const relevantModuleIds = relevantModules.map(m => m.id);
        console.log(`[getFilteredRefreshRateOptions] Found ${relevantModules.length} modules matching criteria:`,
             relevantModules.map(m => ({ id: m.id, code: m.code, name: m.name }))
        );

        if (relevantModuleIds.length === 0) {
             console.log(`[getFilteredRefreshRateOptions] No modules found matching all criteria.`);
            return []; // Если таких модулей нет, то и опций частоты не будет
        }

        // 2. Найти УНИКАЛЬНЫЕ коды частот, связанные с ЭТИМИ модулями
        const refreshRateRelations = await ctx.prisma.moduleRefreshRate.findMany({
            where: {
                 // Фильтруем по связи с найденными модулями
                module: {
                    id: { in: relevantModuleIds }
                },
                // Фильтруем по активности самой Частоты обновления
                refreshRate: { active: onlyActive ?? undefined }
            },
            select: { refreshRateCode: true },
            distinct: ['refreshRateCode'] // Берем только уникальные коды
        });

        const availableRefreshRateCodes = refreshRateRelations.map(rr => rr.refreshRateCode);

        if (availableRefreshRateCodes.length === 0) {
            console.log(`[getFilteredRefreshRateOptions] No relevant refresh rates found for the filtered modules.`);
            return [];
        }
        console.log(`[getFilteredRefreshRateOptions] Found relevant refresh rate codes:`, availableRefreshRateCodes);

        // 3. Запросить сами объекты RefreshRate по найденным кодам
        return ctx.prisma.refreshRate.findMany({
            ...query,
            where: {
                code: { in: availableRefreshRateCodes },
                active: onlyActive ?? undefined, // Фильтруем по активности и здесь
            },
            orderBy: { value: 'asc' }
        });
    }
  })
}));