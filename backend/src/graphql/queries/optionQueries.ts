// src/graphql/queries/optionQueries.ts
import { builder } from '../builder';
import { Prisma } from '@prisma/client';

builder.queryFields((t) => ({

  // --- ЗАПРОС: Получить опции, доступные для типа экрана ---
  optionsByScreenType: t.prismaField({
    type: ['Option'], // Возвращает массив опций
    description: 'Получить список опций, доступных для указанного типа экрана.',
    args: {
        screenTypeCode: t.arg.string({ required: true, description: 'Код типа экрана' }),
        onlyActive: t.arg.boolean({ defaultValue: true, required: false, description: 'Вернуть только активные опции?' })
    },
    resolve: async (query, _parent, args, ctx) => {
        const { screenTypeCode, onlyActive } = args;
        console.log(`[optionsByScreenType] Fetching options for screen type: ${screenTypeCode}`);

        // Находим все связи Option для данного ScreenType
        const screenTypeOptions = await ctx.prisma.screenTypeOption.findMany({
            where: {
                screenTypeCode: screenTypeCode,
                // Фильтруем по активным опциям, если нужно
                option: onlyActive ? { active: true } : undefined
            },
            select: {
                optionCode: true // Нам нужны только коды связанных опций
            }
        });

        const optionCodes = screenTypeOptions.map(sto => sto.optionCode);

        if (optionCodes.length === 0) {
            console.log(`[optionsByScreenType] No options found for screen type: ${screenTypeCode}`);
            return []; // Если связей нет, возвращаем пустой массив
        }

        // Запрашиваем сами объекты Option по найденным кодам
        return ctx.prisma.option.findMany({
            ...query, // Передаем select/include от Pothos
            where: {
                code: { in: optionCodes },
                // Дополнительно проверяем активность самой опции (на случай если onlyActive был false)
                active: onlyActive ?? undefined
            },
            orderBy: {
                name: 'asc' // Сортируем по имени
            }
        });
    }
  }) // --- Конец запроса optionsByScreenType ---

})); // --- Конец builder.queryFields ---