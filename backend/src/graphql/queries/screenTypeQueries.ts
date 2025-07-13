// backend/src/graphql/queries/screenTypeQueries.ts
import { builder } from '../builder.js';
import { ScreenTypeService } from '../../services/screenTypeService.js';

const getScreenTypeService = (ctx: any) => new ScreenTypeService(ctx.prisma);

builder.queryFields((t) => ({
  // Запрос на получение списка всех типов экранов
  screenTypes: t.prismaField({
    type: ['ScreenType'],
    description: 'Получить список всех типов экранов.',
    args: {
      onlyActive: t.arg.boolean({
        defaultValue: true,
        description: 'Вернуть только активные типы экранов?',
      }),
    },
    resolve: (query, _parent, args, ctx) => {
      return getScreenTypeService(ctx).findAll(query, { onlyActive: args.onlyActive });
    },
  }),

  // Запрос на получение одного типа экрана по коду
  screenTypeByCode: t.prismaField({
    type: 'ScreenType',
    nullable: true,
    description: 'Получить один тип экрана по его уникальному коду.',
    args: {
      code: t.arg.string({ required: true, description: 'Уникальный код типа экрана' }),
    },
    resolve: (query, _parent, args, ctx) => {
      return getScreenTypeService(ctx).findByCode(query, args.code);
    },
  }),
}));