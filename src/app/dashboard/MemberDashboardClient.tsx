'use client';

import React, { useState, useTransition } from 'react';
import SecurityClient from './SecurityClient';
import { createBookingAction, cancelBookingAction } from './actions';

export interface ResourceData {
  id: string;
  name: string;
  type: string;
  capacity: number;
  rate: number;
  currency: string;
  isActive: boolean;
  operatingAvailability?: any;
}

export interface PlanData {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  billingPeriod: string;
  coworkingDayAllowance?: number | null;
  meetingRoomHourAllowance?: number | null;
}

export interface BookingData {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  totalCharge: number;
  currency: string;
  resource: {
    id: string;
    name: string;
    type: string;
  };
}

export interface PaymentData {
  id: string;
  amount: number;
  currency: string;
  paymentReference?: string | null;
  provider: string;
  status: string;
  createdAt: string;
}

export interface BenefitLedgerData {
  id: string;
  benefitType: string;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface MemberDashboardProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    taxId: string;
    phone?: string | null;
    role: string;
    accountStatus: string;
    createdAt: string;
  };
  activeMembership?: {
    id: string;
    status: string;
    startAt: string;
    expiresAt: string;
    purchasePrice: number;
    plan: PlanData;
  } | null;
  remainingDays: number;
  remainingHours: number;
  resources: ResourceData[];
  plans: PlanData[];
  bookings: BookingData[];
  payments: PaymentData[];
  benefitLedgers: BenefitLedgerData[];
  softGated?: boolean;
}

