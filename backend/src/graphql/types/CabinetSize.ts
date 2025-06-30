// backend/src/graphql/types/CabinetSize.ts
import { builder } from '../builder';
import { ModuleSizeService } from '../../services/moduleSizeService';
import { CabinetService } from '../../services/cabinetService';

const getModuleSizeService = (ctx: any) => new ModuleSizeService(ctx.prisma);
const getCabinetService = (ctx: any) => new CabinetService(ctx.prisma);

builder.prismaNode('CabinetSize', {
  id: { field: 'id' },
  fields: (t) => ({
    // Простые поля
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
      resolve: (query, parent, args, ctx) => {
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
      resolve: (query, parent, args, ctx) => {
        return getCabinetService(ctx).findByCabinetSizeCode(
          query,
          parent.code,
          args.onlyActive
        );
      },
    }),
  }),
});