// backend/src/services/pitchService.ts
import { PrismaClient, Prisma, Pitch } from "../../prisma/generated/client";

export interface PitchFilters {
    onlyActive?: boolean | null;
}

export class PitchService {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    /**
     * Находит список всех шагов пикселя с фильтрацией.
     * @param query - Объект Pothos для select/include.
     * @param filters - Фильтры.
     * @returns Promise<Pitch[]>
     */
    async findAll(query: any, filters?: PitchFilters): Promise<Pitch[]> {
        const where: Prisma.PitchWhereInput = {
            active: filters?.onlyActive ?? undefined,
        };
        return this.prisma.pitch.findMany({
            ...query,
            where,
            orderBy: { pitchValue: 'asc' },
        });
    }

    /**
     * Находит один шаг пикселя по коду.
     * @param query - Объект Pothos для select/include.
     * @param code - Уникальный код.
     * @returns Promise<Pitch | null>
     */
    async findByCode(query: any, code: string): Promise<Pitch | null> {
        return this.prisma.pitch.findUnique({
            ...query,
            where: { code },
        });
    }

    /**
     * Находит доступные шаги пикселя для модулей в указанной локации.
     * @param query - Объект Pothos для select/include.
     * @param locationCode - Код локации.
     * @param onlyActive - Флаг для фильтрации.
     * @returns Promise<Pitch[]>
     */
    async findAvailableByLocation(
        query: any,
        locationCode: string,
        onlyActive?: boolean | null
    ): Promise<Pitch[]> {
        console.log(`[PitchService] Fetching pitches for location: ${locationCode}`);

        // Шаг 1: Найти уникальные pitchCode из модулей, которые соответствуют локации
        const pitchCodeRelations = await this.prisma.modulePitch.findMany({
            where: {
                module: {
                    active: onlyActive ?? undefined,
                    locations: { some: { locationCode: locationCode } },
                },
            },
            select: { pitchCode: true },
            distinct: ['pitchCode'],
        });

        const availablePitchCodes = pitchCodeRelations.map(p => p.pitchCode);
        if (availablePitchCodes.length === 0) {
            console.log(`[PitchService] No relevant pitches found for location: ${locationCode}`);
            return [];
        }

        // Шаг 2: Получить полные объекты Pitch по найденным кодам
        return this.prisma.pitch.findMany({
            ...query,
            where: {
                code: { in: availablePitchCodes },
                active: onlyActive ?? undefined,
            },
            orderBy: {
                pitchValue: 'asc',
            },
        });
    }

    /**
     * Находит шаги пикселя, связанные с определенным кабинетом.
     * @param query - Prisma запрос для дополнительных условий.
     * @param cabinetCode - Код кабинета, для которого нужно найти шаги пикселя.
     * @returns Promise<Pitch[]>
     */
    async findByCabinetCode(query: any, cabinetCode: string): Promise<Pitch[]> {
        const relations = await this.prisma.cabinetPitch.findMany({
            where: { cabinetCode }, select: { pitchCode: true },
        });
        const codes = relations.map(r => r.pitchCode);
        if (codes.length === 0) return [];
        return this.prisma.pitch.findMany({ ...query, where: { code: { in: codes } } });
    }
    async findByModuleCode(query: any, moduleCode: string): Promise<Pitch[]> {
        const relations = await this.prisma.modulePitch.findMany({ where: { moduleCode }, select: { pitchCode: true } });
        const codes = relations.map(r => r.pitchCode);
        if (codes.length === 0) return [];
        return this.prisma.pitch.findMany({ ...query, where: { code: { in: codes } } });
    }
}