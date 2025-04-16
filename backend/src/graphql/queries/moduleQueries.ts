// src/graphql/queries/moduleQueries.ts
import { builder } from '../builder';
import { Prisma } from '@prisma/client';

builder.queryFields((t) => ({
  // Получить список всех Module (только активных)
  modules: t.prismaConnection({
    type: 'Module',
    cursor: 'id',
     args: {
        onlyActive: t.arg.boolean({defaultValue: true})
    },
    resolve: (query, parent, args, ctx) =>
      ctx.prisma.module.findMany({
          ...query,
           where: { active: args.onlyActive ?? undefined }
       })
  }),

  // Получить Module по коду
  moduleByCode: t.prismaField({
    type: 'Module',
    nullable: true,
    args: {
      code: t.arg.string({ required: true }),
    },
    resolve: (query, parent, args, ctx) =>
      ctx.prisma.module.findUnique({
        ...query,
        where: { code: args.code },
      }),
  }),
  
  moduleOptions: t.prismaField({
    // Возвращает МАССИВ объектов 'Module'
    type: ['Module'],
    description: 'Получить список модулей, подходящих для выбора в калькуляторе.',
    args: {
      // --- Аргументы для фильтрации (пока только активность, но готовы к расширению) ---
      onlyActive: t.arg.boolean({
        required: false,
        defaultValue: true,
        description: 'Вернуть только активные модули?'
      }),
      // TODO: Добавить сюда аргументы для фильтрации по другим параметрам, когда понадобится
      // pitchCode: t.arg.string({ required: false }),
      // locationCode: t.arg.string({ required: false }),
      // materialCode: t.arg.string({ required: false }),
      // ipProtectionCode: t.arg.string({ required: false }),
    },
    resolve: async (query, _parent, args, ctx /*, _info */) => {
      // Собираем условия фильтрации
      const where: Prisma.ModuleWhereInput = {};

      // Фильтр по активности
       if (args.onlyActive === true || args.onlyActive === false) {
        where.active = args.onlyActive;
      }

      // --- TODO: Применить здесь другие фильтры на основе args ---
      // if (args.pitchCode) {
      //   where.pitches = { some: { pitchCode: args.pitchCode } };
      // }
      // if (args.locationCode) {
      //   where.locations = { some: { locationCode: args.locationCode } };
      // }
      // ... и т.д. для других зависимостей

      // Выполняем запрос Prisma
      console.log(`[moduleOptions] Fetching with where:`, JSON.stringify(where)); // Лог для отладки
      return ctx.prisma.module.findMany({
         ...query, // Передаем query от Pothos (важно для выборки нужных полей типа code, sku)
         where,    // Применяем фильтр
         orderBy: {
             // Сортируем по SKU или коду для предсказуемого порядка
             sku: 'asc', // Сначала пытаемся по sku
             // code: 'asc' // Если sku нет, можно добавить сортировку по коду
         }
      });
    }
  })



}));