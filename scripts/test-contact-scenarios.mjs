import assert from 'assert';
import http from 'http';
import app from '../server/index.js';
import { db } from '../server/db/index.js';
import * as emailModule from '../server/utils/email.js';
import { Resend } from 'resend';

let server;
let port;
let baseUrl;

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('Starting Contact Flow & Resend Verification Tests...\n');

  // Start server on an ephemeral port
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Test server running at ${baseUrl}`);

  // Configure environment variables for tests
  process.env.RESEND_API_KEY = 're_test_dummy_key_12345';
  process.env.CONTACT_NOTIFICATION_EMAIL = 'owner@example.com';
  process.env.RESEND_FROM_EMAIL = 'Portfolio <onboarding@resend.dev>';

  let lastSentEmail = null;
  let shouldSimulateResendError = false;

  // Intercept Emails.prototype.send for verification
  const dummyResend = new Resend('re_dummy_init');
  const emailsProto = Object.getPrototypeOf(dummyResend.emails);
  emailsProto.send = async (payload) => {
    lastSentEmail = payload;
    if (shouldSimulateResendError) {
      return { data: null, error: { message: 'Simulated Resend API failure' } };
    }
    return { data: { id: 'msg_resend_mock_id_999' }, error: null };
  };


  // --------------------------------------------------------------------------
  // TEST SCENARIO A: Valid submission
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO A: Valid Submission ---');
  lastSentEmail = null;
  shouldSimulateResendError = false;

  const validRes = await request('/api/contact', {
    method: 'POST',
    body: {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'I would like to discuss a project with you.',
    },
  });

  assert.strictEqual(validRes.status, 200, 'Scenario A should return 200 OK');
  assert.strictEqual(validRes.data.success, true, 'Scenario A response should have success: true');
  assert.ok(lastSentEmail, 'Scenario A should trigger Resend email notification');
  assert.strictEqual(lastSentEmail.subject, 'New Portfolio Contact — John Doe');
  assert.deepStrictEqual(lastSentEmail.to, ['owner@example.com']);
  assert.strictEqual(lastSentEmail.replyTo, 'john@example.com');
  assert.ok(lastSentEmail.text.includes('John Doe'));
  assert.ok(lastSentEmail.text.includes('john@example.com'));
  assert.ok(lastSentEmail.text.includes('I would like to discuss a project with you.'));
  assert.ok(lastSentEmail.html.includes('John Doe'));
  console.log('✓ Scenario A Passed: DB inserted, email dispatched with correct subject and payload, 200 returned.');

  // --------------------------------------------------------------------------
  // TEST SCENARIO B: Invalid submission
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO B: Invalid Submission ---');
  lastSentEmail = null;

  const invalidRes = await request('/api/contact', {
    method: 'POST',
    body: {
      name: '',
      email: 'invalid-email-address',
      message: '',
    },
  });

  assert.strictEqual(invalidRes.status, 400, 'Scenario B should return 400 Bad Request');
  assert.strictEqual(invalidRes.data.success, false);
  assert.strictEqual(lastSentEmail, null, 'Scenario B should NOT trigger email');
  console.log('✓ Scenario B Passed: Validation rejected bad input with 400, no email sent.');

  // --------------------------------------------------------------------------
  // TEST SCENARIO C: Database failure
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO C: Database Failure ---');
  lastSentEmail = null;

  const originalCreate = db.createContactMessage;
  db.createContactMessage = async () => {
    throw new Error('Simulated PostgreSQL connection timeout');
  };

  const dbFailRes = await request('/api/contact', {
    method: 'POST',
    body: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      message: 'Testing database failure scenario.',
    },
  });

  // Restore DB method
  db.createContactMessage = originalCreate;

  assert.strictEqual(dbFailRes.status, 500, 'Scenario C should return 500 Internal Error');
  assert.strictEqual(dbFailRes.data.success, false);
  assert.strictEqual(lastSentEmail, null, 'Scenario C should NOT trigger email when DB fails');
  console.log('✓ Scenario C Passed: Database failure returned 500 and email was aborted.');

  // --------------------------------------------------------------------------
  // TEST SCENARIO D: Resend failure after successful DB insert
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO D: Resend Failure After Successful DB Insert ---');
  lastSentEmail = null;
  shouldSimulateResendError = true;

  const resendFailRes = await request('/api/contact', {
    method: 'POST',
    body: {
      name: 'Bob Builder',
      email: 'bob@example.com',
      message: 'Testing Resend email failure resilience.',
    },
  });

  assert.strictEqual(resendFailRes.status, 200, 'Scenario D should still return 200 to visitor');
  assert.strictEqual(resendFailRes.data.success, true);
  assert.ok(lastSentEmail, 'Resend attempt was made');
  assert.ok(resendFailRes.data.data, 'Database record data is present');
  console.log('✓ Scenario D Passed: DB persisted, email failure handled gracefully without disrupting visitor.');

  // --------------------------------------------------------------------------
  // TEST SCENARIO E: Security & Injection Check (CRLF & XSS escaping)
  // --------------------------------------------------------------------------
  console.log('\n--- SCENARIO E: Security & Injection Check ---');
  lastSentEmail = null;
  shouldSimulateResendError = false;

  const injectionRes = await request('/api/contact', {
    method: 'POST',
    body: {
      name: 'Eve\r\nBcc: evil@attacker.com\r\nSubject: Spoofed',
      email: 'eve@example.com',
      message: 'Dangerous payload: <script>alert("pwned")</script> & <b>bold</b>',
    },
  });

  assert.strictEqual(injectionRes.status, 200);
  assert.ok(lastSentEmail);
  // Ensure subject contains no newlines or carriage returns
  assert.ok(!lastSentEmail.subject.includes('\r'), 'Subject must not contain CR');
  assert.ok(!lastSentEmail.subject.includes('\n'), 'Subject must not contain LF');
  assert.strictEqual(lastSentEmail.subject, 'New Portfolio Contact — Eve Bcc: evil@attacker.com Subject: Spoofed');
  // Ensure HTML body escapes script tags
  assert.ok(!lastSentEmail.html.includes('<script>'), 'HTML must escape script tag');
  assert.ok(lastSentEmail.html.includes('&lt;script&gt;alert(&quot;pwned&quot;)&lt;/script&gt;'), 'HTML must escape entities');
  console.log('✓ Scenario E Passed: Header injection eliminated, HTML entities escaped.');

  // --------------------------------------------------------------------------
  // HEALTH CHECK
  // --------------------------------------------------------------------------
  console.log('\n--- API HEALTH CHECK ---');
  const healthRes = await request('/api/health');
  assert.strictEqual(healthRes.status, 200);
  assert.strictEqual(healthRes.data.status, 'ok');
  console.log('✓ API Health Check Passed.');

  console.log('\n========================================');
  console.log('ALL VERIFICATION SCENARIOS PASSED (5/5)!');
  console.log('========================================');
}

runTests()
  .then(() => {
    if (server) {
      server.close(() => process.exit(0));
    } else {
      process.exit(0);
    }
  })
  .catch((err) => {
    console.error('Test failed with error:', err);
    if (server) {
      server.close(() => process.exit(1));
    } else {
      process.exit(1);
    }
  });

