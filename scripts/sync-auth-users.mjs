import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const authUsers = await prisma.$queryRawUnsafe(`
    SELECT id, email, raw_user_meta_data
    FROM auth.users;
  `);

  console.log(`Found ${authUsers.length} user(s) in auth.users. Syncing to public.User...`);

  for (const au of authUsers) {
    const metadata = au.raw_user_meta_data || {};
    const fullName = metadata.full_name || 'Workn Member';
    const taxId = 'NIG-TAX-' + au.id.slice(0, 8).toUpperCase();

    const synced = await prisma.user.upsert({
      where: { authUserId: au.id },
      update: {
        email: au.email,
        fullName: fullName,
      },
      create: {
        authUserId: au.id,
        fullName: fullName,
        email: au.email,
        taxId: taxId,
        role: 'MEMBER',
        accountStatus: 'ACTIVE',
      },
    });

    console.log(`Synced user: ${synced.email} (${synced.fullName}) - Tax ID: ${synced.taxId}`);
  }

  const allUsers = await prisma.user.findMany();
  console.log('\n=== CURRENT WORKN USERS IN DATABASE ===');
  console.table(
    allUsers.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      taxId: u.taxId,
    }))
  );
}

main().catch(console.error).finally(() => prisma.$disconnect());

