// src/graphql/types/RefreshRate.ts
import { builder } from '../builder.js';
import type { Prisma } from '@prisma/client';
import type { GraphQLContext } from '../builder.js';

// 1. Определяем тип для модели RefreshRate
type RefreshRate = Prisma.RefreshRateGetPayload<{}>;

// 2. Определяем тип для field builder
type FieldBuilder = Parameters<
  Parameters<typeof builder.prismaNode>[1]['fields']
>[0];

builder.prismaNode('RefreshRate', {
  id: { field: 'id' },
  findUnique: (id, { prisma }: GraphQLContext) =>
    prisma.refreshRate.findUnique({
      where: { id: parseInt(id, 10) }
    }),
  fields: (t: FieldBuilder) => ({
    // 3. Основные поля
    code: t.exposeString('code'),
    value: t.exposeInt('value'),
    active: t.exposeBoolean('active'),

    // 4. Поля даты с явным указанием типа
    createdAt: t.field({
      type: 'DateTime',
      resolve: (parent: RefreshRate) => parent.createdAt
    }),
    updatedAt: t.field({
      type: 'DateTime',
      resolve: (parent: RefreshRate) => parent.updatedAt
    }),

    // 5. Опциональные связи (раскомментировать при необходимости)
    // placements: t.relation('placements'),
  }),
});