// backend/src/services/manufacturerService.ts
import { PrismaClient, Prisma, Manufacturer } from "@prisma/client";

export class ManufacturerService {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) { this.prisma = prisma; }

    async findByCabinetCode(query: any, cabinetCode: string): Promise<Manufacturer[]> {
        const relations = await this.prisma.cabinetManufacturer.findMany({
            where: { cabinetCode }, select: { manufacturerCode: true },
        });
        const codes = relations.map(r => r.manufacturerCode);
        if (codes.length === 0) return [];
        return this.prisma.manufacturer.findMany({ ...query, where: { code: { in: codes } } });
    }

    async findByModuleCode(query: any, moduleCode: string): Promise<Manufacturer[]> {
        const relations = await this.prisma.moduleManufacturer.findMany({ where: { moduleCode }, select: { manufacturerCode: true } });
        const codes = relations.map(r => r.manufacturerCode);
        if (codes.length === 0) return [];
        return this.prisma.manufacturer.findMany({ ...query, where: { code: { in: codes } } });
    }
}