// backend/src/graphql/types/Pitch.ts
import { builder } from '../builder';
import { ModuleService } from '../../services/moduleService';

const getModuleService = (ctx: any) => new ModuleService(ctx.prisma);

builder.prismaNode('Pitch', {
  id: { field: 'id' },
  fields: (t) => ({
    // Простые поля
    code: t.exposeString('code'),
    pitchValue: t.float({
      resolve: (parent) => parent.pitchValue.toNumber(),
    }),
    active: t.exposeBoolean('active'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),

    // Связь с модулями, использующая сервис
    modules: t.prismaField({
      type: ['Module'],
      description: "Модули, имеющие данный шаг пикселя.",
      args: {
        onlyActive: t.arg.boolean({ defaultValue: true }),
      },
      resolve: (query, parent, args, ctx) => {
        return getModuleService(ctx).findByPitchCode(
          query,
          parent.code,
          args.onlyActive ?? null
        );
      },
    }),
  }),
});