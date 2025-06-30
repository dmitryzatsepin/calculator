// backend/src/graphql/types/ModuleBrightness.ts
import { builder } from '../builder';

builder.prismaObject('ModuleBrightness', {
    fields: (t) => ({
        moduleCode: t.exposeString('moduleCode'),
        brightnessCode: t.exposeString('brightnessCode'),
    }),
});