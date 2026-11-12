import dns from 'node:dns';
try { dns.setDefaultResultOrder('ipv4first'); } catch { }
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const plans = await prisma.membershipPlan.findMany();
  const resources = await prisma.workspaceResource.findMany();
  const memberships = await prisma.membership.findMany({ include: { plan: true } });
  const bookings = await prisma.booking.findMany({ include: { resource: true } });
  const payments = await prisma.payment.findMany();

  console.log({
    plansCount: plans.length,
    resourcesCount: resources.length,
    membershipsCount: memberships.length,
    bookingsCount: bookings.length,
    paymentsCount: payments.length,
    plans: plans.map(p => ({ id: p.id, name: p.name, price: p.price, period: p.billingPeriod })),
    resources: resources.map(r => ({ id: r.id, name: r.name, type: r.type, rate: r.rate, capacity: r.capacity }))
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

