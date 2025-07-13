// backend/src/graphql/queries/controlTypeQueries.ts
import { builder } from '../builder.js';
import { ControlTypeService } from '../../services/controlTypeService.js';

const getControlTypeService = (ctx: any) => new ControlTypeService(ctx.prisma);

builder.queryFields((t) => ({
  controlTypes: t.prismaField({
    type: ['ControlType'],
    description: 'Получить список всех доступных типов управления.',
    args: {
      onlyActive: t.arg.boolean({
        required: false,
        defaultValue: true,
        description: 'Вернуть только активные типы управления?',
      }),
    },
    resolve: (_query, _parent, args, ctx) => {
      return getControlTypeService(ctx).findAll({ onlyActive: args.onlyActive });
    },
  }),
}));