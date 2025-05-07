import { resolve } from 'path'

// Указываем, где искать клиент
process.env.PRISMA_CLIENT_LOCATION = resolve(__dirname, '../prisma/client')

// Теперь импортируем клиент напрямую из dist
const { PrismaClient } = require('../prisma/client')

export const prisma = new PrismaClient()