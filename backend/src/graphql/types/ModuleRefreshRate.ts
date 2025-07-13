// backend/src/graphql/types/ModuleRefreshRate.ts
import { builder } from '../builder.js';
import type { Prisma } from '@prisma/client';
import type { GraphQLContext } from '../builder.js';

// 1. Определяем тип для модели ModuleRefreshRate
type ModuleRefreshRate = Prisma.ModuleRefreshRateGetPayload<{}>;

// 2. Определяем тип для field builder
type FieldBuilder = Parameters<
    Parameters<typeof builder.prismaObject>[1]['fields']
>[0];

builder.prismaNode('ModuleRefreshRate', {
    id: {
        resolve: (parent) => `${parent.moduleCode}_${parent.refreshRateCode}`
    },
    findUnique: (id, { prisma }: GraphQLContext) => {
        const [moduleCode, refreshRateCode] = id.split('_');
        return prisma.moduleRefreshRate.findUnique({
            where: {
                moduleCode_refreshRateCode: {
                    moduleCode,
                    refreshRateCode
                }
            }
        });
    },
    fields: (t: FieldBuilder) => ({
        moduleCode: t.exposeString('moduleCode'),
        refreshRateCode: t.exposeString('refreshRateCode'),
        module: t.relation('module'),
        refreshRate: t.relation('refreshRate')
    }),
});