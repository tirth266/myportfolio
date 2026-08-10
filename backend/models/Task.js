/**
 * Task Model — Practical 5
 *
 * Mongoose schema for a Task document stored in MongoDB.
 *
 * Fields
 * ──────
 *  title       String  required        The task name (auto-trimmed via pre-save hook)
 *  description String  optional        Extra detail about the task
 *  completed   Boolean default false   Whether the task is done
 *  priority    String  enum            'low' | 'medium' | 'high' (default 'medium')
 *  createdAt   Date    auto            Managed by the timestamps option
 *  updatedAt   Date    auto            Managed by the timestamps option
 *
 * Pre-save hook
 * ─────────────
 *  Automatically trims whitespace from `title` before every save.
 *  Works for both .save() on a new document and .save() after findById().
 */

const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    // ── Required ────────────────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,                      // schema-level trim (Mongoose built-in)
    },

    // ── Optional ────────────────────────────────────────────────────────────────
    description: {
      type: String,
      trim: true,
      default: "",
    },

    // ── Status ──────────────────────────────────────────────────────────────────
    completed: {
      type: Boolean,
      default: false,
    },

    // ── Priority (Practical 5 supplementary requirement) ────────────────────────
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high"],
        message: "Priority must be 'low', 'medium', or 'high'",
      },
      default: "medium",
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields managed by Mongoose
    timestamps: true,
  }
);

// ── Pre-save hook: extra whitespace guard on title ─────────────────────────────
//
// Mongoose's built-in `trim: true` handles trim on initial set, but this hook
// ensures the value is also trimmed if the field is modified via task.title = "  x  "
// before calling task.save().
//
taskSchema.pre("save", function (next) {
  if (this.isModified("title") && this.title) {
    this.title = this.title.trim();
  }
  next();
});

module.exports = mongoose.model("Task", taskSchema);
