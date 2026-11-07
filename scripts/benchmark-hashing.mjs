import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const password = 'WorknSecureMember2026!';
const saltRounds = 12;

console.log('================================================================================');
console.log('WORKN BENCHMARK: BCRYPT (COST FACTOR 12) VS SHA-256');
console.log('Platform:', process.platform, process.arch, '| Node version:', process.version);
console.log('Password under test:', password);
console.log('================================================================================\n');

// 1. Benchmark Bcrypt (Cost factor 12)
const BCRYPT_RUNS = 5;
console.log(`Running ${BCRYPT_RUNS} iterations of bcrypt.hashSync(password, ${saltRounds})...`);
const bcryptStart = process.hrtime.bigint();
for (let i = 0; i < BCRYPT_RUNS; i++) {
  bcrypt.hashSync(password, saltRounds);
}
const bcryptEnd = process.hrtime.bigint();
const totalBcryptNs = Number(bcryptEnd - bcryptStart);
const avgBcryptMs = totalBcryptNs / BCRYPT_RUNS / 1_000_000;
console.log(`-> Bcrypt (Cost 12) Average Time: ${avgBcryptMs.toFixed(2)} ms per hash`);

// 2. Benchmark SHA-256
const SHA_RUNS = 100_000;
console.log(`\nRunning ${SHA_RUNS.toLocaleString()} iterations of SHA-256...`);
const shaStart = process.hrtime.bigint();
for (let i = 0; i < SHA_RUNS; i++) {
  crypto.createHash('sha256').update(password).digest('hex');
}
const shaEnd = process.hrtime.bigint();
const totalShaNs = Number(shaEnd - shaStart);
const avgShaMs = totalShaNs / SHA_RUNS / 1_000_000;
const avgShaMicros = avgShaMs * 1_000;
console.log(`-> SHA-256 Average Time: ${avgShaMs.toFixed(6)} ms (${avgShaMicros.toFixed(3)} microseconds) per hash`);

// 3. Mathematical Calculations
const speedRatio = avgBcryptMs / avgShaMs;
const bcryptGuessesPerSecSingleCore = 1_000 / avgBcryptMs;
const shaGuessesPerSecSingleCore = 1_000 / avgShaMs;

console.log('\n================================================================================');
console.log('ARITHMETIC & ATTACKER FEASIBILITY COMPARISON');
console.log('================================================================================');
console.log(`1. Single-Core Throughput on this machine:`);
console.log(`   - Bcrypt (Cost 12): ~${bcryptGuessesPerSecSingleCore.toFixed(2)} guesses / second`);
console.log(`   - SHA-256:          ~${Math.round(shaGuessesPerSecSingleCore).toLocaleString()} guesses / second`);
console.log(`   - Ratio: SHA-256 is ${Math.round(speedRatio).toLocaleString()}x FASTER than bcrypt.`);

console.log(`\n2. Time to brute-force an 8-character alphanumeric password (62^8 = 218,340,105,584,896 combinations):`);
const combinations = 62 ** 8;

// Attacker with modern 8x RTX 4090 cracking rig:
// SHA-256 on 8x RTX 4090: ~200 billion (2.0e11) hashes/sec
// Bcrypt (Cost 12) on 8x RTX 4090: ~800,000 (8.0e5) hashes/sec
const attackerShaHashRate = 200_000_000_000; // 200 GH/s
const attackerBcryptHashRate = 800_000;       // 800 kH/s

const timeShaSeconds = combinations / attackerShaHashRate;
const timeBcryptSeconds = combinations / attackerBcryptHashRate;
const timeBcryptYears = timeBcryptSeconds / (365.25 * 24 * 3600);

console.log(`   - Attacker hardware: Dedicated cracking rig (8x NVIDIA RTX 4090 GPUs)`);
console.log(`   - Cracking SHA-256:  ${(timeShaSeconds / 60).toFixed(1)} minutes (TOTAL COLLAPSE)`);
console.log(`   - Cracking Bcrypt:   ${timeBcryptYears.toFixed(1)} YEARS (COMPUTATIONALLY INFEASIBLE)`);

console.log('\n================================================================================');
console.log('THE ASYMMETRIC INVERSION IN PLAIN WORDS:');
console.log('When a legitimate user logs in to Workn, the server computes exactly 1 hash,');
console.log(`which takes ${avgBcryptMs.toFixed(2)} ms—completely imperceptible to human response time.`);
console.log('When an attacker steals a database dump and tries billions of dictionary words,');
console.log('the same delay multiplies by billions. Slowing the algorithm costs the business');
console.log('nothing, but costs an attacker an entire lifetime of electricity and hardware.');
console.log('================================================================================');

