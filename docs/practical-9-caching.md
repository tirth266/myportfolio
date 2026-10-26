# Practical 9 — In-Memory Caching and Query Optimization

Applies to `Myportfolio/backend`. One dependency added: `node-cache@5.1.2`. No existing API response shape, status code, or authentication behaviour was removed.

---

## 1. Architecture and cache flow

The cache lives in a single module, `backend/cache/taskCache.js`, which exports one shared `NodeCache` instance. Node caches modules by resolved path, so the controller and every future caller receive the same instance — hits and invalidations are visible process-wide.

### `GET /tasks`

```
Request
  → requireAuth (JWT)            router.use(requireAuth) in routes/taskRoutes.js
  → cache check                  taskCache.getAllTasks()
      ├─ HIT  → log "Cache HIT" → respond with cached array   (no MongoDB query)
      └─ MISS → Task.find().sort({createdAt:-1}).lean()
                → taskCache.setAllTasks(tasks)
                → log "Cache MISS" → respond                  (and warm the cache)
```

### `GET /tasks/:id`

```
Request
  → requireAuth (JWT)
  → validateTaskId
  → cache check                  taskCache.getTask(id)
      ├─ HIT   → respond with cached document                 (no MongoDB query)
      └─ MISS  → Task.findById(id).lean()
                 ├─ not found → 404, NOT cached (negative caching avoided)
                 └─ found    → taskCache.setTask(id, task) → respond
```

Authentication runs **before** the cache check in both cases. `requireAuth` is mounted with `router.use()`, so it applies to every route in `taskRoutes.js` including the new debug endpoints. No cached data can ever be returned to an unauthenticated caller.

---

## 2. Cache module and TTL

`backend/cache/taskCache.js`:

```js
const taskCache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
  useClones: true,
});
```

| Option | Value | Why |
|---|---|---|
| `stdTTL` | `60` | Every entry self-expires after 60 seconds. This is the safety net, not the primary correctness mechanism. |
| `checkperiod` | `120` | Sweep interval for dead keys. Must exceed `stdTTL` so an entry is never dropped before serving its full TTL. |
| `useClones` | `true` | `get()` returns a deep clone. A request handler that mutated the array or document cannot corrupt what the next caller receives. |

TTL is exported as `CACHE_TTL_SECONDS` and echoed by the stats endpoint as `ttlSeconds`.

---

## 3. Cache keys

Keys are stable, deterministic strings — never derived from `Date.now()`, a counter, or a random value, so the same logical data always lands on the same key.

| Key | Populated by | Invalidated by |
|---|---|---|
| `all_tasks` | `GET /tasks` (on MISS) | `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id` |
| `task_<id>` | `GET /tasks/:id` (on MISS) | `PUT /tasks/:id`, `DELETE /tasks/:id` |

Key builders are exported as `allTasksKey()` and `taskKey(id)` and are asserted in `tests/cache.test.js`.

---

## 4. Invalidation logic

Invalidation happens **after** the database write succeeds and **before** the response is sent. A failed write (400 validation, 404 not found, 500 error) invalidates nothing, because the database did not change.

| Operation | Cache calls | Rationale |
|---|---|---|
| `POST /tasks` | `invalidateAllTasks()` | The list gained an entry. |
| `PUT /tasks/:id` | `invalidateAllTasks()`, `invalidateTask(id)` | The task's contents changed **and** it appears in the list. |
| `DELETE /tasks/:id` | `invalidateAllTasks()`, `invalidateTask(id)` | The task disappeared from both the list and its own key. |

One cache module, one invalidation rule: **any successful write to a task invalidates that task's entry and the list entry.** A new task id cannot already be cached, so `POST` does not need `invalidateTask`.

### Why invalidation is mandatory

The cache has no awareness of MongoDB. If `PUT /tasks/:id` succeeded but did not invalidate, the next `GET /tasks/:id` would return the *old* document and the next `GET /tasks` would return a stale list — for up to 60 seconds. The user would edit a task, see the success message, and watch their change vanish on refresh. Invalidation is what makes the cache transparent; the TTL is only the backstop for the case where an invalidation path is ever missed. This behaviour is covered by tests in `tests/cache.test.js` ("the new task must be visible immediately after create", "update must be visible immediately in the list").

