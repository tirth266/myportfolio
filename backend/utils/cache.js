/**
 * Cache Utility — Practical 9: In-Memory Caching and Query Optimization
 * Shared in-memory cache instance built with node-cache (stdTTL: 60s).
 */

const NodeCache = require("node-cache");

// Default standard TTL of 60 seconds as specified in Practical 9
const cache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
  useClones: true,
});

// Cache performance statistics counters
const stats = {
  hits: 0,
  misses: 0,
  invalidations: 0,
};

module.exports = {
  cache,
  stats,
  get: (key) => {
    const val = cache.get(key);
    if (val === undefined) {
      stats.misses += 1;
      return null;
    }
    stats.hits += 1;
    return val;
  },
  set: (key, val, ttl = 60) => {
    return cache.set(key, val, ttl);
  },
  del: (key) => {
    const existed = cache.del(key);
    if (existed) stats.invalidations += 1;
    return existed;
  },
  flush: () => {
    cache.flushAll();
  },
  getStats: () => ({
    hits: stats.hits,
    misses: stats.misses,
    invalidations: stats.invalidations,
    keysCount: cache.keys().length,
    keys: cache.keys(),
    hitRate: stats.hits + stats.misses === 0
      ? 0
      : Number(((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(2)),
  }),
  resetStats: () => {
    stats.hits = 0;
    stats.misses = 0;
    stats.invalidations = 0;
  },
};
