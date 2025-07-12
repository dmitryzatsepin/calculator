// backend/src/graphql/mutations/authMutations.ts
import { builder } from "../builder";
import { GraphQLError } from "graphql";
import { User as PrismaUser } from "../../prisma/generated/client";
import { UserObjectRef } from "../types/User";
import { AuthService, AuthPayload as AuthPayloadType } from "../../services/authService"; // <-- 
const RegisterInput = builder.inputType("RegisterInput", {
  description: "Данные для регистрации нового пользователя",
  fields: (t) => ({
    email: t.string({ required: true }),
    password: t.string({ required: true }),
    name: t.string({ required: true }),
  }),
});

const LoginInput = builder.inputType("LoginInput", {
  description: "Данные для входа пользователя",
  fields: (t) => ({
    email: t.string({ required: true }),
    password: t.string({ required: true }),
  }),
});

const AuthPayload = builder
  .objectRef<AuthPayloadType>("AuthPayload")
  .implement({
    description: "Результат успешной аутентификации",
    fields: (t) => ({
      token: t.exposeString("token"),
      user: t.field({
        type: UserObjectRef,
        resolve: (payload) => payload.user,
      }),
    }),
  });

builder.mutationFields((t) => ({
  login: t.field({
    type: AuthPayload,
    description: "Аутентификация пользователя по email и паролю.",
    args: {
      input: t.arg({ type: LoginInput, required: true }),
    },
    resolve: async (_parent, args, ctx): Promise<AuthPayloadType> => {
      const authService = new AuthService(ctx.prisma);
      return authService.login(args.input);
    },
  }),

  register: t.field({
    type: UserObjectRef,
    description: "Регистрация нового пользователя.",
    args: {
      input: t.arg({ type: RegisterInput, required: true }),
    },
    resolve: async (_parent, args, ctx): Promise<PrismaUser> => {
      const authService = new AuthService(ctx.prisma);
      return authService.register(args.input);
    },
  }),
}));