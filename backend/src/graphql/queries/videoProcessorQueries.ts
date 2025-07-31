// src/graphql/queries/videoProcessorQueries.ts
import { builder } from '../builder.js';
import type { Prisma } from '@prisma/client';
import type { GraphQLContext } from '../builder.js';

const getVideoProcessorService = (ctx: GraphQLContext) => ctx.services.videoProcessorService;

builder.queryFields((t) => ({
    videoProcessors: t.prismaField({
        type: ['VideoProcessor'],
        description: 'Получить список всех видеопроцессоров.',

        args: {
            onlyActive: t.arg.boolean({
                defaultValue: true,
                description: 'Вернуть только активные процессоры'
            })
        },

        resolve: (
            query: Prisma.VideoProcessorFindManyArgs,
            _parent,
            args: { onlyActive?: boolean | null },
            ctx: GraphQLContext
        ) => {
            const where = args.onlyActive ? { active: true } : {};

            return getVideoProcessorService(ctx).findAll({
                ...query,
                where: { ...query.where, ...where }
            });
        },
    }),
}));