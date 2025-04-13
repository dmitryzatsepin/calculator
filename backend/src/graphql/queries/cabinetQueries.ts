// src/graphql/queries/cabinetQueries.ts
import { builder } from '../builder';
import { Prisma } from '@prisma/client'; // Для WhereInput

builder.queryFields((t) => ({

  // --- ЗАПРОС: Получить список кабинетов ---
  cabinets: t.prismaField({
    type: ['Cabinet'], // Возвращает массив Кабинетов
    description: 'Получить список всех кабинетов.',
    args: {
        onlyActive: t.arg.boolean({ // Аргумент для фильтрации по активности
            defaultValue: true,     // По умолчанию возвращаем только активные
            description: 'Вернуть только активные кабинеты?'
        })
    },
    resolve: async (query, _parent, args, ctx, _info) => {
      console.log(`[cabinets] Fetching cabinets. onlyActive: ${args.onlyActive}`);
      return ctx.prisma.cabinet.findMany({
         ...query, // Передаем select/include из GraphQL запроса
         where: {
             // Применяем фильтр по активности, если аргумент onlyActive передан (или true по умолчанию)
             active: args.onlyActive ?? undefined
         },
         orderBy: {
             code: 'asc' // Сортируем по коду для консистентности
         }
      });
    }
  }), // --- Конец запроса cabinets ---


  // --- ЗАПРОС: Получить один кабинет по коду ---
  cabinetByCode: t.prismaField({
    type: 'Cabinet', // Возвращает один Кабинет
    nullable: true,  // Может вернуть null, если не найден
    description: 'Получить один кабинет по его уникальному коду.',
    args: {
        code: t.arg.string({ required: true, description: 'Уникальный код кабинета' })
    },
    resolve: async (query, _parent, args, ctx, _info) => {
        console.log(`[cabinetByCode] Searching for code: ${args.code}`);
        return ctx.prisma.cabinet.findUnique({
            ...query, // Передаем select/include
            where: {
                code: args.code // Ищем по уникальному полю code
            }
        });
    }
  }), // --- Конец запроса cabinetByCode ---


  // --- СУЩЕСТВУЮЩИЙ ЗАПРОС: Кабинеты по шагу пикселя (остается без изменений) ---
  cabinetsByPitch: t.prismaField({
      type: ['Cabinet'],
      args: {
          pitchCode: t.arg.string({ required: true, description: 'Код шага пикселя (например, P3.91)' }),
          onlyActiveCabinets: t.arg.boolean({ defaultValue: true, description: 'Вернуть только активные кабинеты?' }),
          onlyActiveModules: t.arg.boolean({ defaultValue: true, description: 'Учитывать только активные модули?'}),
          onlyActiveModuleSizes: t.arg.boolean({ defaultValue: true, description: 'Учитывать только активные размеры модулей?'}),
          onlyActiveCabinetSizes: t.arg.boolean({ defaultValue: true, description: 'Учитывать только активные размеры кабинетов?'})
      },
      description: "Найти все кабинеты, совместимые с модулями, имеющими указанный шаг пикселя.",
      resolve: async (query, _parent, args, ctx) => {
          const {
              pitchCode,
              onlyActiveCabinets,
              onlyActiveModules,
              onlyActiveModuleSizes,
              onlyActiveCabinetSizes
          } = args;
          console.log(`[cabinetsByPitch] Searching for pitchCode: ${pitchCode}`);

          // Шаг 1: Находим коды модулей с нужным питчем
          const relevantModules = await ctx.prisma.module.findMany({
              where: {
                  active: onlyActiveModules ?? undefined,
                  pitches: { some: { pitchCode: pitchCode } }
              },
              select: { code: true }
          });
          const relevantModuleCodes = relevantModules.map(m => m.code);
          if (relevantModuleCodes.length === 0) {
              console.log(`[cabinetsByPitch] No modules found for pitch ${pitchCode}`);
              return [];
          }
          console.log(`[cabinetsByPitch] Relevant module codes:`, relevantModuleCodes);

          // Шаг 2: Находим ModuleSize, связанные с этими модулями
          const moduleSizeWhere: Prisma.ModuleSizeWhereInput = {
               modules: { some: { moduleCode: { in: relevantModuleCodes } } },
               active: onlyActiveModuleSizes ?? undefined
           };
          const relevantModuleSizes = await ctx.prisma.moduleSize.findMany({
              where: moduleSizeWhere, select: { code: true }
          });
          const relevantModuleSizeCodes = relevantModuleSizes.map(ms => ms.code);
          if (relevantModuleSizeCodes.length === 0) {
              console.log(`[cabinetsByPitch] No module sizes found linked to relevant modules.`);
              return [];
          }
          console.log(`[cabinetsByPitch] Relevant module sizes:`, relevantModuleSizeCodes);

          // Шаг 3: Находим CabinetSize, совместимые с найденными ModuleSize
          const cabinetSizeWhere: Prisma.CabinetSizeWhereInput = {
              moduleSizes: { some: { moduleSizeCode: { in: relevantModuleSizeCodes } } },
              active: onlyActiveCabinetSizes ?? undefined
          };
          const compatibleCabinetSizes = await ctx.prisma.cabinetSize.findMany({
              where: cabinetSizeWhere, select: { code: true }
          });
          const compatibleCabinetSizeCodes = compatibleCabinetSizes.map(cs => cs.code);
          if (compatibleCabinetSizeCodes.length === 0) {
               console.log(`[cabinetsByPitch] No compatible cabinet sizes found.`);
              return [];
          }
           console.log(`[cabinetsByPitch] Compatible cabinet sizes:`, compatibleCabinetSizeCodes);

          // Шаг 4: Находим Кабинеты, связанные с найденными CabinetSize
          const cabinetWhere: Prisma.CabinetWhereInput = {
              sizes: { some: { cabinetSizeCode: { in: compatibleCabinetSizeCodes } } },
              active: onlyActiveCabinets ?? undefined
          };
          console.log(`[cabinetsByPitch] Final where for cabinets:`, JSON.stringify(cabinetWhere));

          // Возвращаем найденные кабинеты
          return ctx.prisma.cabinet.findMany({
              ...query,
              where: cabinetWhere,
              distinct: ['code'] // Убедимся, что кабинеты не дублируются, если связи сложные
          });
      }
  }) // --- Конец запроса cabinetsByPitch ---

})); // --- Конец builder.queryFields ---