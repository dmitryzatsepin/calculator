// src/graphql/queries/itemQueries.ts
import { builder } from '../builder';

builder.queryFields((t) => ({
  // Получить список всех Item (только активных)
  items: t.prismaConnection({
    type: 'Item',
    cursor: 'id', // Пагинация по ID
    args: { // Добавим аргумент для фильтрации по активности
        onlyActive: t.arg.boolean({defaultValue: true})
    },
    resolve: (query, parent, args, ctx) =>
      ctx.prisma.item.findMany({
          ...query,
          where: { active: args.onlyActive ?? undefined } // Фильтр по active
      })
  }),

  // Получить Item по коду
  itemByCode: t.prismaField({
    type: 'Item',
    nullable: true,
    args: {
      code: t.arg.string({ required: true }),
    },
    resolve: (query, parent, args, ctx) =>
      ctx.prisma.item.findUnique({
        ...query,
        where: { code: args.code },
      }),
  }),
}));