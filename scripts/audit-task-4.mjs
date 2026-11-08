import fs from 'fs';
import path from 'path';

const root = 'task-04-server-security';

const expectedDocs = [
  'README.md',
  'docs/schema.md',
  'docs/migrations.md',
  'docs/hashing.md',
  'docs/validation-placement.md',
  'docs/rate-limiting.md',
  'docs/breach-check.md',
  'docs/verification-design.md',
  'docs/email-copy.md',
  'docs/not-implemented.md',
  'docs/defects.md',
  'docs/interview-answers.md'
];

const expectedEvidence = [
  'evidence/01-schema-drawing.jpeg',
  'evidence/02-database-state-before.png',
  'evidence/03-initial-migration.txt',
  'evidence/04-required-column-failure.txt',
  'evidence/05-required-column-three-steps.txt',
  'evidence/06-drift-error.txt',
  'evidence/07-hash-twice-different.txt',
  'evidence/08-timing-argon-vs-sha.txt',
  'evidence/09-email-case-normalised.png',
  'evidence/10-password-trim-working.png',
  'evidence/11-validation-timing.txt',
  'evidence/12-direct-request-before-and-after.txt',
  'evidence/13-rate-limit-triggered.png',
  'evidence/14-rate-limit-defeated.txt',
  'evidence/15-breach-check-rejection.png',
  'evidence/16-smtp-failure.txt',
  'evidence/17-smtp-success.txt',
  'evidence/18-registration-timing-sync-vs-job.txt',
  'evidence/19-verification-row.png',
  'evidence/20-verification-expired.png',
  'evidence/21-verification-wrong-code.png',
  'evidence/22-verification-code-reused.png',
  'evidence/23-rendered-email.png'
];

console.log('='.repeat(80));
console.log('TASK 4 AUDIT: CHECKING ALL REQUIRED DELIVERABLES');
console.log('='.repeat(80));

let allPassed = true;

console.log('\n--- DOCUMENTATION (12 FILES) ---');
for (const f of expectedDocs) {
  const p = path.join(root, f);
  if (fs.existsSync(p)) {
    const size = fs.statSync(p).size;
    if (size > 0) {
      console.log(`✅ ${f.padEnd(35)} [${size} bytes]`);
    } else {
      console.log(`❌ ${f.padEnd(35)} [EMPTY FILE]`);
      allPassed = false;
    }
  } else {
    console.log(`❌ ${f.padEnd(35)} [MISSING]`);
    allPassed = false;
  }
}

console.log('\n--- EVIDENCE (23 FILES) ---');
for (const f of expectedEvidence) {
  const p = path.join(root, f);
  if (fs.existsSync(p)) {
    const size = fs.statSync(p).size;
    if (size > 0) {
      console.log(`✅ ${f.padEnd(45)} [${size} bytes]`);
    } else {
      console.log(`❌ ${f.padEnd(45)} [EMPTY FILE]`);
      allPassed = false;
    }
  } else {
    // Check if jpeg vs jpg
    if (f === 'evidence/01-schema-drawing.jpeg' && fs.existsSync(path.join(root, 'evidence/01-schema-drawing.jpg'))) {
      console.log(`✅ evidence/01-schema-drawing.jpg [${fs.statSync(path.join(root, 'evidence/01-schema-drawing.jpg')).size} bytes]`);
    } else {
      console.log(`❌ ${f.padEnd(45)} [MISSING]`);
      allPassed = false;
    }
  }
}

console.log('\n' + '='.repeat(80));
if (allPassed) {
  console.log('🎉 100% AUDIT PASS: ALL 35 REQUIRED TASK 4 DELIVERABLES EXIST AND ARE NON-EMPTY!');
} else {
  console.log('⚠️ AUDIT FAILED: Some deliverables are missing or empty.');
}
console.log('='.repeat(80));
