// Normalisation & Trimming unit logic
function normaliseEmail(email) {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

function trimPassword(password) {
  if (typeof password !== 'string') return '';
  return password.trim();
}

console.log('================================================================================');
console.log('WORKN STEP 5: NORMALISATION & TRIMMING LOGIC CHECK');
console.log('================================================================================\n');

// 1. Email Normalisation Test
const dirtyEmail = '  Adebayo.Ogunlesi@WORKN.NG  ';
const cleanEmail = normaliseEmail(dirtyEmail);

console.log('1. Email Normalisation:');
console.log('   Input:  ', JSON.stringify(dirtyEmail));
console.log('   Output: ', JSON.stringify(cleanEmail));
console.log('   Check:   Passed (lowercase & trimmed):', cleanEmail === 'adebayo.ogunlesi@workn.ng');

// 2. Password Trimming Test
const dirtyPassword = '  WorknSecureMember2026!  ';
const cleanPassword = trimPassword(dirtyPassword);

console.log('\n2. Password Trimming:');
console.log('   Input:  ', JSON.stringify(dirtyPassword));
console.log('   Output: ', JSON.stringify(cleanPassword));
console.log('   Check:   Passed (whitespace trimmed, casing preserved):', cleanPassword === 'WorknSecureMember2026!');

console.log('\n================================================================================');
console.log('All normalisation and trimming checks verified.');
console.log('================================================================================');
