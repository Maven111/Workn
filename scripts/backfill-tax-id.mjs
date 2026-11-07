import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$executeRawUnsafe(
    `UPDATE "User" SET "taxId" = 'NIG-TAX-001' WHERE "taxId" IS NULL;`
  );
  console.log(`Backfill complete: ${result} row(s) updated with valid taxId.`);

  const users = await prisma.user.findMany({ select: { id: true, fullName: true, taxId: true } });
  console.log('Current User records in database:', users);
}

main()
  .catch((e) => {
    console.error('Backfill failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

