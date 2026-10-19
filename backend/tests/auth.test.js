const test = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';
process.env.RUN_TEST_SERVER = 'false';

const app = require('../server');

(async () => {
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });

  test('POST /auth/register creates a user and returns a token', async () => {
    const port = server.address().port;
    const response = await fetch(`http://127.0.0.1:${port}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Auth Tester',
        email: 'auth.tester@example.com',
        password: 'StrongPass123!'
      })
    });

    const payload = await response.json();
    assert.equal(response.status, 201);
    assert.equal(payload.success, true);
    assert.ok(payload.token);
    assert.equal(payload.user.email, 'auth.tester@example.com');
  });

  test('POST /auth/login returns auth for valid credentials', async () => {
    const port = server.address().port;
    const response = await fetch(`http://127.0.0.1:${port}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'auth.tester@example.com',
        password: 'StrongPass123!'
      })
    });

    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.success, true);
    assert.ok(payload.token);
  });

  test('POST /auth/google rejects empty credentials', async () => {
    const port = server.address().port;
    const response = await fetch(`http://127.0.0.1:${port}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: '' })
    });

    const payload = await response.json();
    assert.equal(response.status, 400);
    assert.equal(payload.success, false);
    assert.match(payload.message, /Google credential/i);
  });

  await new Promise((resolve) => {
    server.close(resolve);
  });
})();
