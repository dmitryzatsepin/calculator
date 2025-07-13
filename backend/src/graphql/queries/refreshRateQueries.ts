// backend/src/graphql/queries/refreshRateQueries.ts
import { builder } from '../builder.js';
import { RefreshRateService } from '../../services/refreshRateService.js';

const getRefreshRateService = (ctx: any) => new RefreshRateService(ctx.prisma);

builder.queryFields((t) => ({
  // Запрос для получения всех RefreshRate
  refreshRates: t.prismaField({
    type: ['RefreshRate'],
    description: 'Получить список всех значений частоты обновления.',
    args: {
      onlyActive: t.arg.boolean({
        required: false,
        defaultValue: true,
      }),
    },
    resolve: (query, _parent, args, ctx) => {
      return getRefreshRateService(ctx).findAll(query, { onlyActive: args.onlyActive });
    },
  }),

  // Запрос для получения отфильтрованных опций
  getFilteredRefreshRateOptions: t.prismaField({
    type: ['RefreshRate'],
    description: 'Получить доступные значения частоты обновления для модулей, подходящих под фильтры.',
    args: {
      locationCode: t.arg.string({ required: true }),
      pitchCode: t.arg.string({ required: true }),
      onlyActive: t.arg.boolean({ defaultValue: true, required: false }),
      isFlex: t.arg.boolean({ required: false }),
    },
    resolve: (query, _parent, args, ctx) => {

      return getRefreshRateService(ctx).findFiltered(query, args);
    },
  }),
}));