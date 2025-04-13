import { builder } from '../builder';

builder.prismaNode('RefreshRate', {
  id: { field: 'id' },
  fields: (t) => ({
    code: t.exposeString('code'),
    value: t.exposeInt('value'),
    active: t.exposeBoolean('active'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
  }),
});