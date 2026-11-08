import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nsrrxhgvstffctqkfgpe.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zcnJ4aGd2c3RmZmN0cWtmZ3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyOTUwNTIsImV4cCI6MjEwODg3MTA1Mn0.nD_P6iCvGOqZYeja4BeHeCwp8gOLayt-trxeCMvqhLE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test(email, password) {
  console.log(`\nTesting: [${email}] with password [${password}]`);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.log(`❌ FAILED: ${error.message} (status: ${error.status})`);
  } else {
    console.log(`✅ SUCCESS! Authenticated as: ${data.user.email} (ID: ${data.user.id})`);
  }
}

async function main() {
  // Test the known password we set earlier
  await test('abdussalamsalaudeen2018@gmail.com', 'WorknSecureMember2026!');
  await test('abdussalamsalaudeen2021@gmail.com', 'WorknSecureMember2026!');
  
  // Test the accounts created yesterday
  await test('oladimejisola2020@gmail.com', 'WorknSecureMember2026!');
  await test('abdussalam0153@gmail.com', 'WorknSecureMember2026!');
}

main().catch(console.error);

