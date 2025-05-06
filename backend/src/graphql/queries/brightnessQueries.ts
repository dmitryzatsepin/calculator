// src/graphql/queries/brightnessQueries.ts
import { builder } from '../builder';
import { Prisma } from '../../../prisma/generated/client'; // Импортируем Prisma Client

builder.queryFields((t) => ({
  // <<< ЗАПРОС ФИЛЬТРОВАННЫХ ОПЦИЙ ЯРКОСТИ >>>
  getFilteredBrightnessOptions: t.prismaField({
    type: ['Brightness'],
    description: 'Получить доступные значения яркости для модулей, подходящих под расположение, шаг пикселя, частоту обновления и опцию гибкости.',
    args: {
        locationCode: t.arg.string({ required: true }),
        pitchCode: t.arg.string({ required: true }),
        refreshRateCode: t.arg.string({ required: true }),
        onlyActive: t.arg.boolean({ defaultValue: true, required: false }),
        isFlex: t.arg.boolean({ required: false }) // <<< ДОБАВЛЕН АРГУМЕНТ isFlex >>>
    },
    resolve: async (query, _parent, args, ctx) => {
        // Явно типизируем args
        const { locationCode, pitchCode, refreshRateCode, onlyActive, isFlex } = args as {
             locationCode: string; pitchCode: string; refreshRateCode: string; onlyActive?: boolean | null; isFlex?: boolean | null
         };
        console.log(`[getFilteredBrightnessOptions] Fetching brightness for loc: ${locationCode}, pitch: ${pitchCode}, refresh: ${refreshRateCode}, isFlex: ${isFlex}`);

        // 1. Найти ID модулей, которые соответствуют ВСЕМ критериям (включая isFlex)
        const moduleWhere: Prisma.ModuleWhereInput = {
            active: onlyActive ?? undefined,
            AND: [
                { locations: { some: { locationCode: locationCode } } },
                { pitches: { some: { pitchCode: pitchCode } } },
                { refreshRates: { some: { refreshRateCode: refreshRateCode } } }
            ],
            // <<< ДОБАВЛЕНА ФИЛЬТРАЦИЯ ПО ОПЦИИ FLEX >>>
            options: isFlex === true
                ? { some: { optionCode: 'flex' } }
                : { none: { optionCode: 'flex' } }
        };

        const relevantModules = await ctx.prisma.module.findMany({
            where: moduleWhere,
            select: { id: true, code: true, name: true } // Выбираем ID и доп. инфо для лога
        });

        const relevantModuleIds = relevantModules.map(m => m.id);
        console.log(`[getFilteredBrightnessOptions] Found ${relevantModules.length} modules matching criteria:`,
             relevantModules.map(m => ({ id: m.id, code: m.code, name: m.name }))
        );

        if (relevantModuleIds.length === 0) {
            console.log(`[getFilteredBrightnessOptions] No modules found matching all criteria.`);
            return [];
        }

        // 2. Найти УНИКАЛЬНЫЕ коды яркости, связанные с ЭТИМИ модулями
        const brightnessRelations = await ctx.prisma.moduleBrightness.findMany({
            where: {
                module: { // Фильтруем по связи module
                    id: { in: relevantModuleIds } // По ID найденных модулей
                },
                brightness: { active: onlyActive ?? undefined } // Фильтруем по активности Brightness
            },
            select: { brightnessCode: true },
            distinct: ['brightnessCode']
        });

        const availableBrightnessCodes = brightnessRelations.map(br => br.brightnessCode);

        if (availableBrightnessCodes.length === 0) {
            console.log(`[getFilteredBrightnessOptions] No relevant brightness options found for the filtered modules.`);
            return [];
        }
         console.log(`[getFilteredBrightnessOptions] Found relevant brightness codes:`, availableBrightnessCodes);

        // 3. Запросить сами объекты Brightness по найденным кодам
        return ctx.prisma.brightness.findMany({
            ...query,
            where: {
                code: { in: availableBrightnessCodes },
                active: onlyActive ?? undefined,
            },
            orderBy: { value: 'asc' }
        });
    }
  }),
}));