// backend/src/services/ipProtectionService.ts
import { PrismaClient, Prisma, IpProtection } from "../../prisma/generated/client";

// Тип для фильтров
export interface IpProtectionFilters {
  onlyActive?: boolean | null;
}

export class IpProtectionService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Находит список всех степеней IP-защиты с возможностью фильтрации по активности.
   * @param filters - Объект с фильтрами, например, { onlyActive: true }.
   * @returns Promise<IpProtection[]>
   */
  async findAll(filters?: IpProtectionFilters): Promise<IpProtection[]> {
    const where: Prisma.IpProtectionWhereInput = {
      active: filters?.onlyActive ?? undefined,
    };

    return this.prisma.ipProtection.findMany({
      where,
      orderBy: { code: 'asc' },
    });
  }

  /**
   * Находит одну степень IP-защиты по ее уникальному коду.
   * @param code - Уникальный код (например, "IP65").
   * @returns Promise<IpProtection | null>
   */
  async findByCode(code: string): Promise<IpProtection | null> {
    console.log(`[IpProtectionService] Searching for code: ${code}`);
    return this.prisma.ipProtection.findUnique({
      where: { code },
    });
  }
}