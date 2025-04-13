// src/graphql/queries/materialQueries.ts
import { builder } from '../builder';

builder.queryFields((t) => ({

  // --- Получить список материалов ---
  materials: t.prismaField({
    type: ['Material'],
    description: 'Получить список всех материалов.',
    args: {
        onlyActive: t.arg.boolean({
            defaultValue: true,
            description: 'Вернуть только активные материалы?'
        })
    },
    resolve: async (query, _parent, args, ctx, _info) => {
      console.log(`[materials] Fetching materials. onlyActive: ${args.onlyActive}`);
      return ctx.prisma.material.findMany({
         ...query,
         where: {
             active: args.onlyActive ?? undefined
         },
         orderBy: {
             code: 'asc'
         }
      });
    }
  }),


  // --- Получить один материал по коду ---
  materialByCode: t.prismaField({
    type: 'Material',
    nullable: true,
    description: 'Получить один материал по его уникальному коду.',
    args: {
        code: t.arg.string({ required: true, description: 'Уникальный код материала' })
    },
    resolve: async (query, _parent, args, ctx, _info) => {
        console.log(`[materialByCode] Searching for code: ${args.code}`);
        return ctx.prisma.material.findUnique({
            ...query,
            where: {
                code: args.code
            }
        });
    }
  })

}));