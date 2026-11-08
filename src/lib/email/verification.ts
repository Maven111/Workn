import { randomInt, randomUUID } from 'crypto';
import nodemailer, { type Transporter } from 'nodemailer';
import { prisma } from '@/lib/prisma';
import { generateVerificationEmailHtml } from '@/lib/email/template';

export const CODE_EXPIRY_MINUTES = 10; // Recorded in Docs/numbers-register.md

/**
 * Creates and returns an SMTP transporter based on environment configuration.
 * Supports standard SMTP (Mailgun/Sendgrid/Brevo/Postmark) or fallback Ethereal test transporter.
 */
export function getSmtpTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.ethereal.email';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  const secure = port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
}

/**
 * Generates a cryptographically secure 6-digit verification code.
 * Uses crypto.randomInt (CSPRNG) rather than Math.random() (predictable PRNG).
 */
export function generateCryptographicCode(): string {
  // Generates integer in range [100000, 999999] uniformly distributed
  const num = randomInt(100000, 1000000);
  return num.toString();
}

/**
 * Creates and records a fresh verification code in PostgreSQL.
 * Includes graceful raw SQL fallback if PrismaClient singleton in Next.js memory is awaiting process restart.
 */
export async function createVerificationRecord(email: string): Promise<{ code: string; expiresAt: Date; id: string }> {
  const code = generateCryptographicCode();
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);
  const id = randomUUID();

  // If PrismaClient in memory has emailVerification model
  if (prisma.emailVerification) {
    await prisma.emailVerification.updateMany({
      where: {
        email,
        consumedAt: null,
      },
      data: {
        consumedAt: new Date(0), // Mark as superseded
      },
    });

    const record = await prisma.emailVerification.create({
      data: {
        id,
        email,
        code,
        expiresAt,
      },
    });

    return { code, expiresAt, id: record.id };
  } else {
    // Resilient raw SQL fallback for un-restarted dev server processes
    await prisma.$executeRawUnsafe(
      `UPDATE "EmailVerification" SET "consumedAt" = to_timestamp(0) WHERE email = $1 AND "consumedAt" IS NULL;`,
      email
    );

    await prisma.$executeRawUnsafe(
      `INSERT INTO "EmailVerification" (id, email, code, "expiresAt", attempts, "createdAt") VALUES ($1, $2, $3, $4, 0, NOW());`,
      id,
      email,
      code,
      expiresAt
    );

    return { code, expiresAt, id };
  }
}

/**
 * Synchronous email dispatch: waits for SMTP network round-trip before returning
 */
