// backend/src/services/cabinetService.ts
import { PrismaClient, Prisma, Cabinet } from "../prisma/generated/client";

export interface CabinetFilters {
  locationCode?: string | null;
  materialCode?: string | null;
  pitchCode?: string | null;
  moduleCode?: string | null;
  onlyActive?: boolean | null;
}

export class CabinetService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // --- Переиспользуемый метод для поиска совместимых размеров кабинета ---
  private async findCompatibleCabinetSizeCodes(
    moduleCode: string
  ): Promise<string[]> {
    // 1. Находим размеры модулей для данного кода модуля
    const moduleSizes = await this.prisma.moduleSize.findMany({
      where: { modules: { some: { moduleCode } }, active: true },
      select: { code: true },
    });
    const moduleSizeCodes = moduleSizes.map((ms) => ms.code);
    if (moduleSizeCodes.length === 0) return [];

    // 2. Находим размеры кабинетов, совместимые с размерами модулей
    const compatibleCabinetSizes = await this.prisma.cabinetSize.findMany({
      where: {
        moduleSizes: { some: { moduleSizeCode: { in: moduleSizeCodes } } },
        active: true,
      },
      select: { code: true },
    });
    return compatibleCabinetSizes.map((cs) => cs.code);
  }

  async findFiltered(filters?: CabinetFilters) {
    console.log('[CabinetService] Fetching with filters:', JSON.stringify(filters));
    const where: Prisma.CabinetWhereInput = {
      active: filters?.onlyActive ?? undefined,
    };

    if (filters?.locationCode) {
      where.locations = { some: { locationCode: filters.locationCode } };
    }
    if (filters?.materialCode) {
      where.materials = { some: { materialCode: filters.materialCode } };
    }
    if (filters?.pitchCode) {
      where.pitches = { some: { pitchCode: filters.pitchCode } };
    }

    if (filters?.moduleCode) {
      const compatibleCabinetSizeCodes = await this.findCompatibleCabinetSizeCodes(filters.moduleCode);
      if (compatibleCabinetSizeCodes.length > 0) {
        where.sizes = { some: { cabinetSizeCode: { in: compatibleCabinetSizeCodes } } };
      } else {
        console.log(`[CabinetService] No compatible cabinet sizes for module ${filters.moduleCode}. Returning empty.`);
        return [];
      }
    }

    console.log(`[CabinetService] Final where clause:`, JSON.stringify(where));
    return this.prisma.cabinet.findMany({
      where,
      orderBy: [{ name: 'asc' }, { sku: 'asc' }],
    });
  }

  async findByCode(code: string) {
    console.log(`[CabinetService] Fetching details for cabinet code: ${code}`);
    return this.prisma.cabinet.findUnique({
      where: { code },
      include: {
        sizes: {
          include: {
            size: true
          },
          where: { size: { active: true } },
          take: 1
        }
      }
    });
  }

  /**
 * Находит кабинеты, имеющие указанный размер.
 * @param query - Объект Pothos для select/include.
 * @param cabinetSizeCode - Код размера кабинета.
 * @param onlyActive - Флаг для фильтрации по активности кабинетов.
 * @returns Promise<Cabinet[]>
 */
async findByCabinetSizeCode(
  query: any,
  cabinetSizeCode: string,
  onlyActive?: boolean | null
): Promise<Cabinet[]> {
  const relations = await this.prisma.cabinetCabinetSize.findMany({
    where: { cabinetSizeCode },
    select: { cabinetCode: true },
  });
  const cabinetCodes = relations.map(r => r.cabinetCode);
  if (cabinetCodes.length === 0) return [];

  const where: Prisma.CabinetWhereInput = { code: { in: cabinetCodes } };
  if (onlyActive !== null && onlyActive !== undefined) {
    where.active = onlyActive;
  }
  return this.prisma.cabinet.findMany({ ...query, where });
}

  async findByPitch(pitchCode: string, onlyActive: boolean) {
    console.warn("findByPitch is deprecated, use findFiltered with pitchCode instead.");
    return this.findFiltered({ pitchCode, onlyActive });
  }
}