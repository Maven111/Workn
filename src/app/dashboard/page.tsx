import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/auth/server';
import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { logout } from '@/lib/auth/actions';
import MemberDashboardClient from './MemberDashboardClient';

export const metadata: Metadata = {
  title: 'Member Dashboard — Workn',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { softGated?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sessionUser = await getCurrentUser();

  if (!user && !sessionUser) {
    redirect('/auth?view=login');
  }

  // Load application-tier user profile from PostgreSQL
  const appUser = sessionUser || (user ? await prisma.user.findUnique({
    where: { authUserId: user.id },
  }) : null);

  const displayEmail = user?.email || appUser?.email || 'member@workn.ng';

  // TASK 5 STEP 6 (Evidence 12): Account Deletion Lockout View
  // If the account has been scheduled for deletion, render the authoritative statutory lockout screen!
  if (appUser && appUser.accountStatus === 'INACTIVE') {
    return (
      <main
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--color-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-6)',
        }}
      >
        <div
          role="alert"
          style={{
            maxWidth: '580px',
            width: '100%',
            backgroundColor: 'var(--color-surface-container-lowest)',
            border: '1.5px solid var(--color-error)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-8)',
            boxShadow: 'var(--effect-soft-shadow)',
            textAlign: 'center',
          }}
        >
          {/* Lockout Badge */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-error-container)',
              color: 'var(--color-on-error-container)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-6)',
              fontSize: '28px',
            }}
          >
            🔒
          </div>

          <span
            style={{
              display: 'inline-block',
              padding: 'var(--space-1) var(--space-3)',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-error-container)',
              color: 'var(--color-on-error-container)',
              fontSize: 'var(--type-label-small-font-size)',
              fontWeight: 700,
              letterSpacing: '0.5px',
              marginBottom: 'var(--space-3)',
            }}
          >
            ACCOUNT STATUS: INACTIVE (LOCKED)
          </span>

          <h1
            style={{
              fontFamily: 'var(--type-headline-large-font-family)',
              fontSize: 'var(--type-headline-large-font-size)',
              fontWeight: 700,
              color: 'var(--color-on-surface)',
              marginBottom: 'var(--space-3)',
            }}
          >
            Account Scheduled for Deletion
          </h1>

          <p
            style={{
              fontFamily: 'var(--type-body-medium-font-family)',
              fontSize: 'var(--type-body-medium-font-size)',
              color: 'var(--color-on-surface-variant)',
              lineHeight: 1.6,
              marginBottom: 'var(--space-6)',
            }}
          >
            Your account deletion request has been processed under <strong>NDPA 2023 Section 34</strong> and <strong>GDPR Article 17</strong>. Your account is immediately locked, all active browser sessions across all devices have been terminated, and personal contact details have been anonymised.
          </p>

          {/* Statutory Details Breakdown */}
          <div
            style={{
              backgroundColor: 'var(--color-surface-container-high)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              textAlign: 'left',
              marginBottom: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              fontSize: 'var(--type-body-small-font-size)',
              fontFamily: 'var(--type-body-medium-font-family)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-on-surface-variant)' }}>Grace Period Window:</span>
              <strong style={{ color: 'var(--color-on-surface)' }}>30 Days (Statutory)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-on-surface-variant)' }}>Active Sessions:</span>
              <strong style={{ color: 'var(--color-error)' }}>0 (All Revoked)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-on-surface-variant)' }}>Identity State:</span>
              <strong style={{ color: 'var(--color-on-surface)' }}>Anonymised Member</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-on-surface-variant)' }}>Commercial Ledgers:</span>
              <strong style={{ color: 'var(--color-on-surface)' }}>Preserved for 6 Years (CAMA / LIRS)</strong>
            </div>
          </div>

          <form action={logout}>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-6)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-on-surface)',
                color: 'var(--color-surface)',
                border: 'none',
                fontFamily: 'var(--type-label-large-font-family)',
                fontSize: 'var(--type-label-large-font-size)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Sign Out & Return to Home
            </button>
          </form>
        </div>
      </main>
    );
  }

  // Fetch Member Relational Data
  const memberWithData = appUser ? await prisma.user.findUnique({
    where: { id: appUser.id },
    include: {
      memberships: {
        where: { status: 'ACTIVE' },
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
      },
      bookings: {
        include: { resource: true },
        orderBy: { startAt: 'desc' },
        take: 15,
      },
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 15,
      },
      benefitLedgers: {
        orderBy: { createdAt: 'desc' },
        take: 30,
      },
    },
  }) : null;

  const [resources, plans] = await Promise.all([
    prisma.workspaceResource.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
    prisma.membershipPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    }),
  ]);

  // Calculate Benefit Balances
  const daysLedger = await prisma.benefitLedger.aggregate({
    where: { memberId: appUser?.id || '', benefitType: 'COWORKING_DAYS' },
    _sum: { amount: true },
  });
  const roomLedger = await prisma.benefitLedger.aggregate({
    where: { memberId: appUser?.id || '', benefitType: 'MEETING_ROOM_HOURS' },
    _sum: { amount: true },
  });

  const remainingDays = Math.max(0, Number(daysLedger._sum.amount || 0));
  const remainingHours = Math.max(0, Number(roomLedger._sum.amount || 0));

  const activeMembership = memberWithData?.memberships[0] ? {
    id: memberWithData.memberships[0].id,
    status: memberWithData.memberships[0].status,
    startAt: memberWithData.memberships[0].startAt.toISOString(),
    expiresAt: memberWithData.memberships[0].expiresAt.toISOString(),
    purchasePrice: Number(memberWithData.memberships[0].purchasePrice),
    plan: {
      id: memberWithData.memberships[0].plan.id,
      name: memberWithData.memberships[0].plan.name,
      description: memberWithData.memberships[0].plan.description,
      price: Number(memberWithData.memberships[0].plan.price),
      currency: memberWithData.memberships[0].plan.currency,
      billingPeriod: memberWithData.memberships[0].plan.billingPeriod,
      coworkingDayAllowance: memberWithData.memberships[0].plan.coworkingDayAllowance,
      meetingRoomHourAllowance: memberWithData.memberships[0].plan.meetingRoomHourAllowance
        ? Number(memberWithData.memberships[0].plan.meetingRoomHourAllowance)
        : null,
    },
  } : null;

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-surface)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Navigation */}
      <header
        style={{
          borderBottom: '1px solid var(--color-outline-variant)',
          backgroundColor: 'var(--color-surface-container-lowest)',
          padding: 'var(--space-3) var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--type-display-large-font-family)',
              fontWeight: 700,
              fontSize: '18px',
            }}
          >
            W
          </div>
          <span
            style={{
              fontFamily: 'var(--type-headline-large-font-family)',
              fontWeight: 700,
              fontSize: '18px',
              color: 'var(--color-on-surface)',
              letterSpacing: '-0.5px',
            }}
          >
            Workn
          </span>
          <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', marginLeft: 'var(--space-2)' }}>
            Lagos Workspace Hub
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <span
            className="type-body-medium"
            style={{ color: 'var(--color-on-surface-variant)', fontSize: '13px' }}
          >
            {displayEmail}
          </span>
          <form action={logout}>
            <button
              type="submit"
              id="dashboard-logout"
              style={{
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-outline-variant)',
                backgroundColor: 'transparent',
                color: 'var(--color-on-surface)',
                fontFamily: 'var(--type-label-medium-font-family)',
                fontSize: 'var(--type-label-medium-font-size)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'border-color 150ms ease',
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* Main Dynamic Member Dashboard */}
      <MemberDashboardClient
        user={{
          id: appUser?.id || '',
          fullName: appUser?.fullName || 'Valued Member',
          email: displayEmail,
          taxId: appUser?.taxId || 'NIG-TAX-MEMBER',
          phone: appUser?.phone || null,
          role: appUser?.role || 'MEMBER',
          accountStatus: appUser?.accountStatus || 'ACTIVE',
          createdAt: appUser?.createdAt?.toISOString() || new Date().toISOString(),
        }}
        activeMembership={activeMembership}
        remainingDays={remainingDays}
        remainingHours={remainingHours}
        resources={resources.map((r) => ({
          id: r.id,
          name: r.name,
          type: r.type,
          capacity: r.capacity,
          rate: Number(r.rate || 0),
          currency: r.currency || 'NGN',
          isActive: r.isActive,
          operatingAvailability: r.operatingAvailability,
        }))}
        plans={plans.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: Number(p.price),
          currency: p.currency,
          billingPeriod: p.billingPeriod,
          coworkingDayAllowance: p.coworkingDayAllowance,
          meetingRoomHourAllowance: p.meetingRoomHourAllowance ? Number(p.meetingRoomHourAllowance) : null,
        }))}
        bookings={(memberWithData?.bookings || []).map((b) => ({
          id: b.id,
          startAt: b.startAt.toISOString(),
          endAt: b.endAt.toISOString(),
          status: b.status,
          totalCharge: Number(b.totalCharge),
          currency: b.currency || 'NGN',
          resource: {
            id: b.resource.id,
            name: b.resource.name,
            type: b.resource.type,
          },
        }))}
        payments={(memberWithData?.payments || []).map((p) => ({
          id: p.id,
          amount: Number(p.amount),
          currency: p.currency,
          paymentReference: p.paymentReference,
          provider: p.provider,
          status: p.status,
          createdAt: p.createdAt.toISOString(),
        }))}
        benefitLedgers={(memberWithData?.benefitLedgers || []).map((l) => ({
          id: l.id,
          benefitType: l.benefitType,
          amount: Number(l.amount),
          reason: l.reason,
          createdAt: l.createdAt.toISOString(),
        }))}
        softGated={searchParams?.softGated === 'true'}
      />
    </main>
  );
}