### Why `node-cache` is process-local

`node-cache` is an in-process `Map` with timers. It has three consequences worth stating plainly:

1. **Not shared across processes.** With two Node instances behind a load balancer, a write handled by instance A invalidates only A's cache. Instance B keeps serving stale data until its TTL expires. Fixing this properly requires a shared store (Redis) or a pub/sub invalidation channel — out of scope here.
2. **Not persisted.** A restart empties the cache. This is a cold start, not a bug; the next `GET` repopulates it.
3. **Lost on a hard crash**, same as above.

For a single-process deployment this is the simplest correct option. It was chosen over Redis precisely because it needs no extra infrastructure for the current topology.

### TTL trade-offs

| TTL | Effect |
|---|---|
| Very short (1–5s) | Lower staleness risk, but hit rate collapses because most page loads take longer than the TTL. |
| **60s (chosen)** | Long enough that a typical burst of navigation or refreshes hits the cache; short enough that a missed invalidation self-heals within a minute. |
| Very long (1h+) | Maximum hit rate, but a missed invalidation means users see stale data for an hour. |

60s bounds the worst case while keeping the hit rate useful for interactive use.

---

## 5. Cache hit/miss statistics

Counters are tracked **separately** for the two caches so each can be proven independently:

```js
stats = {
  allTasks:   { hits: 0, misses: 0 },
  singleTask: { hits: 0, misses: 0 },
  invalidations: 0,
}
```

`getAllTasks()` / `getTask()` increment the matching counter on every lookup. `invalidateAllTasks()` / `invalidateTask()` increment `invalidations` only when the key was actually present, so the number reflects real cache drops rather than no-op deletes.

### `GET /tasks/cache/stats`

```json
{
  "success": true,
  "cache": {
    "ttlSeconds": 60,
    "allTasksCache": {
      "key": "all_tasks",
      "hits": 2,
      "misses": 2,
      "hitRatePercent": 50,
      "currentlyCached": false,
      "cachedTaskCount": 0
    },
    "singleTaskCache": {
      "keyPattern": "task_<id>",
      "hits": 1,
      "misses": 3,
      "hitRatePercent": 25,
      "currentlyCachedKeys": 0
    },
    "invalidations": { "total": 4 },
    "cacheKeys": []
  }
}
```

The above is **real output** captured from a live run, not an illustration.

### `POST /tasks/cache/reset`

Flushes the cache and zeroes the counters, so a timed measurement starts from a known state.

### Route ordering — no conflict with `/tasks/:id`

In `routes/taskRoutes.js` the literal routes are declared **before** the parameterised ones:

```js
router.get("/", taskController.getAllTasks);
router.get("/cache/stats", taskController.getCacheStats);   // ← declared first
router.post("/cache/reset", taskController.resetCacheStats);
router.get("/:id", validateTaskId, taskController.getTaskById);
```

Express matches in declaration order, so `/tasks/cache/stats` is handled by the stats handler. Had `/:id` come first, Express would have matched `/cache` as an id and `validateTaskId` would have returned `400 Invalid task ID`. Both debug endpoints are also covered by `requireAuth` because it is mounted with `router.use()` above them.

---

## 6. Query optimizations

All changes are read-path only. No write query, validation rule, or response field was altered.

### 6.1 `.lean()` on read queries

```js
// GET /tasks
Task.find().sort({ createdAt: -1 }).lean()
// GET /tasks/:id
Task.findById(id).lean()
// PUT /tasks/:id
Task.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean()
// DELETE /tasks/:id
Task.findByIdAndDelete(id).lean()
```

By default Mongoose returns hydrated **document** instances: it builds a schema-aware object per task, attaches getters, methods, and change-tracking state. These results are only ever passed to `res.json()` and never saved or passed to a document method, so all of that work is discarded. `.lean()` returns plain JavaScript objects and skips it.

Two follow-on benefits: the plain objects are directly cacheable (no Mongoose internals retained in RAM), and they serialise faster. `runValidators: true` is preserved on the update, so schema validation is unchanged. `Task.create()` was deliberately **not** changed — it needs a document to run the `pre("save")` title-trimming hook.

