import 'dotenv/config'
import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { INITIAL_PROJECTS } from '../app/lib/data'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const count = await prisma.project.count()
  if (count > 0) {
    console.log(`Database already has ${count} projects — skipping seed.`)
    return
  }

  const projects = INITIAL_PROJECTS.map(({ id: _id, ...rest }) => rest)
  await prisma.project.createMany({ data: projects })
  console.log(`Seeded ${projects.length} projects.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
