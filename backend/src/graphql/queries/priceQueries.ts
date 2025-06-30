// backend/src/graphql/queries/priceQueries.ts
import { builder } from '../builder';
import { PriceService, PriceResult } from '../../services/priceService';
const PriceRequestInput = builder.inputType('PriceRequestInput', {
  fields: (t) => ({
    moduleCode: t.string({ required: false }),
    cabinetCode: t.string({ required: false }),
    itemCodes: t.stringList({ required: false }),
  }),
});

// --- Тип для возвращаемой цены ---
const PriceInfo = builder.objectRef<PriceResult>('PriceInfo').implement({
  fields: (t) => ({
    code: t.exposeString('code'),
    priceUsd: t.float({ nullable: true, resolve: (p) => p.priceUsd }),
    priceRub: t.float({ nullable: true, resolve: (p) => p.priceRub }),
  }),
});

const getPriceService = (ctx: any) => new PriceService(ctx.prisma);

builder.queryFields((t) => ({
  getPricesByCodes: t.field({
    type: [PriceInfo],
    description: "Получить цены для списка кодов модулей, кабинетов и комплектующих.",
    args: {
      codes: t.arg({ type: PriceRequestInput, required: true }),
    },
    resolve: (_parent, args, ctx) => {

      return getPriceService(ctx).findPricesByCodes(args.codes);
    },
  }),
}));