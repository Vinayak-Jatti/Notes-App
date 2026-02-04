/* ===================================================
   models/User.js — Mongoose User Schema
   =================================================== */

import mongoose from "mongoose";
import bcrypt   from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // Display name shown on the dashboard
    name: {
      type:     String,
      required: [true, "Name is required"],
      trim:     true
    },
    // Unique login identifier — always stored lowercase
    email: {
      type:      String,
      required:  [true, "Email is required"],
      unique:    true,
      lowercase: true,
      trim:      true
    },
    // Stored as a bcrypt hash — never plain text
    password: {
      type:     String,
      required: [true, "Password is required"]
    }
  },
  { timestamps: true }   // auto createdAt + updatedAt
);

// ── Hash password before every save ────────────────
// Skipped if the password field hasn't changed (e.g. updating name only)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ── Helper: compare a candidate password to the hash ─
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);
