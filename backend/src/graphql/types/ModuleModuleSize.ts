// src/graphql/types/ModuleModuleSize.ts

import { builder } from '../builder.js';
import type { Prisma } from '@prisma/client';

type ModuleModuleSize = Prisma.ModuleModuleSizeGetPayload<{
  include: {
    size: true;
  }
}>;

type ModuleModuleSizeFieldBuilder = Parameters<
  Parameters<typeof builder.prismaObject>[1]['fields']
>[0];

builder.prismaObject('ModuleModuleSize', {
  fields: (t: ModuleModuleSizeFieldBuilder) => ({
    moduleCode: t.exposeString('moduleCode'),
    moduleSizeCode: t.exposeString('moduleSizeCode'),

    // И связь, если она нужна
    size: t.relation('size'),
  }),
});