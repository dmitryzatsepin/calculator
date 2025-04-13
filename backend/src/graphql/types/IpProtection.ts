// src/graphql/types/IpProtection.ts
import { builder } from '../builder';

export const IpProtectionObjectRef = builder.prismaObject('IpProtection', {
  fields: (t) => ({
    id: t.exposeID('id'),
    code: t.exposeString('code'),
    protectionSolid: t.exposeString('protectionSolid'),
    protectionWater: t.exposeString('protectionWater'),
    active: t.exposeBoolean('active'),
  }),
});