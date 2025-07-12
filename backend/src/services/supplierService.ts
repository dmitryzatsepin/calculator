// backend/src/services/supplierService.ts
import { PrismaClient, Prisma, Supplier } from "../prisma/generated/client";

export class SupplierService {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) { this.prisma = prisma; }

    async findByCabinetCode(query: any, cabinetCode: string): Promise<Supplier[]> {
        const relations = await this.prisma.cabinetSupplier.findMany({
            where: { cabinetCode }, select: { supplierCode: true },
        });
        const codes = relations.map(r => r.supplierCode);
        if (codes.length === 0) return [];
        return this.prisma.supplier.findMany({ ...query, where: { code: { in: codes } } });
    }

    async findByItemCode(query: any, itemCode: string): Promise<Supplier[]> {
        const relations = await this.prisma.itemSupplier.findMany({
            where: { itemCode }, select: { supplierCode: true },
        });
        const codes = relations.map(r => r.supplierCode);
        if (codes.length === 0) return [];
        return this.prisma.supplier.findMany({ ...query, where: { code: { in: codes } } });
    }
}