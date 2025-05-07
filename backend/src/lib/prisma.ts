// prisma.ts

import { resolve } from 'path'
import { PrismaClient } from '@prisma/client'

// Указываем, где искать сгенерированный клиент
const prismaClientLocation = resolve(__dirname, '../prisma/client')
console.log('🔍 PRISMA_CLIENT_LOCATION:', prismaClientLocation)

process.env.PRISMA_CLIENT_LOCATION = prismaClientLocation

export const prisma = new PrismaClient()