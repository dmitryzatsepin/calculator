// backend/src/services/priceService.ts
import { PrismaClient } from "@prisma/client";

export interface PriceRequest {
  moduleCode?: string | null;
  cabinetCode?: string | null;
  itemCodes?: string[] | null;
}

export interface PriceResult {
  code: string;
  priceUsd: number | null;
  priceRub: number | null;
}

export class PriceService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Находит цены для списка кодов модулей, кабинетов и комплектующих.
   * @param request - Объект с кодами для поиска цен.
   * @returns Promise<PriceResult[]>
   */
  async findPricesByCodes(request: PriceRequest): Promise<PriceResult[]> {
    const { moduleCode, cabinetCode, itemCodes } = request;
    const results: PriceResult[] = [];
    const promises: Promise<any>[] = [];

    // 1. Запрос цены Модуля
    if (moduleCode) {
      promises.push(
        this.prisma.modulePrice.findUnique({
          where: { moduleCode },
          select: { priceUsd: true, priceRub: true },
        }).then(price => {
          results.push({
            code: moduleCode,
            priceUsd: price?.priceUsd?.toNumber() ?? null,
            priceRub: price?.priceRub?.toNumber() ?? null,
          });
        })
      );
    }

    // 2. Запрос цены Кабинета
    if (cabinetCode) {
      promises.push(
        this.prisma.cabinetPrice.findUnique({
          where: { cabinetCode },
          select: { priceUsd: true, priceRub: true },
        }).then(price => {
          results.push({
            code: cabinetCode,
            priceUsd: price?.priceUsd?.toNumber() ?? null,
            priceRub: price?.priceRub?.toNumber() ?? null,
          });
        })
      );
    }

    // 3. Запрос цен Комплектующих (Items)
    if (itemCodes && itemCodes.length > 0) {
      promises.push(
        this.prisma.itemPrice.findMany({
          where: { itemCode: { in: itemCodes } },
          select: { itemCode: true, priceUsd: true, priceRub: true },
        }).then(itemPrices => {
          const foundCodes = new Set<string>();
          itemPrices.forEach(p => {
            results.push({
              code: p.itemCode,
              priceUsd: p.priceUsd?.toNumber() ?? null,
              priceRub: p.priceRub?.toNumber() ?? null,
            });
            foundCodes.add(p.itemCode);
          });

          // Добавляем null для ненайденных item кодов
          itemCodes.forEach(reqCode => {
            if (!foundCodes.has(reqCode)) {
              results.push({ code: reqCode, priceUsd: null, priceRub: null });
            }
          });
        })
      );
    }

    await Promise.all(promises);

    return results;
  }
}