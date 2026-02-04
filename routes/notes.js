import { Router } from "express";
import Note from "../models/Note.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Lock every route in this file behind auth
router.use(requireAuth);

// ─────────────────────────────────────────────────────
// GET  /notes/dashboard  →  list all of the user's notes
// ─────────────────────────────────────────────────────
router.get("/dashboard", async (req, res) => {
  try {
    // Only fetch notes that belong to the logged-in user, newest first
    const notes = await Note.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.render("dashboard", {
      userName: req.user.name,
      notes,
      error: null,
    });
  } catch (err) {
    console.error("Dashboard error →", err);
    res.redirect("/auth/login");
  }
});

// ─────────────────────────────────────────────────────
// POST /notes/create  →  add a new note
// ─────────────────────────────────────────────────────
router.post("/create", async (req, res) => {
  const title = (req.body.title || "").trim();
  const content = (req.body.content || "").trim();

  // ── Validate ──────────────────────────────────────
  if (!title || !content) {
    // Re-render dashboard with the error so the user sees the form again
    const notes = await Note.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    return res.render("dashboard", {
      userName: req.user.name,
      notes,
      error: "Both title and content are required.",
    });
  }

  try {
    await new Note({
      title,
      content,
      userId: req.user._id, // ← owner is always the logged-in user
    }).save();

    // PRG: redirect after POST so browser back-button doesn't re-submit
    return res.redirect("/notes/dashboard");
  } catch (err) {
    console.error("Create error →", err);
    return res.redirect("/notes/dashboard");
  }
});

// ─────────────────────────────────────────────────────
// POST /notes/update/:id  →  edit an existing note
// ─────────────────────────────────────────────────────
router.post("/update/:id", async (req, res) => {
  const title = (req.body.title || "").trim();
  const content = (req.body.content || "").trim();

  // ── Validate ──────────────────────────────────────
  if (!title || !content) {
    return res.redirect("/notes/dashboard");
  }

  try {
    // The dual filter (_id AND userId) is the ownership gate.
    // If the note doesn't belong to this user, nothing is updated.
    await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id }, // ← ownership check
      { title, content }, // ← fields to update
    );

    return res.redirect("/notes/dashboard");
  } catch (err) {
    console.error("Update error →", err);
    return res.redirect("/notes/dashboard");
  }
});

// ─────────────────────────────────────────────────────
// POST /notes/delete/:id  →  remove a note
// ─────────────────────────────────────────────────────
router.post("/delete/:id", async (req, res) => {
  try {
    // Same dual filter — can only delete your own notes
    await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id, // ← ownership check
    });

    return res.redirect("/notes/dashboard");
  } catch (err) {
    console.error("Delete error →", err);
    return res.redirect("/notes/dashboard");
  }
});

export default router;
