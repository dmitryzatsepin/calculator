// backend/src/graphql/types/ModulePrice.ts
import { builder } from '../builder';

builder.prismaNode('ModulePrice', {
    id: { field: 'moduleCode' },
    fields: (t) => ({
        moduleCode: t.exposeString('moduleCode'),
        priceUsd: t.float({
            nullable: true,
            resolve: (parent) => parent.priceUsd?.toNumber() ?? null
        }),
        priceRub: t.float({
            nullable: true,
            resolve: (parent) => parent.priceRub?.toNumber() ?? null
        }),
        module: t.relation('module')
    }),
});