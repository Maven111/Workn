import { prisma } from '@/lib/prisma';
import { revokeAllUserSessions } from '@/lib/auth/session';

export const DELETION_GRACE_PERIOD_DAYS = 30; // Recorded in Docs/numbers-register.md

export interface DeletionRequestResult {
  success: boolean;
  userId: string;
  accountLocked: boolean;
  revokedSessionsCount: number;
  scheduledPurgeAt: Date;
  message: string;
}

export interface PurgeJobResult {
  jobStartedAt: Date;
  jobFinishedAt: Date;
  durationMs: number;
  accountsEvaluated: number;
  accountsPurged: number;
  sessionsPurged: number;
  logs: string[];
}

/**
 * Initiates lawful account deletion (Soft Delete & Account Lockout).
 * 1. Locks account immediately (accountStatus = INACTIVE).
 * 2. Revokes all active sessions across all devices.
 * 3. Anonymises PII identity fields.
 * 4. Schedules hard delete after statutory 30-day grace period.
 */
export async function requestAccountDeletion(
  userId: string,
  reason: string = 'User requested erasure under NDPA Section 34 / GDPR Article 17'
): Promise<DeletionRequestResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error(`User with ID ${userId} does not exist.`);
  }

  const scheduledPurgeAt = new Date(Date.now() + DELETION_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);

  // 1. Immediately revoke all active sessions
  const revokedSessionsCount = await revokeAllUserSessions(userId);

  // 2. Anonymise PII & lock account
  const anonymisedEmail = `deleted-${user.id.slice(0, 8)}@workn.invalid`;
  await prisma.user.update({
    where: { id: userId },
    data: {
      accountStatus: 'INACTIVE',
      fullName: 'Anonymised Member',
      email: anonymisedEmail,
      phone: null,
    },
  });

  // 3. Create immutable audit log entry documenting request and scheduled purge
  await prisma.auditLog.create({
    data: {
      actorId: userId,
      action: 'ACCOUNT_DELETION_REQUESTED',
      affectedRecordType: 'User',
      affectedRecordId: userId,
      outcome: 'ACCOUNT_LOCKED_AND_SCHEDULED',
      metadata: {
        reason,
        gracePeriodDays: DELETION_GRACE_PERIOD_DAYS,
        requestedAt: new Date().toISOString(),
        scheduledPurgeAt: scheduledPurgeAt.toISOString(),
        revokedSessionsCount,
        originalEmailDomain: user.email.split('@')[1] || 'unknown',
      },
    },
  });

  return {
    success: true,
    userId,
    accountLocked: true,
    revokedSessionsCount,
    scheduledPurgeAt,
    message: `Account has been locked and anonymised. Complete data purge scheduled after ${DELETION_GRACE_PERIOD_DAYS}-day grace period on ${scheduledPurgeAt.toISOString()}.`,
  };
}

/**
 * Scheduled purge job: runs as a background task on an interval.
 * Discovers expired deletion requests, verifies grace period expiration, and purges in a single transaction.
 * Safe to run multiple times (idempotent).
 */
export async function executeScheduledPurgeJob(options?: {
  simulatedNow?: Date;
}): Promise<PurgeJobResult> {
  const jobStartedAt = new Date();
  const startTime = Date.now();
  const logs: string[] = [];

  const log = (msg: string) => {
    logs.push(msg);
  };

  const now = options?.simulatedNow || jobStartedAt;

  log(`[PURGE JOB START] Scheduled Account Purge Job initiated at ${jobStartedAt.toISOString()}`);
  log(`[PURGE JOB CRITERIA] Searching for accounts with scheduledPurgeAt <= ${now.toISOString()}`);

  // Query audit logs for deletion requests whose grace period has expired and have not yet been purged
  const pendingRequests = await prisma.auditLog.findMany({
    where: {
      action: 'ACCOUNT_DELETION_REQUESTED',
      outcome: 'ACCOUNT_LOCKED_AND_SCHEDULED',
    },
    orderBy: { createdAt: 'asc' },
  });

  const eligibleRequests = pendingRequests.filter((req) => {
    const meta = (req.metadata || {}) as Record<string, unknown>;
    const purgeDateStr = meta.scheduledPurgeAt as string | undefined;
    if (!purgeDateStr) return false;
    const purgeDate = new Date(purgeDateStr);
    return purgeDate <= now;
  });

  log(`[PURGE JOB AUDIT] Evaluated ${pendingRequests.length} total deletion requests. ${eligibleRequests.length} eligible for immediate purge.`);

  let accountsPurged = 0;
  let sessionsPurged = 0;

  if (eligibleRequests.length === 0) {
    log(`[PURGE JOB ZERO-ACTION] Zero eligible accounts expired. System state unchanged.`);
  } else {
    for (const req of eligibleRequests) {
      const targetUserId = req.affectedRecordId;
      if (!targetUserId) continue;

      // Check if user still exists
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
      });

      if (!targetUser) {
        // Already purged, update audit log outcome
        await prisma.auditLog.update({
          where: { id: req.id },
          data: { outcome: 'ALREADY_PURGED' },
        });
        continue;
      }

      // Execute purge in atomic transaction
      await prisma.$transaction(async (tx) => {
        // 1. Purge sessions
        const sessRes = await tx.session.deleteMany({
          where: { userId: targetUserId },
        });
        sessionsPurged += sessRes.count;

        // 2. Anonymise financial and booking references if required by retention matrix, then delete user
        // Note: Audit logs retain actorId: null to preserve facility transaction history
        await tx.auditLog.updateMany({
          where: { actorId: targetUserId },
          data: { actorId: null },
        });

        // 3. Delete user row
        await tx.user.delete({
          where: { id: targetUserId },
        });

        // 4. Mark deletion request as fulfilled in AuditLog
        await tx.auditLog.update({
          where: { id: req.id },
          data: {
            outcome: 'HARD_DELETE_COMPLETED',
            metadata: {
              ...(req.metadata as Record<string, unknown>),
              purgedAt: new Date().toISOString(),
              sessionsDeleted: sessRes.count,
            },
          },
        });
      });

      accountsPurged++;
      log(`[PURGE EXECUTED] User ${targetUserId} purged atomically. Sessions deleted: ${sessionsPurged}.`);
    }
  }

  const durationMs = Date.now() - startTime;
  const jobFinishedAt = new Date();

  log(`[PURGE JOB FINISH] Scheduled Account Purge Job completed at ${jobFinishedAt.toISOString()} in ${durationMs}ms. Evaluated: ${pendingRequests.length}, Purged: ${accountsPurged}. Failures: 0.`);

  return {
    jobStartedAt,
    jobFinishedAt,
    durationMs,
    accountsEvaluated: pendingRequests.length,
    accountsPurged,
    sessionsPurged,
    logs,
  };
}

