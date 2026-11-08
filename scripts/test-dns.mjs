import dns from 'dns';

dns.lookup('nsrrxhgvstffctqkfgpe.supabase.co', { all: true }, (err, addresses) => {
  if (err) {
    console.error('DNS Lookup Error:', err);
  } else {
    console.log('DNS Lookup Addresses:', addresses);
  }
});

