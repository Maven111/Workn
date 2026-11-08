/**
 * Normalises an incoming email string:
 * - Trims leading and trailing whitespace
 * - Converts strictly to lowercase
 */
export function normaliseEmail(email: unknown): string {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Trims leading and trailing whitespace from a password.
 * NOTE: Passwords are NEVER lowercased to preserve entropy and character complexity.
 */
export function trimPassword(password: unknown): string {
  if (typeof password !== 'string') return '';
  return password.trim();
}

