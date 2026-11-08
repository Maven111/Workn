'use server';

import { getCurrentUser } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Privileged operational action strictly restricted to ADMIN role.
 * Enforces server-side authorization check (Rule Auth.md Section 6).
 */
export async function executeAdminEmergencyAction(): Promise<{ success: boolean; message: string; error?: string }> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      success: false,
      message: 'Unauthenticated request.',
      error: 'HTTP 401 Unauthorized: Valid session required.',
    };
  }

  // Authorization enforcement: MUST be ADMIN
  if (user.role !== 'ADMIN') {
    return {
      success: false,
      message: 'Access denied: Administrative privileges required.',
      error: 'HTTP 403 Forbidden: Account role is MEMBER.',
    };
  }

  // Audit action execution
  const activeSessionCount = await prisma.session.count({
    where: { revokedAt: null },
  });

  revalidatePath('/admin');

  return {
    success: true,
    message: `Privileged action executed successfully by ${user.email}. System verified ${activeSessionCount} active session records in PostgreSQL.`,
  };
}

