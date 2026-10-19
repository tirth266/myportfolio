/**
 * Practical 9 — In-Memory Cache verification.
 *
 * Run:  node tests/cache.test.js
 *
 * Uses the real Express app + real MongoDB (same convention as auth.test.js).
 * The cache module and the server share one process, so hit/miss counters are
 * observable from here. Nothing here fabricates timings — this asserts cache
 * behaviour (HIT/MISS flags, invalidation, counters, auth), not latency.
 */

const test = require("node:test");
const assert = require("node:assert/strict");

process.env.NODE_ENV = "test";
process.env.RUN_TEST_SERVER = "false";

const app = require("../server");
const cache = require("../cache/taskCache");
const mongoose = require("mongoose");

const createdIds = [];
let token = null;
let baseUrl = null;

const api = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  return { status: response.status, body: await response.json() };
};

(async () => {
  // server.js skips startServer() under NODE_ENV=test, so this harness owns the
  // MongoDB connection itself.
  await mongoose.connect(process.env.MONGO_URI);

  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  // ── Setup: a real JWT for the requireAuth middleware ────────────────────────
  // The user is created through the Mongoose model rather than POST
  // /auth/register. models/User.js declares googleId as { unique: true, sparse:
  // true, default: null } — `sparse` skips absent fields but NOT explicit nulls,
  // so registering a second local user fails with E11000. That is a pre-existing
  // schema bug unrelated to caching; a unique googleId sidesteps it here.
  await test("setup: create a test user and mint a JWT", async () => {
    const stamp = Date.now();
    const email = `cache.tester.${stamp}@example.com`;

    const user = await mongoose.model("User").create({
      name: "Cache Tester",
      email,
      googleId: `cache-tester-${stamp}`,
      provider: "local",
    });

    token = require("../controllers/authController").createToken(user);
    assert.ok(token, "expected a JWT for the cache tests");
  });

  // ── Practical 7 auth behaviour must be untouched ───────────────────────────
  await test("GET /tasks without a token still returns 401", async () => {
    const response = await fetch(`${baseUrl}/tasks`);
    const payload = await response.json();

    assert.equal(response.status, 401);
    assert.equal(payload.success, false);
    assert.match(payload.message, /Authentication required/i);
  });

  await test("GET /tasks with an invalid token still returns 401", async () => {
    const response = await fetch(`${baseUrl}/tasks`, {
      headers: { Authorization: "Bearer not-a-real-token" },
    });

    assert.equal(response.status, 401);
  });

  await test("GET /tasks/cache/stats requires auth too", async () => {
    const response = await fetch(`${baseUrl}/tasks/cache/stats`);
    assert.equal(response.status, 401);
  });

  // ── GET /tasks caching ──────────────────────────────────────────────────────
  await test("GET /tasks: first request is a MISS, second is a HIT", async () => {
    await api("/tasks/cache/reset", { method: "POST" });

    const miss = await api("/tasks");
    assert.equal(miss.status, 200);
    assert.equal(miss.body.success, true);
    assert.equal(miss.body.cached, false, "cold read must report cached:false");

    const hit = await api("/tasks");
    assert.equal(hit.status, 200);
    assert.equal(hit.body.cached, true, "warm read must report cached:true");
    assert.equal(hit.body.tasks.length, miss.body.tasks.length);
    assert.deepEqual(
      hit.body.tasks.map((t) => t._id),
      miss.body.tasks.map((t) => t._id),
      "cached payload must match the uncached payload"
    );

    const stats = await api("/tasks/cache/stats");
    assert.equal(stats.status, 200);
    assert.equal(stats.body.cache.allTasksCache.hits, 1);
    assert.equal(stats.body.cache.allTasksCache.misses, 1);
    assert.equal(stats.body.cache.allTasksCache.key, "all_tasks");
    assert.equal(stats.body.cache.allTasksCache.currentlyCached, true);
    assert.equal(stats.body.cache.allTasksCache.hitRatePercent, 50);
  });

  // ── Supplementary A: single-task caching ───────────────────────────────────
  await test("GET /tasks/:id is cached separately under task_<id>", async () => {
    const created = await api("/tasks", {
      method: "POST",
      body: JSON.stringify({ title: "Cache test task", priority: "high" }),
    });
    assert.equal(created.status, 201);
    createdIds.push(created.body.task._id);

    const id = created.body.task._id;

    const miss = await api(`/tasks/${id}`);
    assert.equal(miss.status, 200);
    assert.equal(miss.body.cached, false, "cold single read must be a MISS");

    const hit = await api(`/tasks/${id}`);
    assert.equal(hit.status, 200);
    assert.equal(hit.body.cached, true, "warm single read must be a HIT");
    assert.equal(hit.body.task.title, "Cache test task");

    const stats = await api("/tasks/cache/stats");
    assert.equal(stats.body.cache.singleTaskCache.keyPattern, "task_<id>");
    assert.ok(stats.body.cache.singleTaskCache.hits >= 1);
    assert.ok(stats.body.cache.singleTaskCache.currentlyCachedKeys >= 1);
    assert.ok(
      stats.body.cache.cacheKeys.includes(`task_${id}`),
      "expected a stable task_<id> cache key"
    );

    // Reading one task must not satisfy the all-tasks cache, and vice versa.
    assert.equal(stats.body.cache.allTasksCache.key, "all_tasks");
  });

  await test("GET /tasks/:id with an unknown id returns 404 and is not cached", async () => {
    const missing = await api("/tasks/000000000000000000000000");
    assert.equal(missing.status, 404);
    assert.equal(missing.body.success, false);
  });

  // ── POST invalidates all_tasks ──────────────────────────────────────────────
  await test("POST /tasks invalidates the all_tasks cache", async () => {
    await api("/tasks");
    await api("/tasks");

    const before = await api("/tasks/cache/stats");
    assert.equal(before.body.cache.allTasksCache.currentlyCached, true);

    const created = await api("/tasks", {
      method: "POST",
      body: JSON.stringify({ title: "Invalidation probe" }),
    });
    assert.equal(created.status, 201);
    createdIds.push(created.body.task._id);

    const after = await api("/tasks/cache/stats");
    assert.equal(
      after.body.cache.allTasksCache.currentlyCached,
      false,
      "all_tasks must be dropped after a successful create"
    );

    const reread = await api("/tasks");
    assert.equal(reread.body.cached, false, "post-create read must re-query MongoDB");
    assert.ok(
      reread.body.tasks.some((t) => t.title === "Invalidation probe"),
      "the new task must be visible immediately after create"
    );
  });

  // ── PUT invalidates all_tasks + task_<id> ───────────────────────────────────
  await test("PUT /tasks/:id invalidates all_tasks and task_<id>", async () => {
    const id = createdIds[createdIds.length - 1];

    await api("/tasks");
    await api(`/tasks/${id}`);

    const before = await api("/tasks/cache/stats");
    assert.equal(before.body.cache.allTasksCache.currentlyCached, true);
    assert.ok(before.body.cache.cacheKeys.includes(`task_${id}`));

    const updated = await api(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify({ title: "Updated by cache test", completed: true }),
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.task.title, "Updated by cache test");

    const after = await api("/tasks/cache/stats");
    assert.equal(after.body.cache.allTasksCache.currentlyCached, false);
    assert.equal(
      after.body.cache.cacheKeys.includes(`task_${id}`),
      false,
      "task_<id> must be dropped after a successful update"
    );

    const single = await api(`/tasks/${id}`);
    assert.equal(single.body.cached, false);
    assert.equal(single.body.task.title, "Updated by cache test");

    const list = await api("/tasks");
    assert.equal(list.body.cached, false);
    assert.ok(
      list.body.tasks.some((t) => t.title === "Updated by cache test"),
      "update must be visible immediately in the list"
    );
  });

  // ── DELETE invalidates all_tasks + task_<id> ─────────────────────────────────
  await test("DELETE /tasks/:id invalidates all_tasks and task_<id>", async () => {
    const id = createdIds[createdIds.length - 1];

    await api("/tasks");
    await api(`/tasks/${id}`);

    const deleted = await api(`/tasks/${id}`, { method: "DELETE" });
    assert.equal(deleted.status, 200);
    assert.equal(deleted.body.success, true);

    const after = await api("/tasks/cache/stats");
    assert.equal(after.body.cache.allTasksCache.currentlyCached, false);
    assert.equal(after.body.cache.cacheKeys.includes(`task_${id}`), false);

    const gone = await api(`/tasks/${id}`);
    assert.equal(gone.status, 404, "a deleted task must 404, not resolve from cache");

    const list = await api("/tasks");
    assert.equal(list.body.cached, false);
    assert.equal(
      list.body.tasks.some((t) => t._id === id),
      false,
      "a deleted task must not appear in the list"
    );

    createdIds.pop();
  });

  // ── Existing error behaviour preserved ─────────────────────────────────────
  await test("validation and not-found behaviour is unchanged", async () => {
    const noTitle = await api("/tasks", { method: "POST", body: JSON.stringify({}) });
    assert.equal(noTitle.status, 400);

    const badId = await api("/tasks/abc");
    assert.equal(badId.status, 400);
    assert.equal(badId.body.error, "Invalid task ID");

    const noJson = await fetch(`${baseUrl}/tasks`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "text/plain" },
      body: "plain text",
    });
    assert.equal(noJson.status, 400);
    assert.equal((await noJson.json()).error, "Content-Type must be application/json");
  });

  await test("stats endpoint reports totals and invalidations", async () => {
    const stats = await api("/tasks/cache/stats");

    assert.equal(stats.body.cache.ttlSeconds, 60);
    assert.ok(stats.body.cache.allTasksCache.misses > 0);
    assert.ok(stats.body.cache.allTasksCache.hits > 0);
    assert.ok(stats.body.cache.singleTaskCache.misses > 0);
    assert.ok(stats.body.cache.invalidations.total > 0);
  });

  // ── Teardown: leave no test data behind ─────────────────────────────────────
  await test("teardown: remove any leftover test tasks", async () => {
    while (createdIds.length) {
      await api(`/tasks/${createdIds.pop()}`, { method: "DELETE" });
    }

    cache.flushAll();
  });

  await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
})();
