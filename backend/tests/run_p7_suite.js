process.env.NODE_ENV = "test";
process.env.RUN_TEST_SERVER = "false";
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const http = require("http");
const app = require("../server");
const User = require("../models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/task_manager";

async function runSuite() {
  console.log("================================================================================");
  console.log("  PRACTICAL 7: AUTHENTICATION AND MIDDLEWARE PIPELINE — TEST VERIFICATION SUITE ");
  console.log("================================================================================");
  console.log(`Connecting to MongoDB at: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);
  console.log("MongoDB connection verified.\n");

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5000, resolve));
  const baseUrl = "http://127.0.0.1:5000";
  console.log(`Backend server running at ${baseUrl}\n`);

  const results = [];
  const testUser = {
    name: "Tirth Patel",
    email: "p7student@charusat.edu.in",
    password: "Password123!",
  };

  // Clean previous test user
  await User.deleteOne({ email: testUser.email });

  let authToken = "";

  // Helper request
  async function apiCall(method, path, body = null, token = null) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    let data;
    try {
      data = await res.json();
    } catch (e) {
      data = { raw: await res.text() };
    }
    return { status: res.status, data };
  }

  // --- Scenario A: Register success (201) ---
  console.log("--------------------------------------------------------------------------------");
  console.log("Scenario A: Register success (POST /api/auth/register)");
  const resA = await apiCall("POST", "/api/auth/register", testUser);
  console.log(`Status: ${resA.status}`);
  console.log("Response:", JSON.stringify(resA.data, null, 2));
  authToken = resA.data.token || "";
  results.push({
    id: "a",
    name: "Register Success",
    endpoint: "POST /api/auth/register",
    request: JSON.stringify(testUser, null, 2),
    expectedStatus: 201,
    actualStatus: resA.status,
    response: resA.data,
    pass: resA.status === 201 && Boolean(resA.data.token),
  });

  // --- Scenario B: Register missing / invalid field (400) ---
  console.log("--------------------------------------------------------------------------------");
  console.log("Scenario B: Register validation failure (POST /api/auth/register)");
  const invalidUser = { name: "T", email: "invalid-email-format", password: "123" };
  const resB = await apiCall("POST", "/api/auth/register", invalidUser);
  console.log(`Status: ${resB.status}`);
  console.log("Response:", JSON.stringify(resB.data, null, 2));
  results.push({
    id: "b",
    name: "Register Validation Failure",
    endpoint: "POST /api/auth/register",
    request: JSON.stringify(invalidUser, null, 2),
    expectedStatus: 400,
    actualStatus: resB.status,
    response: resB.data,
    pass: resB.status === 400,
  });

  // --- Scenario C: Login success (200 with token) ---
  console.log("--------------------------------------------------------------------------------");
  console.log("Scenario C: Login success (POST /api/auth/login)");
  const loginBody = { email: testUser.email, password: testUser.password };
  const resC = await apiCall("POST", "/api/auth/login", loginBody);
  console.log(`Status: ${resC.status}`);
  console.log("Response:", JSON.stringify(resC.data, null, 2));
  if (resC.data.token) authToken = resC.data.token;
  results.push({
    id: "c",
    name: "Login Success",
    endpoint: "POST /api/auth/login",
    request: JSON.stringify(loginBody, null, 2),
    expectedStatus: 200,
    actualStatus: resC.status,
    response: resC.data,
    pass: resC.status === 200 && Boolean(resC.data.token),
  });

  // --- Scenario D: Login wrong password (401) ---
  console.log("--------------------------------------------------------------------------------");
  console.log("Scenario D: Login wrong password (POST /api/auth/login)");
  const wrongPassBody = { email: testUser.email, password: "IncorrectPassword999!" };
  const resD = await apiCall("POST", "/api/auth/login", wrongPassBody);
  console.log(`Status: ${resD.status}`);
  console.log("Response:", JSON.stringify(resD.data, null, 2));
  results.push({
    id: "d",
    name: "Login Wrong Password",
    endpoint: "POST /api/auth/login",
    request: JSON.stringify(wrongPassBody, null, 2),
    expectedStatus: 401,
    actualStatus: resD.status,
    response: resD.data,
    pass: resD.status === 401,
  });

  // --- Scenario E: Protected route with no token (401) ---
  console.log("--------------------------------------------------------------------------------");
  console.log("Scenario E: Protected route with no token (GET /api/tasks)");
  const resE = await apiCall("GET", "/api/tasks");
  console.log(`Status: ${resE.status}`);
  console.log("Response:", JSON.stringify(resE.data, null, 2));
  results.push({
    id: "e",
    name: "Protected Route Without Token",
    endpoint: "GET /api/tasks",
    request: "Headers: (none)",
    expectedStatus: 401,
    actualStatus: resE.status,
    response: resE.data,
    pass: resE.status === 401,
  });

  // --- Scenario F: Protected route with valid token (200) ---
  console.log("--------------------------------------------------------------------------------");
  console.log("Scenario F: Protected route with valid token (GET /api/tasks)");
  const resF = await apiCall("GET", "/api/tasks", null, authToken);
  console.log(`Status: ${resF.status}`);
  console.log("Response:", JSON.stringify(resF.data, null, 2));
  results.push({
    id: "f",
    name: "Protected Route With Valid Token",
    endpoint: "GET /api/tasks",
    request: `Authorization: Bearer ${authToken.slice(0, 24)}...`,
    expectedStatus: 200,
    actualStatus: resF.status,
    response: resF.data,
    pass: resF.status === 200,
  });

  // --- Scenario G: Protected route with tampered or expired token (401, no crash) ---
  console.log("--------------------------------------------------------------------------------");
  console.log("Scenario G: Protected route with tampered token (GET /api/tasks)");
  const tamperedToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.tamperedsignature999";
  const resG = await apiCall("GET", "/api/tasks", null, tamperedToken);
  console.log(`Status: ${resG.status}`);
  console.log("Response:", JSON.stringify(resG.data, null, 2));
  results.push({
    id: "g",
    name: "Protected Route With Tampered Token",
    endpoint: "GET /api/tasks",
    request: `Authorization: ${tamperedToken}`,
    expectedStatus: 401,
    actualStatus: resG.status,
    response: resG.data,
    pass: resG.status === 401,
  });

  // --- Scenario H: Validation failure on protected POST /api/tasks (400) ---
  console.log("--------------------------------------------------------------------------------");
  console.log("Scenario H: Validation failure on protected route (POST /api/tasks)");
  const invalidTask = { description: "Task with missing required title", priority: "high" };
  const resH = await apiCall("POST", "/api/tasks", invalidTask, authToken);
  console.log(`Status: ${resH.status}`);
  console.log("Response:", JSON.stringify(resH.data, null, 2));
  results.push({
    id: "h",
    name: "Task Validation Failure",
    endpoint: "POST /api/tasks",
    request: JSON.stringify(invalidTask, null, 2),
    expectedStatus: 400,
    actualStatus: resH.status,
    response: resH.data,
    pass: resH.status === 400,
  });

  // --- Scenario I: GET /api/auth/me (200) ---
  console.log("--------------------------------------------------------------------------------");
  console.log("Scenario I: GET /api/auth/me with valid token");
  const resI = await apiCall("GET", "/api/auth/me", null, authToken);
  console.log(`Status: ${resI.status}`);
  console.log("Response:", JSON.stringify(resI.data, null, 2));
  results.push({
    id: "i",
    name: "Current User Profile (GET /api/auth/me)",
    endpoint: "GET /api/auth/me",
    request: `Authorization: Bearer ${authToken.slice(0, 24)}...`,
    expectedStatus: 200,
    actualStatus: resI.status,
    response: resI.data,
    pass: resI.status === 200,
  });

  // --- Scenario J: MongoDB Document showing hashed password ---
  console.log("--------------------------------------------------------------------------------");
  console.log("Scenario J: Inspect User document in MongoDB (Hashed Password)");
  const dbUser = await User.findOne({ email: testUser.email }).select("+password").lean();
  console.log("MongoDB Record Found:");
  console.log(JSON.stringify(dbUser, null, 2));
  const isHashed = dbUser && dbUser.password && dbUser.password.startsWith("$2b$10$");
  console.log(`Is Password Hashed with bcrypt ($2b$10$): ${isHashed}`);
  results.push({
    id: "j",
    name: "MongoDB Hashed Password Verification",
    endpoint: "Database Query: User.findOne({ email: ... }).select('+password')",
    request: `{ email: "${testUser.email}" }`,
    expectedStatus: "Hash starting with $2b$10$",
    actualStatus: isHashed ? "Bcrypt $2b$10$ hash verified" : "Not hashed",
    response: dbUser,
    pass: Boolean(isHashed),
  });

  // Save results to JSON file for image/report generator
  const fs = require("fs");
  const path = require("path");
  const outPath = path.resolve(__dirname, "../../PRACTIACL REPORT/p7_test_results.json");
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nTest results saved to: ${outPath}`);

  server.close();
  await mongoose.disconnect();
  console.log("Server closed and MongoDB disconnected.");
}

runSuite().catch((err) => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
