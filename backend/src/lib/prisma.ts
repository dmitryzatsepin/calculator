import { join } from 'path'

process.env.PRISMA_CLIENT_LOCATION = join(__dirname, '../prisma/client')

import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()