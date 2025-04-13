// src/graphql/queries/locationQueries.ts
import { builder } from '../builder'; // Импортируем наш builder

// Используем builder.queryFields, чтобы добавить новые поля в корневой тип Query
builder.queryFields((t) => ({

  // --- Запрос для получения списка локаций ---
  locations: t.prismaField({
    // Указываем, что этот запрос возвращает: массив объектов типа 'Location'
    // Pothos найдет тип 'Location', который мы определили в Location.ts
    type: ['Location'],
    // Описываем, что делает этот запрос (появится в документации GraphQL)
    description: 'Получить список всех активных локаций, отсортированных по имени.',
    // Определяем резолвер - функцию, которая выполнит запрос к базе данных
    resolve: async (
      query,    // Содержит информацию о полях, запрошенных клиентом (для оптимизации)
      parent,   // Родительский объект (для корневых запросов - пустой)
      args,     // Аргументы, переданные клиентом (здесь их нет)
      context,  // Наш GraphQLContext (содержит prisma)
      info      // Дополнительная информация о GraphQL запросе
    ) => {
      // Используем Prisma Client из контекста
      return context.prisma.location.findMany({
         ...query, // Включаем информацию из query (например, select), чтобы Prisma вернула только нужные поля
         where: {
             active: true // Возвращаем только активные локации
         },
         orderBy: {
             name: 'asc' // Сортируем по имени в алфавитном порядке
         }
      });
    }
  }), // --- Конец запроса locations ---

  // --- Запрос для получения одной локации по коду ---
  locationByCode: t.prismaField({
      // Возвращает один объект типа 'Location'
      type: 'Location',
      // Указываем, что результат может быть null (если локация не найдена)
      nullable: true,
      description: 'Получить одну локацию по ее уникальному коду.',
      // Определяем аргументы, которые принимает этот запрос
      args: {
          // Аргумент 'code' типа String, обязательный
          code: t.arg.string({ required: true, description: 'Уникальный код локации' })
      },
      // Резолвер для получения одной локации
      resolve: async (query, parent, args, context, info) => {
          // Используем findUnique для поиска по уникальному полю 'code'
          return context.prisma.location.findUnique({
              ...query, // Передаем select/include из GraphQL запроса
              where: {
                  // Prisma знает, что 'code' - это уникальное поле в модели Location
                  code: args.code // Используем значение аргумента 'code'
              }
          });
      }
  }) // --- Конец запроса locationByCode ---

  // Сюда можно будет добавлять другие запросы в будущем

}));