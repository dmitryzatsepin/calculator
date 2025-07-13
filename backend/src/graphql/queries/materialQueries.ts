// backend/src/graphql/queries/materialQueries.ts
import { builder } from '../builder.js';
import { MaterialService } from '../../services/materialService.js';

const getMaterialService = (ctx: any) => new MaterialService(ctx.prisma);

builder.queryFields((t) => ({
  // Запрос на получение списка материалов
  materials: t.prismaField({
    type: ['Material'],
    description: 'Получить список всех материалов.',
    args: {
      onlyActive: t.arg.boolean({
        defaultValue: true,
        description: 'Вернуть только активные материалы?',
      }),
    },
    resolve: (_query, _parent, args, ctx) => {
      return getMaterialService(ctx).findAll({ onlyActive: args.onlyActive });
    },
  }),

  // Запрос на получение одного материала по коду
  materialByCode: t.prismaField({
    type: 'Material',
    nullable: true,
    description: 'Получить один материал по его уникальному коду.',
    args: {
      code: t.arg.string({ required: true, description: 'Уникальный код материала' }),
    },
    resolve: (_query, _parent, args, ctx) => {
      return getMaterialService(ctx).findByCode(args.code);
    },
  }),
}));