/**
 * Validation & Sanitization Middleware — Practical 7
 * ----------------------------------------------------
 * This is the SECOND piece of the pipeline. It runs AFTER auth (so an
 * unauthenticated attacker cannot even probe my validation rules) and
 * BEFORE the controller (so a bad request never reaches MongoDB).
 *
 * Two jobs:
 *   1. VALIDATE  — check that every required field is present, is the right
 *                  type, is a real email, and meets the minimum length.
 *   2. SANITIZE  — trim strings, and strip MongoDB operator keys ($, .) so
 *                  a body like {"email": {"$ne": null}} cannot be smuggled
 *                  through as a NoSQL injection attempt.
 *
 * On failure it returns 400 Bad Request with a clear message, exactly the
 * status code the practical asks for. It never calls the controller.
 */

// Simple, readable email check. Mongoose also checks the format on save,
// but failing here means the user gets a 400 instead of a server error.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// bcrypt only looks at the first 72 bytes of a password. Anything after
// that is silently ignored, so I reject longer input rather than let a
// user think their long password is fully protecting the account.
const BCRYPT_MAX_BYTES = 72;

/**
 * Rule sets. Each key is a request body field; each value describes what
 * that field must look like. Keeping them in one object means the route
 * file reads like documentation.
 */
const rules = {
  // POST /api/auth/register
  registerUser: {
    name: { label: "Name", type: "string", required: true, trim: true, min: 2, max: 50 },
    email: { label: "Email", type: "email", required: true, trim: true, lowercase: true },
    // min 8 is the rule the practical asks for ("min password length").
    password: { label: "Password", type: "string", required: true, min: 8, maxBytes: BCRYPT_MAX_BYTES },
  },

  // POST /api/auth/login
  loginUser: {
    // Not trimmed to a minimum length — on login I only need to know the
    // field is present, the real check is bcrypt.compare against the hash.
    email: { label: "Email", type: "email", required: true, trim: true, lowercase: true },
    password: { label: "Password", type: "string", required: true, trim: false },
  },

  // POST /api/tasks
  createTask: {
    title: { label: "Title", type: "string", required: true, trim: true, min: 1, max: 120 },
    description: { label: "Description", type: "string", required: false, trim: true, max: 1000 },
    priority: { label: "Priority", type: "string", required: false, oneOf: ["low", "medium", "high"] },
    completed: { label: "Completed", type: "boolean", required: false },
  },

  // POST /api/ai/generate-description — Practical 13
  // Only the title is forwarded to the AI provider; no PII or credentials.
  generateDescription: {
    title: { label: "Title", type: "string", required: true, trim: true, min: 1, max: 200 },
  },
};

/**
 * PUT /api/tasks/:id — same as create, except everything is optional.
 * I build it from createTask so the two can never drift apart.
 */
rules.updateTask = {
  title: { ...rules.createTask.title, required: false },
  description: { ...rules.createTask.description, required: false },
  priority: { ...rules.createTask.priority, required: false },
  completed: { ...rules.createTask.completed, required: false },
};

/**
 * Sanitization: remove MongoDB query operators from the body.
 *
 * If a client posts { "email": { "$ne": null } } and I pass that straight
 * into User.findOne(), Mongoose would read it as "find a user whose email
 * is not null" — which matches the first user in the database and lets the
 * attacker log in as anybody. Any key starting with "$", or containing a
 * ".", is an operator, never a real field, so I delete it.
 */
const stripMongoOperators = (payload) => {
  Object.keys(payload).forEach((key) => {
    if (key.startsWith("$") || key.includes(".")) {
      delete payload[key];
    }
  });
  return payload;
};

/**
 * Validate one field against its rule. Returns an error string, or null.
 */
const checkField = (rule, rawValue) => {
  // Reject object/array input for scalar fields — an object is never a
  // valid string, and it is also how a NoSQL operator would arrive.
  if (typeof rawValue === "object" && rawValue !== null) {
    return `${rule.label} must be a ${rule.type}.`;
  }

  // ---- Required check ----
  // I treat "", null and undefined all as "missing" so an empty string
  // cannot sneak past a required field.
  const isMissing = rawValue === undefined || rawValue === null || rawValue === "";

  if (rule.required && isMissing) {
    return `${rule.label} is required.`;
  }

  // An optional field that was not supplied at all is simply skipped.
  if (!rule.required && isMissing) {
    return null;
  }

  // ---- Type check ----
  if (rule.type === "string" && typeof rawValue !== "string") {
    return `${rule.label} must be a string.`;
  }

  if (rule.type === "boolean" && typeof rawValue !== "boolean") {
    return `${rule.label} must be true or false.`;
  }

  // ---- Normalise (this is the sanitization step for strings) ----
  let cleaned = rawValue;
  if (typeof cleaned === "string" && rule.trim) {
    // Trimming here means "  aayush  " and "aayush" are treated as the same
    // value, so users cannot create duplicate accounts with stray spaces.
    cleaned = cleaned.trim();
  }
  if (typeof cleaned === "string" && rule.lowercase) {
    cleaned = cleaned.toLowerCase();
  }

  // Re-check after trimming: a field of only spaces ("   ") trims to "" and
  // should be treated as missing, otherwise it would pass a length check.
  if (rule.required && cleaned === "") {
    return `${rule.label} cannot be empty or only whitespace.`;
  }

  // ---- Length checks ----
  if (rule.min !== undefined && cleaned.length < rule.min) {
    return `${rule.label} must be at least ${rule.min} characters long.`;
  }

  if (rule.max !== undefined && cleaned.length > rule.max) {
    return `${rule.label} must be at most ${rule.max} characters long.`;
  }

  // bcrypt silently drops everything past 72 bytes, which would let two
  // different long passwords produce the same hash. Reject them instead.
  if (rule.maxBytes !== undefined && Buffer.byteLength(cleaned, "utf8") > rule.maxBytes) {
    return `${rule.label} must be at most ${rule.maxBytes} bytes long.`;
  }

  // ---- Format checks ----
  if (rule.type === "email" && !EMAIL_PATTERN.test(cleaned)) {
    return `${rule.label} must be a valid email address.`;
  }

  if (rule.oneOf && !rule.oneOf.includes(cleaned)) {
    return `${rule.label} must be one of: ${rule.oneOf.join(", ")}.`;
  }

  return null;
};

/**
 * Build an Express middleware from a rule set.
 * Usage in a route file:  router.post("/", validate(rules.createTask), controller)
 */
const validate = (ruleSet) => (req, res, next) => {
  // req.body is undefined if no JSON body was sent at all.
  const body = stripMongoOperators(
    req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {}
  );

  const errors = [];

  Object.entries(ruleSet).forEach(([field, rule]) => {
    const error = checkField(rule, body[field]);

    if (error) {
      errors.push({ field, message: error });
    }
  });

  // Nothing wrong -> write the cleaned values back and continue to the
  // controller. Controllers then never need to call trim() themselves.
  if (errors.length === 0) {
    req.body = body;
    return next();
  }

  // Something wrong -> stop here with 400. The controller is never reached,
  // so no half-valid document can ever be written to MongoDB.
  return res.status(400).json({
    success: false,
    error: errors[0].message,
    message: errors[0].message,
    errors,
  });
};

// Pre-built middleware so route files stay short and readable.
module.exports = validate;
module.exports.validate = validate;
module.exports.rules = rules;
