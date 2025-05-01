// src/graphql/queries/locationQueries.ts
import { builder } from '../builder'; // Импортируем наш builder

builder.queryFields((t) => ({

  // --- Запрос для получения списка локаций ---
  locations: t.prismaField({
    type: ['Location'],
    description: 'Получить список всех активных локаций, отсортированных по имени.',
    resolve: async (
      query,
      parent,
      args,
      context,
      info
    ) => {
      return context.prisma.location.findMany({
         ...query,
         where: {
             active: true
         },
         orderBy: {
             name: 'asc'
         }
      });
    }
  }),

  locationByCode: t.prismaField({
      type: 'Location',
      nullable: true,
      description: 'Получить одну локацию по ее уникальному коду.',
      args: {
          code: t.arg.string({ required: true, description: 'Уникальный код локации' })
      },
      resolve: async (query, _parent, args, context, _info) => {
          console.log(`[locationByCode] Searching for code: ${args.code}`);
          const codeArg = args.code;
        if (typeof codeArg !== 'string') {
             console.error("Invalid code argument type received:", typeof codeArg);
             throw new Error("Invalid argument: code must be a string.");
        }
          return context.prisma.location.findUnique({
              ...query,
              where: {
                  code: codeArg 
              }
          });
      }
  })
}));