// backend/src/services/locationService.ts
import { PrismaClient, Prisma, Location } from "../../prisma/generated/client";

export interface LocationFilters {
    onlyActive?: boolean | null;
}
export class LocationService {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    /**
     * Находит список всех активных локаций.
     * @returns Promise<Location[]>
     */
    async findAllActive(): Promise<Location[]> {
        return this.prisma.location.findMany({
            where: { active: true },
            orderBy: { name: 'asc' },
        });
    }

    /**
     * Находит одну локацию по ее уникальному коду.
     * @param code - Уникальный код.
     * @returns Promise<Location | null>
     */
    async findByCode(code: string): Promise<Location | null> {
        return this.prisma.location.findUnique({
            where: { code },
        });
    }
    /**
     * Находит список локаций с возможностью фильтрации по активности.
     * @param filters - Объект с фильтрами, например, { onlyActive: true }.
     * @returns Promise<Location[]>
     */
    async findByCabinetCode(query: any, cabinetCode: string): Promise<Location[]> {
        const relations = await this.prisma.cabinetLocation.findMany({
            where: { cabinetCode }, select: { locationCode: true },
        });
        const codes = relations.map(r => r.locationCode);
        if (codes.length === 0) return [];
        return this.prisma.location.findMany({ ...query, where: { code: { in: codes } } });
    }

    async findByModuleCode(query: any, moduleCode: string): Promise<Location[]> {
        const relations = await this.prisma.moduleLocation.findMany({ where: { moduleCode }, select: { locationCode: true } });
        const codes = relations.map(r => r.locationCode);
        if (codes.length === 0) return [];
        return this.prisma.location.findMany({ ...query, where: { code: { in: codes } } });
    }
}