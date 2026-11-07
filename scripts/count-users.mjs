import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const count = await prisma.user.count();
  console.log('USER_COUNT:' + count);
  await prisma.$disconnect();
}

check().catch(console.error);

