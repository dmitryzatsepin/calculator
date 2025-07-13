import { builder } from '../builder.js';
import type { Prisma } from '@prisma/client';
import type { GraphQLContext } from '../builder.js';

type Location = Prisma.LocationGetPayload<{}>;

type LocationFieldBuilder = Parameters<
  Parameters<typeof builder.prismaNode>[1]['fields']
>[0];

builder.prismaNode('Location', {
  id: { field: 'id' },
  findUnique: (id: string, { prisma }: GraphQLContext) =>
    prisma.location.findUnique({
      where: { id: parseInt(id, 10) },
    }),
  fields: (t: LocationFieldBuilder) => ({
    code: t.exposeString('code'),
    name: t.exposeString('name'),
    active: t.exposeBoolean('active'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
  }),
});