import { builder } from '../builder.js';
import type { Prisma } from '@prisma/client';
import type { GraphQLContext } from '../builder.js';

type ModuleItemComponent = Prisma.ModuleItemComponentGetPayload<{}>;

type ModuleItemComponentFieldBuilder = Parameters<
    Parameters<typeof builder.prismaObject>[1]['fields']
>[0];

const getItemService = (ctx: GraphQLContext) => ctx.services.itemService;

builder.prismaObject('ModuleItemComponent', {
    fields: (t: ModuleItemComponentFieldBuilder) => ({
        quantity: t.exposeInt('quantity'),
        item: t.prismaField({
            type: 'Item',
            nullable: true,
            resolve: async (
                query: Prisma.ItemFindFirstArgs,
                parent: ModuleItemComponent,
                _args: {},
                ctx: GraphQLContext
            ) => {
                const item = await getItemService(ctx).findByCodeWithLoader(parent.itemCode);
                if (!item) {
                    console.warn(`Item with code ${parent.itemCode} not found for ModuleItemComponent.`);
                    return null;
                }
                return item;
            },
        }),
    }),
});