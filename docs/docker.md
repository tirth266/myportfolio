# Practical 11: Containerization with Docker and Docker Compose

## 1. Overview
This document outlines the containerization setup for the **Myportfolio** full-stack application (React frontend, Node.js/Express backend, MongoDB database) using Docker and Docker Compose.

---

## 2. Docker Architecture

| Service | Base Image | Role | Port Mapping | Storage / Volume |
| :--- | :--- | :--- | :--- | :--- |
| **`mongo`** | `mongo:latest` | Database engine | `27017:27017` | `mongo-data` (`/data/db`) |
| **`backend`** | `node:18-alpine` | REST API Server | `5000:5000` | Ephemeral |
| **`frontend`** | `node:18-alpine` & `nginx:alpine` | Static SPA Build & Reverse Proxy | `80:80` | Ephemeral |

- **Network**: All 3 services communicate over an isolated bridge network named `portfolio-network`.
- **Service Discovery**: The backend connects to MongoDB using Docker DNS: `mongodb://mongo:27017/task_manager`.

---

## 3. Docker Image Sizes

Estimated and typical production image footprints:

| Repository / Image | Base OS | Layer Strategy | Expected Size |
| :--- | :--- | :--- | :--- |
| `myportfolio-frontend` | Alpine Linux | Multi-stage build (`node:18-alpine` -> `nginx:alpine`) | ~25 MB - 35 MB |
| `myportfolio-backend` | Alpine Linux | Single stage with `--omit=dev` production dependencies | ~180 MB - 220 MB |
| `mongo` | Ubuntu/Debian | Official MongoDB community image | ~700 MB - 800 MB |

*Note: The frontend multi-stage build discards the Node.js runtime and development build tools (Vite, Rollup, ESLint), keeping only the compiled static assets served by lightweight Nginx.*

---

## 4. Backend Healthcheck Configuration

Configured in `backend/Dockerfile` and `docker-compose.yml`:
```yaml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 10s
```

---

## 5. Data Persistence Verification
1. Data written to MongoDB is stored inside the named volume `mongo-data` mapped to `/data/db`.
2. Running `docker compose down` destroys running containers but preserves `mongo-data`.
3. Running `docker compose up` mounts the existing `mongo-data` volume, ensuring zero data loss across container lifecycles.
