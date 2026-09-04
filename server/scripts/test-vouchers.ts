import 'dotenv/config';

const BASE_URL = 'http://localhost:3000/api';

async function login(email: string) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: process.env.DEMO_USER_PASSWORD }),
  });
  return res.headers.get('set-cookie')?.split(';')[0] || '';
}

async function runVoucherTests() {
  console.log('--- Voucher Tests ---');
  const empCookie = await login('employee@expenseflow.com');
  const dirCookie = await login('director@expenseflow.com');
  const accCookie = await login('accounts@expenseflow.com');

  console.log('1. Accounts cannot create');
  const createFail = await fetch(`${BASE_URL}/vouchers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: accCookie },
    body: JSON.stringify({ department: 'IT', expenseTitle: 'T', expenseCategory: 'C', expenseDate: new Date().toISOString(), amount: 100 })
  });
  if (createFail.status !== 403) throw new Error('Accounts created voucher unexpectedly');

  console.log('2. Employee creates DRAFT');
  const createRes = await fetch(`${BASE_URL}/vouchers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: empCookie },
    body: JSON.stringify({ department: 'IT', expenseTitle: 'Mouse', expenseCategory: 'Hardware', expenseDate: new Date().toISOString(), amount: 50.50 })
  });
  if (createRes.status !== 201) throw new Error('Employee failed to create voucher');
  const { voucher } = await createRes.json();
  const vid = voucher.id;

  console.log('3. Signature upload fails with invalid file');
  const invalidFormData = new FormData();
  invalidFormData.append('signature', new Blob(['fake image data'], { type: 'image/png' }), 'sig.png');
  const invalidSig = await fetch(`${BASE_URL}/vouchers/${vid}/employee-signature`, {
    method: 'POST',
    headers: { Cookie: empCookie },
    body: invalidFormData
  });
  if (invalidSig.status !== 400) throw new Error('Failed to reject invalid magic bytes');

  console.log('4. Signature upload succeeds with real PNG');
  const validPng = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);
  const validFormData = new FormData();
  validFormData.append('signature', new Blob([validPng], { type: 'image/png' }), 'sig.png');
  const validSig = await fetch(`${BASE_URL}/vouchers/${vid}/employee-signature`, {
    method: 'POST',
    headers: { Cookie: empCookie },
    body: validFormData
  });
  if (validSig.status !== 200) throw new Error('Failed to accept valid PNG');

  console.log('5. Employee submits voucher');
  const submitRes = await fetch(`${BASE_URL}/vouchers/${vid}/submit`, { method: 'POST', headers: { Cookie: empCookie } });
  if (submitRes.status !== 200) throw new Error('Failed to submit voucher');

  console.log('6. Employee cannot edit submitted voucher');
  const editRes = await fetch(`${BASE_URL}/vouchers/${vid}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: empCookie },
    body: JSON.stringify({ amount: 10 })
  });
  if (editRes.status !== 409) throw new Error('Allowed to edit submitted voucher');

  console.log('7. Director reject without reason fails');
  const rejectFail = await fetch(`${BASE_URL}/vouchers/${vid}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: dirCookie },
    body: JSON.stringify({ rejectionReason: '   ' }) // Whitespace fails Zod trim + min(1)
  });
  if (rejectFail.status !== 400) throw new Error('Allowed Director to reject without reason');

  console.log('8. Director rejects with reason');
  const rejectRes = await fetch(`${BASE_URL}/vouchers/${vid}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: dirCookie },
    body: JSON.stringify({ rejectionReason: 'Too expensive' })
  });
  if (rejectRes.status !== 200) throw new Error('Failed Director reject');

  console.log('9. Second draft for approval');
  const create2 = await fetch(`${BASE_URL}/vouchers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: empCookie },
    body: JSON.stringify({ department: 'IT', expenseTitle: 'Keyboard', expenseCategory: 'Hardware', expenseDate: new Date().toISOString(), amount: 80 })
  });
  const vid2 = (await create2.json()).voucher.id;

  const validFormData2 = new FormData();
  validFormData2.append('signature', new Blob([validPng], { type: 'image/png' }), 'sig.png');
  await fetch(`${BASE_URL}/vouchers/${vid2}/employee-signature`, { method: 'POST', headers: { Cookie: empCookie }, body: validFormData2 });
  await fetch(`${BASE_URL}/vouchers/${vid2}/submit`, { method: 'POST', headers: { Cookie: empCookie } });

  console.log('10. Director approves with signature');
  const dirFormData = new FormData();
  dirFormData.append('signature', new Blob([validPng], { type: 'image/png' }), 'dir_sig.png');
  const approveRes = await fetch(`${BASE_URL}/vouchers/${vid2}/approve`, {
    method: 'POST',
    headers: { Cookie: dirCookie },
    body: dirFormData
  });
  if (approveRes.status !== 200) throw new Error('Failed Director approve');

  console.log('11. Check dashboards');
  const empDash = await fetch(`${BASE_URL}/dashboard`, { headers: { Cookie: empCookie } });
  const dirDash = await fetch(`${BASE_URL}/dashboard`, { headers: { Cookie: dirCookie } });
  const accDash = await fetch(`${BASE_URL}/dashboard`, { headers: { Cookie: accCookie } });
  
  if (empDash.status !== 200 || dirDash.status !== 200 || accDash.status !== 200) {
    throw new Error('Dashboard fetching failed');
  }

  console.log('12. Signature retrieval');
  const sigRes = await fetch(`${BASE_URL}/vouchers/${vid2}/signatures/director`, { headers: { Cookie: empCookie } });
  if (sigRes.status !== 200) throw new Error('Failed to retrieve signature');
  const buf = await sigRes.arrayBuffer();
  if (buf.byteLength === 0) throw new Error('Signature stream is empty');

  console.log('All voucher tests passed successfully.');
}

runVoucherTests().catch(e => {
  console.error(e);
  process.exit(1);
});
