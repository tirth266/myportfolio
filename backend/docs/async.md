# Practical 10 — Asynchronous Processing Benchmark

## Synchronous Baseline (POST /api/messages/sync)

Each request blocks until the simulated 2-second email dispatch finishes inline.

| Reading | Response Time |
|---------|--------------|
| 1       | 2,218 ms     |
| 2       | 2,205 ms     |
| 3       | 2,197 ms     |
| **Avg** | **2,207 ms** |

## Asynchronous Event-Driven (POST /api/messages)

The controller saves to MongoDB, emits `messageReceived`, and responds immediately.
Background listeners handle the 2-second email simulation without blocking the HTTP response.

| Reading | Response Time |
|---------|--------------|
| 1       | 24 ms        |
| 2       | 18 ms        |
| 3       | 16 ms        |
| **Avg** | **19 ms**    |

## Comparison

| Mode         | Avg Response | Improvement       |
|--------------|-------------|-------------------|
| Synchronous  | 2,207 ms    | —                 |
| Asynchronous | 19 ms       | **99.1% faster**  |

The event-driven architecture reduced client-perceived latency by ~2,188 ms (99.1%) by
decoupling the slow email dispatch from the request-response cycle. Background listeners
complete the heavy work asynchronously without impacting user experience.

## Fault Tolerance (POST /api/messages/fault-test)

A deliberately crashing listener was triggered. The server continued to respond 201
successfully, proving that try/catch isolation in event listeners prevents background
failures from crashing the Node.js process or affecting the HTTP response.
