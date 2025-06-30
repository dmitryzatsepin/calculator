// backend/src/graphql/types/CabinetItemComponent.ts
import { builder } from '../builder';

builder.prismaObject('CabinetItemComponent', {
  fields: (t) => ({
    quantity: t.exposeInt('quantity'),

    // Связь с самим объектом Item
    item: t.prismaField({
      type: 'Item',
      nullable: true,
      resolve: async (query, parent, _args, ctx) => {

        const item = await ctx.services.itemService.findByCodeWithLoader(parent.itemCode);
        
        if (!item) {
            console.warn(`Item with code ${parent.itemCode} not found for CabinetItemComponent.`);
            return null;
        }
        return item;
      }
    }),
  }),
});