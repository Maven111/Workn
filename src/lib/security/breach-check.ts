import { createHash } from 'crypto';

export interface BreachCheckResult {
  isBreached: boolean;
  breachCount: number;
  error?: string;
}

/**
 * Workn Breached Password Checker (Task 4 Step 9)
 * 
 * Uses the k-Anonymity mathematical model against the HaveIBeenPwned API:
 * 1. Computes the 40-character SHA-1 hash of the candidate password locally.
 * 2. Takes strictly the first 5 hexadecimal characters (prefix) and sends them to the API.
 * 3. The API returns a range of suffixes matching that 5-char prefix without knowing the original password.
 * 4. Checks the remaining 35 characters (suffix) against the returned list locally in memory.
 * 
 * This ensures the plaintext password and full hash NEVER leave the server boundary.
 */
export async function checkBreachedPassword(password: string): Promise<BreachCheckResult> {
  if (!password) {
    return { isBreached: false, breachCount: 0 };
  }

  // In development mode, bypass the breach check so developers can use any password
  // for testing registration flows without false positives or network blocks.
  if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_STRICT_BREACH_CHECK !== 'true') {
    return { isBreached: false, breachCount: 0 };
  }

  try {
    // 1. Compute SHA-1 hash locally
    const sha1Hash = createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = sha1Hash.slice(0, 5);
    const suffix = sha1Hash.slice(5);

    // 2. Query HIBP range API with 3-second network timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Workn-Security-Auditor/1.0',
        'Add-Padding': 'true', // Prevents response length side-channel analysis
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[BreachCheck] HIBP API returned status ${response.status}. Failing open gracefully.`);
      return { isBreached: false, breachCount: 0, error: `HIBP API status ${response.status}` };
    }

    const text = await response.text();
    const lines = text.split('\r\n');

    // 3. Search for the suffix in memory
    for (const line of lines) {
      const [hashSuffix, countStr] = line.split(':');
      if (hashSuffix && hashSuffix.trim().toUpperCase() === suffix) {
        const breachCount = parseInt(countStr.trim(), 10) || 1;
        return {
          isBreached: true,
          breachCount,
        };
      }
    }

    return {
      isBreached: false,
      breachCount: 0,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.warn(`[BreachCheck] Network check failed (${errorMsg}). Failing open gracefully.`);
    return {
      isBreached: false,
      breachCount: 0,
      error: errorMsg,
    };
  }
}

