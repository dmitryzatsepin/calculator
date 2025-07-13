// backend/src/graphql/types/ModuleSize.ts
import { builder } from '../builder.js';
import type { Prisma } from '@prisma/client';
import type { GraphQLContext } from '../builder.js';

import { ModuleService } from '../../services/moduleService.js';
import { CabinetSizeService } from '../../services/cabinetSizeService.js';

// --- Типизация ---
type ModuleSize = Prisma.ModuleSizeGetPayload<{}>;
type ModuleSizeFieldBuilder = Parameters<Parameters<typeof builder.prismaNode>[1]['fields']>[0];

// --- Типизированные вспомогательные функции ---
const getModuleService = (ctx: GraphQLContext) => new ModuleService(ctx.prisma);
const getCabinetSizeService = (ctx: GraphQLContext) => new CabinetSizeService(ctx.prisma);

builder.prismaNode('ModuleSize', {
    id: { field: 'id' },
    findUnique: (id: string, { prisma }: GraphQLContext) =>
        prisma.moduleSize.findUnique({
            where: { id: parseInt(id, 10) },
        }),
    fields: (t: ModuleSizeFieldBuilder) => ({
        // --- Простые поля ---
        code: t.exposeString('code'),
        size: t.exposeString('size'),
        width: t.exposeInt('width'),
        height: t.exposeInt('height'),
        active: t.exposeBoolean('active'),

        createdAt: t.field({
            type: 'DateTime',
            resolve: (parent: ModuleSize) => parent.createdAt,
        }),

        updatedAt: t.field({
            type: 'DateTime',
            resolve: (parent: ModuleSize) => parent.updatedAt,
        }),

        // --- Связь с модулями этого размера ---
        modules: t.prismaField({
            type: ['Module'],
            description: 'Модули, имеющие данный размер.',
            args: { onlyActive: t.arg.boolean({ defaultValue: true }) },
            resolve: (
                query: Prisma.ModuleFindManyArgs,
                parent: ModuleSize,
                args: { onlyActive: boolean },
                ctx: GraphQLContext
            ) => {
                return getModuleService(ctx).findByModuleSizeCode(
                    query,
                    parent.code,
                    args.onlyActive ?? null
                );
            },
        }),

        // --- Связь с совместимыми размерами кабинетов ---
        compatibleCabinetSizes: t.prismaField({
            type: ['CabinetSize'],
            description: 'Размеры кабинетов, совместимые с данным размером модуля.',
            args: { onlyActive: t.arg.boolean({ defaultValue: true }) },
            resolve: (
                query: Prisma.CabinetSizeFindManyArgs,
                parent: ModuleSize,
                args: { onlyActive: boolean },
                ctx: GraphQLContext
            ) => {
                return getCabinetSizeService(ctx).findCompatibleByModuleSizeCode(
                    query,
                    parent.code,
                    args.onlyActive ?? null
                );
            },
        }),
    }),
});