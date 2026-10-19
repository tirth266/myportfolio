const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const User = require("../models/User");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Sign a JWT for a user.
 *
 * The payload is deliberately tiny — { id, email, provider }. The server
 * secret comes from process.env.JWT_SECRET (set in backend/.env, which is
 * gitignored) and NEVER from a hardcoded string. Expiry is 1 hour, so a
 * stolen token stops working on its own fairly quickly.
 */
const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is missing. Add it to backend/.env before starting the server."
    );
  }

  return jwt.sign(
    {
      id: user._id,          // the user id goes inside the token
      email: user.email,
      provider: user.provider || "local",
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );
};

/**
 * Remove the password (and every other sensitive field) before sending a
 * user object back to the client. The schema already hides `password` with
 * select:false, so this is a second belt-and-braces layer.
 */
const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar || "",
  provider: user.provider,
  createdAt: user.createdAt,
});

/**
 * POST /api/auth/register  (Practical 7)
 *
 * Pipeline: Client -> requireAuth? (no, this is public) -> validate.registerUser
 *           -> this controller -> MongoDB
 *
 * The shape of the input has already been checked and trimmed by
 * middleware/validate.js, so by the time we get here name/email/password
 * are known-good strings.
 *
 * Returns 201 with the user and a token. The plain-text password is never
 * included in the response — only the bcrypt hash goes into the database.
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Duplicate email is a business rule, not a validation rule, so it
    // still has to be checked here against the database.
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
        error: "An account with this email already exists.",
      });
    }

    // bcrypt.hash with 10 salt rounds. The "10" is the cost factor — it
    // makes the hash deliberately slow to compute so brute forcing is
    // expensive for an attacker. The result is different every time even
    // for the same password, because the salt is random and embedded.
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword, // only the hash is stored, never the plain text
      provider: "local",
    });

    // Sign the token straight away so the user does not have to log in
    // again immediately after registering.
    const token = createToken(user);

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/auth/login  (Practical 7)
 *
 * bcrypt.compare() re-hashes the submitted password using the salt stored
 * inside the saved hash and checks the two match. It always takes the same
 * amount of time for the same cost factor, so the response time does not
 * reveal whether the email exists (a "timing attack").
 *
 * A wrong password and an unknown email both return the SAME 401 message
 * on purpose — otherwise an attacker could use the error text to find out
 * which email addresses are registered.
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // +password because the schema sets select:false on that field.
    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
        error: "Invalid email or password.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
        error: "Invalid email or password.",
      });
    }

    const token = createToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/auth/logout  (Supplementary — Practical 7)
 *
 * This route is protected by requireAuth, so reaching it already proves the
 * token is valid. A JWT is stateless: the server does not keep a session
 * list, so it cannot delete the token. The real logout happens in the
 * browser, which deletes the token from localStorage. This endpoint exists
 * so the client has one obvious place to end the session.
 */
const logoutUser = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out. Please remove the token from client storage.",
  });
};

/**
 * GET /api/auth/me  (Supplementary — Practical 7)
 *
 * Returns the currently logged-in user. auth.js has already decoded the
 * JWT and put the id on req.user, so all I do here is load that user from
 * MongoDB and send it back without the password.
 *
 * This is how the React app decides what to show in the navbar on page load.
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("name email avatar provider createdAt");

    // The token verified but the account has since been deleted.
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists. Please log in again.",
      });
    }

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential || typeof credential !== "string" || !credential.trim()) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required.",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || payload.email_verified !== true) {
      return res.status(401).json({
        success: false,
        message: "Google authentication failed. Please try again.",
      });
    }

    const email = payload.email.toLowerCase();
    const googleId = payload.sub;
    const name = payload.name || payload.given_name || "Google User";
    const avatar = payload.picture || "";

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.findOne({ email });
    }

    if (!user) {
      user = await User.create({
        name,
        email,
        avatar,
        googleId,
        provider: "google",
      });
    } else {
      const shouldLinkGoogleAccount = !user.googleId;
      user.googleId = user.googleId || googleId;
      user.provider = user.provider === "local" ? "google" : user.provider || "google";
      user.name = user.name || name;
      user.avatar = user.avatar || avatar;

      if (shouldLinkGoogleAccount || user.email !== email) {
        user.email = email;
      }

      await user.save();
    }

    const token = createToken(user);

    return res.status(200).json({
      success: true,
      message: "Google login successful.",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    const message =
      error?.message === "Token used too late" || error?.message === "Wrong recipient"
        ? "Google authentication failed. Please try again."
        : "Google authentication failed. Please try again.";

    return res.status(401).json({
      success: false,
      message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  googleLogin,
  createToken,
};
