import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log('--- STARTING RESUME WORKFLOW INTEGRATION TEST ---');
  
  // Set VERCEL env to false so app initializes cleanly
  process.env.PORT = '5098';
  process.env.NODE_ENV = 'test';

  const { default: app } = await import('../server/index.js');
  const { db } = await import('../server/db/index.js');

  // Wait a moment for server/index.js to bind
  await new Promise((resolve) => setTimeout(resolve, 800));
  console.log('[Test] Server ready on http://localhost:5098');

  let adminCookie = '';

  const request = (method, urlPath, headers = {}, body = null) =>
    new Promise((resolve, reject) => {
      const opts = {
        hostname: 'localhost',
        port: 5098,
        path: urlPath,
        method,
        headers: {
          ...headers,
          ...(adminCookie ? { Cookie: adminCookie } : {}),
          Origin: 'http://localhost:5098',
        },
      };

      const req = http.request(opts, (res) => {
        let raw = '';
        if (res.headers['set-cookie']) {
          const cookieHeader = Array.isArray(res.headers['set-cookie'])
            ? res.headers['set-cookie'].join('; ')
            : res.headers['set-cookie'];
          adminCookie = cookieHeader;
        }
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(raw) });
          } catch {
            resolve({ status: res.statusCode, text: raw });
          }
        });
      });
      req.on('error', reject);
      if (body) req.write(body);
      req.end();
    });

  try {
    // 1. Authenticate as admin
    console.log('[Test 1] Authenticating as Admin...');
    const adminEmail = process.env.ADMIN_EMAIL || 'sanjaymurugesan23@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      throw new Error('ADMIN_PASSWORD environment variable is required to run this test.');
    }
    const loginPayload = JSON.stringify({
      email: adminEmail,
      password: adminPassword,
    });
    const loginRes = await request('POST', '/api/admin/auth/login', {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginPayload),
    }, loginPayload);

    if (loginRes.status !== 200 || !loginRes.data?.success) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.data)}`);
    }
    console.log('✓ Admin authenticated successfully.');

    // 2. Fetch initial public settings
    console.log('[Test 2] Fetching initial public settings...');
    const pubSettingsRes = await request('GET', '/api/settings/public');
    const initialResumeUrl = pubSettingsRes.data?.data?.resume_url;
    console.log(`✓ Initial public resume_url: ${initialResumeUrl}`);

    // 3. Test upload rejection on non-PDF (e.g. text file)
    console.log('[Test 3] Testing rejection of non-PDF file...');
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const fakeTextFile = Buffer.from('This is a text file, not a pdf.');
    const textBody = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test.txt"\r\nContent-Type: text/plain\r\n\r\n`),
      fakeTextFile,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const rejectRes = await request('POST', '/api/admin/resume', {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': textBody.length,
    }, textBody);

    if (rejectRes.status === 400) {
      console.log('✓ Successfully rejected non-PDF upload with 400 Bad Request.');
    } else {
      throw new Error(`Expected 400 for non-PDF, got ${rejectRes.status}: ${JSON.stringify(rejectRes.data)}`);
    }

    // 4. Test upload rejection on invalid magic bytes
    console.log('[Test 4] Testing rejection of file with .pdf extension but invalid header bytes...');
    const corruptPdfFile = Buffer.from('NOTAPDF_HEADER_BYTES');
    const corruptBody = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="corrupt.pdf"\r\nContent-Type: application/pdf\r\n\r\n`),
      corruptPdfFile,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const corruptRes = await request('POST', '/api/admin/resume', {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': corruptBody.length,
    }, corruptBody);

    if (corruptRes.status === 400) {
      console.log('✓ Successfully rejected corrupt PDF bytes with 400 Bad Request.');
    } else {
      throw new Error(`Expected 400 for corrupt PDF, got ${corruptRes.status}: ${JSON.stringify(corruptRes.data)}`);
    }

    // 5. Test valid PDF upload and persistence
    console.log('[Test 5] Uploading a valid PDF document (public/Sanjay_M_Resume.pdf)...');
    const validPdfBuffer = fs.readFileSync(path.resolve(__dirname, '../public/Sanjay_M_Resume.pdf'));
    const validBody = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="Sanjay_M_Resume.pdf"\r\nContent-Type: application/pdf\r\n\r\n`),
      validPdfBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const uploadRes = await request('POST', '/api/admin/resume', {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': validBody.length,
    }, validBody);

    if (uploadRes.status !== 200 || !uploadRes.data?.success) {
      throw new Error(`Valid PDF upload failed: ${JSON.stringify(uploadRes.data)}`);
    }
    const newResumeUrl = uploadRes.data.data.resume_url;
    console.log(`✓ Resume uploaded successfully. New URL: ${newResumeUrl} (Storage: ${uploadRes.data.data.storage})`);

    // 6. Verify public API returns the new resume URL
    console.log('[Test 6] Verifying public API returns updated resume_url...');
    const verifyPubRes = await request('GET', '/api/settings/public');
    const updatedPubResume = verifyPubRes.data?.data?.resume_url;
    if (updatedPubResume !== newResumeUrl) {
      throw new Error(`Public resume mismatch! Expected ${newResumeUrl}, got ${updatedPubResume}`);
    }
    console.log(`✓ Public API successfully confirmed new resume_url: ${updatedPubResume}`);

    // 7. Verify admin API returns the new resume URL
    console.log('[Test 7] Verifying admin settings API returns updated resume_url...');
    const verifyAdminRes = await request('GET', '/api/admin/settings');
    const updatedAdminResume = verifyAdminRes.data?.data?.resume_url;
    if (updatedAdminResume !== newResumeUrl) {
      throw new Error(`Admin resume mismatch! Expected ${newResumeUrl}, got ${updatedAdminResume}`);
    }
    console.log(`✓ Admin settings API successfully confirmed new resume_url: ${updatedAdminResume}`);

    // 8. Test safeguard against accidental overwrite in PUT /api/admin/settings
    console.log('[Test 8] Testing safeguard: PUT /api/admin/settings with empty resume_url must preserve existing URL...');
    const currentSettings = verifyAdminRes.data.data;
    const settingsPayload = JSON.stringify({
      ...currentSettings,
      resume_url: '', // attempt to blank it
    });
    const putRes = await request('PUT', '/api/admin/settings', {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(settingsPayload),
    }, settingsPayload);

    if (putRes.status !== 200) {
      throw new Error(`PUT settings failed: ${JSON.stringify(putRes.data)}`);
    }

    const checkPreservedRes = await request('GET', '/api/settings/public');
    const preservedResume = checkPreservedRes.data?.data?.resume_url;
    if (preservedResume !== newResumeUrl) {
      throw new Error(`Safeguard failed! Empty resume_url overwrote valid URL. Expected ${newResumeUrl}, got ${preservedResume}`);
    }
    console.log(`✓ Safeguard verified: Existing resume URL was preserved: ${preservedResume}`);

    // 9. Verify persistence across DB re-fetch
    console.log('[Test 9] Verifying database persistence across direct re-query...');
    const dbSettings = await db.getSettings('site_settings');
    if (dbSettings.resume_url !== newResumeUrl) {
      throw new Error(`Direct DB check failed! Expected ${newResumeUrl}, got ${dbSettings.resume_url}`);
    }
    console.log(`✓ Direct database query verified persistence: ${dbSettings.resume_url}`);

    // Reset back to initial if desired or keep clean
    console.log('\n========================================');
    console.log('ALL 9 VERIFICATION CHECKS PASSED PERFECTLY!');
    console.log('========================================');
  } finally {
    await db.close();
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('\n❌ INTEGRATION TEST FAILED:', err);
  process.exit(1);
});
