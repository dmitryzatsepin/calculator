// src/graphql/queries/pitchQueries.ts
import { builder } from '../builder';

builder.queryFields((t) => ({
  // Запрос для получения списка Pitch
  pitches: t.prismaField({
    type: ['Pitch'], // Возвращает массив Pitch
    description: 'Получить список всех шагов пикселя.',
    args: { // Добавляем аргумент для фильтрации
      onlyActive: t.arg.boolean({ defaultValue: true, description: 'Вернуть только активные?' })
    },
    resolve: async (query, parent, args, ctx, info) => {
      return ctx.prisma.pitch.findMany({
         ...query,
         where: {
             active: args.onlyActive ?? undefined
         },
         orderBy: {
             // Сортируем по числовому значению шага
             pitchValue: 'asc'
         }
      });
    }
  }),

  // Запрос для получения одного Pitch по коду
  pitchByCode: t.prismaField({
      type: 'Pitch',
      nullable: true,
      description: 'Получить один шаг пикселя по его коду.',
      args: {
          code: t.arg.string({ required: true, description: 'Уникальный код шага (например, P3.91)' })
      },
      resolve: async (query, parent, args, ctx, info) => {
          return ctx.prisma.pitch.findUnique({
              ...query,
              where: { code: args.code }
          });
      }
  })
}));