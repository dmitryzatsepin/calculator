// src/graphql/queries/priceQueries.ts
import { builder } from '../builder';
import { Prisma } from '../../../prisma/generated/client';
import { Decimal } from '@prisma/client/runtime/library'; // Для преобразования

// --- Input тип PriceRequestInput ---
const PriceRequestInput = builder.inputType('PriceRequestInput', {
  fields: (t) => ({
    moduleCode: t.string({ required: false }),
    cabinetCode: t.string({ required: false }),
    itemCodes: t.stringList({ required: false }),
  }),
});

// --- Тип для возвращаемой цены ---
// Используем простой объект, т.к. ID не всегда есть или он разный
const PriceInfo = builder.objectRef<PriceResult>('PriceInfo').implement({
     fields: (t) => ({
        code: t.exposeString('code'),
        priceUsd: t.float({ nullable: true, resolve: (p) => p.priceUsd }), // Используем number | null из PriceResult
        priceRub: t.float({ nullable: true, resolve: (p) => p.priceRub }), // Используем number | null из PriceResult
    }),
});

// Промежуточный тип для резолвера
type PriceResult = {
    code: string;
    priceUsd: number | null;
    priceRub: number | null;
}

// --- Сам запрос ---
builder.queryFields((t) => ({
  getPricesByCodes: t.field({
    type: [PriceInfo], // Возвращаем массив объектов PriceInfo
    args: {
      codes: t.arg({ type: PriceRequestInput, required: true }),
    },
    resolve: async (_parent, args, ctx) => {
      const { moduleCode, cabinetCode, itemCodes } = args.codes;
      const results: PriceResult[] = [];

      // 1. Цена Модуля
      if (moduleCode) {
        const modulePrice = await ctx.prisma.modulePrice.findUnique({
          where: { moduleCode: moduleCode },
          select: { priceUsd: true, priceRub: true },
        });
        results.push({
          code: moduleCode,
          priceUsd: modulePrice?.priceUsd?.toNumber() ?? null,
          priceRub: modulePrice?.priceRub?.toNumber() ?? null,
        });
      }

      // 2. Цена Кабинета
      if (cabinetCode) {
         const cabinetPrice = await ctx.prisma.cabinetPrice.findUnique({
           where: { cabinetCode: cabinetCode },
           select: { priceUsd: true, priceRub: true },
         });
         results.push({
           code: cabinetCode,
           priceUsd: cabinetPrice?.priceUsd?.toNumber() ?? null,
           priceRub: cabinetPrice?.priceRub?.toNumber() ?? null,
         });
      }

      // 3. Цены Комплектующих (Items)
      if (itemCodes && itemCodes.length > 0) {
        const itemPrices = await ctx.prisma.itemPrice.findMany({
          where: { itemCode: { in: itemCodes } },
          select: { itemCode: true, priceUsd: true, priceRub: true },
        });
        // Преобразуем в нужный формат
        itemPrices.forEach(p => {
            results.push({
                code: p.itemCode,
                priceUsd: p.priceUsd?.toNumber() ?? null,
                priceRub: p.priceRub?.toNumber() ?? null,
            });
        });
         // Добавим null для ненайденных item кодов, если нужно
         const foundCodes = new Set(itemPrices.map(p => p.itemCode));
         itemCodes.forEach(reqCode => {
             if (!foundCodes.has(reqCode)) {
                 results.push({ code: reqCode, priceUsd: null, priceRub: null });
             }
         });
      }

      return results;
    },
  }),
}));