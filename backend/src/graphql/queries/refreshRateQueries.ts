// src/graphql/queries/refreshRateQueries.ts
import { builder } from '../builder';
import { Prisma } from '@prisma/client'; // Добавляем Prisma для типов WhereInput

builder.queryFields((t) => ({

  // --- СТАРЫЙ ЗАПРОС для получения ВСЕХ RefreshRate (оставляем, если нужен) ---
  refreshRates: t.prismaField({
    type: ['RefreshRate'],
    description: 'Получить список всех значений частоты обновления.',
    args: {
      onlyActive: t.arg.boolean({
        required: false,
        defaultValue: true,
        description: 'Вернуть только активные значения частоты обновления?'
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
         orderBy: {
             value: 'asc'
         }
      });
    }
  }), // --- Конец запроса refreshRates ---

  // --- НОВЫЙ ЗАПРОС: Получить опции RefreshRate по Location и Pitch ---
  getFilteredRefreshRateOptions: t.prismaField({
    type: ['RefreshRate'], // Возвращает массив RefreshRate
    description: 'Получить доступные значения частоты обновления для модулей, подходящих под расположение и шаг пикселя.',
    args: {
        locationCode: t.arg.string({ required: true, description: 'Код расположения (Location)' }),
        pitchCode: t.arg.string({ required: true, description: 'Код шага пикселя' }),
        onlyActive: t.arg.boolean({ defaultValue: true, required: false, description: 'Учитывать только активные модули и частоты?'})
    },
    resolve: async (query, _parent, args, ctx) => {
        const { locationCode, pitchCode, onlyActive } = args;
        console.log(`[getFilteredRefreshRateOptions] Fetching refresh rates for location: ${locationCode}, pitch: ${pitchCode}`);

        // 1. Найти УНИКАЛЬНЫЕ коды частот обновления, связанные с модулями,
        //    которые подходят под локацию И питч И активны (если onlyActive=true)
        const refreshRateRelations = await ctx.prisma.moduleRefreshRate.findMany({
            where: {
                module: { // Ищем модули...
                    active: onlyActive ?? undefined,
                    locations: { some: { locationCode: locationCode } }, // ...с нужной локацией
                    pitches: { some: { pitchCode: pitchCode } } // ...и нужным питчем
                },
                // Условие на активность самой частоты обновления
                refreshRate: { active: onlyActive ?? undefined }
            },
            select: { refreshRateCode: true },
            distinct: ['refreshRateCode'] // Уникальные коды
        });

        const availableRefreshRateCodes = refreshRateRelations.map(rr => rr.refreshRateCode);

        if (availableRefreshRateCodes.length === 0) {
            console.log(`[getFilteredRefreshRateOptions] No relevant refresh rates found for location: ${locationCode}, pitch: ${pitchCode}`);
            return [];
        }
         console.log(`[getFilteredRefreshRateOptions] Found relevant refresh rate codes:`, availableRefreshRateCodes);

        // 2. Запросить сами объекты RefreshRate по найденным кодам
        return ctx.prisma.refreshRate.findMany({
            ...query,
            where: {
                code: { in: availableRefreshRateCodes },
                // 'active' уже учтен выше
            },
            orderBy: { value: 'asc' } // Сортируем по значению
        });
    }
  }) // --- Конец getFilteredRefreshRateOptions ---

})); // --- Конец builder.queryFields ---