Verified compatible: the frontend reads `_id`, `title`, `description`, `completed`, `priority`, `createdAt`. All are returned by `.lean()` exactly as before, and `createdAt`/`updatedAt` remain real `Date` values that serialise to the same ISO strings. An end-to-end check confirmed the cached payload is byte-identical to the uncached payload.

### 6.2 Index supporting the `GET /tasks` sort

```js
// models/Task.js
taskSchema.index({ createdAt: -1 });
```

`GET /tasks` sorts by `createdAt: -1`. `timestamps: true` creates the field but no index, so MongoDB was doing a collection scan plus an in-memory sort on every uncached request. The index lets the sort be served directly. This is the only schema change and it adds no behaviour.

### 6.3 Projection + `.lean()` in the auth lookup

```js
// middleware/authMiddleware.js — runs on EVERY authenticated request
const user = await User.findById(decoded.userId)
  .select("name email provider")
  .lean();
```

`requireAuth` reads only `id`, `email`, `name`, and `provider` to build `req.user`. Previously it fetched the whole document (including the `googleId` field) and hydrated a Mongoose document that is only read, never saved. Projecting to the four fields actually used and skipping hydration removes per-request overhead from the hot path that every protected call passes through. All 401 paths (missing header, bad token, user not found) are untouched.

---

## 7. What was NOT changed

- No response field was removed. `GET /tasks` and `GET /tasks/:id` gained one **additive** boolean, `cached`, which is `true` on a HIT and `false` on a MISS. The React frontend reads `response.data.tasks`, `response.data.task`, and `response.data.message`; all unchanged. It simply ignores the extra key.
- No route, status code, or validation message was altered.
- `requireAuth` is unchanged in behaviour — the Practical 7 JWT flow is fully intact.
- No Redis, no new service, no config value was introduced.

---

## 8. Performance testing instructions

No response times are reported in this document because **no Postman/Thunder Client timing run was performed**. Fill in section 9 from your own measurements.

Start the server:

```bash
cd Myportfolio/backend
npm start          # or: npm run dev
```

Log in (or register) and copy the `token` from the response. In Postman set an environment variable `token`, and add `Authorization: Bearer {{token}}` to the collection's Authorization tab so every request inherits it.

Then run, in order:

| # | Request | What to observe |
|---|---|---|
| 1 | `POST /tasks/cache/reset` | `"Cache flushed and statistics reset"` — clean slate |
| 2 | `GET /tasks` | Response body `cached: false`. Note Postman's **Time** field → this is the MISS (MongoDB) time |
| 3 | `GET /tasks` | `cached: true`. Note Time → this is the HIT time |
| 4 | `GET /tasks` (×5 more) | `cached: true`. Note Time → steady-state HIT |
| 5 | `GET /tasks/cache/stats` | `allTasksCache.hits: 6`, `misses: 1`, `hitRatePercent: 85.71` |
| 6 | `GET /tasks/<id>` twice | First `cached: false`, second `cached: true` |
| 7 | `GET /tasks/cache/stats` | `singleTaskCache.hits: 1`, `misses: 1` |
| 8 | `POST /tasks` | `201`. Then `GET /tasks` → `cached: false`, and the new task is present |
| 9 | `PUT /tasks/<id>` | `200`. Then `GET /tasks/<id>` → `cached: false` and the new title is returned |
| 10 | `DELETE /tasks/<id>` | `200`. Then `GET /tasks/<id>` → `404`, `GET /tasks` → `cached: false` |
| 11 | `GET /tasks/cache/stats` | `invalidations.total` increased by 4 |
| 12 | `GET /tasks` with no token | `401 Authentication required.` |
| 13 | `GET /tasks` with `Authorization: Bearer garbage` | `401 Invalid or expired token.` |
| 14 | `GET /tasks/cache/stats` with no token | `401` — the debug endpoint is protected too |

To exercise the TTL itself, request `GET /tasks` twice (warm), wait **more than 60 seconds**, then request again: `cached` must be `false` again.

Automated equivalent — no Postman needed:

```bash
cd Myportfolio/backend
node tests/cache.test.js
```

### Evidence worth capturing for submission

