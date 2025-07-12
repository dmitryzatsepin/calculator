// backend/src/services/authService.ts
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { GraphQLError } from "graphql";
import { PrismaClient, User as PrismaUser } from "../prisma/generated/client";

interface TokenPayload {
  id: string;
  email: string;
  role: string;
  [key: string]: string;
}

function isPrismaError(error: unknown): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error;
}

function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`[AUTH_CONFIG] FATAL: ${name} is not defined in environment variables.`);
    process.exit(1);
  }
  return value;
}

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  email: string;
  password: string;
  name?: string | null;
}

export interface AuthPayload {
  token: string;
  user: PrismaUser;
}

const JWT_SECRET = getRequiredEnvVar('JWT_SECRET');
const JWT_EXPIRES_IN = getRequiredEnvVar('JWT_EXPIRES_IN');

export class AuthService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async login(input: LoginInput): Promise<AuthPayload> {
    const { email, password } = input;
    console.log(`[AuthService] Login attempt for email: ${email}`);

    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.warn(`[AuthService] Login failed for email: ${email}`);
      throw new GraphQLError("Неверный email или пароль", {
        extensions: { code: "AUTHENTICATION_FAILED" },
      });
    }

    console.log(`[AuthService] Login success for email: ${email}, User ID: ${user.id}`);

    const tokenPayload: TokenPayload = { 
      id: String(user.id),
      email: user.email, 
      role: user.role 
    };

    const signOptions: SignOptions = {
      expiresIn: Number(JWT_EXPIRES_IN) || 3600
    };

    const token = jwt.sign(
      tokenPayload,
      JWT_SECRET,
      signOptions
    );

    return { token, user };
  }

  async register(input: RegisterInput): Promise<PrismaUser> {
    const { email, password, name } = input;
    const lowerCaseEmail = email.toLowerCase();

    if (password.length < 8) {
      throw new GraphQLError("Пароль должен содержать минимум 8 символов", {
        extensions: { code: "VALIDATION_FAILED", argumentName: "password" },
      });
    }

    console.log(`[AuthService] Register attempt for email: ${lowerCaseEmail}`);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: lowerCaseEmail },
    });

    if (existingUser) {
      console.warn(`[AuthService] Register failed: Email ${lowerCaseEmail} already exists.`);
      throw new GraphQLError("Пользователь с таким email уже существует", {
        extensions: { code: "USER_ALREADY_EXISTS" },
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log(`[AuthService] Password hashed for email: ${lowerCaseEmail}`);

    try {
      const newUser = await this.prisma.user.create({
        data: {
          email: lowerCaseEmail,
          password: hashedPassword,
          name: name || '',
          role: 'USER',
        },
      });
      console.log(`[AuthService] Success: User created with ID ${newUser.id} for email: ${lowerCaseEmail}`);
      return newUser;
    } catch (error) {
      console.error(`[AuthService] Register failed: Database error for email ${lowerCaseEmail}`, error);
      
      if (isPrismaError(error) && error.code === 'P2002') {
        throw new GraphQLError("Пользователь с таким email уже существует.", {
          extensions: { code: "USER_ALREADY_EXISTS" },
        });
      }

      throw new GraphQLError("Не удалось создать пользователя из-за внутренней ошибки.", {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      });
    }
  }
}