// backend/src/graphql/queries/optionQueries.ts
import { builder } from '../builder';
import { OptionService } from '../../services/optionService';

const getOptionService = (ctx: any) => new OptionService(ctx.prisma);

builder.queryFields((t) => ({
  optionsByScreenType: t.prismaField({
    type: ['Option'],
    description: 'Получить список опций, доступных для указанного типа экрана.',
    args: {
      screenTypeCode: t.arg.string({ required: true, description: 'Код типа экрана' }),
      onlyActive: t.arg.boolean({
        defaultValue: true,
        required: false,
        description: 'Вернуть только активные опции?',
      }),
    },
    resolve: (query, _parent, args, ctx) => {
      return getOptionService(ctx).findByScreenTypeCode(
        query,
        args.screenTypeCode,
        args.onlyActive
      );
    },
  }),
}));