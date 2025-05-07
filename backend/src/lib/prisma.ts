// src/lib/prisma.ts

import { resolve } from 'path'

// Указываем, где искать клиент при запуске через node dist/server.js
process.env.PRISMA_CLIENT_LOCATION = resolve(__dirname, '../prisma/client')

// Локально используем @prisma/client
// В проде используем ../../../prisma/client (после билда)
let PrismaClient

if (process.env.NODE_ENV === 'production') {
  // В проде клиент находится в dist/prisma/client
  const { PrismaClient: ProdPrismaClient } = require('../../../prisma/client')
  PrismaClient = ProdPrismaClient
} else {
  // В деве используем стандартный путь
  const { PrismaClient: DevPrismaClient } = require('@prisma/client')
  PrismaClient = DevPrismaClient
}

export const prisma = new PrismaClient()