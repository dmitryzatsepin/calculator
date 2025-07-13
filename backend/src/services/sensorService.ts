// backend/src/services/sensorService.ts
import { PrismaClient, Prisma, Sensor } from "@prisma/client";

export interface SensorFilters {
    onlyActive?: boolean | null;
}

export class SensorService {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    /**
     * Находит список всех сенсоров с возможностью фильтрации по активности.
     * @param query - Объект Pothos для select/include.
     * @param filters - Объект с фильтрами, например, { onlyActive: true }.
     * @returns Promise<Sensor[]>
     */
    async findAll(query: any, filters?: SensorFilters): Promise<Sensor[]> {
        const where: Prisma.SensorWhereInput = {
            active: filters?.onlyActive ?? undefined,
        };

        return this.prisma.sensor.findMany({
            ...query,
            where,
            orderBy: { name: 'asc' },
        });
    }

    /**
   * Находит сенсоры, доступные для указанного типа экрана.
   * @param query - Объект Pothos.
   * @param screenTypeCode - Код типа экрана.
   * @returns Promise<Sensor[]>
   */
    async findByScreenTypeCode(query: any, screenTypeCode: string): Promise<Sensor[]> {
        const relations = await this.prisma.screenTypeSensor.findMany({
            where: { screenTypeCode },
            select: { sensorCode: true },
        });
        const codes = relations.map(r => r.sensorCode);
        if (codes.length === 0) return [];
        return this.prisma.sensor.findMany({ ...query, where: { code: { in: codes } } });
    }
}