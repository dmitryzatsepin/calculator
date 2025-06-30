// backend/src/services/refreshRateService.ts
import { PrismaClient, Prisma, RefreshRate } from "../../prisma/generated/client";

export interface RefreshRateFilters {
  onlyActive?: boolean | null;
}

export interface FilteredRefreshRateOptions {
  locationCode: string;
  pitchCode: string;
  onlyActive?: boolean | null;
  isFlex?: boolean | null;
}

export class RefreshRateService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Находит список всех частот обновления.
   */
  async findAll(query: any, filters?: RefreshRateFilters): Promise<RefreshRate[]> {
    const where: Prisma.RefreshRateWhereInput = {
      active: filters?.onlyActive ?? undefined,
    };
    return this.prisma.refreshRate.findMany({
      ...query,
      where,
      orderBy: { value: 'asc' },
    });
  }

  /**
   * Находит доступные опции частоты обновления на основе фильтров по модулям.
   */
  async findFiltered(query: any, filters: FilteredRefreshRateOptions): Promise<RefreshRate[]> {
    const { locationCode, pitchCode, onlyActive, isFlex } = filters;
    console.log(`[RefreshRateService] Fetching for loc: ${locationCode}, pitch: ${pitchCode}, isFlex: ${isFlex}`);

    const moduleWhere: Prisma.ModuleWhereInput = {
      active: onlyActive ?? undefined,
      AND: [
        { locations: { some: { locationCode: locationCode } } },
        { pitches: { some: { pitchCode: pitchCode } } },
      ],
    };

    const relevantModules = await this.prisma.module.findMany({
      where: moduleWhere,
      select: { id: true },
    });

    const relevantModuleIds = relevantModules.map(m => m.id);
    if (relevantModuleIds.length === 0) return [];

    const relations = await this.prisma.moduleRefreshRate.findMany({
          where: {
            module: {
              id: { in: relevantModuleIds }
            },
            refreshRate: { active: onlyActive ?? undefined },
          },
          select: { refreshRateCode: true },
          distinct: ['refreshRateCode'],
        });

    const availableCodes = relations.map(r => r.refreshRateCode);
    if (availableCodes.length === 0) return [];

    return this.prisma.refreshRate.findMany({
      ...query,
      where: {
        code: { in: availableCodes },
        active: onlyActive ?? undefined,
      },
      orderBy: { value: 'asc' },
    });
  }
}