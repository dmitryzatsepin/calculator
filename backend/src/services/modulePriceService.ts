// backend/src/services/modulePriceService.ts
import { PrismaClient, ModulePrice } from "../prisma/generated/client";

export class ModulePriceService {
    private prisma: PrismaClient;
    constructor(prisma: PrismaClient) { this.prisma = prisma; }

    async findByModuleCode(query: any, moduleCode: string): Promise<ModulePrice | null> {
        return this.prisma.modulePrice.findUnique({ ...query, where: { moduleCode } });
    }
}