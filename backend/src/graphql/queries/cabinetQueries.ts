// src/graphql/queries/cabinetQueries.ts
import { builder } from '../builder';
import { Prisma } from '@prisma/client'; // Для WhereInput и Decimal

// --- НОВЫЙ ТИП ДЛЯ ФИЛЬТРОВ КАБИНЕТОВ ---
// Создадим Input тип для группировки фильтров
const CabinetFilterInput = builder.inputType('CabinetFilterInput', {
    fields: (t) => ({
        locationCode: t.string({ required: false }),
        materialCode: t.string({ required: false }),
        pitchCode:    t.string({ required: false }),
        moduleCode:   t.string({ required: false }), // Нужен для связи по размерам
        // Можно добавить и другие фильтры если нужно
        // widthMm: t.int({ required: false }),
        // heightMm: t.int({ required: false }),
    }),
});
// -------------------------------------

builder.queryFields((t) => ({

  // --- ЗАПРОС: Получить список всех кабинетов ---
  // (Оставляем как есть)
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
  // (Оставляем как есть)
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


  // --- СУЩЕСТВУЮЩИЙ ЗАПРОС: Кабинеты по шагу пикселя ---
  // (Оставляем как есть, но возможно, его логику стоит перенести в cabinetOptions)
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
  }), // --- Конец запроса cabinetsByPitch ---

  // --- НОВЫЙ ЗАПРОС ДЛЯ ВЫПАДАЮЩЕГО СПИСКА КАБИНЕТОВ ---
  cabinetOptions: t.prismaField({
    type: ['Cabinet'], // Возвращает массив кабинетов
    description: 'Получить отфильтрованный список кабинетов для выбора.',
    args: {
        filters: t.arg({ type: CabinetFilterInput, required: false }), // Принимаем объект с фильтрами
        onlyActive: t.arg.boolean({ defaultValue: true, required: false }),
    },
    resolve: async (query, _parent, args, ctx) => {
        const { filters, onlyActive } = args;
        console.log('[cabinetOptions] Fetching with filters:', JSON.stringify(filters));

        // Собираем базовые условия
        const where: Prisma.CabinetWhereInput = {
            active: onlyActive ?? undefined,
        };

        // Применяем фильтры, если они переданы
        if (filters) {
            if (filters.locationCode) {
                where.locations = { some: { locationCode: filters.locationCode } };
            }
            if (filters.materialCode) {
                where.materials = { some: { materialCode: filters.materialCode } };
            }
            if (filters.pitchCode) {
                where.pitches = { some: { pitchCode: filters.pitchCode } };
            }

            // --- Фильтрация по совместимости размеров с выбранным модулем ---
            if (filters.moduleCode) {
                // 1. Находим размер(ы) выбранного модуля
                const moduleSizes = await ctx.prisma.moduleSize.findMany({
                    where: { modules: { some: { moduleCode: filters.moduleCode } }, active: true },
                    select: { code: true }
                });
                const moduleSizeCodes = moduleSizes.map(ms => ms.code);

                if (moduleSizeCodes.length > 0) {
                    // 2. Находим размеры кабинетов, совместимые с размерами модуля
                    const compatibleCabinetSizes = await ctx.prisma.cabinetSize.findMany({
                        where: {
                            moduleSizes: { some: { moduleSizeCode: { in: moduleSizeCodes } } },
                            active: true
                        },
                        select: { code: true }
                    });
                    const compatibleCabinetSizeCodes = compatibleCabinetSizes.map(cs => cs.code);

                    if (compatibleCabinetSizeCodes.length > 0) {
                        // 3. Добавляем условие к основному запросу кабинетов
                        // У Кабинета должна быть связь хотя бы с одним из совместимых CabinetSize
                        where.sizes = { some: { cabinetSizeCode: { in: compatibleCabinetSizeCodes } } };
                    } else {
                        // Если не найдено совместимых размеров кабинетов, возвращаем пустой результат
                        console.log(`[cabinetOptions] No compatible cabinet sizes found for module ${filters.moduleCode}`);
                        return [];
                    }
                } else {
                     // Если у модуля нет размеров, это странно, но тоже вернем пустой результат
                     console.log(`[cabinetOptions] No module sizes found for module ${filters.moduleCode}`);
                     return [];
                }
            }
            // --- Конец фильтрации по размерам ---
        }

        console.log(`[cabinetOptions] Final where clause:`, JSON.stringify(where));
        return ctx.prisma.cabinet.findMany({
            ...query, // ВАЖНО: для выборки code, name, sku
            where,
            orderBy: [
                { name: 'asc' }, // Сортируем по имени или SKU
                { sku: 'asc' },
            ]
        });
    }
  }) // --- Конец запроса cabinetOptions ---

})); // --- Конец builder.queryFields ---