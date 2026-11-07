import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findFirst();
  if (existing) {
    console.log('User already exists in populated table:', existing);
    return;
  }

  const user = await prisma.user.create({
    data: {
      authUserId: 'auth_usr_lagos_001',
      fullName: 'Adebayo Ogunlesi',
      email: 'adebayo@workn.ng',
      phone: '+2348012345678',
      role: 'MEMBER',
      accountStatus: 'ACTIVE',
    },
  });
  console.log('Successfully inserted seed user:', user);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

