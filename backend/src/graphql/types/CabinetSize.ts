// backend/src/graphql/types/CabinetSize.ts

import { builder } from '../builder.js';
import type { Prisma } from '@prisma/client';
import type { GraphQLContext } from '../builder.js';

import { ModuleSizeService } from '../../services/moduleSizeService.js';
import { CabinetService } from '../../services/cabinetService.js';


// --- Типизация ---
type CabinetSize = Prisma.CabinetSizeGetPayload<{}>;
type CabinetSizeFieldBuilder = Parameters<Parameters<typeof builder.prismaNode>[1]['fields']>[0];

// --- Типизированные вспомогательные функции ---
const getModuleSizeService = (ctx: GraphQLContext) => new ModuleSizeService(ctx.prisma);
const getCabinetService = (ctx: GraphQLContext) => new CabinetService(ctx.prisma);

builder.prismaNode('CabinetSize', {
  id: { field: 'id' },
  findUnique: (id: string, { prisma }: GraphQLContext) =>
    prisma.cabinetSize.findUnique({
      where: { id: parseInt(id, 10) },
    }),
  fields: (t: CabinetSizeFieldBuilder) => ({
    code: t.exposeString('code'),
    size: t.exposeString('size'),
    width: t.exposeInt('width'),
    height: t.exposeInt('height'),
    active: t.exposeBoolean('active'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),

    // Связь с совместимыми размерами модулей
    compatibleModuleSizes: t.prismaField({
      type: ['ModuleSize'],
      description: "Размеры модулей, совместимые с данным размером кабинета.",
      args: { onlyActive: t.arg.boolean({ defaultValue: true }) },
      resolve: (
        query: Prisma.ModuleSizeFindManyArgs,
        parent: CabinetSize,
        args: { onlyActive: boolean },
        ctx: GraphQLContext
      ) => {
        return getModuleSizeService(ctx).findCompatibleByCabinetSizeCode(
          query,
          parent.code,
          args.onlyActive
        );
      },
    }),

    // Связь с кабинетами этого размера
    cabinets: t.prismaField({
      type: ['Cabinet'],
      description: "Кабинеты, имеющие данный размер.",
      args: { onlyActive: t.arg.boolean({ defaultValue: true }) },
      resolve: (
        query: Prisma.CabinetFindManyArgs,
        parent: CabinetSize,
        args: { onlyActive: boolean },
        ctx: GraphQLContext
      ) => {
        return getCabinetService(ctx).findByCabinetSizeCode(
          query,
          parent.code,
          args.onlyActive
        );
      },
    }),
  }),
});