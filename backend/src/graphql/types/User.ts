// src/graphql/types/User.ts
import { builder } from '../builder.js';
import type { Prisma } from '@prisma/client';
import type { GraphQLContext } from '../builder.js';

// 1. Определяем тип для модели User
type User = Prisma.UserGetPayload<{}>;

// 2. Определяем тип для field builder
type FieldBuilder = Parameters<
  Parameters<typeof builder.prismaObject>[1]['fields']
>[0];

// 3. Определяем enum Role
const RoleEnum = builder.enumType('Role', {
  values: ['USER', 'ADMIN'] as const,
  description: 'Роль пользователя в системе',
});

// --- ДОБАВЛЯЕМ EXPORT ---
export const UserObjectRef = builder.prismaObject('User', {
  fields: (t: FieldBuilder) => ({
    id: t.exposeID('id'),
    email: t.exposeString('email'),
    name: t.exposeString('name', { nullable: true }),
    role: t.expose('role', { type: RoleEnum }),
    createdAt: t.field({
      type: 'DateTime',
      resolve: (parent: User) => parent.createdAt,
    }),
  }),
});