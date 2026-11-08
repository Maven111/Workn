import { createHash } from 'crypto';

async function checkPassword(password) {
  const sha1Hash = createHash('sha1').update(password).digest('hex').toUpperCase();
  const prefix = sha1Hash.slice(0, 5);
  const suffix = sha1Hash.slice(5);

  console.log(`\nTesting password: "${password}"`);
  console.log(`- SHA-1 Hash: ${sha1Hash}`);
  console.log(`- Prefix sent to HIBP (5 chars): ${prefix}`);
  console.log(`- Suffix evaluated locally (35 chars): ${suffix}`);

  try {
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'User-Agent': 'Workn-Auditor/1.0', 'Add-Padding': 'true' }
    });
    
    if (!res.ok) {
      console.log(`- HTTP Status: ${res.status}`);
      return;
    }

    const text = await res.text();
    const lines = text.split('\r\n');
    console.log(`- Range returned ${lines.length} matching candidate hashes from HIBP.`);

    let match = null;
    for (const line of lines) {
      const [hashSuffix, countStr] = line.split(':');
      if (hashSuffix && hashSuffix.trim().toUpperCase() === suffix) {
        match = parseInt(countStr.trim(), 10);
        break;
      }
    }

    if (match) {
      console.log(`❌ BREACHED: Found in corpus! Observed ${match.toLocaleString()} times in known breaches.`);
    } else {
      console.log(`✅ CLEAN: Not found in any known public breach corpus.`);
    }
  } catch (err) {
    console.log(`❌ Network Error: ${err.message}`);
  }
}

async function main() {
  console.log('='.repeat(80));
  console.log('WORKN TASK 4 STEP 9: HAVEIBEENPWNED K-ANONYMITY BREACH CHECK');
  console.log('='.repeat(80));

  // 1. Common breached password
  await checkPassword('password123');

  // 2. High entropy unique password
  await checkPassword('WorknLag0s!StrongComplex#2026');
}

main();

