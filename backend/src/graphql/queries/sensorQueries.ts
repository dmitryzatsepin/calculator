// src/graphql/queries/sensorQueries.ts
import { builder } from '../builder';
import { Prisma } from '../../../prisma/generated/client';

// Используем builder.queryFields
builder.queryFields((t) => ({

  // Определяем запрос 'sensors'
  sensors: t.prismaField({
    // Возвращает МАССИВ объектов 'Sensor' (тип 'Sensor' уже определен в types/Sensor.ts)
    type: ['Sensor'],
    description: 'Получить список всех доступных сенсоров.',
    args: {
      onlyActive: t.arg.boolean({ // Аргумент для фильтрации по активности
        required: false,
        defaultValue: true, // По умолчанию возвращаем только активные
        description: 'Вернуть только активные сенсоры?'
      })
      // Пока нет других аргументов (например, фильтра по screenTypeCode)
    },
    resolve: async (query, _parent, args, ctx /*, _info */) => {
      // Определяем тип для where
      const where: Prisma.SensorWhereInput = {};

      // Применяем фильтр по активности
      if (args.onlyActive === true || args.onlyActive === false) {
        where.active = args.onlyActive;
      }

      // Выполняем запрос Prisma
      return ctx.prisma.sensor.findMany({
         ...query, // Передаем query от Pothos
         where,    // Применяем фильтр
         orderBy: {
             // Сортируем по имени для предсказуемого порядка
             name: 'asc'
         }
      });
    }
  }) // Конец определения 'sensors'

})); // Конец builder.queryFields