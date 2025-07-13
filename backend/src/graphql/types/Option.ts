// src/graphql/types/Options.ts
import { builder } from '../builder.js';
import type { Prisma } from '@prisma/client';
import type { GraphQLContext } from '../builder.js';

// 1. Определяем тип для модели Option
type Option = Prisma.OptionGetPayload<{}>;

// 2. Определяем тип для field builder
type FieldBuilder = Parameters<
  Parameters<typeof builder.prismaNode>[1]['fields']
>[0];

builder.prismaNode('Option', {
  id: { field: 'id' },
  findUnique: (id, { prisma }: GraphQLContext) =>
    prisma.option.findUnique({
      where: { id: parseInt(id, 10) }
    }),
  fields: (t: FieldBuilder) => ({
    // 3. Основные поля
    code: t.exposeString('code'),
    name: t.exposeString('name'),
    active: t.exposeBoolean('active'),

    // 4. Поля даты с явным указанием типа
    createdAt: t.field({
      type: 'DateTime',
      resolve: (parent: Option) => parent.createdAt
    }),
    updatedAt: t.field({
      type: 'DateTime',
      resolve: (parent: Option) => parent.updatedAt
    }),

    // 5. Опционально: можно добавить связи, если они есть в модели
    // modules: t.relation('modules'),
    // другие relations...
  }),
});