/**
 * Authentication Middleware — Practical 7
 * ------------------------------------------
 * This is the FIRST piece of the "Client -> Auth Middleware -> Validation
 * Middleware -> Controller" pipeline. Nothing in a protected route runs
 * before this file has decided that the caller is allowed in.
 *
 * What it does, step by step:
 *   1. Reads the "Authorization: Bearer <token>" request header.
 *   2. Rejects the request with 401 if the header is missing or malformed.
 *   3. Calls jwt.verify() INSIDE a try/catch. A JWT is just a string signed
 *      with our secret, so verify() both checks the signature and checks
 *      that the "exp" (expiry) claim has not passed yet.
 *   4. On success it puts the decoded payload on req.user and calls next().
 *   5. On ANY failure (missing / malformed / expired / tampered token) it
 *      returns 401. Because the failure is caught, a bad token can never
 *      crash the server — it just bounces the request.
 *
 * Note: we do NOT hit the database here. The token payload is enough to
 * identify the user, so verification stays a cheap pure-CPU operation.
 */

// The jsonwebtoken package — used to sign (login) and verify (here) tokens.
const jwt = require("jsonwebtoken");

/**
 * Read the secret from the environment.
 *
 * SECURITY: the secret must only ever live in backend/.env, which is listed
 * in .gitignore. Hardcoding it here would let anyone who reads the repo
 * forge a token for any user id.
 */
const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return process.env.JWT_SECRET;
};

/**
 * Express middleware. Signature (req, res, next) is what Express expects.
 */
const requireAuth = (req, res, next) => {
  // Step 1: grab the raw Authorization header.
  const authHeader = req.headers.authorization;

  // Step 2a: no header at all -> the client never sent a token.
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please provide a Bearer token.",
    });
  }

  // Step 2b: split "Bearer abc.def.ghi" into ["Bearer", "abc.def.ghi"].
  // Anything else (e.g. a bare token, or "Basic xyz") is malformed.
  const [scheme, token] = authHeader.trim().split(/\s+/);

  if (!/^Bearer$/i.test(scheme) || !token) {
    return res.status(401).json({
      success: false,
      message: "Malformed Authorization header. Expected format: Bearer <token>.",
    });
  }

  // Step 3: verify the token. This is the part that can throw, so it MUST
  // sit inside try/catch — an uncaught throw here would be a 500 + crash log.
  try {
    // verify() throws on a bad signature, a malformed string, or an expired
    // "exp" claim. If it returns, the token is genuine and still valid.
    const decoded = jwt.verify(token, getJwtSecret());

    // New tokens carry "id" (Practical 7 spec). Older Google-login tokens
    // from Practical 6 carry "userId", so I read both to avoid breaking them.
    const userId = decoded.id || decoded.userId;

    if (!userId) {
      throw new Error("Token payload does not contain a user id");
    }

    // Step 4: attach the identity to the request so controllers can use it.
    req.user = {
      id: userId,
      email: decoded.email || null,
      provider: decoded.provider || "local",
    };

    // Keep the raw token around in case a controller wants to re-read claims.
    req.token = token;

    return next();
  } catch (error) {
    // Step 5: every failure mode becomes a clean 401 with a useful message.
    // jsonwebtoken gives us a different error.name for each case, so I can
    // tell the client exactly what went wrong without leaking the secret.
    let message = "Invalid token. Please log in again.";

    if (error.name === "TokenExpiredError") {
      message = "Token has expired. Please log in again.";
    } else if (error.name === "JsonWebTokenError") {
      message = error.message.includes("malformed")
        ? "Malformed token. Expected format: Bearer <token>."
        : "Invalid token signature. Please log in again.";
    }

    return res.status(401).json({
      success: false,
      message,
    });
  }
};

module.exports = requireAuth;
