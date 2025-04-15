// src/graphql/queries/brightnessQueries.ts
import { builder } from '../builder';
import { Prisma } from '@prisma/client';

builder.queryFields((t) => ({
  brightnesses: t.prismaField({
    type: ['Brightness'],
    description: 'Получить список всех значений яркости.',
    args: {
      onlyActive: t.arg.boolean({
        required: false,
        defaultValue: true,
        description: 'Вернуть только активные значения яркости?'
      })
    },
    resolve: async (query, _parent, args, ctx) => {
      const where: Prisma.BrightnessWhereInput = {};

      if (args.onlyActive === true || args.onlyActive === false) {
         where.active = args.onlyActive;
      }

      // Выполняем запрос Prisma
      return ctx.prisma.brightness.findMany({
         ...query,
         where,
         orderBy: {
             value: 'asc'
         }
      });
    }
  }) 

  // Сюда можно добавить другие запросы, связанные с Brightness, если нужно

}));