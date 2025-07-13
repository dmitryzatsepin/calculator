// backend/src/graphql/types/Brightness.ts

import { builder } from '../builder.js';
import type { Prisma } from '@prisma/client';
import type { GraphQLContext } from '../builder.js';

type Brightness = Prisma.BrightnessGetPayload<{}>;
type FieldBuilder = Parameters<
  Parameters<typeof builder.prismaNode>[1]['fields']
>[0];

builder.prismaNode('Brightness', {
  id: { field: 'id' },
  findUnique: (id, { prisma }: GraphQLContext) =>
    prisma.brightness.findUnique({
      where: { id: parseInt(id, 10) }
    }),
  fields: (t: FieldBuilder) => ({
    code: t.exposeString('code'),
    value: t.exposeInt('value'),
    active: t.exposeBoolean('active'),
    createdAt: t.field({
      type: 'DateTime',
      resolve: (parent: Brightness) => parent.createdAt,
    }),
    updatedAt: t.field({
      type: 'DateTime',
      resolve: (parent: Brightness) => parent.updatedAt,
    }),
  }),
});