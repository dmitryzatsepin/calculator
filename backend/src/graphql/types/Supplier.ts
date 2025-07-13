// src/graphql/types/Supplier.ts
import { builder } from '../builder.js';
import type { Prisma } from '@prisma/client';
import type { GraphQLContext } from '../builder.js';

// 1. Определяем тип для модели Supplier
type Supplier = Prisma.SupplierGetPayload<{}>;

// 2. Определяем тип для field builder
type FieldBuilder = Parameters<
  Parameters<typeof builder.prismaNode>[1]['fields']
>[0];

builder.prismaNode('Supplier', {
  id: { field: 'id' },
  findUnique: (id, { prisma }: GraphQLContext) =>
    prisma.supplier.findUnique({
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
      resolve: (parent: Supplier) => parent.createdAt
    }),
    updatedAt: t.field({
      type: 'DateTime',
      resolve: (parent: Supplier) => parent.updatedAt
    }),

    // 5. Опциональные связи (раскомментировать при необходимости)
    // cabinets: t.relation('cabinets'),
    // modules: t.relation('modules'),
  }),
});