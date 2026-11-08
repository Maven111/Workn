import { validateVerificationCode } from '../src/lib/email/verification.js';

async function main() {
  const email = 'sabdussalam@x3mideas-ng.com';

  console.log('Testing validateVerificationCode:');

  // Test 1: Expired code (Evidence 20)
  const resExpired = await validateVerificationCode(email, '987123');
  console.log('1. Code 987123 (Expired):', resExpired);

  // Test 2: Wrong code (Evidence 21)
  const resWrong = await validateVerificationCode(email, '000000');
  console.log('2. Code 000000 (Wrong):', resWrong);

  // Test 3: Reused code (Evidence 22)
  const resReused = await validateVerificationCode(email, '555888');
  console.log('3. Code 555888 (Reused):', resReused);

  // Test 4: Valid active code
  const resValid = await validateVerificationCode(email, '915464');
  console.log('4. Code 915464 (Valid):', resValid);
}

main().catch(console.error);

