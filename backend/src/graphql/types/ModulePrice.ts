// backend/src/graphql/types/ModulePrice.ts
import { builder } from '../builder.js';
import type { Prisma } from '@prisma/client';
import type { GraphQLContext } from '../builder.js';

// 1. Определяем тип для модели ModulePrice с включенными отношениями
type ModulePrice = Prisma.ModulePriceGetPayload<{
    include: {
        module: true;
    };
}>;

// 2. Определяем тип для field builder
type FieldBuilder = Parameters<
    Parameters<typeof builder.prismaNode>[1]['fields']
>[0];

builder.prismaNode('ModulePrice', {
    id: { field: 'moduleCode' },
    findUnique: (id, { prisma }: GraphQLContext) =>
        prisma.modulePrice.findUnique({
            where: { moduleCode: id },
            include: { module: true }
        }),
    fields: (t: FieldBuilder) => ({
        // 3. Основные поля
        moduleCode: t.exposeString('moduleCode'),

        // 4. Поля с преобразованием Decimal в number
        priceUsd: t.float({
            nullable: true,
            resolve: (parent: ModulePrice) => parent.priceUsd?.toNumber() ?? null
        }),
        priceRub: t.float({
            nullable: true,
            resolve: (parent: ModulePrice) => parent.priceRub?.toNumber() ?? null
        }),

        // 5. Реляционное поле
        module: t.relation('module', {
            resolve: (parent: ModulePrice) => parent.module
        })
    }),
});