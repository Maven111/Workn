import crypto from 'crypto';
import { cookies, headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import type { User, Session } from '@prisma/client';
import { extractClientIp } from '@/lib/security/rate-limiter';

export const SESSION_COOKIE_NAME = 'workn_session';
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days (recorded in Docs/numbers-register.md)
export const SESSION_ENTROPY_BYTES = 32; // 256 bits of CSPRNG entropy

/**
 * Generates a cryptographically secure random session token.
 * Uses Node.js crypto.randomBytes (CSPRNG) yielding 256 bits of entropy.
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(SESSION_ENTROPY_BYTES).toString('hex');
}

/**
 * Derives a SHA-256 hash of the raw session token.
 * The database stores strictly this hash, while the client holds the raw token.
 * Even under a total database compromise, an attacker cannot reverse the hash to hijack sessions.
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Creates a new server-side session for a verified user and sets the secure HTTP cookie.
 * @param userId - ID of the authenticating user
 * @param metadata - Client IP and User-Agent for auditability
 */
export async function createSession(
  userId: string,
  metadata?: { ipAddress?: string; userAgent?: string }
): Promise<{ session: Session; rawToken: string }> {
  const rawToken = generateSessionToken();
  const sessionTokenHash = hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  const session = await prisma.session.create({
    data: {
      userId,
      sessionTokenHash,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return { session, rawToken };
}

/**
 * Validates a session token from the incoming cookie against PostgreSQL.
 * Enforces expiration, revocation, and account status checks.
 */
export async function validateSessionToken(
  rawToken: string
): Promise<{ user: User; session: Session } | null> {
  if (!rawToken || typeof rawToken !== 'string') {
    return null;
  }

  const sessionTokenHash = hashSessionToken(rawToken);

  const session = await prisma.session.findUnique({
    where: { sessionTokenHash },
    include: { user: true },
  });

  if (!session) {
    return null;
  }

  // Check if session has been explicitly revoked (e.g. via logout or password reset)
  if (session.revokedAt !== null) {
    return null;
  }

  // Check if session has expired
  if (Date.now() > session.expiresAt.getTime()) {
    return null;
  }

  // Check if user account is banned or inactive
  if (session.user.accountStatus !== 'ACTIVE') {
    return null;
  }

  return { user: session.user, session };
}

/**
 * Retrieves the currently authenticated user from the active session cookie.
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  const result = await validateSessionToken(sessionCookie.value);
  return result ? result.user : null;
}

/**
 * Destroys the current session on the server and clears the client cookie.
 */
export async function destroySession(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (sessionCookie?.value) {
    const sessionTokenHash = hashSessionToken(sessionCookie.value);
    await prisma.session.updateMany({
      where: { sessionTokenHash },
      data: { revokedAt: new Date() },
    });
  }

  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  return true;
}

/**
 * Revokes all active sessions for a user (used during password reset and account deletion).
 */
export async function revokeAllUserSessions(userId: string): Promise<number> {
  const result = await prisma.session.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  return result.count;
}

