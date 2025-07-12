// copy-prisma-client.ts
import fs from 'fs-extra'
import path from 'path'

async function copyPrismaClient() {
  const source = path.resolve('src/prisma/generated/client')
  const dest = path.resolve('dist/prisma/client')

  try {
    await fs.ensureDir(dest)
    await fs.copy(source, dest)
    console.log(`✅ Prisma client copied from ${source} to ${dest}`)
  } catch (err) {
    console.error(`❌ Failed to copy Prisma client:`, err)
    process.exit(1)
  }
}

copyPrismaClient()