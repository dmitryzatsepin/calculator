// backend/src/services/itemPriceService.ts
import { PrismaClient, ItemPrice } from "../../prisma/generated/client";

export class ItemPriceService {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async findByItemCode(query: any, itemCode: string): Promise<ItemPrice | null> {
        return this.prisma.itemPrice.findUnique({
            ...query,
            where: { itemCode },
        });
    }
}