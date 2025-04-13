// src/graphql/types/Location.ts
import { builder } from '../builder'; // Импортируем наш настроенный builder

// Определяем GraphQL тип 'Location' на основе Prisma модели 'Location'
// Используем builder.prismaNode для соответствия Relay спецификации (глобальный ID)
// Pothos использует имя модели Prisma ('Location') для связи с типами PrismaTypes
builder.prismaNode('Location', {
  // Указываем, какое поле в Prisma модели соответствует ID для Relay Node interface
  // Pothos автоматически создаст глобально уникальный ID для этого типа
  id: { field: 'id' },
  // Определяем поля, которые будут доступны в GraphQL для типа Location
  fields: (t) => ({
    // t.exposeX() делает поле из Prisma модели доступным в GraphQL
    // Первый аргумент - имя поля в Prisma модели
    // Pothos автоматически определяет тип GraphQL на основе типа Prisma

    // Поле code (тип String в Prisma -> String в GraphQL)
    code: t.exposeString('code'),

    // Поле name (тип String в Prisma -> String в GraphQL)
    name: t.exposeString('name'),

    // Поле active (тип Boolean в Prisma -> Boolean в GraphQL)
    active: t.exposeBoolean('active'),

    // Поле createdAt (тип DateTime в Prisma -> DateTime скаляр в GraphQL)
    // Мы указываем 'DateTime', так как зарегистрировали такой скаляр в builder.ts
    createdAt: t.expose('createdAt', { type: 'DateTime' }),

    // Поле updatedAt (тип DateTime в Prisma -> DateTime скаляр в GraphQL)
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),

    // --- Связи ---
    // На данном этапе у типа Location нет прямых связей, которые мы бы хотели выводить.
    // Связи с Cabinet и Module будут определяться внутри типов Cabinet и Module
    // как поля, ссылающиеся на Location.
  }),
});