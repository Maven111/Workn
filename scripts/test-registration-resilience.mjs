import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nsrrxhgvstffctqkfgpe.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zcnJ4aGd2c3RmZmN0cWtmZ3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyOTUwNTIsImV4cCI6MjEwODg3MTA1Mn0.nD_P6iCvGOqZYeja4BeHeCwp8gOLayt-trxeCMvqhLE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function signUpWithRetry(email, password, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Attempt ${attempt}] Calling supabase.auth.signUp for ${email}...`);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: 'Resilience Test' } },
      });

      if (error) {
        if (error.message.includes('fetch failed') || error.status === 0) {
          console.warn(`⚠️ Attempt ${attempt} failed with transient fetch error. Retrying in 1s...`);
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        return { error };
      }

      return { data };
    } catch (err) {
      console.warn(`⚠️ Attempt ${attempt} threw exception (${err.message}). Retrying...`);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return { error: new Error('Registration failed after 3 network retry attempts.') };
}

async function main() {
  console.log('Testing 3 sequential registrations with retry wrapper:');
  for (let i = 1; i <= 3; i++) {
    const email = `resilience_${Date.now()}_${i}@workn.ng`;
    const res = await signUpWithRetry(email, 'WorknSecureMember2026!');
    if (res.data?.user) {
      console.log(`✅ Success for ${email} (ID: ${res.data.user.id})`);
    } else {
      console.log(`❌ Failed for ${email}:`, res.error?.message);
    }
  }
}

main().catch(console.error);

