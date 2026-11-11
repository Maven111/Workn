'use client';

import React, { useState, useTransition } from 'react';
import { triggerAccountDeletionAction, resetPasswordAction } from './actions';

export default function SecurityClient() {
  // Password Reset State
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isResetPending, startResetTransition] = useTransition();

  // Deletion State
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    startResetTransition(async () => {
      setResetError(null);
      setResetSuccess(null);
      const formData = new FormData();
      formData.set('newPassword', newPassword);
      const res = await resetPasswordAction(formData);
      if (res.success) {
        setResetSuccess(res.message || 'Password successfully reset.');
        setNewPassword('');
      } else {
        setResetError(res.error || 'Failed to reset password.');
      }
    });
  };

  const handleConfirmDeletion = () => {
    startDeleteTransition(async () => {
      setDeleteError(null);
      const res = await triggerAccountDeletionAction();
      if (!res.success && res.error) {
        setDeleteError(res.error);
      }
    });
  };

  return (
    <div style={{ width: '100%', maxWidth: '640px', marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* 1. Task 5 Step 5: Password Reset Kills All Previous Sessions (Evidence 11) */}
      <div
        style={{
          backgroundColor: 'var(--color-surface-container-lowest)',
          border: '1px solid var(--color-outline-variant)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
          <span
            style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary)',
            }}
          />
          <h2
            style={{
              fontFamily: 'var(--type-title-medium-font-family)',
              fontSize: 'var(--type-title-medium-font-size)',
              fontWeight: 700,
              color: 'var(--color-on-surface)',
              margin: 0,
            }}
          >
            Credential Security & Session Revocation
          </h2>
        </div>

        <p
          style={{
            fontFamily: 'var(--type-body-medium-font-family)',
            fontSize: 'var(--type-body-medium-font-size)',
            color: 'var(--color-on-surface-variant)',
            lineHeight: 1.5,
            marginBottom: 'var(--space-4)',
          }}
        >
          Reset your password. In accordance with strict forward-deployed security posture, resetting credentials authoritatively <strong>terminates all existing sessions across every browser and device</strong> simultaneously.
        </p>

        {resetSuccess && (
          <div
            role="status"
            style={{
              marginBottom: 'var(--space-4)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-container)',
              color: 'var(--color-on-primary-container)',
              fontSize: 'var(--type-body-small-font-size)',
              fontWeight: 600,
            }}
          >
            ✅ {resetSuccess}
          </div>
        )}

        {resetError && (
          <div
            role="alert"
            style={{
              marginBottom: 'var(--space-4)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-error-container)',
              color: 'var(--color-on-error-container)',
              fontSize: 'var(--type-body-small-font-size)',
            }}
          >
            {resetError}
          </div>
        )}

        <form onSubmit={handleResetPassword} style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <input
            type="password"
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new secure password (8+ chars)"
            required
            minLength={8}
            style={{
              flex: 1,
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-outline-variant)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-on-surface)',
              fontFamily: 'var(--type-body-medium-font-family)',
              fontSize: 'var(--type-body-medium-font-size)',
            }}
          />
          <button
            type="submit"
            disabled={isResetPending || newPassword.length < 8}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              fontFamily: 'var(--type-label-medium-font-family)',
              fontSize: 'var(--type-label-medium-font-size)',
              fontWeight: 600,
              cursor: isResetPending ? 'not-allowed' : 'pointer',
              opacity: isResetPending || newPassword.length < 8 ? 0.7 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {isResetPending ? 'Resetting...' : 'Reset Password & Invalidate All Sessions'}
          </button>
        </form>
      </div>

      {/* 2. Task 5 Step 6: Account Deletion Lockout Trigger (Evidence 12) */}
      <div
        style={{
          backgroundColor: 'var(--color-surface-container-lowest)',
          border: '1px solid var(--color-outline-variant)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
          <span
            style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-error)',
            }}
          />
          <h2
            style={{
              fontFamily: 'var(--type-title-medium-font-family)',
              fontSize: 'var(--type-title-medium-font-size)',
              fontWeight: 700,
              color: 'var(--color-on-surface)',
              margin: 0,
            }}
          >
            Privacy & Statutory Account Erasure (NDPA / GDPR)
          </h2>
        </div>

        <p
          style={{
            fontFamily: 'var(--type-body-medium-font-family)',
            fontSize: 'var(--type-body-medium-font-size)',
            color: 'var(--color-on-surface-variant)',
            lineHeight: 1.5,
            marginBottom: 'var(--space-4)',
          }}
        >
          Under NDPA 2023 Section 34 and GDPR Article 17, you may request permanent erasure. Submitting this request immediately locks your account, revokes all active sessions, anonymises your contact records, and starts a <strong>30-day statutory grace period</strong> before the permanent database purge.
        </p>

        {deleteError && (
          <div
            role="alert"
            style={{
              marginBottom: 'var(--space-4)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-error-container)',
              color: 'var(--color-on-error-container)',
              fontSize: 'var(--type-body-small-font-size)',
            }}
          >
            {deleteError}
          </div>
        )}

        {!showConfirm ? (
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-error)',
              backgroundColor: 'transparent',
              color: 'var(--color-error)',
              fontFamily: 'var(--type-label-medium-font-family)',
              fontSize: 'var(--type-label-medium-font-size)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Request Account Deletion
          </button>
        ) : (
          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-surface-container-high)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-error)',
            }}
          >
            <p
              style={{
                margin: '0 0 var(--space-3) 0',
                fontWeight: 600,
                fontSize: 'var(--type-body-medium-font-size)',
                color: 'var(--color-on-surface)',
              }}
            >
              Are you sure? Your account will be locked immediately and all sessions revoked.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button
                type="button"
                disabled={isDeletePending}
                onClick={handleConfirmDeletion}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: 'var(--color-error)',
                  color: 'var(--color-on-error)',
                  fontFamily: 'var(--type-label-medium-font-family)',
                  fontSize: 'var(--type-label-medium-font-size)',
                  fontWeight: 600,
                  cursor: isDeletePending ? 'not-allowed' : 'pointer',
                  opacity: isDeletePending ? 0.7 : 1,
                }}
              >
                {isDeletePending ? 'Locking Account...' : 'Confirm Account Erasure'}
              </button>
              <button
                type="button"
                disabled={isDeletePending}
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-outline-variant)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-on-surface)',
                  fontFamily: 'var(--type-label-medium-font-family)',
                  fontSize: 'var(--type-label-medium-font-size)',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

