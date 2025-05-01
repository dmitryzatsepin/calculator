// src/graphql/types/ModuleModuleSize.ts
import { builder } from '../builder';

builder.prismaObject('ModuleModuleSize', {
  fields: (t) => ({
    size: t.relation('size'),
  }),
});