import { PrismaClient } from '@prisma/client';
import { randomInt } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const email = 'sabdussalam@x3mideas-ng.com';

  // 1. Create a fresh, valid 6-digit code (valid for 10 minutes)
  const validCode = String(randomInt(100000, 1000000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Invalidate previous unconsumed codes for this email
  await prisma.emailVerification.updateMany({
    where: { email, consumedAt: null },
    data: { consumedAt: new Date(0) },
  });

  const activeRecord = await prisma.emailVerification.create({
    data: {
      email,
      code: validCode,
      expiresAt,
    },
  });

  // 2. Also ensure an EXPIRED code exists for testing Failure Mode 1 (Evidence 20)
  const expiredCode = '987123';
  await prisma.emailVerification.create({
    data: {
      email,
      code: expiredCode,
      expiresAt: new Date(Date.now() - 5 * 60 * 1000), // Expired 5 minutes ago
    },
  });

  // 3. Also ensure an ALREADY CONSUMED code exists for testing Failure Mode 3 (Evidence 22)
  const reusedCode = '555888';
  await prisma.emailVerification.create({
    data: {
      email,
      code: reusedCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      consumedAt: new Date(), // Already used!
    },
  });

  console.log('='.repeat(80));
  console.log(`VERIFICATION CODES READY FOR: ${email}`);
  console.log('='.repeat(80));
  console.log(`1. VALID ACTIVE CODE:   ${validCode}  (Expires in 10 mins) -> For Evidence 19 & Successful Verification`);
  console.log(`2. EXPIRED CODE:        ${expiredCode}  (Expired 5m ago)     -> For Evidence 20 (Code Expired error)`);
  console.log(`3. WRONG CODE:          000000  (Incorrect)          -> For Evidence 21 (Wrong Code error)`);
  console.log(`4. REUSED CODE:         ${reusedCode}  (Already consumed)   -> For Evidence 22 (Code Reused error)`);
  console.log('='.repeat(80));
}

main().catch(console.error).finally(() => prisma.$disconnect());

