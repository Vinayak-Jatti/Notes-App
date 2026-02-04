/* ===================================================
   models/Note.js — Mongoose Note Schema
   =================================================== */

import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    // Short heading of the note
    title: {
      type:      String,
      required:  [true, "Title is required"],
      trim:      true,
      maxlength: [200, "Title can be at most 200 characters"]
    },
    // Body text of the note
    content: {
      type:     String,
      required: [true, "Content is required"],
      trim:     true
    },
    // Foreign key → User collection
    // Every note is strictly owned by one user
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "Note must belong to a user"]
    }
  },
  { timestamps: true }   // auto createdAt + updatedAt
);

// Compound index: fast lookups for "all notes by user, newest first"
noteSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Note", noteSchema);
