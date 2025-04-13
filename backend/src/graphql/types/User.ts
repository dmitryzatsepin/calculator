// src/graphql/types/User.ts
import { builder } from '../builder';

const RoleEnum = builder.enumType('Role', {
  values: ['USER', 'ADMIN'] as const,
  description: 'Роль пользователя в системе',
});

// --- ДОБАВЛЯЕМ EXPORT ---
export const UserObjectRef = builder.prismaObject('User', {
  fields: (t) => ({
    id: t.exposeID('id'),
    email: t.exposeString('email'),
    name: t.exposeString('name', { nullable: true }),
    role: t.expose('role', { type: RoleEnum }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
  }),
});