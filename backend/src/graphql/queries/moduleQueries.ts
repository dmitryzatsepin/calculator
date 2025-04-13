// src/graphql/queries/moduleQueries.ts
import { builder } from '../builder';

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
}));