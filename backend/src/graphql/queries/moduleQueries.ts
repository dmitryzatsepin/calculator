// backend/src/graphql/queries/moduleQueries.ts
import { builder } from '../builder.js';
import { ModuleService } from '../../services/moduleService.js';
const ModuleFilterInput = builder.inputType('ModuleFilterInput', {
  fields: (t) => ({
    locationCode: t.string({ required: false }),
    pitchCode: t.string({ required: false }),
    brightnessCode: t.string({ required: false }),
    refreshRateCode: t.string({ required: false }),
    isFlex: t.boolean({ required: false }),
  }),
});

const getModuleService = (ctx: any) => new ModuleService(ctx.prisma);

builder.queryFields((t) => ({
  // Запрос для получения отфильтрованного списка модулей
  moduleOptions: t.prismaConnection({
    type: 'Module',
    cursor: 'id',
    description: 'Получить отфильтрованный список модулей для выбора.',
    args: {
      filters: t.arg({ type: ModuleFilterInput, required: false }),
      onlyActive: t.arg.boolean({ defaultValue: true, required: false }),
    },

    totalCount: (_parent, args, ctx) => {
      const serviceArgs = { ...args.filters, onlyActive: args.onlyActive };
      return getModuleService(ctx).countFiltered(serviceArgs);
    },
    resolve: (query, _parent, args, ctx) => {
      const serviceArgs = { ...args.filters, onlyActive: args.onlyActive };
      return getModuleService(ctx).findFiltered(query, serviceArgs);
    },
  }),

  // Получить Module по коду
  moduleByCode: t.prismaField({
    type: 'Module',
    nullable: true,
    args: {
      code: t.arg.string({ required: true }),
    },
    resolve: (query, _parent, args, ctx) => {
      return getModuleService(ctx).findByCode(query, args.code);
    },
  }),

  // Получить ДЕТАЛИ Модуля по коду
  moduleDetails: t.prismaField({
    type: 'Module',
    nullable: true,
    description: 'Получить подробную информацию о модуле по его коду.',
    args: {
      code: t.arg.string({ required: true }),
    },
    resolve: (query, _parent, args, ctx) => {
      return getModuleService(ctx).findByCode(query, args.code);
    },
  }),
}));