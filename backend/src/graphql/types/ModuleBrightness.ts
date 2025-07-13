// backend/src/graphql/types/ModuleBrightness.ts

import { builder } from '../builder.js';
import type { Prisma } from '@prisma/client';

type ModuleBrightness = Prisma.ModuleBrightnessGetPayload<{}>;

type ModuleBrightnessFieldBuilder = Parameters<
    Parameters<typeof builder.prismaObject>[1]['fields']
>[0];

builder.prismaObject('ModuleBrightness', {
    fields: (t: ModuleBrightnessFieldBuilder) => ({
        moduleCode: t.exposeString('moduleCode'),
        brightnessCode: t.exposeString('brightnessCode'),
    }),
});