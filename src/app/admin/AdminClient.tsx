'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import type { User } from '@prisma/client';
import { executeAdminEmergencyAction } from './actions';

interface AdminDashboardClientProps {
  adminUser: User;
  stats: {
    totalUsers: number;
    totalSessions: number;
    totalVerifications: number;
  };
}

export default function AdminDashboardClient({
  adminUser,
  stats,
}: AdminDashboardClientProps) {
  const [actionResult, setActionResult] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAdminAction = () => {
    startTransition(async () => {
      const res = await executeAdminEmergencyAction();
      if (res.success) {
        setActionResult(res.message);
      } else {
        setActionResult(`Action failed: ${res.error}`);
      }
    });
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-surface)',
        padding: 'var(--space-8) var(--space-6)',
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-8)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: 'var(--space-1) var(--space-3)',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-primary-container)',
                  color: 'var(--color-on-primary-container)',
                  fontSize: 'var(--type-label-small-font-size)',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                }}
              >
                ADMIN ROLE VERIFIED
              </span>
              <span className="type-body-small" style={{ color: 'var(--color-on-surface-variant)' }}>
                {adminUser.email}
              </span>
            </div>
            <h1 className="type-headline-large" style={{ color: 'var(--color-on-surface)' }}>
              Workn Facility Administration
            </h1>
            <p className="type-body-medium" style={{ color: 'var(--color-on-surface-variant)' }}>
              Privileged controls, platform oversight, and facility access authorization.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="auth-outline-btn"
            style={{ textDecoration: 'none' }}
          >
            Switch to Member View
          </Link>
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--space-5)',
            marginBottom: 'var(--space-8)',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface-container-lowest)',
              border: '1px solid var(--color-outline-variant)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-5)',
              boxShadow: 'var(--effect-soft-shadow)',
            }}
          >
            <div className="type-label-medium" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-1)' }}>
              Registered Members
            </div>
            <div className="type-headline-large" style={{ color: 'var(--color-on-surface)', fontWeight: 700 }}>
              {stats.totalUsers}
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--color-surface-container-lowest)',
              border: '1px solid var(--color-outline-variant)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-5)',
              boxShadow: 'var(--effect-soft-shadow)',
            }}
          >
            <div className="type-label-medium" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-1)' }}>
              Active Sessions
            </div>
            <div className="type-headline-large" style={{ color: 'var(--color-on-surface)', fontWeight: 700 }}>
              {stats.totalSessions}
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--color-surface-container-lowest)',
              border: '1px solid var(--color-outline-variant)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-5)',
              boxShadow: 'var(--effect-soft-shadow)',
            }}
          >
            <div className="type-label-medium" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-1)' }}>
              Verification Records
            </div>
            <div className="type-headline-large" style={{ color: 'var(--color-on-surface)', fontWeight: 700 }}>
              {stats.totalVerifications}
            </div>
          </div>
        </div>

        {/* Privileged Action Card */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            border: '1px solid var(--color-outline-variant)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            boxShadow: 'var(--effect-soft-shadow)',
          }}
        >
          <h2 className="type-headline-small" style={{ color: 'var(--color-on-surface)', marginBottom: 'var(--space-2)' }}>
            Privileged Operational Action
          </h2>
          <p className="type-body-medium" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-5)' }}>
            This administrative operation is strictly restricted to accounts possessing the <code>ADMIN</code> role. Ordinary members attempting to invoke this server mutation will be refused with HTTP 403.
          </p>

          {actionResult && (
            <div
              role="alert"
              style={{
                marginBottom: 'var(--space-5)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-success-container)',
                color: 'var(--color-on-success-container)',
                fontSize: 'var(--type-body-medium-font-size)',
                fontWeight: 600,
              }}
            >
              {actionResult}
            </div>
          )}

          <button
            type="button"
            onClick={handleAdminAction}
            disabled={isPending}
            className="wk-btn-primary"
            style={{
              backgroundColor: '#dc2626',
              borderColor: '#dc2626',
            }}
          >
            {isPending ? 'Executing privileged audit verification…' : 'Execute Emergency Facility Access Audit & Session Flush'}
          </button>
        </div>
      </div>
    </main>
  );
}

