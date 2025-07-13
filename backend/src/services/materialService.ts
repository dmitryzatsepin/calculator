// backend/src/services/materialService.ts
import { PrismaClient, Prisma, Material } from "@prisma/client";

export interface MaterialFilters {
  onlyActive?: boolean | null;
}

export class MaterialService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Находит список всех материалов с возможностью фильтрации по активности.
   * @param filters - Объект с фильтрами, например, { onlyActive: true }.
   * @returns Promise<Material[]>
   */
  async findAll(filters?: MaterialFilters): Promise<Material[]> {
    const where: Prisma.MaterialWhereInput = {
      active: filters?.onlyActive ?? undefined,
    };

    return this.prisma.material.findMany({
      where,
      orderBy: { code: 'asc' },
    });
  }

  /**
   * Находит один материал по его уникальному коду.
   * @param code - Уникальный код.
   * @returns Promise<Material | null>
   */
  async findByCode(code: string): Promise<Material | null> {
    return this.prisma.material.findUnique({
      where: { code },
    });
  }
    /**
     * Находит список материалов, связанных с определенным кабинетом.
     * @param query - Prisma запрос для дополнительных условий.
     * @param cabinetCode - Код кабинета, для которого нужно найти материалы.
     * @returns Promise<Material[]>
     */
  async findByCabinetCode(query: any, cabinetCode: string): Promise<Material[]> {
    const relations = await this.prisma.cabinetMaterial.findMany({
      where: { cabinetCode }, select: { materialCode: true },
    });
    const codes = relations.map(r => r.materialCode);
    if (codes.length === 0) return [];
    return this.prisma.material.findMany({ ...query, where: { code: { in: codes } } });
  }
}