import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.$queryRawUnsafe(`
    SELECT id, email, confirmed_at, email_confirmed_at, 
           CASE WHEN encrypted_password IS NOT NULL THEN 'HAS_PASSWORD' ELSE 'NO_PASSWORD' END as pwd_status,
           SUBSTRING(encrypted_password, 1, 15) as pwd_prefix
    FROM auth.users;
  `);
  console.table(users);
}

main().catch(console.error).finally(() => prisma.$disconnect());

