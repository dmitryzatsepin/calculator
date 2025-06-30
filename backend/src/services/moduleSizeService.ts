// backend/src/services/moduleSizeService.ts
import { PrismaClient, Prisma, ModuleSize } from "../../prisma/generated/client";

export class ModuleSizeService {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) { this.prisma = prisma; }
    async findCompatibleByCabinetSizeCode(
        query: any,
        cabinetSizeCode: string,
        onlyActive?: boolean | null
    ): Promise<ModuleSize[]> {
        const relations = await this.prisma.cabinetSizeModuleSize.findMany({
            where: { cabinetSizeCode },
            select: { moduleSizeCode: true },
        });
        const moduleSizeCodes = relations.map(r => r.moduleSizeCode);
        if (moduleSizeCodes.length === 0) return [];

        const where: Prisma.ModuleSizeWhereInput = { code: { in: moduleSizeCodes } };
        if (onlyActive !== null && onlyActive !== undefined) {
            where.active = onlyActive;
        }
        return this.prisma.moduleSize.findMany({ ...query, where });
    }
    async findByModuleCode(
        query: any,
        moduleCode: string,
        onlyActive: boolean | null
    ): Promise<ModuleSize[]> {
        return this.prisma.moduleSize.findMany({
            ...query,
            where: {
                modules: {
                    some: {
                        moduleCode: moduleCode
                    }
                },
                active: onlyActive ?? undefined
            }
        });
    }
}