// backend/src/services/brightnessService.ts
import { PrismaClient, Prisma } from "../../prisma/generated/client";

export interface BrightnessFilters {
  locationCode: string;
  pitchCode: string;
  refreshRateCode: string;
  onlyActive?: boolean | null;
  isFlex?: boolean | null;
}

export class BrightnessService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Находит доступные опции яркости на основе сложных фильтров по модулям.
   * @param filters - Объект с фильтрами: locationCode, pitchCode, refreshRateCode, и т.д.
   * @returns Promise<Brightness[]> - Массив отфильтрованных объектов Brightness.
   */
  async findFiltered(filters: BrightnessFilters) {
    const { locationCode, pitchCode, refreshRateCode, onlyActive, isFlex } = filters;
    console.log(`[BrightnessService] Fetching brightness for loc: ${locationCode}, pitch: ${pitchCode}, refresh: ${refreshRateCode}, isFlex: ${isFlex}`);

    // Шаг 1: Найти ID модулей, которые соответствуют всем критериям
    const moduleWhere: Prisma.ModuleWhereInput = {
      active: onlyActive ?? undefined,
      AND: [
        { locations: { some: { locationCode: locationCode } } },
        { pitches: { some: { pitchCode: pitchCode } } },
        { refreshRates: { some: { refreshRateCode: refreshRateCode } } },
      ],
    };
    // Управляем фильтром isFlex
    if (isFlex === true) {
      moduleWhere.options = { some: { optionCode: 'flex' } };
    } else if (isFlex === false) {
      moduleWhere.options = { none: { optionCode: 'flex' } };
    } // Если isFlex === null или undefined, фильтр не применяется

    const relevantModules = await this.prisma.module.findMany({
      where: moduleWhere,
      select: { id: true },
    });

    const relevantModuleIds = relevantModules.map(m => m.id);

    if (relevantModuleIds.length === 0) {
      console.log(`[BrightnessService] No modules found matching criteria.`);
      return [];
    }

    // Шаг 2: Найти УНИКАЛЬНЫЕ коды яркости, связанные с ЭТИМИ модулями
    const brightnessRelations = await this.prisma.moduleBrightness.findMany({
            where: {
                module: {
                    id: { in: relevantModuleIds }
                },
                brightness: { active: onlyActive ?? undefined }
            },
            select: { brightnessCode: true },
            distinct: ['brightnessCode'],
        });

    const availableBrightnessCodes = brightnessRelations.map(br => br.brightnessCode);

    if (availableBrightnessCodes.length === 0) {
      console.log(`[BrightnessService] No relevant brightness options found.`);
      return [];
    }

    // Шаг 3: Запросить сами объекты Brightness по найденным кодам
    return this.prisma.brightness.findMany({
      where: {
        code: { in: availableBrightnessCodes },
        active: onlyActive ?? undefined,
      },
      orderBy: { value: 'asc' },
    });
  }
}