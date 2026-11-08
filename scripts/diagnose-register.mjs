import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nsrrxhgvstffctqkfgpe.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zcnJ4aGd2c3RmZmN0cWtmZ3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyOTUwNTIsImV4cCI6MjEwODg3MTA1Mn0.nD_P6iCvGOqZYeja4BeHeCwp8gOLayt-trxeCMvqhLE';

console.log('Testing Supabase Auth endpoint connectivity...');
console.log('Target URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const testEmail = `diag_${Date.now()}@workn.ng`;
  console.log('Attempting signUp with:', testEmail);

  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'WorknSecureMember2026!',
      options: {
        data: { full_name: 'Diagnostic Tester' },
      },
    });

    if (error) {
      console.log('❌ Supabase Auth returned error:');
      console.log('Message:', error.message);
      console.log('Status:', error.status);
      console.log('Cause:', error.cause);
      console.dir(error, { depth: 5 });
    } else {
      console.log('✅ Supabase Auth SUCCESS!');
      console.log('User ID:', data.user?.id);
    }
  } catch (err) {
    console.log('❌ Caught unhandled exception:');
    console.log('Message:', err.message);
    console.log('Stack:', err.stack);
  }
}

main().catch(console.error);
