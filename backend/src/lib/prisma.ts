import { resolve } from 'path'

// Эта строка должна быть первой!
process.env.PRISMA_CLIENT_LOCATION = resolve(__dirname, '../prisma/client')

// Теперь импортируем клиент
const { PrismaClient } = require('@prisma/client')

export const prisma = new PrismaClient()