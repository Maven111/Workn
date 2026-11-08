import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('Checking prisma.emailVerification model...');
if (typeof prisma.emailVerification !== 'undefined') {
  console.log('✅ prisma.emailVerification IS DEFINED on PrismaClient!');
} else {
  console.error('❌ prisma.emailVerification IS UNDEFINED! Prisma Client needs regeneration.');
}

prisma.$disconnect();

