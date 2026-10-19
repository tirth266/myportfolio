/**
 * Auth Routes — Practical 7
 *
 * This file is where the middleware pipeline actually becomes visible:
 *
 *   Public route    POST /register   validate -> controller
 *   Public route    POST /login      validate -> controller
 *   Protected route GET  /me         auth -> controller
 *
 * Note the order. requireAuth always comes BEFORE validate. That matters:
 * if validation ran first, an unauthenticated attacker could send garbage
 * to my endpoints and read the error messages to learn my rules. With auth
 * first, only logged-in users ever reach the validation step.
 */

const express = require("express");

const {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  googleLogin,
} = require("../controllers/authController");
const requireAuth = require("../middleware/auth");
const { validate, rules } = require("../middleware/validate");

const router = express.Router();

// Public. Anyone can create an account, so only validation is needed.
router.post("/register", validate(rules.registerUser), registerUser);

// Public. Validating the email shape here gives a clear 400 instead of a
// pointless database lookup for input like "not-an-email".
router.post("/login", validate(rules.loginUser), loginUser);

// Practical 6 Google login (kept so the existing feature still works).
router.post("/google", googleLogin);

// Protected: auth middleware verifies the JWT before the controller runs.
router.get("/me", requireAuth, getMe);

// Protected logout. A JWT cannot be revoked server-side, so the client
// clearing the token is what actually ends the session.
router.post("/logout", requireAuth, logoutUser);

module.exports = router;
