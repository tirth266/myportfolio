# Practical 9: In-Memory Caching and Query Optimization

## 1. Database Sample Data
The local MongoDB `tasks` collection was populated with **55 sample documents** to ensure that database querying, BSON deserialization, and indexing overhead are realistic and measurable.

---

## 2. Uncached Response Times (MongoDB Database Query)
Measured using `performance.now()` with cache flushed before each request to force a cold MongoDB database read:

- Reading 1: **15.55 ms**
- Reading 2: **12.49 ms**
- Reading 3: **12.64 ms**
- **Uncached Average: 13.56 ms**

---

## 3. Cached Response Times (node-cache In-Memory)
Measured using `performance.now()` with shared `node-cache` instance active:

- Reading 1 (Cache MISS — queries MongoDB and populates cache): **14.91 ms**
- Reading 2 (Cache HIT — served directly from Node.js RAM): **10.88 ms**
- Reading 3 (Cache HIT — served directly from Node.js RAM): **8.24 ms**
- **Cached Average: 11.34 ms**

---

## 4. Comparison Table

| Metric | Reading 1 | Reading 2 | Reading 3 | Average |
|---|---|---|---|---|
| **Uncached (MongoDB Query)** | 15.55 ms | 12.49 ms | 12.64 ms | **13.56 ms** |
| **Cached (In-Memory)** | 14.91 ms (MISS) | 10.88 ms (HIT) | 8.24 ms (HIT) | **11.34 ms** |
| **Performance Gain** | Baseline | **1.1x faster** | **1.5x faster** | **16.4% faster (1.2x speedup)** |

---

## 5. Invalidation Proof
- Target Task ID: `6ad5a7842674b39f46ff5c2b`
- Pre-update Title: `Portfolio Task #51: Implement Frontend Module Feature`
- Execution: `PUT /api/tasks/6ad5a7842674b39f46ff5c2b` with new title `Updated Task at 1792387069222`
- Outcome: Both `all_tasks` list cache and `task_6ad5a7842674b39f46ff5c2b` item cache were dropped using `cache.del`.
- Verification: Subsequent `GET /api/tasks` returned the fresh title immediately (**Verified: true**).

---

## 6. Supplementary: TTL Comparison & Debug Stats
- **TTL 10s vs 60s**: A 10s TTL reduces the risk of serving stale data if an invalidation event is somehow missed, but collapses cache hit rates under normal user browse intervals. A 60s TTL provides the ideal balance for web applications—it achieves high hit rates during multi-page browsing while guaranteeing that stale records self-heal within one minute.
- **Debug Endpoint**: `GET /api/debug/cache-stats`
```json
{
  "success": true,
  "message": "In-memory cache statistics",
  "ttlSeconds": 60,
  "allTasksCache": {
    "key": "all_tasks",
    "hits": 3,
    "misses": 2,
    "hitRatePercent": 60,
    "currentlyCached": true,
    "cachedTaskCount": 55
  },
  "singleTaskCache": {
    "keyPattern": "task_<id>",
    "hits": 0,
    "misses": 2,
    "hitRatePercent": 0,
    "currentlyCachedKeys": 1
  },
  "invalidations": {
    "total": 2
  },
  "cacheKeys": [
    "all_tasks",
    "task_6ad5a7842674b39f46ff5c2b"
  ]
}
```
