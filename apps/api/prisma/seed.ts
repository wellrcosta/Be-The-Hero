import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
const password = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for seeding');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    }),
  });

  const emailNorm = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { emailNorm } });
  if (existing) {
    console.log(`Seed admin already exists: ${existing.id}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      emailNorm,
      passwordHash,
      roles: ['ADMIN'],
      status: 'ACTIVE',
    },
  });

  console.log(`Seeded admin user: ${user.id}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
