/**
 * AI Description Generation Tests — Practical 13: AI API Integration
 *
 * Tests the POST /api/ai/generate-description endpoint:
 *  1. Missing API key → 503 graceful degradation
 *  2. Empty title → 400 validation error
 *  3. Title too long → 400 validation error
 *  4. Missing title field → 400 validation error
 *  5. No auth token → 401 (auth guard)
 *  6. Mocked success → 200 with description and disclaimer
 *  7. Mocked provider failure → 503 graceful degradation
 *  8. Mocked timeout → 503 graceful degradation
 *
 * The Gemini SDK is mocked throughout. No real API key is required.
 * No paid requests are made in this test suite.
 */

const request = require("supertest");
const app = require("../server");
const jwt = require("jsonwebtoken");

// ── Mock the Gemini SDK ──────────────────────────────────────────────────────
jest.mock("@google/generative-ai", () => {
  const mockGenerateContent = jest.fn();
  const MockGoogleGenerativeAI = jest.fn(() => ({
    getGenerativeModel: jest.fn(() => ({
      generateContent: mockGenerateContent,
    })),
  }));
  MockGoogleGenerativeAI._mockGenerateContent = mockGenerateContent;
  return { GoogleGenerativeAI: MockGoogleGenerativeAI };
});

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Helper: get the inner mock function across test files
const getMockGenerateContent = () => GoogleGenerativeAI._mockGenerateContent;

// ── Test helpers ─────────────────────────────────────────────────────────────

/** Generate a valid JWT for test requests */
const makeToken = () => {
  const secret =
    process.env.JWT_SECRET || "ci-testing-jwt-secret-key-at-least-32-chars-long";
  return jwt.sign({ id: "test-user-id-123", email: "test@example.com" }, secret, {
    expiresIn: "1h",
  });
};

// ── Test Suite ───────────────────────────────────────────────────────────────

describe("POST /api/ai/generate-description — AI Description Generation (Practical 13)", () => {
  let validToken;

  beforeAll(() => {
    process.env.JWT_SECRET =
      process.env.JWT_SECRET || "ci-testing-jwt-secret-key-at-least-32-chars-long";
    validToken = makeToken();
  });

  afterEach(() => {
    // Reset mock between tests
    getMockGenerateContent().mockReset();
    // Clear rate limit state for clean test isolation
    delete process.env.GEMINI_API_KEY;
  });

  // ── 1. Missing API key (no GEMINI_API_KEY in env) ──────────────────────
  describe("Missing API key — graceful degradation", () => {
    it("should return 503 with fallback:true when GEMINI_API_KEY is not configured", async () => {
      delete process.env.GEMINI_API_KEY;

      const res = await request(app)
        .post("/api/ai/generate-description")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ title: "Prepare weekly report" });

      expect(res.statusCode).toBe(503);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("fallback", true);
      expect(res.body.message).toMatch(/not configured|manually/i);
    });
  });

  // ── 2. Empty title ─────────────────────────────────────────────────────
  describe("Input validation — empty title", () => {
    it("should return 400 for an empty title string", async () => {
      const res = await request(app)
        .post("/api/ai/generate-description")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ title: "" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  // ── 3. Excessively long title ──────────────────────────────────────────
  describe("Input validation — title too long", () => {
    it("should return 400 for a title exceeding 200 characters", async () => {
      const longTitle = "A".repeat(201);
      const res = await request(app)
        .post("/api/ai/generate-description")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ title: longTitle });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  // ── 4. Missing title field ─────────────────────────────────────────────
  describe("Input validation — missing title field", () => {
    it("should return 400 when title field is absent from request body", async () => {
      const res = await request(app)
        .post("/api/ai/generate-description")
        .set("Authorization", `Bearer ${validToken}`)
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  // ── 5. No auth token ───────────────────────────────────────────────────
  describe("Authentication guard", () => {
    it("should return 401 when no Authorization header is provided", async () => {
      const res = await request(app)
        .post("/api/ai/generate-description")
        .send({ title: "Valid title" });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body.message).toMatch(/Authentication required/i);
    });
  });

  // ── 6. Mocked successful response ─────────────────────────────────────
  describe("Mocked success — AI provider responds", () => {
    it("should return 200 with description and disclaimer when provider succeeds", async () => {
      process.env.GEMINI_API_KEY = "mock-test-key-for-unit-testing-only";

      const mockDescription =
        "Prepare the weekly status report by gathering metrics and summarizing progress.";

      getMockGenerateContent().mockResolvedValueOnce({
        response: { text: () => mockDescription },
      });

      const res = await request(app)
        .post("/api/ai/generate-description")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ title: "Prepare weekly report" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("description", mockDescription);
      expect(res.body).toHaveProperty("fallback", false);
      expect(res.body).toHaveProperty("disclaimer");
      expect(res.body.disclaimer).toMatch(/AI-generated suggestion/i);
    });
  });

  // ── 7. Mocked provider failure ─────────────────────────────────────────
  describe("Mocked provider failure — graceful degradation", () => {
    it("should return 503 with fallback:true when provider throws an error", async () => {
      process.env.GEMINI_API_KEY = "mock-test-key-for-unit-testing-only";

      getMockGenerateContent().mockRejectedValueOnce(
        new Error("Service temporarily unavailable")
      );

      const res = await request(app)
        .post("/api/ai/generate-description")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ title: "Unique failure test title abc123" });

      expect(res.statusCode).toBe(503);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("fallback", true);
      expect(res.body.message).toMatch(/manually/i);
    });
  });

  // ── 8. Mocked invalid API key ──────────────────────────────────────────
  describe("Mocked invalid API key — graceful degradation", () => {
    it("should return 503 when provider returns an API_KEY_INVALID error", async () => {
      process.env.GEMINI_API_KEY = "mock-invalid-api-key-for-testing";

      const apiKeyError = new Error("API_KEY_INVALID: The provided API key is not valid.");
      getMockGenerateContent().mockRejectedValueOnce(apiKeyError);

      const res = await request(app)
        .post("/api/ai/generate-description")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ title: "Unique api key error test xyz789" });

      expect(res.statusCode).toBe(503);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("fallback", true);
      expect(res.body.message).toMatch(/temporarily unavailable|manually/i);
    });
  });
});
