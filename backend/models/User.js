/**
 * User Model — Practical 7 (Authentication and Middleware Pipeline)
 *
 * Mongoose schema for a User document in MongoDB.
 *
 * The important part for this practical is the `password` field: what gets
 * stored is NEVER the plain text the user typed. The controller runs
 * bcrypt.hash(password, 10) before calling create(), so by the time a
 * document reaches MongoDB the password column contains something like
 * "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy".
 *
 * select: false means the password is left out of every query result by
 * default. Login is the only place that opts back in with .select("+password"),
 * which reduces the chance of accidentally shipping a hash to the client.
 *
 * Timestamps (createdAt / updatedAt) are added automatically by Mongoose
 * because of the `timestamps: true` option below.
 */

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      // Google sign-in users have no local password, so null is allowed.
      default: null,
      // Hidden from ordinary queries — see the note at the top of the file.
      select: false,
      // Defence in depth: middleware/validate.js already enforces 8 chars,
      // but Mongoose checks again so no other code path can slip past it.
      validate: {
        validator: function (value) {
          return value === null || value === undefined || value.length >= 8;
        },
        message: "Password must be at least 8 characters long",
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    avatar: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function (next) {
  if (this.isModified("name") && typeof this.name === "string") {
    this.name = this.name.trim();
  }

  if (this.isModified("email") && typeof this.email === "string") {
    this.email = this.email.trim().toLowerCase();
  }

  next();
});

module.exports = mongoose.model("User", userSchema);
