// backend/src/services/placementService.ts
import { PrismaClient, Prisma, Placement } from "@prisma/client";

export class PlacementService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) { this.prisma = prisma; }

  async findByCabinetCode(query: any, cabinetCode: string): Promise<Placement[]> {
    const relations = await this.prisma.cabinetPlacement.findMany({
      where: { cabinetCode }, select: { placementCode: true },
    });
    const codes = relations.map(r => r.placementCode);
    if (codes.length === 0) return [];
    return this.prisma.placement.findMany({ ...query, where: { code: { in: codes } } });
  }
}