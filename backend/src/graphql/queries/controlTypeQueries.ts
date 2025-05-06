// src/graphql/queries/controlTypeQueries.ts
import { builder } from '../builder';
import { Prisma } from '../../../prisma/generated/client';

// Используем builder.queryFields
builder.queryFields((t) => ({

  // Определяем запрос 'controlTypes'
  controlTypes: t.prismaField({
    // Возвращает МАССИВ объектов 'ControlType' (тип определен в types/ControlType.ts)
    type: ['ControlType'],
    description: 'Получить список всех доступных типов управления.',
    args: {
      onlyActive: t.arg.boolean({ // Аргумент для фильтрации по активности
        required: false,
        defaultValue: true, // По умолчанию возвращаем только активные
        description: 'Вернуть только активные типы управления?'
      })
      // Пока нет других аргументов
    },
    resolve: async (query, _parent, args, ctx /*, _info */) => {
      // Определяем тип для where
      const where: Prisma.ControlTypeWhereInput = {};

      // Применяем фильтр по активности
      if (args.onlyActive === true || args.onlyActive === false) {
        where.active = args.onlyActive;
      }

      // Выполняем запрос Prisma
      return ctx.prisma.controlType.findMany({
         ...query, // Передаем query от Pothos
         where,    // Применяем фильтр
         orderBy: {
             // Сортируем по имени для предсказуемого порядка
             name: 'asc'
         }
      });
    }
  }) // Конец определения 'controlTypes'

})); // Конец builder.queryFields