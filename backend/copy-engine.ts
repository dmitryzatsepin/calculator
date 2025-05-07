// copy-engine.ts
import fs from 'fs-extra'
import path from 'path'

async function copyEngine() {
  const source = path.resolve('prisma/generated/client/libquery_engine-debian-openssl-3.0.x.so.node')
  const dest = path.resolve('dist/query-engine.so.node')

  try {
    await fs.ensureDir(path.dirname(dest))
    await fs.copyFile(source, dest)
    console.log(`✅ Engine copied from ${source} to ${dest}`)
  } catch (err) {
    console.error(`❌ Failed to copy engine:`, err)
    process.exit(1)
  }
}

copyEngine()