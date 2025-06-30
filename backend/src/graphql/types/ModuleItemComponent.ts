// backend/src/graphql/types/ModuleItemComponent.ts
import { builder } from '../builder';
import { ItemService } from '../../services/itemService'; // <-- Важно! Используем сервис

const getItemService = (ctx: any) => new ItemService(ctx.prisma);

builder.prismaObject('ModuleItemComponent', {
    fields: (t) => ({
        quantity: t.exposeInt('quantity'),
        item: t.prismaField({
            type: 'Item',
            nullable: true,
            resolve: async (query, parent, _args, ctx) => {
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