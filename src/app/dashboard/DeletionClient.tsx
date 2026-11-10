'use client';

import React, { useState, useTransition } from 'react';
import { triggerAccountDeletionAction } from './actions';

export default function DeletionClient() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleConfirmDeletion = () => {
    startTransition(async () => {
      setError(null);
      const res = await triggerAccountDeletionAction();
      if (!res.success && res.error) {
        setError(res.error);
      }
    });
  };

  return (
    <div
      style={{
        marginTop: 'var(--space-8)',
        maxWidth: '560px',
        width: '100%',
        backgroundColor: 'var(--color-surface-container-lowest)',
        border: '1px solid var(--color-outline-variant)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
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
          Privacy & Account Erasure (NDPA / GDPR)
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

      {error && (
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
          {error}
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
            transition: 'background-color 150ms ease',
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
            Are you sure? Your account will be locked immediately.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button
              type="button"
              disabled={isPending}
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
                cursor: isPending ? 'not-allowed' : 'pointer',
                opacity: isPending ? 0.7 : 1,
              }}
            >
              {isPending ? 'Locking Account...' : 'Confirm Account Erasure'}
            </button>
            <button
              type="button"
              disabled={isPending}
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
  );
}
