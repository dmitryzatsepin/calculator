// backend/src/services/moduleItemComponentService.ts
import { PrismaClient, ModuleItemComponent } from "../../prisma/generated/client";

export class ModuleItemComponentService {
    private prisma: PrismaClient;
    constructor(prisma: PrismaClient) { this.prisma = prisma; }

    async findByModuleCode(query: any, moduleCode: string): Promise<ModuleItemComponent[]> {
        return this.prisma.moduleItemComponent.findMany({
            ...query,
            where: {
                moduleCode,
                item: { active: true },
            },
        });
    }
}