1. Screenshot of `GET /tasks` #2 showing `cached: true` alongside a visibly lower Time than #2's MISS.
2. Screenshot of `GET /tasks/cache/stats` showing non-zero `hits`, `misses`, `hitRatePercent`, and `invalidations.total`.
3. Screenshot pair: `POST /tasks` → immediate `GET /tasks` returning `cached: false` with the new task in the list.
4. Screenshot pair: `PUT /tasks/:id` → immediate `GET /tasks/:id` returning `cached: false` with the updated title.
5. Screenshot of the 401 responses with no/bad token.
6. The `logs/activity.csv` rows showing `Cache HIT` / `Cache MISS` / `(cache invalidated)` in the `details` column — this is timestamped proof from the server itself.

---

## 9. Before / after response times

**TBD — not measured.** No Postman or Thunder Client timing run was performed while implementing this practical, so no numbers are recorded here. Populate this table from your own runs using the sequence in section 8. Do not leave the placeholder values in a submitted report.

| Scenario | Before caching (ms) | After — MISS (ms) | After — HIT (ms) |
|---|---|---|---|
| `GET /tasks` (cold, first call) | _TBD_ | _TBD_ | n/a |
| `GET /tasks` (warm, repeat call) | _TBD_ | n/a | _TBD_ |
| `GET /tasks/:id` (cold) | _TBD_ | _TBD_ | n/a |
| `GET /tasks/:id` (warm) | _TBD_ | n/a | _TBD_ |

Cache effectiveness is already measured objectively and needs no timing:

| Metric | Value |
|---|---|
| `allTasksCache.hitRatePercent` after 1 MISS + 6 HITs | _run and record_ |
| `singleTaskCache.hitRatePercent` after 1 MISS + 1 HIT | _run and record_ |
| `invalidations.total` after POST + PUT + DELETE | _run and record_ |

---

## 10. Verification performed

| Check | Result |
|---|---|
| `node --check` on all 14 backend source files | all pass |
| `node tests/cache.test.js` (real Express app + real MongoDB) | **13/13 pass** |
| Server boots, connects to MongoDB | pass |
| `GET /tasks` 1st call | `200`, `cached: false` |
| `GET /tasks` 2nd and 3rd calls | `200`, `cached: true` |
| Cached payload identical to uncached payload | pass (byte-identical JSON) |
| `POST /tasks` then `GET /tasks` | `cached: false`, new task present immediately |
| `GET /tasks/:id` 1st / 2nd call | `cached: false` / `cached: true` |
| `PUT /tasks/:id` then `GET /tasks/:id` | `cached: false`, updated title returned |
| `DELETE /tasks/:id` then `GET /tasks/:id` | `404`, not served from cache |
| `GET /tasks/cache/stats` | returns both counters and invalidations |
| `GET /tasks` no token / bad token | `401` / `401` (Practical 7 intact) |
| `GET /tasks/cache/stats` no token | `401` (debug route protected) |
| 400 on empty title, 400 on bad ObjectId, 400 on wrong Content-Type | unchanged |

### Pre-existing issues found (not introduced by Practical 9, not fixed)

1. **`tests/auth.test.js` cannot run.** It calls `test()` without awaiting, so the IIFE reaches `server.close()` before the deferred test bodies execute; `server.address()` is then `null`. It also never connects Mongoose, so queries buffer and time out after 10s. It fails 3/3 both before and after this practical. Left untouched because it belongs to Practical 7.
2. **`models/User.js` blocks registering a second local user.** `googleId` is declared `{ unique: true, sparse: true, default: null }`. `sparse` skips *absent* fields but not explicit `null`s, so every local user stores `googleId: null` and the second insert fails with `E11000 duplicate key error … googleId_1`. `tests/cache.test.js` works around it by creating its user through the model with a unique `googleId`. The real fix is a partial index (`googleId: { type: String, default: undefined }` plus `index({ googleId: 1 }, { unique: true, partialFilterExpression: { googleId: { $type: 'string' } } })`), but that changes existing auth behaviour and was left out of scope.
3. **`npm audit` reports 4 pre-existing vulnerabilities** (3 moderate, 1 critical) in the existing dependency tree. Unrelated to this practical.
4. `backend/README.md` still documents only Practicals 4 and 5 and has no test script in `backend/package.json`; `tests/cache.test.js` is run directly with `node tests/cache.test.js`.

---

**Version**: Practical 9 — In-Memory Caching and Query Optimization
**License**: ISC
