// src/lib/prisma.ts
import { PrismaClient } from '../prisma/generated/client';
const prisma = new PrismaClient({
});

export { prisma };