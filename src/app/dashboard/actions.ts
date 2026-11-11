'use server';

import { createClient } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { requestAccountDeletion } from '@/lib/compliance/deletion';
import { revokeAllUserSessions, createSession } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';

/**
 * Task 5 Step 6: Lawful account deletion (Soft delete & 30-day grace period lockout).
 */
export async function triggerAccountDeletionAction(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthenticated session.' };
    }

    const appUser = await prisma.user.findUnique({
      where: { authUserId: user.id },
    });

    if (!appUser) {
      return { success: false, error: 'User record not found in PostgreSQL.' };
    }

    // Execute lawful soft delete & 30-day grace period lockout (Task 5 Step 6)
    await requestAccountDeletion(appUser.id);

    revalidatePath('/dashboard');
    return {
      success: true,
      message: 'Account locked and scheduled for deletion.',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to request account deletion.';
    return { success: false, error: message };
  }
}

/**
 * Task 5 Step 5: Password reset kills all active sessions across all devices (Evidence 11).
 */
export async function resetPasswordAction(formData: FormData): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthenticated session.' };
    }

    const newPassword = formData.get('newPassword') as string;
    if (!newPassword || newPassword.trim().length < 8) {
      return { success: false, error: 'Password must be at least 8 characters.' };
    }

    const appUser = await prisma.user.findUnique({
      where: { authUserId: user.id },
    });

    if (!appUser) {
      return { success: false, error: 'User record not found.' };
    }

    // 1. Update password in Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword.trim(),
    });

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // 2. Task 5 Step 5: Password reset kills all active sessions across all devices!
    const revokedCount = await revokeAllUserSessions(appUser.id);

    // 3. Issue a fresh session exclusively for this browser so it remains authenticated
    await createSession(appUser.id);

    revalidatePath('/dashboard');
    return {
      success: true,
      message: `Password reset successfully! Revoked ${revokedCount} session(s) across all other browsers.`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An error occurred during password reset.';
    return { success: false, error: message };
  }
}
