// backend/src/services/optionService.ts
import { PrismaClient, Prisma, Option } from "../prisma/generated/client";

export class OptionService {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    /**
     * Находит опции, доступные для указанного типа экрана.
     * @param query - Объект с параметрами от Pothos (включая select/include).
     * @param screenTypeCode - Код типа экрана.
     * @param onlyActive - Флаг для фильтрации по активности опций.
     * @returns Promise<Option[]>
     */
    async findByScreenTypeCode(
        query: any,
        screenTypeCode: string,
        onlyActive?: boolean | null // Оставляем эту версию, так как она более гибкая
    ): Promise<Option[]> {
        console.log(`[OptionService] Fetching options for screen type: ${screenTypeCode}`);

        const relations = await this.prisma.screenTypeOption.findMany({
            where: {
                screenTypeCode,
                // Фильтруем по активности связанной опции, если onlyActive=true
                option: onlyActive ? { active: true } : undefined,
            },
            select: { optionCode: true },
        });

        const optionCodes = relations.map(sto => sto.optionCode);

        if (optionCodes.length === 0) {
            console.log(`[OptionService] No options found for screen type: ${screenTypeCode}`);
            return [];
        }

        return this.prisma.option.findMany({
            ...query,
            where: {
                code: { in: optionCodes },
                active: onlyActive ?? undefined,
            },
            orderBy: { name: 'asc' },
        });
    }

    // Этот метод был добавлен для рефакторинга Module.ts
    async findByModuleCode(query: any, moduleCode: string): Promise<Option[]> {
        const relations = await this.prisma.moduleOption.findMany({ where: { moduleCode }, select: { optionCode: true } });
        const codes = relations.map(r => r.optionCode);
        if (codes.length === 0) return [];
        return this.prisma.option.findMany({ ...query, where: { code: { in: codes } } });
    }

    // Дублирующая функция удалена
}