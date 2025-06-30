// backend/src/services/itemCategoryService.ts
import { PrismaClient, Prisma, ItemCategory } from "../../prisma/generated/client";

export class ItemCategoryService {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) { this.prisma = prisma; }

    async findByCabinetCode(query: any, cabinetCode: string): Promise<ItemCategory[]> {
        const relations = await this.prisma.cabinetCategory.findMany({
            where: { cabinetCode }, select: { categoryCode: true },
        });
        const codes = relations.map(r => r.categoryCode);
        if (codes.length === 0) return [];
        return this.prisma.itemCategory.findMany({ ...query, where: { code: { in: codes } } });
    }

    async findByItemCode(query: any, itemCode: string): Promise<ItemCategory[]> {
        const relations = await this.prisma.itemCategoryRelation.findMany({
            where: { itemCode }, select: { categoryCode: true },
        });
        const codes = relations.map(r => r.categoryCode);
        if (codes.length === 0) return [];
        return this.prisma.itemCategory.findMany({ ...query, where: { code: { in: codes } } });
    }

    async findByModuleCode(query: any, moduleCode: string): Promise<ItemCategory[]> {
        const relations = await this.prisma.moduleCategory.findMany({ where: { moduleCode }, select: { categoryCode: true } });
        const codes = relations.map(r => r.categoryCode);
        if (codes.length === 0) return [];
        return this.prisma.itemCategory.findMany({ ...query, where: { code: { in: codes } } });
    }
}