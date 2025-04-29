// src/graphql/queries/brightnessQueries.ts
import { builder } from '../builder';
import { Prisma } from '@prisma/client';

builder.queryFields((t) => ({


  getFilteredBrightnessOptions: t.prismaField({
    type: ['Brightness'],
    description: 'Получить доступные значения яркости для модулей, подходящих под расположение и шаг пикселя.',
    args: {
        locationCode: t.arg.string({ required: true }),
        pitchCode: t.arg.string({ required: true }),
        refreshRateCode: t.arg.string({ required: true }),
        onlyActive: t.arg.boolean({ defaultValue: true, required: false })
    },
    resolve: async (query, _parent, args, ctx) => {
        const { locationCode, pitchCode, onlyActive } = args;
        console.log(`[getFilteredBrightnessOptions] Fetching brightness for location: ${locationCode}, pitch: ${pitchCode}`);

        // 1. Найти УНИКАЛЬНЫЕ коды яркости, связанные с модулями,
        //    которые подходят под локацию И питч И активны (если onlyActive=true)
        const brightnessRelations = await ctx.prisma.moduleBrightness.findMany({
            where: {
                module: {
                    active: onlyActive ?? undefined,
                    locations: { some: { locationCode: locationCode } },
                    pitches: { some: { pitchCode: pitchCode } },
                    refreshRates: { some: { refreshRateCode: args.refreshRateCode } }
                },
                brightness: { active: onlyActive ?? undefined } // Условие на активность самой яркости
            },
            select: { brightnessCode: true },
            distinct: ['brightnessCode']
        });

        const availableBrightnessCodes = brightnessRelations.map(br => br.brightnessCode);

        if (availableBrightnessCodes.length === 0) {
            console.log(`[getFilteredBrightnessOptions] No relevant brightness values found for location: ${locationCode}, pitch: ${pitchCode}`);
            return [];
        }
        console.log(`[getFilteredBrightnessOptions] Found relevant brightness codes:`, availableBrightnessCodes);

        // 2. Запросить сами объекты Brightness по найденным кодам
        return ctx.prisma.brightness.findMany({
            ...query,
            where: {
                code: { in: availableBrightnessCodes },
            },
            orderBy: { value: 'asc' }
        });
    }
  }),
}));