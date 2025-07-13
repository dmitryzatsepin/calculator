// backend/src/graphql/types/ScreenType.ts
import { builder } from '../builder.js';
import type { Prisma } from '@prisma/client';
import type { GraphQLContext } from '../builder.js';

import { OptionService } from '../../services/optionService.js';
import { ControlTypeService } from '../../services/controlTypeService.js';
import { SensorService } from '../../services/sensorService.js';

// --- Типизация ---
type ScreenType = Prisma.ScreenTypeGetPayload<{}>;
type ScreenTypeFieldBuilder = Parameters<Parameters<typeof builder.prismaNode>[1]['fields']>[0];

// --- Типизированные вспомогательные функции ---
const getOptionService = (ctx: GraphQLContext) => new OptionService(ctx.prisma);
const getControlTypeService = (ctx: GraphQLContext) => new ControlTypeService(ctx.prisma);
const getSensorService = (ctx: GraphQLContext) => new SensorService(ctx.prisma);

builder.prismaNode('ScreenType', {
    id: { field: 'id' },
    findUnique: (id: string, { prisma }: GraphQLContext) =>
        prisma.screenType.findUnique({
            where: { id: parseInt(id, 10) },
        }),
    fields: (t: ScreenTypeFieldBuilder) => ({
        // --- Простые поля ---
        code: t.exposeString('code'),
        name: t.exposeString('name'),
        active: t.exposeBoolean('active'),

        createdAt: t.field({
            type: 'DateTime',
            resolve: (parent: ScreenType) => parent.createdAt,
        }),

        updatedAt: t.field({
            type: 'DateTime',
            resolve: (parent: ScreenType) => parent.updatedAt,
        }),

        // --- Связи, делегированные сервисам ---
        options: t.prismaField({
            type: ['Option'],
            resolve: (
                query: Prisma.OptionFindManyArgs,
                parent: ScreenType,
                _args: unknown,
                ctx: GraphQLContext
            ) => {
                return getOptionService(ctx).findByScreenTypeCode(query, parent.code);
            },
        }),

        controlTypes: t.prismaField({
            type: ['ControlType'],
            resolve: (
                query: Prisma.ControlTypeFindManyArgs,
                parent: ScreenType,
                _args: unknown,
                ctx: GraphQLContext
            ) => {
                return getControlTypeService(ctx).findByScreenTypeCode(query, parent.code);
            },
        }),

        sensors: t.prismaField({
            type: ['Sensor'],
            resolve: (
                query: Prisma.SensorFindManyArgs,
                parent: ScreenType,
                _args: unknown,
                ctx: GraphQLContext
            ) => {
                return getSensorService(ctx).findByScreenTypeCode(query, parent.code);
            },
        }),
    }),
});