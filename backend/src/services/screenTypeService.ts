// backend/src/services/screenTypeService.ts
import { PrismaClient, Prisma, ScreenType } from "../../prisma/generated/client";

export interface ScreenTypeFilters {
  onlyActive?: boolean | null;
}

export class ScreenTypeService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Находит список всех типов экранов с возможностью фильтрации по активности.
   * @param query - Объект Pothos для select/include.
   * @param filters - Объект с фильтрами.
   * @returns Promise<ScreenType[]>
   */
  async findAll(query: any, filters?: ScreenTypeFilters): Promise<ScreenType[]> {
    const where: Prisma.ScreenTypeWhereInput = {
      active: filters?.onlyActive ?? undefined,
    };

    return this.prisma.screenType.findMany({
      ...query,
      where,
      orderBy: { code: 'asc' },
    });
  }

  /**
   * Находит один тип экрана по его уникальному коду.
   * @param query - Объект Pothos для select/include.
   * @param code - Уникальный код.
   * @returns Promise<ScreenType | null>
   */
  async findByCode(query: any, code: string): Promise<ScreenType | null> {
    return this.prisma.screenType.findUnique({
      ...query,
      where: { code },
    });
  }
}