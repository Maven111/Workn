import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const codes = await prisma.emailVerification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  console.log('=== LATEST EMAIL VERIFICATION CODES IN DATABASE ===');
  console.table(
    codes.map((c) => ({
      id: c.id,
      email: c.email,
      code: c.code,
      expiresAt: c.expiresAt.toISOString(),
      consumedAt: c.consumedAt ? c.consumedAt.toISOString() : 'ACTIVE (null)',
      attempts: c.attempts,
      createdAt: c.createdAt.toISOString(),
    }))
  );
}

main().catch(console.error).finally(() => prisma.$disconnect());

