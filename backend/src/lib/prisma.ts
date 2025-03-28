import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
    // Можно добавить опции, например, логирование:
    // log: ['query', 'info', 'warn', 'error'],
});