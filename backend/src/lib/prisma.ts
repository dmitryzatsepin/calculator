import { resolve } from 'path'

// Устанавливаем переменную окружения до импорта клиента
if (process.env.NODE_ENV === 'production') {
  process.env.PRISMA_CLIENT_LOCATION = resolve(__dirname, '../prisma/client')
}

// Локально используем @prisma/client
let PrismaClient

try {
  // Пробуем использовать наш клиент (в проде)
  const ProdPrisma = require('../prisma/client')
  PrismaClient = ProdPrisma.PrismaClient
} catch {
  // Или стандартный (в деве)
  const DevPrisma = require('@prisma/client')
  PrismaClient = DevPrisma.PrismaClient
}

export const prisma = new PrismaClient()