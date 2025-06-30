// backend/src/graphql/types/ModuleRefreshRate.ts
import { builder } from '../builder';

builder.prismaObject('ModuleRefreshRate', {
    fields: (t) => ({
        moduleCode: t.exposeString('moduleCode'),
        refreshRateCode: t.exposeString('refreshRateCode'),
    }),
});