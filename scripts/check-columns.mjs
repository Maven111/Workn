import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const cols = await prisma.$queryRawUnsafe(`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'User'
    ORDER BY ordinal_position;
  `);
  console.log('Columns in PostgreSQL User table:');
  console.table(cols);
}

main().catch(console.error).finally(() => prisma.$disconnect());

