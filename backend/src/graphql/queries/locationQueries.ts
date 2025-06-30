// backend/src/graphql/queries/locationQueries.ts
import { builder } from '../builder';
import { LocationService } from '../../services/locationService';

const getLocationService = (ctx: any) => new LocationService(ctx.prisma);

builder.queryFields((t) => ({
  // Запрос для получения списка локаций
  locations: t.prismaField({
    type: ['Location'],
    description: 'Получить список всех активных локаций, отсортированных по имени.',
    resolve: (_query, _parent, _args, ctx) => {
      return getLocationService(ctx).findAllActive();
    },
  }),

  // Запрос для получения одной локации по коду
  locationByCode: t.prismaField({
    type: 'Location',
    nullable: true,
    description: 'Получить одну локацию по ее уникальному коду.',
    args: {
      code: t.arg.string({ required: true, description: 'Уникальный код локации' }),
    },
    resolve: (_query, _parent, args, ctx) => {
      return getLocationService(ctx).findByCode(args.code);
    },
  }),
}));