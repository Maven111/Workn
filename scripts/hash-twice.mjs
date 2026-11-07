import bcrypt from 'bcryptjs';

const password = 'WorknSecureMember2026!';
const saltRounds = 12;

console.log('Password to hash:', password);
console.log('Configured Salt Rounds (Cost Factor):', saltRounds);

const hash1 = bcrypt.hashSync(password, saltRounds);
const hash2 = bcrypt.hashSync(password, saltRounds);

console.log('\n--- HASH OUTPUT 1 ---');
console.log(hash1);

console.log('\n--- HASH OUTPUT 2 ---');
console.log(hash2);

console.log('\n--- WHY DO THEY DIFFER? ---');
console.log(
  'They differ because bcrypt generates a unique, cryptographically secure 128-bit (16-byte) random salt for each invocation, preventing rainbow table attacks and ensuring identical passwords produce completely distinct ciphertext hashes.'
);

// Verify that both hashes successfully validate against the original plaintext password
const valid1 = bcrypt.compareSync(password, hash1);
const valid2 = bcrypt.compareSync(password, hash2);
console.log('\nVerification check:');
console.log('Hash 1 matches original password:', valid1);
console.log('Hash 2 matches original password:', valid2);

