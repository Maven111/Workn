import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const newPassword = 'WorknSecureMember2026!';
  // Supabase uses bcrypt with cost factor 10
  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  console.log(`Setting password to "${newPassword}" and confirming accounts...`);

  const updated = await prisma.$executeRawUnsafe(`
    UPDATE auth.users 
    SET 
      encrypted_password = '${hashedPassword}',
      email_confirmed_at = NOW(),
      updated_at = NOW()
    WHERE email IN ('abdussalamsalaudeen2018@gmail.com', 'abdussalamsalaudeen2021@gmail.com');
  `);

  console.log(`Updated ${updated} account(s) in auth.users.`);

  // Also make sure public.User records are active
  const publicUpdated = await prisma.user.updateMany({
    where: {
      email: { in: ['abdussalamsalaudeen2018@gmail.com', 'abdussalamsalaudeen2021@gmail.com'] },
    },
    data: {
      accountStatus: 'ACTIVE',
    },
  });

  console.log(`Updated ${publicUpdated.count} record(s) in public.User to ACTIVE.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
