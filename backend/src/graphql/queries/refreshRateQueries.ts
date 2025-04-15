// src/graphql/queries/refreshRateQueries.ts
import { builder } from '../builder';
import { Prisma } from '@prisma/client';

builder.queryFields((t) => ({
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

      // Выполняем запрос Prisma
      return ctx.prisma.refreshRate.findMany({
         ...query,
         where,
         orderBy: {
             value: 'asc'
         }
      });
    }
  })

  // Сюда можно добавить другие запросы, связанные с RefreshRate, если нужно

}));