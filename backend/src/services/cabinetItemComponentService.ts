// backend/src/services/cabinetItemComponentService.ts
import { PrismaClient, Prisma, CabinetItemComponent } from "../prisma/generated/client";

export class CabinetItemComponentService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) { this.prisma = prisma; }

  async findByCabinetCode(query: any, cabinetCode: string): Promise<CabinetItemComponent[]> {
    return this.prisma.cabinetItemComponent.findMany({
      ...query,
      where: {
        cabinetCode: cabinetCode,
        item: { active: true },
      },
    });
  }
}