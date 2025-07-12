// backend/src/services/moduleService.ts
import { PrismaClient, Prisma, Module } from "../prisma/generated/client";

// Тип для фильтров, который сервис будет принимать
export interface ModuleFilters {
    locationCode?: string | null;
    pitchCode?: string | null;
    brightnessCode?: string | null;
    refreshRateCode?: string | null;
    isFlex?: boolean | null;
    onlyActive?: boolean | null;
}

export class ModuleService {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    /**
     * Находит отфильтрованный список модулей.
     * @param query - Объект с параметрами от Pothos.
     * @param filters - Объект с дополнительными фильтрами.
     * @returns Promise<Module[]>
     */
    async findFiltered(query: any, filters?: ModuleFilters): Promise<Module[]> {
        const where: Prisma.ModuleWhereInput = {
            active: filters?.onlyActive ?? undefined,
        };

        if (filters) {
            if (filters.locationCode) where.locations = { some: { locationCode: filters.locationCode } };
            if (filters.pitchCode) where.pitches = { some: { pitchCode: filters.pitchCode } };
            if (filters.brightnessCode) where.brightnesses = { some: { brightnessCode: filters.brightnessCode } };
            if (filters.refreshRateCode) where.refreshRates = { some: { refreshRateCode: filters.refreshRateCode } };
            if (typeof filters.isFlex === 'boolean') {
                where.options = filters.isFlex
                    ? { some: { optionCode: 'flex' } }
                    : { none: { optionCode: 'flex' } };
            } else {
                where.options = { none: { optionCode: 'flex' } };
            }
        } else {
            where.options = { none: { optionCode: 'flex' } };
        }

        return this.prisma.module.findMany({
            ...query,
            where,
            orderBy: [{ sku: 'asc' }, { name: 'asc' }, { code: 'asc' }],
        });
    }

    /**
     * Находит один Module по его уникальному коду.
     * @param query - Объект с параметрами от Pothos.
     * @param code - Уникальный код.
     * @returns Promise<Module | null>
     */
    async findByCode(query: any, code: string): Promise<Module | null> {
        return this.prisma.module.findUnique({
            ...query,
            where: { code },
        });
    }

    /**
 * Находит модули, имеющие указанный размер.
 * @param query - Объект Pothos.
 * @param moduleSizeCode - Код размера модуля.
 * @param onlyActive - Флаг фильтрации.
 * @returns Promise<Module[]>
 */
    async findByModuleSizeCode(
        query: any,
        moduleSizeCode: string,
        onlyActive?: boolean | null
    ): Promise<Module[]> {
        const relations = await this.prisma.moduleModuleSize.findMany({
            where: { moduleSizeCode },
            select: { moduleCode: true },
        });
        const moduleCodes = relations.map(r => r.moduleCode);
        if (moduleCodes.length === 0) return [];

        const where: Prisma.ModuleWhereInput = { code: { in: moduleCodes } };
        if (onlyActive !== null && onlyActive !== undefined) {
            where.active = onlyActive;
        }
        return this.prisma.module.findMany({ ...query, where });
    }

    /**
   * Считает количество отфильтрованных модулей.
   * @param filters - Объект с фильтрами.
   * @returns Promise<number>
   */
    async countFiltered(filters?: ModuleFilters): Promise<number> {
        const where: Prisma.ModuleWhereInput = {
            active: filters?.onlyActive ?? undefined,
        };

        if (filters) {
            if (filters.locationCode) where.locations = { some: { locationCode: filters.locationCode } };
            if (filters.pitchCode) where.pitches = { some: { pitchCode: filters.pitchCode } };
            if (filters.brightnessCode) where.brightnesses = { some: { brightnessCode: filters.brightnessCode } };
            if (filters.refreshRateCode) where.refreshRates = { some: { refreshRateCode: filters.refreshRateCode } };
            if (typeof filters.isFlex === 'boolean') {
                where.options = filters.isFlex
                    ? { some: { optionCode: 'flex' } }
                    : { none: { optionCode: 'flex' } };
            } else {
                where.options = { none: { optionCode: 'flex' } };
            }
        } else {
            where.options = { none: { optionCode: 'flex' } };
        }

        return this.prisma.module.count({ where });
    }

    /**
 * Находит модули, имеющие указанный шаг пикселя.
 * @param query - Объект Pothos.
 * @param pitchCode - Код шага пикселя.
 * @param onlyActive - Флаг фильтрации.
 * @returns Promise<Module[]>
 */
    async findByPitchCode(
        query: any,
        pitchCode: string,
        onlyActive?: boolean | null
    ): Promise<Module[]> {
        const relations = await this.prisma.modulePitch.findMany({
            where: { pitchCode },
            select: { moduleCode: true },
        });
        const moduleCodes = relations.map(r => r.moduleCode);
        if (moduleCodes.length === 0) return [];

        const where: Prisma.ModuleWhereInput = { code: { in: moduleCodes } };
        if (onlyActive !== null && onlyActive !== undefined) {
            where.active = onlyActive;
        }

        return this.prisma.module.findMany({ ...query, where });
    }
}