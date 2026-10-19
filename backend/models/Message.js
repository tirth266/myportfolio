/**
 * Message Model — Practical 10: Asynchronous Processing
 * Mongoose schema for contact messages stored in MongoDB.
 */

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: [2, "Message must be at least 2 characters long"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);
