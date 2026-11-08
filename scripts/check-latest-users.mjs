import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  console.log('=== LATEST USERS IN public.User ===');
  console.table(
    users.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      createdAt: u.createdAt.toISOString(),
    }))
  );

  const authUsers = await prisma.$queryRawUnsafe(`
    SELECT id, email, created_at, email_confirmed_at
    FROM auth.users
    ORDER BY created_at DESC
    LIMIT 5;
  `);

  console.log('\n=== LATEST USERS IN auth.users ===');
  console.table(authUsers);
}

main().catch(console.error).finally(() => prisma.$disconnect());

