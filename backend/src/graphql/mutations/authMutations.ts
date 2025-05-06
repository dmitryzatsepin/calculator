// src/graphql/mutations/authMutations.ts
import { builder } from "../builder"; // Убедитесь, что путь к builder.ts верный
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";
import { User as PrismaUser } from "@prisma/client"; // Импорт типа Prisma User
import { UserObjectRef } from "../types/User"; // Импортируем ссылку на тип User из types/User.ts

// 1. Определение Input типа для данных РЕГИСТРАЦИИ
const RegisterInput = builder.inputType("RegisterInput", {
  description: "Данные для регистрации нового пользователя",
  fields: (t) => ({
    email: t.string({ required: true, description: "Email нового пользователя" }),
    password: t.string({
      required: true,
      description: "Пароль (мин. 8 символов)",
      // Встроенная валидация Pothos здесь не поддерживается, убрана
    }),
    name: t.string({ description: "Имя пользователя (опционально)" }),
    // Добавьте другие поля, необходимые при регистрации, если они есть
  }),
});

// 2. Определение Input типа для данных ВХОДА (без изменений)
const LoginInput = builder.inputType("LoginInput", {
  description: "Данные для входа пользователя",
  fields: (t) => ({
    email: t.string({ required: true, description: "Email пользователя" }),
    password: t.string({ required: true, description: "Пароль пользователя" }),
  }),
});

// 3. Определение типа для возвращаемого результата АУТЕНТИФИКАЦИИ (Payload) (без изменений)
const AuthPayload = builder
  .objectRef<{ token: string; user: PrismaUser }>("AuthPayload")
  .implement({
    description: "Результат успешной аутентификации",
    fields: (t) => ({
      token: t.exposeString("token", { description: "JWT токен доступа" }),
      user: t.field({
        type: UserObjectRef, // Используем импортированную ссылку на тип User
        description: "Данные аутентифицированного пользователя",
        nullable: false,
        resolve: (payload) => payload.user,
      }),
    }),
  });

// 4. Определение мутаций (Login и Register)
builder.mutationFields((t) => ({
  // --- Мутация Login (Аутентификация) ---
  login: t.field({
    type: AuthPayload, // Возвращает токен и пользователя
    description: "Аутентификация пользователя по email и паролю.",
    args: {
      input: t.arg({ type: LoginInput, required: true }),
    },
    nullable: true,
    resolve: async (
      _parent,
      args,
      ctx,
      info
    ): Promise<{ token: string; user: PrismaUser }> => {
      const { email, password } = args.input;
      console.log(`[MUTATION login] Attempt for email: ${email}`);

      const user = await ctx.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      // Проверка пользователя и пароля (сравнение с хешем из БД)
      if (!user || !(await bcrypt.compare(password, user.password))) {
        console.warn(`[MUTATION login] Failed for email: ${email}`);
        throw new GraphQLError("Неверный email или пароль", {
          extensions: { code: "AUTHENTICATION_FAILED" },
        });
      }
      console.log(`[MUTATION login] Success for email: ${email}, User ID: ${user.id}`);

      // Генерация JWT токена
      const secret = process.env.JWT_SECRET;
      if (!secret || typeof secret !== "string") {
        console.error("[MUTATION login] FATAL: JWT_SECRET not set or invalid!");
        throw new GraphQLError("Ошибка конфигурации сервера", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }

      const expiresIn = process.env.JWT_EXPIRES_IN;
      if (!expiresIn || typeof expiresIn !== "string") {
        console.error("[MUTATION login] FATAL: JWT_EXPIRES_IN is invalid!");
        throw new GraphQLError("Ошибка конфигурации сервера", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }

      const tokenPayload = { id: user.id, email: user.email, role: user.role };
      const token = jwt.sign(
        tokenPayload,
        secret,
        { expiresIn } as jwt.SignOptions
      );

      return { token, user };
    },
  }),

  // --- Мутация Register (Регистрация) ---
  register: t.field({
    type: UserObjectRef, // Возвращает созданного пользователя
    description: "Регистрация нового пользователя.",
    args: {
      input: t.arg({ type: RegisterInput, required: true }),
    },
    nullable: true,
    resolve: async (_parent, args, ctx): Promise<PrismaUser> => {
      const { email, password, name } = args.input;
      const lowerCaseEmail = email.toLowerCase();

      // --- РУЧНАЯ ВАЛИДАЦИЯ ДЛИНЫ ПАРОЛЯ ---
      if (password.length < 8) {
        throw new GraphQLError("Пароль должен содержать минимум 8 символов", {
          extensions: { code: "VALIDATION_FAILED", argumentName: "password" }, // Указываем поле
        });
      }
      // ---------------------------------------

      console.log(`[MUTATION register] Attempt for email: ${lowerCaseEmail}`);

      // Проверка, существует ли пользователь с таким email
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: lowerCaseEmail },
      });

      if (existingUser) {
        console.warn(`[MUTATION register] Failed: Email ${lowerCaseEmail} already exists.`);
        throw new GraphQLError("Пользователь с таким email уже существует", {
          extensions: { code: "USER_ALREADY_EXISTS" },
        });
      }

      // Хеширование пароля перед сохранением
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      console.log(`[MUTATION register] Password hashed for email: ${lowerCaseEmail}`);

      // Создание пользователя в базе данных
      try {
        const newUser = await ctx.prisma.user.create({
          data: {
            email: lowerCaseEmail,
            password: hashedPassword,
            name: name || '',
            // ----------------------------------
            role: 'USER',
          },
        });
        console.log(`[MUTATION register] Success: User created with ID ${newUser.id} for email: ${lowerCaseEmail}`);
        return newUser;
      } catch (error) {
        console.error(`[MUTATION register] Failed: Database error for email ${lowerCaseEmail}`, error);
        if (error instanceof Error && 'code' in error && error.code === 'P2002') {
            throw new GraphQLError("Произошла ошибка при создании пользователя (возможно, email уже занят).", {
               extensions: { code: "REGISTRATION_FAILED" },
            });
       }
       if (error instanceof Error && error.message.includes("Argument `name` is missing")) {
            throw new GraphQLError("Не удалось создать пользователя: поле 'name' является обязательным.", {
                extensions: { code: "VALIDATION_FAILED", argumentName: "name" },
            });
       }
        throw new GraphQLError("Не удалось создать пользователя из-за внутренней ошибки сервера.", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  }),
}));