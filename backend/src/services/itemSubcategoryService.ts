// backend/src/services/itemSubcategoryService.ts
import { PrismaClient, Prisma, ItemSubcategory } from "../prisma/generated/client";

export class ItemSubcategoryService {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) { this.prisma = prisma; }

    async findByCabinetCode(query: any, cabinetCode: string): Promise<ItemSubcategory[]> {
        const relations = await this.prisma.cabinetSubcategory.findMany({
            where: { cabinetCode }, select: { subcategoryCode: true },
        });
        const codes = relations.map(r => r.subcategoryCode);
        if (codes.length === 0) return [];
        return this.prisma.itemSubcategory.findMany({ ...query, where: { code: { in: codes } } });
    }

    async findByItemCode(query: any, itemCode: string): Promise<ItemSubcategory[]> {
        const relations = await this.prisma.itemSubcategoryRelation.findMany({
            where: { itemCode }, select: { subcategoryCode: true },
        });
        const codes = relations.map(r => r.subcategoryCode);
        if (codes.length === 0) return [];
        return this.prisma.itemSubcategory.findMany({ ...query, where: { code: { in: codes } } });
    }

    async findByModuleCode(query: any, moduleCode: string): Promise<ItemSubcategory[]> {
        const relations = await this.prisma.moduleSubcategory.findMany({ where: { moduleCode }, select: { subcategoryCode: true } });
        const codes = relations.map(r => r.subcategoryCode);
        if (codes.length === 0) return [];
        return this.prisma.itemSubcategory.findMany({ ...query, where: { code: { in: codes } } });
    }
}