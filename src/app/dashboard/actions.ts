'use server';

import { createClient } from '@/lib/auth/server';
import { prisma } from '@/lib/prisma';
import { requestAccountDeletion } from '@/lib/compliance/deletion';
import { revalidatePath } from 'next/cache';

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
