import { builder } from '../builder.js';
import type { GraphQLContext } from '../builder.js';

// Тип для поля t в fields
type IpProtectionFieldBuilder = Parameters<
  Parameters<typeof builder.prismaNode>[1]['fields']
>[0];

export const IpProtectionObjectRef = builder.prismaNode('IpProtection', {
  id: { field: 'id' },
  findUnique: (id: string, { prisma }: GraphQLContext) =>
    prisma.ipProtection.findUnique({
      where: { id: parseInt(id, 10) },
    }),
  fields: (t: IpProtectionFieldBuilder) => ({
    code: t.exposeString('code'),
    protectionSolid: t.exposeString('protectionSolid'),
    protectionWater: t.exposeString('protectionWater'),
    active: t.exposeBoolean('active'),
  }),
});