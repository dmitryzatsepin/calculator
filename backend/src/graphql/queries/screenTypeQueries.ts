// src/graphql/queries/screenTypeQueries.ts
import { builder } from '../builder'; // Импортируем наш builder

// Добавляем поля в корневой тип Query
builder.queryFields((t) => ({

  // --- ЗАПРОС: Получить список типов экранов ---
  screenTypes: t.prismaField({
    type: ['ScreenType'], // Возвращает массив [ScreenType]
    description: 'Получить список всех типов экранов.',
    args: {
        onlyActive: t.arg.boolean({ // Аргумент для фильтрации по активности
            defaultValue: true,     // По умолчанию запрашиваем только активные
            description: 'Вернуть только активные типы экранов?'
        })
    },
    // Резолвер для получения списка
    resolve: async (query, _parent, args, ctx, _info) => {
      console.log(`[screenTypes] Fetching screen types. onlyActive: ${args.onlyActive}`);
      return ctx.prisma.screenType.findMany({
         ...query, // Передаем select/include из GraphQL запроса (для связей options, controlTypes, sensors)
         where: {
             // Фильтруем по полю active, если onlyActive = true (или не указан)
             active: args.onlyActive ?? undefined
         },
         orderBy: {
             code: 'asc' // Сортируем по коду
         }
      });
    }
  }), // --- Конец запроса screenTypes ---


  // --- ЗАПРОС: Получить один тип экрана по коду ---
  screenTypeByCode: t.prismaField({
    type: 'ScreenType', // Возвращает один ScreenType
    nullable: true,     // Может вернуть null, если тип не найден
    description: 'Получить один тип экрана по его уникальному коду.',
    args: {
        // Обязательный строковый аргумент code
        code: t.arg.string({ required: true, description: 'Уникальный код типа экрана' })
    },
    // Резолвер для получения одного элемента
    resolve: async (query, _parent, args, ctx, _info) => {
        console.log(`[screenTypeByCode] Searching for code: ${args.code}`);
        return ctx.prisma.screenType.findUnique({
            ...query, // Передаем select/include
            where: {
                code: args.code // Ищем по уникальному полю code
            }
        });
    }
  }) // --- Конец запроса screenTypeByCode ---

})); // --- Конец builder.queryFields ---