// src/graphql/types/VideoProcessor.ts

import { builder } from '../builder.js';
import type { Prisma } from '@prisma/client';
import type { GraphQLContext } from '../builder.js';

type VideoProcessor = Prisma.VideoProcessorGetPayload<{}>;

type VideoProcessorFieldBuilder = Parameters<
    Parameters<typeof builder.prismaNode>[1]['fields']
>[0];

builder.prismaNode('VideoProcessor', {
    id: { field: 'id' },
    findUnique: (id: string, { prisma }: GraphQLContext) =>
        prisma.videoProcessor.findUnique({
            where: { id: parseInt(id, 10) },
        }),
    fields: (t: VideoProcessorFieldBuilder) => ({
        code: t.exposeString('code'),
        name: t.exposeString('name'),
        maxResolutionX: t.exposeInt('maxResolutionX'),
        maxResolutionY: t.exposeInt('maxResolutionY'),
        priceUsd: t.float({ nullable: true, resolve: (p: VideoProcessor) => p.priceUsd?.toNumber() ?? null }),
        priceRub: t.float({ nullable: true, resolve: (p: VideoProcessor) => p.priceRub?.toNumber() ?? null }),
        active: t.exposeBoolean('active'),
    }),
});