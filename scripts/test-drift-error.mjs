import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Attempting to query User table with unmigrated schema field "driftTestField"...');
  const user = await prisma.user.findFirst();
  console.log('Query succeeded (unexpected):', user);
}

main()
  .catch((err) => {
    console.error('=== PRISMA CLIENT SCHEMA DRIFT ERROR CAPTURED ===');
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

