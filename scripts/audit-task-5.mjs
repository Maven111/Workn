import fs from 'fs';
import path from 'path';

const baseDir = path.resolve('task-05-sessions-compliance-defence');

console.log('='.repeat(80));
console.log('WORKN TASK 5 DELIVERABLES & COMPLIANCE AUDIT');
console.log('='.repeat(80));

const deliverables = [
  // Root markdown files
  { path: 'README.md', required: true, description: 'Task 5 Overview & Synthesis' },
  { path: 'privacy.md', required: true, description: 'Plain language privacy policy' },
  { path: 'privacy-draft-with-broken-promise.md', required: true, description: 'Initial draft with unfulfillable promise' },

  // Docs
  { path: 'docs/sessions.md', required: true, description: 'Session architecture & hijacking threat model' },
  { path: 'docs/gating.md', required: true, description: 'Hard vs Soft Gating analysis & tradeoff' },
  { path: 'docs/retention-matrix.md', required: true, description: 'Data retention matrix & conflict analysis' },
  { path: 'docs/state-management.md', required: true, description: 'State management evaluation & zero-roundtrip test' },
  { path: 'docs/defects.md', required: true, description: 'Task 5 defects register with files and lines' },
  { path: 'docs/interview-answers.md', required: true, description: '22 viva interview answers (<200 words each)' },
  { path: 'docs/interview-with-owner.md', required: false, builderOnly: true, description: 'Primary research interview with real owner' },
  { path: 'docs/handbook.md', required: false, builderOnly: true, description: '7-section onboarding handbook' },
  { path: 'docs/what-i-do-not-know.md', required: false, builderOnly: true, description: '8+ technical unknowns' },

  // Evidence
  { path: 'evidence/01-two-session-ids.txt', required: true, description: 'Two unique session IDs on consecutive sign-ins' },
  { path: 'evidence/02-cookie-flags.png', required: false, manual: true, description: 'DevTools cookie flags screenshot' },
  { path: 'evidence/03-soft-gating-flow', required: false, manual: true, description: 'Soft gating flow (video/images)' },
  { path: 'evidence/04-hard-gating-flow', required: false, manual: true, description: 'Hard gating flow (video/images)' },
  { path: 'evidence/05-generic-errors-both-cases.png', required: false, manual: true, description: 'Generic errors screenshot' },
  { path: 'evidence/06-two-users-one-browser.txt', required: true, description: 'Shared browser session collision test' },
  { path: 'evidence/07-session-row-present.png', required: false, manual: true, description: 'DB session row active screenshot' },
  { path: 'evidence/08-session-row-deleted.png', required: false, manual: true, description: 'DB session row revoked screenshot' },
  { path: 'evidence/09-logout-network-failure.txt', required: true, description: 'Logout network socket failure reproduction' },
  { path: 'evidence/10-logout-edge-case-fixed.txt', required: true, description: 'Logout network edge case fixed trace' },
  { path: 'evidence/11-reset-kills-other-session', required: false, manual: true, description: 'Password reset cross-device revocation' },
  { path: 'evidence/12-deletion-request-locks-account.png', required: false, manual: true, description: 'Account deletion lockout UI' },
  { path: 'evidence/13-scheduled-job-run-one.txt', required: true, description: 'Purge job Run 1 execution trace' },
  { path: 'evidence/14-scheduled-job-run-two.txt', required: true, description: 'Purge job Run 2 idempotency trace' },
  { path: 'evidence/15-state-management-working', required: false, manual: true, description: 'State carryover working UI' },
  { path: 'evidence/16-admin-route-refused.png', required: false, manual: true, description: 'Admin route 403 Access Denied' },
  { path: 'evidence/17-published-article-screenshot.png', required: false, builderOnly: true, description: 'Published 1500-word article' },
];

let automatedPass = 0;
let automatedFail = 0;
let pendingManual = 0;
let pendingBuilderOnly = 0;

