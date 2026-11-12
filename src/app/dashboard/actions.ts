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

/**
 * Member Service: Book a workspace desk or meeting room.
 * Derives user ID strictly from the verified server-side session.
 */
export async function createBookingAction(formData: FormData): Promise<{
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
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          include: { plan: true },
        },
      },
    });

    if (!appUser) {
      return { success: false, error: 'User record not found.' };
    }

    if (appUser.accountStatus === 'INACTIVE') {
      return { success: false, error: 'Account is scheduled for deletion and cannot make bookings.' };
    }

    const resourceId = formData.get('resourceId') as string;
    const dateStr = formData.get('date') as string; // YYYY-MM-DD
    const timeStr = formData.get('time') as string; // HH:mm
    const durationHours = parseInt((formData.get('durationHours') as string) || '1', 10);

    if (!resourceId || !dateStr || !timeStr) {
      return { success: false, error: 'Please select a resource, date, and start time.' };
    }

    const resource = await prisma.workspaceResource.findUnique({
      where: { id: resourceId },
    });

    if (!resource || !resource.isActive) {
      return { success: false, error: 'Selected workspace resource is currently unavailable.' };
    }

    // Construct start and end timestamps
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    const startAt = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    const endAt = new Date(startAt.getTime() + durationHours * 60 * 60 * 1000);

    if (startAt.getTime() < Date.now() - 5 * 60 * 1000) {
      return { success: false, error: 'Cannot book time slots in the past.' };
    }

    // Collision Check: Verify no existing active booking overlaps this slot
    const collision = await prisma.booking.findFirst({
      where: {
        resourceId,
        status: { in: ['CONFIRMED', 'PENDING'] },
        AND: [
          { startAt: { lt: endAt } },
          { endAt: { gt: startAt } },
        ],
      },
    });

    if (collision) {
      return {
        success: false,
        error: `This resource is already booked from ${collision.startAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to ${collision.endAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Please choose another time.`,
      };
    }

    const activeMembership = appUser.memberships[0];
    let totalCharge = Number(resource.rate || 0) * (resource.type === 'MEETING_ROOM' ? durationHours : 1);
    let coveredByBenefit = false;
    let benefitDeductionType: 'COWORKING_DAYS' | 'MEETING_ROOM_HOURS' | null = null;
    let benefitDeductionAmount = 0;

    // Check membership benefit ledger
    if (activeMembership) {
      if (resource.type === 'DESK') {
        const daysLedger = await prisma.benefitLedger.aggregate({
          where: { memberId: appUser.id, benefitType: 'COWORKING_DAYS' },
          _sum: { amount: true },
        });
        const remainingDays = Number(daysLedger._sum.amount || 0);

        if (remainingDays >= 1) {
          coveredByBenefit = true;
          benefitDeductionType = 'COWORKING_DAYS';
          benefitDeductionAmount = 1;
          totalCharge = 0;
        }
      } else if (resource.type === 'MEETING_ROOM') {
        const roomLedger = await prisma.benefitLedger.aggregate({
          where: { memberId: appUser.id, benefitType: 'MEETING_ROOM_HOURS' },
          _sum: { amount: true },
        });
        const remainingHours = Number(roomLedger._sum.amount || 0);

        if (remainingHours >= durationHours) {
          coveredByBenefit = true;
          benefitDeductionType = 'MEETING_ROOM_HOURS';
          benefitDeductionAmount = durationHours;
          totalCharge = 0;
        }
      }
    }

    // Execute booking creation inside a database transaction
    await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          memberId: appUser.id,
          resourceId,
          startAt,
          endAt,
          status: 'CONFIRMED',
          totalCharge,
          currency: 'NGN',
        },
      });

      if (coveredByBenefit && activeMembership && benefitDeductionType) {
        await tx.benefitLedger.create({
          data: {
            memberId: appUser.id,
            membershipId: activeMembership.id,
            bookingId: newBooking.id,
            benefitType: benefitDeductionType,
            amount: -benefitDeductionAmount,
            reason: `Booking for ${resource.name} (${dateStr})`,
          },
        });
      }
    });

    revalidatePath('/dashboard');
    return {
      success: true,
      message: coveredByBenefit
        ? `Booking confirmed! Covered by your membership allowance (0 NGN charged).`
        : `Booking confirmed! Total fee: ₦${totalCharge.toLocaleString()}.`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create booking.';
    return { success: false, error: message };
  }
}

/**
 * Member Service: Cancel an existing booking and restore deducted benefits.
 */
export async function cancelBookingAction(bookingId: string): Promise<{
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
      return { success: false, error: 'User record not found.' };
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        resource: true,
        benefitLedgers: true,
      },
    });

    if (!booking) {
      return { success: false, error: 'Booking not found.' };
    }

    // Rule: Member can only manage their OWN records
    if (booking.memberId !== appUser.id) {
      return { success: false, error: 'Unauthorized: You cannot cancel another member’s booking.' };
    }

    if (booking.status === 'CANCELLED') {
      return { success: false, error: 'Booking is already cancelled.' };
    }

    await prisma.$transaction(async (tx) => {
      // 1. Mark booking CANCELLED
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      });

      // 2. Refund deducted benefits if any
      for (const ledger of booking.benefitLedgers) {
        if (Number(ledger.amount) < 0) {
          const refundAmount = Math.abs(Number(ledger.amount));
          await tx.benefitLedger.create({
            data: {
              memberId: appUser.id,
              membershipId: ledger.membershipId,
              bookingId: booking.id,
              benefitType: ledger.benefitType,
              amount: refundAmount,
              reason: `Reinstated allowance for cancelled booking (${booking.resource.name})`,
            },
          });
        }
      }
    });

    revalidatePath('/dashboard');
    return {
      success: true,
      message: 'Booking cancelled successfully. Any deducted benefits have been refunded to your ledger.',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to cancel booking.';
    return { success: false, error: message };
  }
}
