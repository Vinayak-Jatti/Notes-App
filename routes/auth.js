/* ===================================================
   routes/auth.js — Registration / Login / Logout
   =================================================== */

import { Router } from "express";
import User       from "../models/User.js";

const router = Router();

// ─────────────────────────────────────────────────────
// GET  /auth/register  →  show registration form
// ─────────────────────────────────────────────────────
router.get("/register", (_req, res) => {
  res.render("register", { error: null });
});

// ─────────────────────────────────────────────────────
// POST /auth/register  →  create account
// ─────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  // ── Validate ──────────────────────────────────────
  if (!name || !email || !password) {
    return res.render("register", {
      error: "All fields are required."
    });
  }
  if (password.length < 6) {
    return res.render("register", {
      error: "Password must be at least 6 characters."
    });
  }

  try {
    // Duplicate email check
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.render("register", {
        error: "An account with that email already exists."
      });
    }

    // Create user — pre-save hook hashes the password automatically
    await new User({ name, email, password }).save();

    // Success → redirect to login page
    return res.redirect("/auth/login?msg=Account+created.+Please+log+in.");
  } catch (err) {
    console.error("Register error →", err);
    return res.render("register", { error: "Something went wrong. Try again." });
  }
});

// ─────────────────────────────────────────────────────
// GET  /auth/login  →  show login form
// ─────────────────────────────────────────────────────
router.get("/login", (req, res) => {
  res.render("login", {
    error:   req.query.error || null,
    success: req.query.msg   || null
  });
});

// ─────────────────────────────────────────────────────
// POST /auth/login  →  authenticate
// ─────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // ── Validate ──────────────────────────────────────
  if (!email || !password) {
    return res.render("login", {
      error:   "Both email and password are required.",
      success: null
    });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // User not found OR password mismatch → same generic message
    // (never reveal which field was wrong)
    if (!user || !(await user.comparePassword(password))) {
      return res.render("login", {
        error:   "Invalid email or password.",
        success: null
      });
    }

    // ── Set signed session cookie ───────────────────
    // signed: true   → cookie-parser signs it with COOKIE_SECRET from app.js
    // httpOnly: true → browser JS cannot read it
    res.cookie("userId", user._id.toString(), {
      signed:   true,
      httpOnly: true,
      sameSite: "Strict"
    });

    return res.redirect("/notes/dashboard");
  } catch (err) {
    console.error("Login error →", err);
    return res.render("login", {
      error:   "Something went wrong. Try again.",
      success: null
    });
  }
});

// ─────────────────────────────────────────────────────
// GET  /auth/logout  →  clear cookie & go to login
// ─────────────────────────────────────────────────────
router.get("/logout", (_req, res) => {
  res.clearCookie("userId");
  return res.redirect("/auth/login?msg=You+have+been+logged+out.");
});

export default router;
