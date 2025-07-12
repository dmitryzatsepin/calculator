// backend/src/services/controlTypeService.ts
import { PrismaClient, Prisma, ControlType } from "../prisma/generated/client"; // <--- ДОБАВЛЕНО 'ControlType'

export interface ControlTypeFilters {
    onlyActive?: boolean | null;
}

export class ControlTypeService {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async findAll(filters?: ControlTypeFilters): Promise<ControlType[]> {
        const where: Prisma.ControlTypeWhereInput = {
            active: filters?.onlyActive ?? undefined,
        };
        return this.prisma.controlType.findMany({
            where,
            orderBy: { name: 'asc' },
        });
    }

    async findByScreenTypeCode(query: any, screenTypeCode: string): Promise<ControlType[]> {
        const relations = await this.prisma.screenTypeControlType.findMany({
            where: { screenTypeCode },
            select: { controlTypeCode: true },
        });
        const codes = relations.map(r => r.controlTypeCode);
        if (codes.length === 0) return [];
        return this.prisma.controlType.findMany({ ...query, where: { code: { in: codes } } });
    }
}