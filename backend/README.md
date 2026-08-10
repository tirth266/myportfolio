# Task Manager REST API

A production-quality REST API for task management built with Node.js, Express.js, and MongoDB (Mongoose).

- **Practical 4** — Express REST API with in-memory storage, middleware architecture
- **Practical 5** — MongoDB integration, Mongoose schema design, data persistence

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Environment Setup](#environment-setup)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Request & Response Format](#request--response-format)
- [Task Schema](#task-schema)
- [Mongoose Validation](#mongoose-validation)
- [Middleware](#middleware)
- [HTTP Status Codes](#http-status-codes)
- [CSV Activity Logging](#csv-activity-logging)
- [Postman Testing](#postman-testing)
- [MongoDB Persistence Test](#mongodb-persistence-test)

---

## Features

### Practical 4
- Complete CRUD operations for tasks
- Request validation and error handling
- Global logging middleware (console + CSV)
- JSON content-type validation (415 on wrong type)
- Task ID validation middleware
- Consistent response format `{ success, message, data }`
- RESTful API design (Richardson Maturity Level 2)
- Search by title, filter by status, sort, pagination

### Practical 5 (New)
- MongoDB database storage via Mongoose
- Persistent data — tasks survive server restarts
- Mongoose schema with validation
- `priority` field with enum validation (`low` | `medium` | `high`)
- Pre-save hook for automatic title trimming
- Structured Mongoose validation error responses
- Environment variables via `.env` (MongoDB URI never hardcoded)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB (Atlas or local) |
| ODM | Mongoose |
| Environment | dotenv |
| CORS | cors |
| Logging | Custom middleware (fs, path) |

---

## Folder Structure

```
backend/
├── server.js                  # Entry point — connects MongoDB, starts server
├── package.json
├── .env                       # Your MongoDB URI (DO NOT commit)
├── .env.example               # Template — safe to commit
├── .gitignore
├── README.md
├── MATURITY.md                # Richardson Maturity Model analysis
│
├── models/
│   └── Task.js                # Mongoose schema + pre-save hook  [Practical 5]
│
├── routes/
│   └── taskRoutes.js          # Route definitions
│
├── controllers/
│   └── taskController.js      # Business logic (MongoDB CRUD)    [Practical 5]
│
├── middleware/
│   ├── logger.js              # Console + CSV logging
│   ├── validateJson.js        # Content-Type validation
│   ├── validateTaskId.js      # ObjectId format validation       [Practical 5]
│   ├── errorHandler.js        # Global error handler             [Practical 5]
│   └── notFound.js            # 404 handler
│
├── data/
│   └── tasks.js               # LEGACY — Practical 4 in-memory store (not used)
│
├── utils/
│   └── response.js            # sendSuccess / sendError helpers
│
└── logs/
    └── activity.csv           # Auto-generated (gitignored)
```

---

## Environment Setup

### 1. Get a MongoDB URI

**Option A — MongoDB Atlas (recommended)**

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Sign up / log in
3. Create a free cluster (M0)
4. Under **Database Access**, create a database user
5. Under **Network Access**, allow your IP (or `0.0.0.0/0` for development)
6. Click **Connect** → **Drivers** → copy the connection string

**Option B — Local MongoDB**

```
mongodb://localhost:27017/taskmanager
```

### 2. Create `.env`

```bash
cp .env.example .env
```

Open `.env` and paste your connection string:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/taskmanager?retryWrites=true&w=majority
```

> **Never commit `.env` to git. It contains your credentials.**

---

## Running the Server

```bash
# Install dependencies
npm install

# Development (auto-reload)
npm run dev

# Production
npm start
```

Expected output:

```
MongoDB connected

╔════════════════════════════════════════╗
║   Task Manager REST API Server         ║
║   Running on http://localhost:3000     ║
╚════════════════════════════════════════╝
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks` | Get all tasks (filtering, sorting, pagination) |
| POST | `/tasks` | Create a new task |
| GET | `/tasks/:id` | Get a task by MongoDB ObjectId |
| PUT | `/tasks/:id` | Update a task (partial update) |
| DELETE | `/tasks/:id` | Delete a task |

### Query Parameters for GET /tasks

| Param | Example | Description |
|---|---|---|
| `title` | `?title=mongo` | Case-insensitive search |
| `completed` | `?completed=true` | Filter by status |
| `sort` | `?sort=oldest` | `newest` (default) or `oldest` |
| `page` | `?page=2` | Page number (default: 1) |
| `limit` | `?limit=5` | Items per page (default: 10, max: 100) |

---

## Request & Response Format

### Success

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "...",
    "title": "Learn MongoDB",
    "description": "Complete Practical 5",
    "completed": false,
    "priority": "high",
    "createdAt": "2026-08-10T15:30:00.000Z",
    "updatedAt": "2026-08-10T15:30:00.000Z"
  }
}
```

### Error

```json
{
  "success": false,
  "message": "Task not found"
}
```

### Validation Error (POST/PUT with bad data)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "title": "Title is required",
    "priority": "Priority must be 'low', 'medium', or 'high'"
  }
}
```

---

## Task Schema

Defined in `models/Task.js`:

```js
{
  title:       String,   required, auto-trimmed
  description: String,   optional, default: ""
  completed:   Boolean,  default: false
  priority:    String,   enum: ["low", "medium", "high"], default: "medium"
  createdAt:   Date,     auto-managed by Mongoose timestamps
  updatedAt:   Date,     auto-managed by Mongoose timestamps
}
```

### Pre-save Hook

The schema includes a Mongoose pre-save hook that automatically trims whitespace from the `title` field before every save. This applies to both create and update operations that use `.save()`.

```
Input:  "    Learn MongoDB    "
Stored: "Learn MongoDB"
```

---

## Mongoose Validation

Validation is handled at the **schema level** by Mongoose.

| Field | Rule |
|---|---|
| `title` | Required. Cannot be empty or missing. |
| `priority` | Must be `low`, `medium`, or `high` if provided. |

Validation errors are returned as clean, structured JSON (not raw Mongoose objects):

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "title": "Title is required"
  }
}
```

---

## Middleware

| File | Purpose | Practical |
|---|---|---|
| `logger.js` | Logs method, URL, status, duration to terminal + CSV | P4 |
| `validateJson.js` | Returns 415 if Content-Type is not application/json | P4 |
| `validateTaskId.js` | Returns 400 if `:id` is not a valid MongoDB ObjectId | P5 |
| `errorHandler.js` | Converts all errors to clean JSON (Mongoose aware) | P4+P5 |
| `notFound.js` | Returns 404 for undefined routes | P4 |

---

## HTTP Status Codes

| Code | Meaning | Example |
|---|---|---|
| 200 | OK | GET, PUT, DELETE success |
| 201 | Created | POST success |
| 400 | Bad Request | Invalid input, invalid ObjectId |
| 404 | Not Found | Task not found, route not found |
| 415 | Unsupported Media Type | Wrong Content-Type header |
| 500 | Internal Server Error | Unexpected errors |

---

## CSV Activity Logging

Every API request is logged to `logs/activity.csv`:

```
timestamp,action,method,url,status,details
2026-08-10 15:30:12,REQUEST,POST,/tasks,201,Task created
2026-08-10 15:31:04,REQUEST,GET,/tasks,200,Tasks fetched
2026-08-10 15:32:18,REQUEST,DELETE,/tasks/...,200,Task deleted
```

- File and directory are created automatically on first startup
- The `logs/` folder is in `.gitignore` — not committed to git
- Logs never contain MongoDB URI, passwords, or sensitive data

---

## Postman Testing

### 1. GET /tasks

```
GET http://localhost:3000/tasks
```

### 2. POST /tasks (valid)

```
POST http://localhost:3000/tasks
Content-Type: application/json

{
  "title": "Learn MongoDB",
  "description": "Complete Practical 5",
  "completed": false,
  "priority": "high"
}
```

### 3. POST without title (validation error)

```
POST http://localhost:3000/tasks
Content-Type: application/json

{}
```

Expected: `400` with `{ success: false, message: "Validation failed", errors: { title: "Title is required" } }`

### 4. POST with invalid priority

```
POST http://localhost:3000/tasks
Content-Type: application/json

{ "title": "Test", "priority": "urgent" }
```

Expected: `400` validation error

### 5. GET /tasks/:id

Copy an `_id` from a previous POST response and run:

```
GET http://localhost:3000/tasks/<_id>
```

### 6. GET non-existent ID

```
GET http://localhost:3000/tasks/000000000000000000000000
```

Expected: `404 Task not found`

### 7. GET invalid ObjectId

```
GET http://localhost:3000/tasks/abc
```

Expected: `400 Invalid task ID. Must be a valid MongoDB ObjectId.`

### 8. PUT /tasks/:id

```
PUT http://localhost:3000/tasks/<_id>
Content-Type: application/json

{ "completed": true, "priority": "low" }
```

### 9. DELETE /tasks/:id

```
DELETE http://localhost:3000/tasks/<_id>
```

### 10. Wrong Content-Type

```
POST http://localhost:3000/tasks
Content-Type: text/plain

anything
```

Expected: `415 Unsupported Media Type`

---

## MongoDB Persistence Test

1. Start server — confirm "MongoDB connected"
2. POST a new task — note the `_id`
3. GET the task by `_id` — confirm it appears
4. Stop the server (`Ctrl+C`)
5. Start the server again
6. GET the same task by `_id`
7. Task still exists — **MongoDB persistence confirmed** ✅

---

## Code Quality

- **Separation of Concerns** — routes, controllers, middleware, models
- **DRY** — response utilities (`sendSuccess`, `sendError`)
- **Validation** — Mongoose schema-level + middleware-level
- **Error Safety** — no stack traces or credentials exposed to clients
- **RESTful Design** — proper HTTP methods and status codes (Level 2)
- **Environment Safety** — MongoDB URI in `.env`, never in source code

---

**Version**: 2.0.0 (Practical 5 — MongoDB)
**Author**: Created for College Practical 4 & 5
**License**: ISC