export default function MemberDashboardClient({
  user,
  activeMembership,
  remainingDays,
  remainingHours,
  resources,
  plans,
  bookings,
  payments,
  benefitLedgers,
  softGated,
}: MemberDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'membership' | 'payments' | 'security'>('overview');
  const [isPending, startTransition] = useTransition();
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Booking Form State
  const [selectedResourceId, setSelectedResourceId] = useState<string>(resources[0]?.id || '');
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return tomorrow.toISOString().split('T')[0];
  });
  const [bookingTime, setBookingTime] = useState<string>('09:00');
  const [bookingDuration, setBookingDuration] = useState<number>(2);

  const selectedResource = resources.find((r) => r.id === selectedResourceId);

  // Calculate pricing breakdown for current form state
  const isMeetingRoom = selectedResource?.type === 'MEETING_ROOM';
  const rawCost = isMeetingRoom
    ? (selectedResource?.rate || 0) * bookingDuration
    : (selectedResource?.rate || 0);

  const isCoveredByPlan =
    (activeMembership &&
      selectedResource?.type === 'DESK' &&
      remainingDays >= 1) ||
    (activeMembership &&
      selectedResource?.type === 'MEETING_ROOM' &&
      remainingHours >= bookingDuration);

  function handleCreateBooking(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setActionFeedback(null);

    const formData = new FormData();
    formData.set('resourceId', selectedResourceId);
    formData.set('date', bookingDate);
    formData.set('time', bookingTime);
    formData.set('durationHours', String(bookingDuration));

    startTransition(async () => {
      const res = await createBookingAction(formData);
      if (res.success) {
        setActionFeedback({ type: 'success', text: res.message || 'Booking confirmed!' });
      } else {
        setActionFeedback({ type: 'error', text: res.error || 'Failed to create booking.' });
      }
    });
  }

  function handleCancelBooking(bookingId: string) {
    if (!confirm('Are you sure you want to cancel this booking? Any deducted allowance will be reinstated.')) {
      return;
    }
    setActionFeedback(null);
    startTransition(async () => {
      const res = await cancelBookingAction(bookingId);
      if (res.success) {
        setActionFeedback({ type: 'success', text: res.message || 'Booking cancelled.' });
      } else {
        setActionFeedback({ type: 'error', text: res.error || 'Failed to cancel.' });
      }
    });
  }

  const upcomingBookings = bookings.filter((b) => b.status === 'CONFIRMED');

  return (
    <div style={{ maxWidth: '1160px', width: '100%', margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
      {/* Soft Gating Banner */}
      {softGated && (
        <div
          role="alert"
          style={{
            marginBottom: 'var(--space-6)',
            padding: 'var(--space-4) var(--space-5)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#fef3c7',
            border: '1.5px solid #f59e0b',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <span style={{ fontSize: '24px' }}>⚡</span>
          <div>
            <strong style={{ display: 'block', fontSize: '15px', marginBottom: '2px' }}>
              Zero-Wait Soft Gating Active
            </strong>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5 }}>
              Your workspace account was provisioned with instant access. You can explore available desks, plans, and
              facilities immediately. Please verify your email via the security tab to unlock external payment processing.
            </p>
          </div>
        </div>
      )}

      {/* Global Feedback Banner */}
      {actionFeedback && (
        <div
          role="alert"
          style={{
            marginBottom: 'var(--space-6)',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: actionFeedback.type === 'success' ? '#ecfdf5' : 'var(--color-error-container)',
            color: actionFeedback.type === 'success' ? '#065f46' : 'var(--color-on-error-container)',
            border: `1px solid ${actionFeedback.type === 'success' ? '#10b981' : 'var(--color-error)'}`,
            fontSize: 'var(--type-body-small-font-size)',
            fontWeight: 500,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{actionFeedback.text}</span>
          <button
            onClick={() => setActionFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'inherit' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Member Hero Header */}
      <section
        style={{
          backgroundColor: 'var(--color-surface-container-lowest)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6) var(--space-8)',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--color-outline-variant)',
          marginBottom: 'var(--space-8)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <h1
              style={{
                fontFamily: 'var(--type-headline-large-font-family)',
                fontSize: '26px',
                fontWeight: 700,
                color: 'var(--color-on-surface)',
                margin: 0,
              }}
            >
              Welcome, {user.fullName || 'Workn Member'}
            </h1>
            <span
              style={{
                padding: '2px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary-container)',
                color: 'var(--color-on-primary-container)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}
            >
              {user.role}
            </span>
          </div>
          <p style={{ margin: 0, color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>
            {user.email} &bull; Tax ID: <code style={{ backgroundColor: 'var(--color-surface-container-high)', padding: '2px 6px', borderRadius: '4px' }}>{user.taxId}</code>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {user.role === 'ADMIN' && (
            <a
              href="/admin"
              style={{
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Admin Oversight &rarr;
            </a>
          )}
        </div>
      </section>

      {/* Metrics Row */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-5)',
          marginBottom: 'var(--space-8)',
        }}
      >
        {/* Metric 1: Membership Status */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--color-outline-variant)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>MEMBERSHIP STATUS</span>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: activeMembership ? '#d1fae5' : '#fee2e2',
                color: activeMembership ? '#065f46' : '#991b1b',
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              {activeMembership?.status || 'NO PLAN'}
            </span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 'var(--space-1) 0', color: 'var(--color-on-surface)' }}>
            {activeMembership?.plan.name || 'Pay-as-you-go'}
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>
            {activeMembership
              ? `Valid through ${new Date(activeMembership.expiresAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}`
              : 'Choose a monthly or day pass plan.'}
          </p>
        </div>

        {/* Metric 2: Coworking Days */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--color-outline-variant)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>COWORKING DAYS</span>
            <span style={{ fontSize: '18px' }}>🏢</span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: 'var(--space-1) 0', color: 'var(--color-on-surface)' }}>
            {remainingDays} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-on-surface-variant)' }}>/ {activeMembership?.plan.coworkingDayAllowance || 0} Days</span>
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>
            Available hot desk credits this billing cycle.
          </p>
        </div>

        {/* Metric 3: Meeting Room Hours */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--color-outline-variant)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>MEETING ROOM HOURS</span>
            <span style={{ fontSize: '18px' }}>🎙️</span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: 'var(--space-1) 0', color: 'var(--color-on-surface)' }}>
            {remainingHours} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-on-surface-variant)' }}>/ {activeMembership?.plan.meetingRoomHourAllowance || 0} Hours</span>
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>
            For boardrooms and podcast studios.
          </p>
        </div>

        {/* Metric 4: Upcoming Bookings */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--color-outline-variant)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>UPCOMING SESSIONS</span>
            <span style={{ fontSize: '18px' }}>📅</span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: 'var(--space-1) 0', color: 'var(--color-on-surface)' }}>
            {upcomingBookings.length}
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>
            {upcomingBookings[0]
              ? `Next: ${upcomingBookings[0].resource.name} (${new Date(upcomingBookings[0].startAt).toLocaleDateString([], { month: 'short', day: 'numeric' })})`
              : 'No upcoming bookings scheduled.'}
          </p>
        </div>
      </section>

      {/* Tab Navigation */}
      <nav
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          borderBottom: '2px solid var(--color-outline-variant)',
          marginBottom: 'var(--space-6)',
          overflowX: 'auto',
        }}
      >
        {[
          { key: 'overview', label: 'Overview & Quick Booking', icon: '⚡' },
          { key: 'bookings', label: `My Bookings (${bookings.length})`, icon: '📅' },
          { key: 'membership', label: 'Membership & Allowances', icon: '💳' },
          { key: 'payments', label: `Payments & Invoices (${payments.length})`, icon: '🧾' },
          { key: 'security', label: 'Security & Privacy', icon: '🔒' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: 'var(--space-3) var(--space-4)',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key ? '3px solid var(--color-primary)' : '3px solid transparent',
              color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
              fontFamily: 'inherit',
              fontSize: '14px',
              fontWeight: activeTab === tab.key ? 700 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              marginBottom: '-2px',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* TAB 1: OVERVIEW & QUICK BOOKING */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-6)' }}>
          {/* Quick Booking Form */}
          <section
            style={{
              backgroundColor: 'var(--color-surface-container-lowest)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-card)',
              border: '1px solid var(--color-outline-variant)',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 var(--space-4)', color: 'var(--color-on-surface)' }}>
              Reserve a Workspace
            </h2>
            <form onSubmit={handleCreateBooking} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: 'var(--space-1)', color: 'var(--color-on-surface)' }}>
                  Workspace Resource
                </label>
                <select
                  value={selectedResourceId}
                  onChange={(e) => setSelectedResourceId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--color-outline-variant)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-on-surface)',
                    fontSize: '14px',
                  }}
                >
                  {resources.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.type === 'MEETING_ROOM' ? `₦${r.rate.toLocaleString()}/hr` : `₦${r.rate.toLocaleString()}/day`} - Cap: {r.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: 'var(--space-1)', color: 'var(--color-on-surface)' }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    style={{
                      width: '100%',
                      padding: 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--color-outline-variant)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-on-surface)',
                      fontSize: '14px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: 'var(--space-1)', color: 'var(--color-on-surface)' }}>
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--color-outline-variant)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-on-surface)',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>

              {isMeetingRoom && (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: 'var(--space-1)', color: 'var(--color-on-surface)' }}>
                    Duration (Hours)
                  </label>
                  <select
                    value={bookingDuration}
                    onChange={(e) => setBookingDuration(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--color-outline-variant)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-on-surface)',
                      fontSize: '14px',
                    }}
                  >
                    {[1, 2, 3, 4, 6, 8].map((h) => (
                      <option key={h} value={h}>
                        {h} Hour{h > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Cost Calculation Preview */}
              <div
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-container-high)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '14px',
                }}
              >
                <span style={{ color: 'var(--color-on-surface-variant)' }}>Estimated Charge:</span>
                <div>
                  {isCoveredByPlan ? (
                    <span style={{ color: '#059669', fontWeight: 700 }}>
                      Covered by Membership (₦0.00)
                    </span>
                  ) : (
                    <span style={{ fontWeight: 700, color: 'var(--color-on-surface)' }}>
                      ₦{rawCost.toLocaleString()} NGN
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  opacity: isPending ? 0.7 : 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                }}
              >
                {isPending ? 'Processing Booking...' : 'Confirm Reservation'}
              </button>
            </form>
          </section>

          {/* Active Bookings Quick View */}
          <section
            style={{
              backgroundColor: 'var(--color-surface-container-lowest)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-card)',
              border: '1px solid var(--color-outline-variant)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--color-on-surface)' }}>
                Upcoming Reservations
              </h2>
              <button
                onClick={() => setActiveTab('bookings')}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
              >
                View all &rarr;
              </button>
            </div>

            {upcomingBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--color-on-surface-variant)' }}>
                <p style={{ fontSize: '28px', margin: '0 0 var(--space-2)' }}>☕</p>
                <p style={{ margin: 0, fontSize: '14px' }}>No active bookings scheduled.</p>
                <span style={{ fontSize: '12px' }}>Use the form to reserve a desk or conference room.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {upcomingBookings.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      padding: 'var(--space-3) var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-outline-variant)',
                      backgroundColor: 'var(--color-surface)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong style={{ display: 'block', fontSize: '14px', color: 'var(--color-on-surface)' }}>
                        {b.resource.name}
                      </strong>
                      <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
                        {new Date(b.startAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      disabled={isPending}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#fee2e2',
                        color: '#991b1b',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Hub Quick Info */}
            <div
              style={{
                marginTop: 'var(--space-6)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-container-high)',
                fontSize: '13px',
                color: 'var(--color-on-surface-variant)',
                lineHeight: 1.5,
              }}
            >
              <strong style={{ display: 'block', color: 'var(--color-on-surface)', marginBottom: '4px' }}>
                📍 Lagos Hub Operations
              </strong>
              Open Monday – Saturday from 8:00 AM to 8:00 PM. High-speed Starlink + fiber backup, 100% solar inverter
              switchover, and on-site barista.
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: MY BOOKINGS */}
      {activeTab === 'bookings' && (
        <section
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--color-outline-variant)',
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 var(--space-4)', color: 'var(--color-on-surface)' }}>
            Complete Booking History
          </h2>
          {bookings.length === 0 ? (
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>No bookings found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-outline-variant)', color: 'var(--color-on-surface-variant)' }}>
                    <th style={{ padding: 'var(--space-3)' }}>Resource</th>
                    <th style={{ padding: 'var(--space-3)' }}>Type</th>
                    <th style={{ padding: 'var(--space-3)' }}>Date & Time</th>
                    <th style={{ padding: 'var(--space-3)' }}>Charge</th>
                    <th style={{ padding: 'var(--space-3)' }}>Status</th>
                    <th style={{ padding: 'var(--space-3)', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                      <td style={{ padding: 'var(--space-3)', fontWeight: 600 }}>{b.resource.name}</td>
                      <td style={{ padding: 'var(--space-3)', color: 'var(--color-on-surface-variant)' }}>{b.resource.type}</td>
                      <td style={{ padding: 'var(--space-3)' }}>
                        {new Date(b.startAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td style={{ padding: 'var(--space-3)' }}>
                        {b.totalCharge > 0 ? `₦${b.totalCharge.toLocaleString()}` : 'Covered'}
                      </td>
                      <td style={{ padding: 'var(--space-3)' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor:
                              b.status === 'CONFIRMED' ? '#d1fae5' : b.status === 'CANCELLED' ? '#f3f4f6' : '#fef3c7',
                            color:
                              b.status === 'CONFIRMED' ? '#065f46' : b.status === 'CANCELLED' ? '#4b5563' : '#92400e',
                          }}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td style={{ padding: 'var(--space-3)', textAlign: 'right' }}>
                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleCancelBooking(b.id)}
                            disabled={isPending}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: '#fee2e2',
                              color: '#991b1b',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* TAB 3: MEMBERSHIP & ALLOWANCES */}
      {activeTab === 'membership' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Active Plan Detail */}
          <section
            style={{
              backgroundColor: 'var(--color-surface-container-lowest)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-card)',
              border: '1px solid var(--color-outline-variant)',
            }}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 var(--space-3)', color: 'var(--color-on-surface)' }}>
              Current Plan Details
            </h2>
            {activeMembership ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
                <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>PLAN NAME</span>
                  <p style={{ fontSize: '18px', fontWeight: 700, margin: '4px 0', color: 'var(--color-on-surface)' }}>
                    {activeMembership.plan.name}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>
                    {activeMembership.plan.description}
                  </p>
                </div>
                <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>BILLING RATE</span>
                  <p style={{ fontSize: '18px', fontWeight: 700, margin: '4px 0', color: 'var(--color-on-surface)' }}>
                    ₦{activeMembership.purchasePrice.toLocaleString()} / {activeMembership.plan.billingPeriod}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>
                    Status: <strong style={{ color: '#059669' }}>{activeMembership.status}</strong>
                  </p>
                </div>
                <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>PERIOD WINDOW</span>
                  <p style={{ fontSize: '14px', fontWeight: 600, margin: '4px 0', color: 'var(--color-on-surface)' }}>
                    {new Date(activeMembership.startAt).toLocaleDateString()} &mdash; {new Date(activeMembership.expiresAt).toLocaleDateString()}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-on-surface-variant)' }}>
                    Non-rollover statutory billing cycle.
                  </p>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>No active subscription plan found.</p>
            )}
          </section>

          {/* Benefit Ledger Table */}
          <section
            style={{
              backgroundColor: 'var(--color-surface-container-lowest)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-card)',
              border: '1px solid var(--color-outline-variant)',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 var(--space-4)', color: 'var(--color-on-surface)' }}>
              Benefit Usage Ledger
            </h2>
            {benefitLedgers.length === 0 ? (
              <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>No ledger events recorded.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-outline-variant)', color: 'var(--color-on-surface-variant)' }}>
                      <th style={{ padding: 'var(--space-2)' }}>Date</th>
                      <th style={{ padding: 'var(--space-2)' }}>Benefit</th>
                      <th style={{ padding: 'var(--space-2)' }}>Change</th>
                      <th style={{ padding: 'var(--space-2)' }}>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {benefitLedgers.map((l) => (
                      <tr key={l.id} style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                        <td style={{ padding: 'var(--space-2)' }}>{new Date(l.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: 'var(--space-2)', fontWeight: 600 }}>{l.benefitType}</td>
                        <td
                          style={{
                            padding: 'var(--space-2)',
                            fontWeight: 700,
                            color: l.amount > 0 ? '#059669' : '#dc2626',
                          }}
                        >
                          {l.amount > 0 ? `+${l.amount}` : l.amount}
                        </td>
                        <td style={{ padding: 'var(--space-2)', color: 'var(--color-on-surface-variant)' }}>{l.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Available Plans Catalogue */}
          <section
            style={{
              backgroundColor: 'var(--color-surface-container-lowest)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-card)',
              border: '1px solid var(--color-outline-variant)',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 var(--space-4)', color: 'var(--color-on-surface)' }}>
              Workspace Membership Catalogue
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
              {plans.map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    border: activeMembership?.plan.id === p.id ? '2px solid var(--color-primary)' : '1px solid var(--color-outline-variant)',
                    backgroundColor: 'var(--color-surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '16px', display: 'block', color: 'var(--color-on-surface)' }}>{p.name}</strong>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-primary)', display: 'block', margin: 'var(--space-2) 0' }}>
                      ₦{p.price.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-on-surface-variant)' }}>/ {p.billingPeriod}</span>
                    </span>
                    <p style={{ fontSize: '13px', color: 'var(--color-on-surface-variant)', lineHeight: 1.4 }}>{p.description}</p>
                    <ul style={{ fontSize: '12px', paddingLeft: '18px', color: 'var(--color-on-surface)', margin: 'var(--space-2) 0' }}>
                      <li>{p.coworkingDayAllowance ? `${p.coworkingDayAllowance} Coworking Days` : 'Day pass access'}</li>
                      {p.meetingRoomHourAllowance ? <li>{p.meetingRoomHourAllowance} Meeting Room Hours</li> : null}
                    </ul>
                  </div>
                  {activeMembership?.plan.id === p.id ? (
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669', textAlign: 'center', marginTop: 'var(--space-3)' }}>
                      Current Plan
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => alert(`To switch to ${p.name}, please contact reception or scan the Moniepoint POS.`)}
                      style={{
                        padding: 'var(--space-2)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-surface-container-high)',
                        color: 'var(--color-on-surface)',
                        border: '1px solid var(--color-outline-variant)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginTop: 'var(--space-3)',
                      }}
                    >
                      Switch to Plan
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: PAYMENTS & INVOICES */}
      {activeTab === 'payments' && (
        <section
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--color-outline-variant)',
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 var(--space-4)', color: 'var(--color-on-surface)' }}>
            Payment History & Receipts
          </h2>
          {payments.length === 0 ? (
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: '14px' }}>No payment receipts on record.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-outline-variant)', color: 'var(--color-on-surface-variant)' }}>
                    <th style={{ padding: 'var(--space-3)' }}>Reference</th>
                    <th style={{ padding: 'var(--space-3)' }}>Date</th>
                    <th style={{ padding: 'var(--space-3)' }}>Amount</th>
                    <th style={{ padding: 'var(--space-3)' }}>Provider</th>
                    <th style={{ padding: 'var(--space-3)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                      <td style={{ padding: 'var(--space-3)', fontFamily: 'monospace', fontSize: '13px' }}>
                        {p.paymentReference || p.id.slice(0, 8)}
                      </td>
                      <td style={{ padding: 'var(--space-3)' }}>
                        {new Date(p.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: 'var(--space-3)', fontWeight: 600 }}>
                        ₦{p.amount.toLocaleString()} {p.currency}
                      </td>
                      <td style={{ padding: 'var(--space-3)', color: 'var(--color-on-surface-variant)' }}>{p.provider}</td>
                      <td style={{ padding: 'var(--space-3)' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: p.status === 'SUCCESSFUL' ? '#d1fae5' : '#fee2e2',
                            color: p.status === 'SUCCESSFUL' ? '#065f46' : '#991b1b',
                          }}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* TAB 5: SECURITY & PRIVACY */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Member Profile Summary */}
          <section
            style={{
              backgroundColor: 'var(--color-surface-container-lowest)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-card)',
              border: '1px solid var(--color-outline-variant)',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 var(--space-4)', color: 'var(--color-on-surface)' }}>
              Member Identity & Statutory Records
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', fontSize: '14px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>Full Legal Name</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: 'var(--color-on-surface)' }}>{user.fullName}</p>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>Registered Email</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: 'var(--color-on-surface)' }}>{user.email}</p>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>Telephone</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: 'var(--color-on-surface)' }}>{user.phone || 'Not provided'}</p>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>Corporate Tax ID</span>
                <p style={{ margin: '2px 0 0', fontWeight: 600, color: 'var(--color-on-surface)' }}>{user.taxId}</p>
              </div>
            </div>
          </section>

          {/* Existing Security Client (Task 5 Reset & Account Erasure) */}
          <SecurityClient />
        </div>
      )}
    </div>
  );
}

