// src/lib/prisma.ts

import { resolve } from 'path'

process.env.PRISMA_CLIENT_LOCATION = resolve(__dirname, '../prisma/client')

import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()