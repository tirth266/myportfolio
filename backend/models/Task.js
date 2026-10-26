/**
 * Task Model — Practical 5
 *
 * Mongoose schema for a Task document stored in MongoDB.
 *
 * Schema Fields:
 *  - title       (String, required, trimmed, non-empty)
 *  - description (String, optional, default: "")
 *  - completed   (Boolean, default: false)
 *  - priority    (String, enum: ['low', 'medium', 'high'], default: 'medium')
 *  - createdAt   (Date, default: Date.now)
 *
 * Pre-save Hook:
 *  - Automatically trims whitespace from title before saving.
 */

const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      validate: {
        validator: function (value) {
          return typeof value === "string" && value.trim().length > 0;
        },
        message: "Title cannot be empty or only whitespace",
      },
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high"],
        message: "Priority must be 'low', 'medium', or 'high'",
      },
      default: "medium",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// ── Query index: supports GET /tasks sort({ createdAt: -1 }) ──────────────────
// Without this index MongoDB must sort the whole collection in memory on every
// uncached GET /tasks. With it, the sort is served straight off the index.
taskSchema.index({ createdAt: -1 });

// ── Pre-save hook: trim title before saving ───────────────────────────────────
taskSchema.pre("save", function (next) {
  if (this.isModified("title") && typeof this.title === "string") {
    this.title = this.title.trim();
  }
  next();
});

module.exports = mongoose.model("Task", taskSchema);
