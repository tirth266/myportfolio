# My Portfolio — Full Stack MERN Application

[![CI/CD Pipeline](https://github.com/tirth266/myportfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/tirth266/myportfolio/actions/workflows/ci.yml)

A full-stack portfolio application with a React frontend, Express REST API, and MongoDB Atlas persistence.

## Practical Coverage

| Practical | Focus |
|-----------|-------|
| 1 | React component architecture with props |
| 2 | React Router, controlled inputs, state management |
| 3 | GitHub API integration and RepoCard component |
| 4 | Node.js + Express REST CRUD API |
| 5 | MongoDB + Mongoose ODM integration |
| 6 | Full-stack integration: React ↔ Express ↔ MongoDB |
| 7 | Authentication and Middleware Pipeline (JWT & Validation) |
| 8 | Performance Optimization & Profiling |
| 9 | In-Memory Caching with Node-Cache |
| 10 | Asynchronous Event-Driven Architecture (EventEmitter) |
| 11 | Containerization with Docker and Docker Compose |
| 12 | CI/CD Pipeline with GitHub Actions |
| **13** | **AI API Integration — Gemini-powered task description generation** |

---

## Architecture

```
Browser (React)          localhost:5173
    ↓ HTTP fetch / Axios
Express REST API         localhost:5000
    ↓ Mongoose
MongoDB Atlas            cloud
```

---

## Routes

| Path | Page |
|------|------|
| `/` | Home — Portfolio homepage |
| `/about` | About Me |
| `/skills` | Skills & technologies |
| `/projects` | Featured projects + GitHub repos |
| `/experience` | Work experience timeline |
| `/contact` | Contact form |
| `/tasks` | **Task Manager** (full-stack CRUD) |
| `*` | 404 Not Found |

---

## Prerequisites

- **Node.js** ≥ 14
- **npm**
- **MongoDB Atlas** account with a database cluster

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <repo-url>
cd Myportfolio
```

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/task_manager?retryWrites=true&w=majority
FRONTEND_ORIGIN=http://localhost:5173
```

> ⚠️ Never commit your real `MONGO_URI` to version control.

### 3. Configure Frontend Environment

```bash
cd frontend
cp .env.example .env
```

The default `frontend/.env` works out of the box:

```env
VITE_API_URL=http://localhost:5000
```

---

## Running the Application

### Terminal 1 — Backend

```bash
cd backend
npm install
npm start
```

Backend runs on: **http://localhost:5000**

### Terminal 2 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: **http://localhost:5173**

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Retrieve all tasks |
| GET | `/tasks/:id` | Retrieve task by MongoDB ObjectId |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Update an existing task |
| DELETE | `/tasks/:id` | Delete a task |

### Request/Response Format

**GET /tasks**
```json
{ "success": true, "tasks": [...] }
```

**POST /tasks** body:
```json
{ "title": "string", "description": "string", "completed": false, "priority": "medium" }
```

**POST /tasks** response:
```json
{ "success": true, "message": "Task created successfully", "task": { "_id": "...", ... } }
```

---

## Technologies

### Frontend
- **React 19** — UI framework
- **Vite** — Build tool
- **React Router v7** — Client-side routing
- **Tailwind CSS** — Styling
- **Framer Motion** — Animations
- **Axios** — HTTP client
- **SweetAlert2** — Notifications & confirmation dialogs

### Backend
- **Node.js + Express** — REST API server
- **Mongoose** — MongoDB ODM
- **MongoDB Atlas** — Cloud database
- **cors** — Cross-Origin Resource Sharing
- **dotenv** — Environment variable management

---

## Project Structure

```
Myportfolio/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Tasks.jsx        # Full-stack Task Manager (Practical 6)
│   │   │   ├── Projects.jsx
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── TaskCard.jsx     # Task display card
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── taskApi.js       # Centralized Axios API service
│   │   └── App.jsx
│   ├── .env                     # VITE_API_URL (not committed)
│   └── .env.example
├── backend/
│   ├── server.js                # Express app + MongoDB connection
│   ├── routes/taskRoutes.js
│   ├── controllers/taskController.js
│   ├── models/Task.js           # Mongoose schema
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   ├── validateJson.js
│   │   └── validateTaskId.js
│   ├── .env                     # MONGO_URI (not committed)
│   └── .env.example
└── README.md
```

---

## Security Notes

- `MONGO_URI` and database credentials are **backend-only** (`backend/.env`)
- The frontend only knows `VITE_API_URL=http://localhost:5000`
- Neither `.env` file is committed to version control
- MongoDB credentials are never exposed in API responses or frontend source

---

## Build

```bash
cd frontend
npm run build
```

Production output is written to `frontend/dist/`.

---

## Practical 12: CI/CD Pipeline with GitHub Actions

Automated Continuous Integration pipeline configured at [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

### Workflow Triggers
- **Push events** targeting the `main` branch.
- **Pull Request events** targeting the `main` branch.

### Automated Validation Stages
1. **Backend API Automated Tests (`backend-test`)**:
   - Checks out the repository and configures Node.js 20 with `npm` dependency caching based on `backend/package-lock.json`.
   - Executes `npm install` inside the `backend` directory.
   - Runs automated Jest & Supertest integration test suite (`npm test`) covering root health check (`GET /`), authentication guards (`GET /api/tasks`), cache monitoring (`GET /api/debug/cache-stats`), and 404 error middleware.
2. **Frontend Build & Validation (`frontend-build`)**:
   - Configures Node.js 20 with dependency caching based on `frontend/package-lock.json`.
   - Executes `npm install` inside the `frontend` directory.
   - Compiles the production SPA bundle with Vite (`npm run build`).

### Inspecting Workflow Runs
Workflow execution logs, step timings, and status badges can be viewed directly under the GitHub repository Actions tab:
- **GitHub Actions Dashboard**: [https://github.com/tirth266/myportfolio/actions](https://github.com/tirth266/myportfolio/actions)

---

## Practical 13: AI API Integration into a Web Application

AI-powered task description generation using the **Google Gemini API**, integrated securely via the backend.

### Feature Overview

- **Generate Description** button in the task creation form.
- Sends **only the task title** to the backend; the backend calls Gemini.
- Returns an editable description inserted into the description field.
- Displays a clear **AI-generated content disclaimer**.
- Graceful fallback if the API key is missing or the provider is unavailable.
- Task creation continues to work normally when AI is unavailable.

### AI Provider

| Property | Value |
|----------|-------|
| Provider | Google Gemini API |
| SDK | `@google/generative-ai` |
| Model | `gemini-1.5-flash` |
| Key location | `backend/.env` → `GEMINI_API_KEY` |
| Key exposure | **Backend only — never sent to browser** |

### Backend Endpoint

```
POST /api/ai/generate-description
Authorization: Bearer <JWT>
Content-Type: application/json

{ "title": "Prepare project presentation" }
```

**Success (200):**
```json
{
  "success": true,
  "description": "Prepare the presentation slides, organize project results, and review the material before the scheduled presentation.",
  "fallback": false,
  "disclaimer": "AI-generated suggestion: Review and edit this description before saving..."
}
```

**Graceful degradation (503):**
```json
{
  "success": false,
  "message": "AI description generation is not configured on this server. You can still enter a description manually.",
  "fallback": true
}
```

### Environment Variable Setup

```bash
# In backend/.env (NEVER commit this file)
GEMINI_API_KEY=your-gemini-api-key-here
```

Get a free key at: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

> ⚠️ The `GEMINI_API_KEY` must **never** be committed to Git, placed in frontend code, or exposed in browser requests.

### Security Measures

- API key read exclusively from `process.env.GEMINI_API_KEY` (backend only).
- Key is never logged, returned in responses, or accessible from the browser.
- Only the task title (minimum necessary data) is forwarded to Gemini.
- Per-title rate limit: 1 generation per normalized title per 60 seconds.
- 10-second provider timeout with `AbortController`.
- Provider errors are caught and returned as structured JSON; no stack traces.

### Testing the Feature

```bash
# Run all backend tests (no real API key required — Gemini SDK is mocked)
cd backend
npm test
```

Test suite covers: auth guard, empty/long/missing title validation, missing API key (503), mocked success (200), mocked provider failure (503), mocked invalid key (503).

```bash
# Run with a real key (optional — only if you have GEMINI_API_KEY configured)
cd backend
node -e "
const axios = require('axios');
// Start server first, then POST with a valid JWT
"
```

### Privacy and Responsible AI

- Only the task title is sent to the Gemini API — no credentials, user IDs, or private data.
- Users are informed via a visible disclaimer that their title is sent to an external provider.
- Generated content is editable; the user must explicitly review and submit.
- Do not enter confidential, personal, or sensitive information as a task title.
- Google's data handling policies apply: [https://ai.google.dev/gemini-api/terms](https://ai.google.dev/gemini-api/terms)

### Error Handling

| Scenario | HTTP Status | Behaviour |
|----------|-------------|-----------|
| No API key configured | 503 | Returns `fallback: true` with helpful message |
| Empty/missing title | 400 | Validation error before calling provider |
| Provider timeout (>10s) | 503 | AbortController cancels, returns safe message |
| Invalid API key | 503 | Caught, returns safe message without exposing key |
| Provider outage | 503 | Returns safe message, task form stays usable |
| Rate limit exceeded | 429 | Returns retry-after seconds |