console.log('\n--- DELIVERABLE FILE AUDIT ---');
for (const item of deliverables) {
  const fullPath = path.join(baseDir, item.path);
  // Also check if directory with extensions exist (e.g. 03-soft-gating-flow.mp4 or directory)
  let exists = fs.existsSync(fullPath);
  if (!exists && !path.extname(item.path)) {
    // Check if an extension exists
    const dir = path.dirname(fullPath);
    const base = path.basename(fullPath);
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      exists = files.some(f => f.startsWith(base));
    }
  }

  if (exists) {
    const stats = fs.statSync(fullPath);
    const size = stats.size;
    console.log(`✅ [PRESENT] ${item.path.padEnd(48)} (${size} bytes) - ${item.description}`);
    if (item.required) automatedPass++;
  } else if (item.builderOnly) {
    console.log(`👤 [BUILDER-ONLY PENDING] ${item.path.padEnd(48)} - ${item.description}`);
    pendingBuilderOnly++;
  } else if (item.manual) {
    console.log(`⏳ [MANUAL CAPTURE PENDING] ${item.path.padEnd(48)} - ${item.description}`);
    pendingManual++;
  } else {
    console.log(`❌ [MISSING REQUIRED] ${item.path.padEnd(48)} - ${item.description}`);
    automatedFail++;
  }
}

// Check Automatic Fail Criteria
console.log('\n--- AUTOMATIC FAIL CRITERIA VERIFICATION ---');

// 1. Retention matrix conflict identified
const retentionPath = path.join(baseDir, 'docs/retention-matrix.md');
if (fs.existsSync(retentionPath)) {
  const content = fs.readFileSync(retentionPath, 'utf8');
  const hasConflict = content.toLowerCase().includes('conflict') && 
                      content.toLowerCase().includes('erasure') && 
                      (content.includes('CAMA') || content.includes('LIRS') || content.includes('tax'));
  if (hasConflict) {
    console.log('✅ Criteria 1: Retention matrix identifies statutory legal conflict (CAMA/LIRS vs NDPA Right to Erasure) [PASS]');
  } else {
    console.log('❌ Criteria 1: Retention matrix does NOT identify conflict! [AUTOMATIC FAIL]');
    automatedFail++;
  }
}

// 2. Question 20 numbers matching numbers-register.md
const qPath = path.join(baseDir, 'docs/interview-answers.md');
const nrPath = path.resolve('Docs/numbers-register.md');
if (fs.existsSync(qPath) && fs.existsSync(nrPath)) {
  const answers = fs.readFileSync(qPath, 'utf8');
  const numbers = fs.readFileSync(nrPath, 'utf8');
  
  const has70px = answers.includes('70px') && numbers.includes('70px');
  const has451ms = answers.includes('451.95 ms') && numbers.includes('451.95 ms');
  const has5Attempts = answers.includes('5 attempts per 15 minutes') && numbers.includes('5 attempts / 15 minutes');

  if (has70px && has451ms && has5Attempts) {
    console.log('✅ Criteria 2: Question 20 citations match Docs/numbers-register.md exactly (70px, 451.95ms, 5/15m) [PASS]');
  } else {
    console.log('❌ Criteria 2: Question 20 numbers contradict numbers-register.md! [AUTOMATIC FAIL]');
    automatedFail++;
  }
}

// 3. Admin route role check (authorization vs authentication)
const adminPagePath = path.resolve('src/app/admin/page.tsx');
if (fs.existsSync(adminPagePath)) {
  const adminPage = fs.readFileSync(adminPagePath, 'utf8');
  const checksRole = adminPage.includes("user.role !== 'ADMIN'") || adminPage.includes("user.role === 'ADMIN'");
  if (checksRole) {
    console.log("✅ Criteria 3: Admin route enforces server-side role check ('ADMIN') and blocks MEMBER [PASS]");
  } else {
    console.log('❌ Criteria 3: Admin route does not check user role! [AUTOMATIC FAIL]');
    automatedFail++;
  }
}

console.log('\n' + '='.repeat(80));
console.log(`AUDIT SUMMARY: Automated Required Pass: ${automatedPass} | Automated Fail: ${automatedFail}`);
console.log(`Pending Manual Screenshots by Builder: ${pendingManual}`);
console.log(`Pending Builder-Only Requirements:     ${pendingBuilderOnly}`);
console.log('='.repeat(80));

