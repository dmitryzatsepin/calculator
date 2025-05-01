// src/graphql/queries/pitchQueries.ts
import { builder } from '../builder';

builder.queryFields((t) => ({
  pitches: t.prismaField({
    type: ['Pitch'],
    description: 'Получить список всех шагов пикселя.',
    args: {
      onlyActive: t.arg.boolean({ defaultValue: true, description: 'Вернуть только активные?' })
    },
    resolve: async (query, _parent, args, ctx) => {
      return ctx.prisma.pitch.findMany({
         ...query,
         where: {
             active: args.onlyActive ?? undefined
         },
         orderBy: {
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
      resolve: async (query, _parent, args, ctx) => {
        const codeArg = args.code;
        if (typeof codeArg !== 'string') {
             console.error("Invalid code argument type received:", typeof codeArg);
             throw new Error("Invalid argument: code must be a string.");
        }
          return ctx.prisma.pitch.findUnique({
              ...query,
              where: { code: codeArg }
          });
      }
  }),

  // --- Получить Pitch опции по Location ---
  pitchOptionsByLocation: t.prismaField({
    type: ['Pitch'],
    description: 'Получить доступные шаги пикселя для модулей, подходящих под указанное расположение.',
    args: {
        locationCode: t.arg.string({ required: true, description: 'Код расположения (Location)' }),
        onlyActive: t.arg.boolean({ defaultValue: true, required: false, description: 'Учитывать только активные модули и питчи?'})
    },
    resolve: async (query, _parent, args, ctx) => {
        const { locationCode, onlyActive } = args;
        console.log(`[pitchOptionsByLocation] Fetching pitches for location: ${locationCode}`);

        const pitchCodeRelations = await ctx.prisma.modulePitch.findMany({
            where: {
                module: {
                    active: onlyActive ?? undefined,
                    locations: { some: { locationCode: locationCode as string} }
                }
            },
            select: { pitchCode: true },
            distinct: ['pitchCode']
        });

        const availablePitchCodes = pitchCodeRelations.map(p => p.pitchCode);

        if (availablePitchCodes.length === 0) {
             console.log(`[pitchOptionsByLocation] No relevant pitches found for location: ${locationCode}`);
            return [];
        }
        console.log(`[pitchOptionsByLocation] Found relevant pitch codes:`, availablePitchCodes);

        return ctx.prisma.pitch.findMany({
            ...query,
            where: {
                code: { in: availablePitchCodes },
                active: onlyActive ?? undefined
            },
            orderBy: {
                pitchValue: 'asc'
            }
        });
    }
  })
}));