// src/graphql/types/Material.ts
import { builder } from '../builder';

builder.prismaNode('Material', {
  id: { field: 'id' },
  fields: (t) => ({
    code: t.exposeString('code'),
    name: t.exposeString('name'),
    active: t.exposeBoolean('active'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
  }),
});