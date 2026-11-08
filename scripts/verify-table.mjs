import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const columns = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'EmailVerification'
    ORDER BY ordinal_position;
  `);

  console.log('✅ TABLE EmailVerification FOUND IN POSTGRESQL:');
  console.table(columns);
}

main().catch(console.error).finally(() => prisma.$disconnect());

