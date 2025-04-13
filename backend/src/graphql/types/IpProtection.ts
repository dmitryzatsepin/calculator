import { builder } from '../builder';

builder.prismaNode('IpProtection', {
  id: { field: 'id' },
  fields: (t) => ({
    code: t.exposeString('code'),
    protectionSolid: t.exposeString('protectionSolid'),
    protectionWater: t.exposeString('protectionWater'),
    active: t.exposeBoolean('active'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
  }),
});