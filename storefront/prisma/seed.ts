import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// El catálogo (productos, categorías) lo sirve Medusa. Prisma solo respalda
// usuarios/sesiones de NextAuth, así que el seed se limita a usuarios demo.
async function main() {
  console.log('Seeding users...')

  const passwordHash = await bcrypt.hash('demo123', 10)

  await prisma.user.upsert({
    where: { email: 'demo@lunette.com' },
    update: {},
    create: {
      name: 'Usuario Demo',
      email: 'demo@lunette.com',
      password: passwordHash,
      role: 'USER',
    },
  })

  await prisma.user.upsert({
    where: { email: 'admin@lunette.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@lunette.com',
      password: passwordHash,
      role: 'ADMIN',
    },
  })

  console.log('✓ Usuarios demo creados (demo@lunette.com / admin@lunette.com — pass: demo123)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
