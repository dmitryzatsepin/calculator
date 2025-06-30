// backend/src/graphql/queries/cabinetQueries.ts
import { builder } from '../builder';
import { CabinetService } from '../../services/cabinetService';

const CabinetFilterInput = builder.inputType('CabinetFilterInput', {
  fields: (t) => ({
    locationCode: t.string({ required: false }),
    materialCode: t.string({ required: false }),
    pitchCode: t.string({ required: false }),
    moduleCode: t.string({ required: false }),
  }),
});

const getCabinetService = (ctx: any) => new CabinetService(ctx.prisma);

builder.queryFields((t) => ({
  cabinets: t.prismaField({
    type: ['Cabinet'],
    description: 'Получить список всех кабинетов',
    args: {
      onlyActive: t.arg.boolean({ defaultValue: true }),
    },
    resolve: (query, _parent, args, ctx) => {
      return ctx.prisma.cabinet.findMany({
        ...query,
        where: { active: args.onlyActive ?? undefined },
        orderBy: { code: 'asc' },
      });
    },
  }),

  cabinetByCode: t.prismaField({
    type: 'Cabinet',
    nullable: true,
    description: 'Получить кабинет по коду',
    args: {
      code: t.arg.string({ required: true }),
    },
    resolve: async (_query, _parent, args, ctx) => {
      return getCabinetService(ctx).findByCode(args.code);
    },
  }),

  cabinetOptions: t.prismaField({
    type: ['Cabinet'],
    description: 'Получить отфильтрованный список кабинетов',
    args: {
      filters: t.arg({ type: CabinetFilterInput, required: false }),
      onlyActive: t.arg.boolean({ defaultValue: true, required: false }),
    },
    resolve: async (query, _parent, args, ctx) => {
      return getCabinetService(ctx).findFiltered({
        ...args.filters,
        onlyActive: args.onlyActive,
      });
    },
  }),

  cabinetDetails: t.prismaField({
    type: 'Cabinet',
    nullable: true,
    description: 'Получить детальную информацию о кабинете',
    args: {
      code: t.arg.string({ required: true }),
    },
    resolve: async (_query, _parent, args, ctx) => {
      return getCabinetService(ctx).findByCode(args.code);
    },
  }),

  cabinetsByPitch: t.prismaField({
    type: ['Cabinet'],
    description: '[Устарело] Кабинеты по шагу пикселя',
    args: {
      pitchCode: t.arg.string({ required: true }),
    },
    resolve: async (query, _parent, args, ctx) => {
      return getCabinetService(ctx).findByPitch(args.pitchCode, true);
    },
  }),
}));