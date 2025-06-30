// backend/src/graphql/queries/brightnessQueries.ts
import { builder } from '../builder';
import { BrightnessService } from '../../services/brightnessService';

const getBrightnessService = (ctx: any) => new BrightnessService(ctx.prisma);

builder.queryFields((t) => ({
  getFilteredBrightnessOptions: t.prismaField({
    type: ['Brightness'],
    description: 'Получить доступные значения яркости для модулей, подходящих под фильтры.',
    args: {
        locationCode: t.arg.string({ required: true }),
        pitchCode: t.arg.string({ required: true }),
        refreshRateCode: t.arg.string({ required: true }),
        onlyActive: t.arg.boolean({ defaultValue: true, required: false }),
        isFlex: t.arg.boolean({ required: false })
    },
    resolve: async (_query, _parent, args, ctx) => {
        return getBrightnessService(ctx).findFiltered(args);
    }
  }),
}));