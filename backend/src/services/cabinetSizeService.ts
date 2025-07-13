// backend/src/services/cabinetSizeService.ts
import { PrismaClient, Prisma, CabinetSize } from "@prisma/client";

export class CabinetSizeService {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    /**
   * Находит размеры кабинетов, совместимые с заданным размером модуля.
   */
    async findCompatibleByModuleSizeCode(
        query: any,
        moduleSizeCode: string,
        onlyActive?: boolean | null
    ): Promise<CabinetSize[]> {
        const relations = await this.prisma.cabinetSizeModuleSize.findMany({
            where: { moduleSizeCode },
            select: { cabinetSizeCode: true },
        });
        const cabinetSizeCodes = relations.map(r => r.cabinetSizeCode);
        if (cabinetSizeCodes.length === 0) return [];

        const where: Prisma.CabinetSizeWhereInput = { code: { in: cabinetSizeCodes } };
        if (onlyActive !== null && onlyActive !== undefined) {
            where.active = onlyActive;
        }
        return this.prisma.cabinetSize.findMany({ ...query, where });
    }
}