export async function sendVerificationEmailSync(
  email: string,
  fullName: string,
  code: string,
  customTransporter?: Transporter
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = customTransporter || getSmtpTransporter();
    const html = generateVerificationEmailHtml({ fullName, code, expiryMinutes: CODE_EXPIRY_MINUTES });

    const info = await transporter.sendMail({
      from: `"Workn Coworking" <${process.env.SMTP_FROM || 'no-reply@workn.ng'}>`,
      to: email,
      subject: `${code} is your Workn verification code`,
      text: `Hello ${fullName},\n\nYour 6-digit Workn verification code is: ${code}\n\nThis code is valid for ${CODE_EXPIRY_MINUTES} minutes.`,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'SMTP dispatch error';
    return { success: false, error: message };
  }
}

/**
 * Asynchronous email dispatch: queues email transmission in background job,
 * returning immediately without blocking the client registration response.
 */
export function enqueueVerificationEmailJob(
  email: string,
  fullName: string,
  code: string,
  customTransporter?: Transporter
): { enqueued: boolean; jobId: string } {
  const jobId = `job_${Date.now()}_${randomInt(1000, 9999)}`;

  // Defer execution using setImmediate (asynchronous background queue simulation)
  setImmediate(async () => {
    try {
      await sendVerificationEmailSync(email, fullName, code, customTransporter);
    } catch (err) {
      console.error(`[BackgroundEmailQueue] Job ${jobId} failed:`, err);
    }
  });

  return { enqueued: true, jobId };
}

export interface VerificationValidationResult {
  success: boolean;
  status: 'VERIFIED' | 'EXPIRED' | 'WRONG_CODE' | 'REUSED' | 'NOT_FOUND';
  error?: string;
}

interface VerificationRow {
  id: string;
  email: string;
  code: string;
  expiresAt: Date;
  consumedAt: Date | null;
  attempts: number;
}

/**
 * Validates a submitted verification code against PostgreSQL records.
 * Covers all three specified failure modes:
 * 1. Expired code
 * 2. Wrong code
 * 3. Reused code
 */
export async function validateVerificationCode(
  email: string,
  submittedCode: string
): Promise<VerificationValidationResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedCode = submittedCode.trim();

  // 1. Check if there is a record matching this email and submitted code
  let matchingRecord: VerificationRow | null = null;

  if (prisma.emailVerification) {
    const found = await prisma.emailVerification.findFirst({
      where: { email: normalizedEmail, code: trimmedCode },
      orderBy: { createdAt: 'desc' },
    });

    if (found) {
      matchingRecord = {
        id: found.id,
        email: found.email,
        code: found.code,
        expiresAt: new Date(found.expiresAt),
        consumedAt: found.consumedAt ? new Date(found.consumedAt) : null,
        attempts: found.attempts,
      };
    }
  } else {
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id, email, code, "expiresAt", "consumedAt", attempts 
       FROM "EmailVerification" 
       WHERE email = $1 AND code = $2 
       ORDER BY "createdAt" DESC 
       LIMIT 1;`,
      normalizedEmail,
      trimmedCode
    );

    if (rows && rows.length > 0) {
      matchingRecord = {
        id: rows[0].id,
        email: rows[0].email,
        code: rows[0].code,
        expiresAt: new Date(rows[0].expiresAt),
        consumedAt: rows[0].consumedAt ? new Date(rows[0].consumedAt) : null,
        attempts: Number(rows[0].attempts) || 0,
      };
    }
  }

  // If a record with this code was found:
  if (matchingRecord) {
    // Failure Mode 3: Code already used / consumed
    if (matchingRecord.consumedAt !== null) {
      return {
        success: false,
        status: 'REUSED',
        error: 'This verification code has already been used. Please request a fresh code (Code Reused).',
      };
    }

    // Failure Mode 1: Code expired
    const now = new Date();
    if (now > matchingRecord.expiresAt) {
      return {
        success: false,
        status: 'EXPIRED',
        error: `This verification code has expired. Codes are strictly valid for ${CODE_EXPIRY_MINUTES} minutes (Code Expired).`,
      };
    }

    // SUCCESS: Consume code atomically
    if (prisma.emailVerification) {
      await prisma.emailVerification.update({
        where: { id: matchingRecord.id },
        data: { consumedAt: now },
      });
    } else {
      await prisma.$executeRawUnsafe(
        `UPDATE "EmailVerification" SET "consumedAt" = NOW() WHERE id = $1;`,
        matchingRecord.id
      );
    }

    // Activate member account in public.User
    await prisma.user.updateMany({
      where: { email: normalizedEmail },
      data: { accountStatus: 'ACTIVE' },
    });

    return {
      success: true,
      status: 'VERIFIED',
    };
  }

  // 2. Exact code not found -> Failure Mode 2: Wrong code!
  // Find the latest record for this email to increment its attempts count
  let latestId: string | null = null;
  if (prisma.emailVerification) {
    const latest = await prisma.emailVerification.findFirst({
      where: { email: normalizedEmail },
      orderBy: { createdAt: 'desc' },
    });
    if (latest) {
      latestId = latest.id;
      await prisma.emailVerification.update({
        where: { id: latest.id },
        data: { attempts: { increment: 1 } },
      });
    }
  } else {
    const fallbackRows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id FROM "EmailVerification" WHERE email = $1 ORDER BY "createdAt" DESC LIMIT 1;`,
      normalizedEmail
    );
    if (fallbackRows && fallbackRows.length > 0) {
      latestId = fallbackRows[0].id;
      await prisma.$executeRawUnsafe(
        `UPDATE "EmailVerification" SET attempts = attempts + 1 WHERE id = $1;`,
        latestId
      );
    }
  }

  if (!latestId) {
    return {
      success: false,
      status: 'NOT_FOUND',
      error: 'No active verification code was found for this email address.',
    };
  }

  return {
    success: false,
    status: 'WRONG_CODE',
    error: 'The verification code entered is incorrect. Please check your email and try again (Wrong Code).',
  };
}
