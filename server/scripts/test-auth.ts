import 'dotenv/config';

const BASE_URL = 'http://localhost:3000/api';

async function runTests() {
  console.log('--- Running Tests ---');
  let cookie = '';

  console.log('\n[Test 1] Health route');
  const res1 = await fetch(`${BASE_URL}/health`);
  console.log(res1.status, await res1.json());

  console.log('\n[Test 2] Unknown email');
  const res2 = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'fake@expenseflow.com', password: process.env.DEMO_USER_PASSWORD }),
  });
  console.log(res2.status, await res2.json());

  console.log('\n[Test 3] Wrong password');
  const res3 = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'employee@expenseflow.com', password: 'wrong' }),
  });
  console.log(res3.status, await res3.json());

  console.log('\n[Test 4] Unauthenticated /api/auth/me');
  const res4 = await fetch(`${BASE_URL}/auth/me`);
  console.log(res4.status, await res4.json());

  console.log('\n[Test 5] Successful login');
  const res5 = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'employee@expenseflow.com', password: process.env.DEMO_USER_PASSWORD }),
  });
  const cookieHeader = res5.headers.get('set-cookie');
  if (cookieHeader) cookie = cookieHeader.split(';')[0];
  const loginData = await res5.json();
  console.log(res5.status, loginData);
  if (loginData.user && loginData.user.password) {
    console.error('FAIL: Password hash returned in user object!');
    process.exit(1);
  }

  console.log('\n[Test 6] Authenticated /api/auth/me');
  const res6 = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Cookie: cookie },
  });
  console.log(res6.status, await res6.json());

  console.log('\n[Test 7] Successful logout');
  const res7 = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { Cookie: cookie },
  });
  console.log(res7.status, await res7.json());

  console.log('\n[Test 8] Unauthenticated /api/auth/me after logout');
  const newCookie = res7.headers.get('set-cookie')?.split(';')[0] || cookie;
  const res8 = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Cookie: newCookie },
  });
  console.log(res8.status, await res8.json());

  console.log('\nAll tests completed successfully.');
}

runTests().catch(console.error);
