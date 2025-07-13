// backend/src/graphql/types/Pitch.ts
import { builder } from '../builder.js';
import type { Prisma } from '@prisma/client';
import type { GraphQLContext } from '../builder.js';
import { ModuleService } from '../../services/moduleService.js';

// --- Типизация ---
type Pitch = Prisma.PitchGetPayload<{}>;
type PitchFieldBuilder = Parameters<Parameters<typeof builder.prismaNode>[1]['fields']>[0];

// --- Типизированная вспомогательная функция ---
const getModuleService = (ctx: GraphQLContext) => new ModuleService(ctx.prisma);

builder.prismaNode('Pitch', {
  id: { field: 'id' },
  findUnique: (id: string, { prisma }: GraphQLContext) =>
    prisma.pitch.findUnique({
      where: { id: parseInt(id, 10) },
    }),
  fields: (t: PitchFieldBuilder) => ({
    // --- Простые поля ---
    code: t.exposeString('code'),
    pitchValue: t.float({
      resolve: (parent: Pitch) => parent.pitchValue.toNumber(),
    }),
    active: t.exposeBoolean('active'),

    createdAt: t.field({
      type: 'DateTime',
      resolve: (parent: Pitch) => parent.createdAt,
    }),

    updatedAt: t.field({
      type: 'DateTime',
      resolve: (parent: Pitch) => parent.updatedAt,
    }),

    // --- Связь с модулями, имеющими данный шаг пикселя ---
    modules: t.prismaField({
      type: ['Module'],
      description: 'Модули, имеющие данный шаг пикселя.',
      args: { onlyActive: t.arg.boolean({ defaultValue: true }) },
      resolve: (
        query: Prisma.ModuleFindManyArgs,
        parent: Pitch,
        args: { onlyActive: boolean },
        ctx: GraphQLContext
      ) => {
        return getModuleService(ctx).findByPitchCode(
          query,
          parent.code,
          args.onlyActive ?? null
        );
      },
    }),
  }),
});