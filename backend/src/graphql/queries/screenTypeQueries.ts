// src/graphql/queries/screenTypeQueries.ts
import { builder } from '../builder'; // Импортируем наш builder

builder.queryFields((t) => ({

  screenTypes: t.prismaField({
    type: ['ScreenType'],
    description: 'Получить список всех типов экранов.',
    args: {
        onlyActive: t.arg.boolean({
            defaultValue: true,
            description: 'Вернуть только активные типы экранов?'
        })
    },
    resolve: async (query, _parent, args, ctx, _info) => {
      console.log(`[screenTypes] Fetching screen types. onlyActive: ${args.onlyActive}`);
      return ctx.prisma.screenType.findMany({
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

  screenTypeByCode: t.prismaField({
    type: 'ScreenType',
    nullable: true,
    description: 'Получить один тип экрана по его уникальному коду.',
    args: {
        code: t.arg.string({ required: true, description: 'Уникальный код типа экрана' })
    },
    resolve: async (query, _parent, args, ctx, _info) => {
        console.log(`[screenTypeByCode] Searching for code: ${args.code}`);
        const codeArg = args.code;
        if (typeof codeArg !== 'string') {
          console.error("Invalid code argument type received:", typeof codeArg);
          throw new Error("Invalid argument: code must be a string.");
        }
        return ctx.prisma.screenType.findUnique({
            ...query,
            where: {
                code: codeArg 
            }
        });
    }
  })

}));