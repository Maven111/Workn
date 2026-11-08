import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'sabdussalam@x3mideas-ng.com';
  const u = await prisma.$queryRawUnsafe(
    `SELECT id, email, created_at, email_confirmed_at FROM auth.users WHERE email = $1`,
    email
  );
  console.log('Query result for', email, ':', u);

  const v = await prisma.emailVerification.findMany({
    where: { email },
  });
  console.log('Verification records for', email, ':', v);
}

main().catch(console.error).finally(() => prisma.$disconnect());

