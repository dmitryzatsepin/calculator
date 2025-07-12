// backend/src/services/cabinetPriceService.ts
import { PrismaClient, Prisma, CabinetPrice } from "../prisma/generated/client";

export class CabinetPriceService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) { this.prisma = prisma; }

  async findByCabinetCode(query: any, cabinetCode: string): Promise<CabinetPrice | null> {
    return this.prisma.cabinetPrice.findUnique({
      ...query,
      where: { cabinetCode },
    });
  }
}