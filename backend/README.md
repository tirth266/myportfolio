# Task Manager REST API

A production-quality REST API for task management built with Node.js and Express.js. This project demonstrates professional backend development practices including proper middleware architecture, error handling, request validation, and RESTful design patterns.

## 📋 Table of Contents

- [Features](#features)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Request & Response Format](#request--response-format)
- [Middleware Explanation](#middleware-explanation)
- [HTTP Status Codes](#http-status-codes)
- [Testing with Postman](#testing-with-postman)
- [Query Parameters & Bonus Features](#query-parameters--bonus-features)
- [Future Improvements](#future-improvements)

## ✨ Features

- ✅ Complete CRUD operations for tasks
- ✅ Request validation and error handling
- ✅ Global logging middleware
- ✅ JSON content-type validation
- ✅ Task ID validation with proper error responses
- ✅ Consistent response format
- ✅ RESTful API design
- ✅ Search functionality (by title or completion status)
- ✅ Sorting (newest first, oldest first)
- ✅ Pagination support with metadata
- ✅ Production-ready error handling
- ✅ Clean separation of concerns (routes, controllers, middleware)

## 📂 Folder Structure

```
backend/
├── server.js                  # Main application server
├── package.json              # Project dependencies and scripts
├── .gitignore               # Git ignore rules
├── README.md                # This file
├── MATURITY.md              # Richardson Maturity Model evaluation
│
├── routes/
│   └── taskRoutes.js        # Route definitions
│
├── controllers/
│   └── taskController.js    # Business logic for all endpoints
│
├── middleware/
│   ├── logger.js            # Request logging middleware
│   ├── validateJson.js      # JSON content-type validation
│   ├── validateTaskId.js    # Task ID validation
│   ├── errorHandler.js      # Global error handling
│   └── notFound.js          # 404 handler
│
├── data/
│   └── tasks.js             # In-memory storage
│
└── utils/
    └── response.js          # Response utility functions
```

## 🚀 Installation

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

## 🎯 Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will run on `http://localhost:3000`

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Retrieve all tasks (supports filtering, sorting, pagination) |
| GET | `/tasks/:id` | Retrieve a single task by ID |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Update an existing task |
| DELETE | `/tasks/:id` | Delete a task |

## 📤 Request & Response Format

### Success Response

All successful requests return:

```json
{
  "success": true,
  "message": "Operation description",
  "data": {
    // Response data
  }
}
```

### Error Response

All error requests return:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Task Object

```json
{
  "id": 1,
  "title": "Learn Express",
  "description": "Complete the middleware practical",
  "completed": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

## 🔧 Middleware Explanation

### 1. Logger Middleware (`middleware/logger.js`)

Logs all incoming HTTP requests with:
- HTTP Method (GET, POST, PUT, DELETE)
- Request URL
- Response Time in milliseconds
- HTTP Status Code

**Example Output:**
```
GET /tasks | Status 200 | 2ms
POST /tasks | Status 201 | 5ms
```

### 2. JSON Validator Middleware (`middleware/validateJson.js`)

- Validates Content-Type header for POST and PUT requests
- Ensures all request bodies are JSON
- Returns `415 Unsupported Media Type` if validation fails

**When it triggers:** POST or PUT requests without `Content-Type: application/json`

### 3. Task ID Validator Middleware (`middleware/validateTaskId.js`)

- Validates task ID in URL parameters
- Ensures ID is a positive integer
- Returns `400 Bad Request` for invalid IDs

**When it triggers:** Requests to `/tasks/:id` with non-numeric or invalid ID values

### 4. Error Handler Middleware (`middleware/errorHandler.js`)

- Catches all thrown errors
- Returns consistent error responses
- Never exposes stack traces to clients
- Only shows full error details in development mode

### 5. Not Found Middleware (`middleware/notFound.js`)

- Handles requests to undefined routes
- Returns `404 Not Found` with a consistent error response
- Must be placed after all other route handlers

## 📊 HTTP Status Codes

| Status Code | Description | Usage |
|-------------|-------------|-------|
| 200 | OK | Successful GET, PUT, DELETE requests |
| 201 | Created | Successful POST request |
| 400 | Bad Request | Invalid input or ID format |
| 404 | Not Found | Task or route doesn't exist |
| 415 | Unsupported Media Type | Missing or incorrect Content-Type header |
| 500 | Internal Server Error | Server-side errors |

## 🧪 Testing with Postman

### 1. Create Task (POST)

```
Method: POST
URL: http://localhost:3000/tasks
Headers: Content-Type: application/json
Body (JSON):
{
  "title": "Complete Project",
  "description": "Finish the REST API",
  "completed": false
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 4,
    "title": "Complete Project",
    "description": "Finish the REST API",
    "completed": false,
    "createdAt": "2024-01-21T10:00:00.000Z",
    "updatedAt": "2024-01-21T10:00:00.000Z"
  }
}
```

### 2. Get All Tasks (GET)

```
Method: GET
URL: http://localhost:3000/tasks
```

### 3. Get Single Task (GET)

```
Method: GET
URL: http://localhost:3000/tasks/1
```

### 4. Update Task (PUT)

```
Method: PUT
URL: http://localhost:3000/tasks/1
Headers: Content-Type: application/json
Body (JSON):
{
  "completed": true,
  "title": "Updated Title"
}
```

### 5. Delete Task (DELETE)

```
Method: DELETE
URL: http://localhost:3000/tasks/1
```

### 6. Error Testing

Test JSON validation (should fail):
```
Method: POST
URL: http://localhost:3000/tasks
Headers: Content-Type: text/plain
Body: Any text
```

Expected: `415 Unsupported Media Type`

## 🔍 Query Parameters & Bonus Features

### Search by Completion Status

```
GET /tasks?completed=true
GET /tasks?completed=false
```

### Search by Title

```
GET /tasks?title=express
GET /tasks?title=learn
```

### Sorting

```
GET /tasks?sort=newest    # Newest tasks first
GET /tasks?sort=oldest    # Oldest tasks first
```

### Pagination

```
GET /tasks?page=1&limit=5     # Page 1, 5 items per page
GET /tasks?page=2&limit=10    # Page 2, 10 items per page
```

### Combined Query

```
GET /tasks?completed=false&title=learn&sort=newest&page=1&limit=5
```

**Response includes pagination metadata:**
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": {
    "tasks": [...],
    "pagination": {
      "currentPage": 1,
      "limit": 5,
      "totalCount": 12,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

## 🔮 Future Improvements

### Version 1.1
- [ ] Connect to a real database (MongoDB or PostgreSQL)
- [ ] Add user authentication and authorization
- [ ] Implement JWT token-based security
- [ ] Add task categories and tags
- [ ] Support for task priorities and due dates

### Version 1.2
- [ ] API rate limiting
- [ ] Request/response compression
- [ ] CORS support for frontend integration
- [ ] Input sanitization against XSS attacks
- [ ] API documentation with Swagger/OpenAPI

### Version 2.0
- [ ] Real-time updates with WebSockets
- [ ] Task reminders and notifications
- [ ] Collaborative task management
- [ ] Export tasks to CSV/PDF
- [ ] Task history and audit logs

## 📝 Code Quality

This project follows professional development practices:

- ✅ **Separation of Concerns**: Routes, controllers, and middleware are properly separated
- ✅ **DRY Principle**: Response utilities prevent code duplication
- ✅ **Error Handling**: Comprehensive error handling without exposing stack traces
- ✅ **Validation**: Input validation at middleware and controller levels
- ✅ **Comments**: Clear comments explaining complex logic
- ✅ **RESTful Design**: Proper use of HTTP methods and status codes

---

**Author**: Created as part of College Practical 4

**Version**: 1.0.0

**License**: ISC
