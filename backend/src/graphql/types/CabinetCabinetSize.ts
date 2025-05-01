// src/graphql/types/CabinetCabinetSize.ts
import { builder } from '../builder';

builder.prismaObject('CabinetCabinetSize', {
  fields: (t) => ({
    size: t.relation('size'),
  }),
});