import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const now = new Date();
  const keepRevokedDays = Number(process.env.KEEP_REVOKED_TOKENS_DAYS ?? '7');
  const revokedBefore = new Date(
    now.getTime() - keepRevokedDays * 24 * 60 * 60_000,
  );

  const expired = await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: { lt: now },
    },
  });

  const revokedOld = await prisma.refreshToken.deleteMany({
    where: {
      revokedAt: { not: null, lt: revokedBefore },
    },
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        deletedExpired: expired.count,
        deletedRevokedOld: revokedOld.count,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
