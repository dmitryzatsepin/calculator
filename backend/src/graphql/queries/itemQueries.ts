// backend/src/graphql/queries/itemQueries.ts
import { builder } from '../builder.js';
import { ItemService } from '../../services/itemService.js';

const getItemService = (ctx: any) => new ItemService(ctx.prisma);

builder.queryFields((t) => ({
  // Получить список всех Item с пагинацией
  items: t.prismaConnection({
    type: 'Item',
    cursor: 'id',
    args: {
      onlyActive: t.arg.boolean({ defaultValue: true }),
    },
    // Используем totalCount для получения общего количества записей (полезно для UI)
    totalCount: (parent, args, ctx) => {
      return ctx.prisma.item.count({
        where: { active: args.onlyActive ?? undefined }
      });
    },
    resolve: (query, _parent, args, ctx) => {
      return getItemService(ctx).findMany(query, { onlyActive: args.onlyActive });
    },
  }),

  // Получить Item по коду
  itemByCode: t.prismaField({
    type: 'Item',
    nullable: true,
    args: {
      code: t.arg.string({ required: true }),
    },
    resolve: (query, _parent, args, ctx) => {
      return getItemService(ctx).findByCode(query, args.code);
    },
  }),
}));