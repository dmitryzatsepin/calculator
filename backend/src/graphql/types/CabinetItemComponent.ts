// backend/src/graphql/types/CabinetItemComponent.ts

import { builder } from '../builder.js';
import type { Prisma } from '@prisma/client';
import type { GraphQLContext } from '../builder.js';

type CabinetItemComponent = Prisma.CabinetItemComponentGetPayload<{}>;

type FieldBuilder = Parameters<
  Parameters<typeof builder.prismaObject>[1]['fields']
>[0];

builder.prismaObject('CabinetItemComponent', {
  fields: (t: FieldBuilder) => ({
    quantity: t.exposeInt('quantity'),

    item: t.prismaField({
      type: 'Item',
      nullable: true,
      resolve: async (
        parent: CabinetItemComponent,
        _args: {},
        ctx: GraphQLContext
      ) => {
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