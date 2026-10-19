/**
 * Task Cache — Practical 9
 * Shared in-memory cache for read-heavy Task endpoints, built on node-cache.
 *
 * Design notes:
 *  - One shared NodeCache instance is created at module load. Because Node caches
 *    modules by resolved path, every `require("../cache/taskCache")` in this app
 *    receives the SAME instance, so hits/invalidations are visible process-wide.
 *  - stdTTL of 60s means every entry self-expires after one minute even if an
 *    invalidation path were ever missed. Invalidation is the primary mechanism;
 *    the TTL is the safety net.
 *  - The cache is process-local (in RAM). It is NOT shared between Node instances
 *    and does not survive a restart. See docs/practical-9-caching.md.
 *
 * Cache keys (stable, deterministic — never derived from Date.now() or a counter):
 *  - "all_tasks"      -> the full sorted task list returned by GET /tasks
 *  - "task_<id>"      -> one task document returned by GET /tasks/:id
 */

const NodeCache = require("node-cache");

const ALL_TASKS_KEY = "all_tasks";
const CACHE_TTL_SECONDS = 60;

// checkperiod (120s) controls how often expired keys are swept. It must be
// greater than stdTTL so an entry lives at least its full TTL even if the sweep
// is delayed, while still guaranteeing eventual removal of dead entries.
const taskCache = new NodeCache({
  stdTTL: CACHE_TTL_SECONDS,
  checkperiod: CACHE_TTL_SECONDS * 2,
  useClones: true,
});

// ── Cache statistics ──────────────────────────────────────────────────────────
// Hit/miss counters are tracked separately for the two caches so the debug
// endpoint can prove each one independently.
const stats = {
  allTasks: { hits: 0, misses: 0 },
  singleTask: { hits: 0, misses: 0 },
  invalidations: 0,
};

// ── Key builders ──────────────────────────────────────────────────────────────
const allTasksKey = () => ALL_TASKS_KEY;
const taskKey = (id) => `task_${id}`;

// ── GET /tasks cache ──────────────────────────────────────────────────────────
/**
 * Read the cached task list. Counts and returns a hit or a miss.
 * @returns {{hit: boolean, value: Array|null}}
 */
const getAllTasks = () => {
  const value = taskCache.get(allTasksKey());

  if (value === undefined) {
    stats.allTasks.misses += 1;
    return { hit: false, value: null };
  }

  stats.allTasks.hits += 1;
  return { hit: true, value };
};

/**
 * Store the task list for the next CACHE_TTL_SECONDS seconds.
 */
const setAllTasks = (tasks) => {
  taskCache.set(allTasksKey(), tasks, CACHE_TTL_SECONDS);
};

// ── GET /tasks/:id cache ──────────────────────────────────────────────────────
/**
 * Read a single cached task. Counts and returns a hit or a miss.
 * Negative results (task not found) are intentionally NOT cached, so a task
 * created after a 404 is immediately visible on the next request.
 * @returns {{hit: boolean, value: Object|null}}
 */
const getTask = (id) => {
  const value = taskCache.get(taskKey(id));

  if (value === undefined) {
    stats.singleTask.misses += 1;
    return { hit: false, value: null };
  }

  stats.singleTask.hits += 1;
  return { hit: true, value };
};

/**
 * Store one task document for the next CACHE_TTL_SECONDS seconds.
 */
const setTask = (id, task) => {
  taskCache.set(taskKey(id), task, CACHE_TTL_SECONDS);
};

// ── Invalidation ──────────────────────────────────────────────────────────────
/**
 * Drop the cached task list. MUST be called after every successful create,
 * update, or delete — otherwise GET /tasks would serve stale data for up to
 * 60 seconds.
 */
const invalidateAllTasks = () => {
  const existed = taskCache.get(allTasksKey()) !== undefined;
  taskCache.del(allTasksKey());

  if (existed) {
    stats.invalidations += 1;
  }

  return existed;
};

/**
 * Drop one cached task. MUST be called after a successful update or delete of
 * that specific id, otherwise GET /tasks/:id would serve a stale document.
 */
const invalidateTask = (id) => {
  const existed = taskCache.get(taskKey(id)) !== undefined;
  taskCache.del(taskKey(id));

  if (existed) {
    stats.invalidations += 1;
  }

  return existed;
};

/**
 * Drop the list and every individual task entry. Exposed for manual testing and
 * for future multi-process cache coordination. Not called on the hot path.
 */
const flushAll = () => {
  taskCache.flushAll();
};

// ── Statistics ────────────────────────────────────────────────────────────────
const buildRatio = (bucket) => {
  const total = bucket.hits + bucket.misses;
  return total === 0 ? 0 : Number(((bucket.hits / total) * 100).toFixed(2));
};

/**
 * Build the payload served by GET /tasks/cache/stats.
 */
const getStats = () => {
  const keys = taskCache.keys();
  const singleTaskKeys = keys.filter((key) => key.startsWith("task_"));

  return {
    ttlSeconds: CACHE_TTL_SECONDS,
    allTasksCache: {
      key: ALL_TASKS_KEY,
      hits: stats.allTasks.hits,
      misses: stats.allTasks.misses,
      hitRatePercent: buildRatio(stats.allTasks),
      currentlyCached: taskCache.get(allTasksKey()) !== undefined,
      cachedTaskCount: Array.isArray(taskCache.get(allTasksKey()))
        ? taskCache.get(allTasksKey()).length
        : 0,
    },
    singleTaskCache: {
      keyPattern: "task_<id>",
      hits: stats.singleTask.hits,
      misses: stats.singleTask.misses,
      hitRatePercent: buildRatio(stats.singleTask),
      currentlyCachedKeys: singleTaskKeys.length,
    },
    invalidations: {
      total: stats.invalidations,
    },
    cacheKeys: keys,
  };
};

/**
 * Reset hit/miss/invalidation counters. Exposed as POST /tasks/cache/reset so
 * measurements can start from a clean slate.
 */
const resetStats = () => {
  stats.allTasks = { hits: 0, misses: 0 };
  stats.singleTask = { hits: 0, misses: 0 };
  stats.invalidations = 0;
};

module.exports = {
  ALL_TASKS_KEY,
  CACHE_TTL_SECONDS,
  allTasksKey,
  taskKey,
  getAllTasks,
  setAllTasks,
  getTask,
  setTask,
  invalidateAllTasks,
  invalidateTask,
  flushAll,
  getStats,
  resetStats,
};
