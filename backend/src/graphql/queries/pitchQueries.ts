// backend/src/graphql/queries/pitchQueries.ts
import { builder } from '../builder.js';
import { PitchService } from '../../services/pitchService.js';

const getPitchService = (ctx: any) => new PitchService(ctx.prisma);

builder.queryFields((t) => ({
  // Запрос на получение списка всех шагов пикселя
  pitches: t.prismaField({
    type: ['Pitch'],
    description: 'Получить список всех шагов пикселя.',
    args: {
      onlyActive: t.arg.boolean({ defaultValue: true, description: 'Вернуть только активные?' }),
    },
    resolve: (query, _parent, args, ctx) => {
      return getPitchService(ctx).findAll(query, { onlyActive: args.onlyActive });
    },
  }),

  // Запрос на получение одного Pitch по коду
  pitchByCode: t.prismaField({
    type: 'Pitch',
    nullable: true,
    description: 'Получить один шаг пикселя по его коду.',
    args: {
      code: t.arg.string({ required: true, description: 'Уникальный код шага (например, P3.91)' }),
    },
    resolve: (query, _parent, args, ctx) => {
      return getPitchService(ctx).findByCode(query, args.code);
    },
  }),

  // Запрос на получение опций Pitch по Location
  pitchOptionsByLocation: t.prismaField({
    type: ['Pitch'],
    description: 'Получить доступные шаги пикселя для модулей, подходящих под указанное расположение.',
    args: {
      locationCode: t.arg.string({ required: true, description: 'Код расположения (Location)' }),
      onlyActive: t.arg.boolean({ defaultValue: true, required: false, description: 'Учитывать только активные модули и питчи?' }),
    },
    resolve: (query, _parent, args, ctx) => {
      return getPitchService(ctx).findAvailableByLocation(
        query,
        args.locationCode,
        args.onlyActive
      );
    },
  }),
}));