async function main() {
  const payload = 'fullName=A&email=attacker-bypass@example.com&phone=invalid-phone&password=spaces8&acceptTerms=false';
  
  console.log('Sending direct HTTP POST bypass attack to http://localhost:3000/api/auth/register...');
  console.log('Content-Type: application/x-www-form-urlencoded');
  console.log('Payload:', payload);

  try {
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: payload,
    });

    console.log(`\nHTTP Status: ${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log('Server Response Body:');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

main();

