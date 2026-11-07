import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const authUsers = await prisma.$queryRawUnsafe(`
    SELECT id, email, created_at, confirmed_at, raw_user_meta_data
    FROM auth.users
    ORDER BY created_at DESC;
  `);
  console.log('=== SUPABASE AUTH USERS ===');
  console.log(JSON.stringify(authUsers, null, 2));

  const appUsers = await prisma.user.findMany();
  console.log('\n=== WORKN PUBLIC USERS ===');
  console.log(JSON.stringify(appUsers, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());

