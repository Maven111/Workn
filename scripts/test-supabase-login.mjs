import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nsrrxhgvstffctqkfgpe.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zcnJ4aGd2c3RmZmN0cWtmZ3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyOTUwNTIsImV4cCI6MjEwODg3MTA1Mn0.nD_P6iCvGOqZYeja4BeHeCwp8gOLayt-trxeCMvqhLE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin(email, password) {
  console.log(`Testing login for ${email}...`);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error('Login failed:', error.message);
  } else {
    console.log('Login SUCCEEDED! User ID:', data.user?.id, 'Email:', data.user?.email);
  }
}

testLogin('abdussalamsalaudeen2018@gmail.com', 'WorknSecureMember2026!')
  .then(() => testLogin('abdussalamsalaudeen2021@gmail.com', 'WorknSecureMember2026!'))
  .catch(console.error);

