/* ===================================================
   app.js — Application Entry Point
   =================================================== */

import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import noteRoutes from "./routes/notes.js";

// ── ENV VARIABLES — edit these directly ─────────────
// MongoDB connection string (local instance)
const MONGO_URI = "mongodb://localhost:27017/Notes-App";

// Secret used to sign the session cookie.
// Change this to any random string you like.
const COOKIE_SECRET = "change-this-to-any-random-string-you-want";

// Port the server listens on
const PORT = 3000;

// ── Express app ────────────────────────────────
const app = express();

// Parse form bodies from EJS <form> POSTs
app.use(express.urlencoded({ extended: true }));

// cookie-parser: parses cookies, signs them with COOKIE_SECRET
// After this middleware req.cookies and req.signedCookies are available
app.use(cookieParser(COOKIE_SECRET));

// Serve /public as static files (CSS lives here)
app.use(express.static("public"));

// ── View engine ─────────────────────────────────────
app.set("view engine", "ejs");
app.set("views", "views");

// ── Routes ──────────────────────────────────────────
// Export COOKIE_SECRET so middleware/auth.js can read it
app.locals.COOKIE_SECRET = COOKIE_SECRET;

app.use("/auth", authRoutes); // register / login / logout
app.use("/notes", noteRoutes); // CRUD — every route is protected

// Root → login
app.get("/", (_req, res) => res.redirect("/auth/login"));

// ── 404 ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).render("error", {
    title: "Page Not Found",
    message: "The page you are looking for does not exist.",
    code: 404,
  });
});

// ── Global error handler ────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Unhandled error →", err);
  res.status(500).render("error", {
    title: "Server Error",
    message: "Something went wrong. Please try again later.",
    code: 500,
  });
});

// ── MongoDB connect → start server ──────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✔  MongoDB connected →", MONGO_URI);
    app.listen(PORT, () => {
      console.log(`✔  Server running   → http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("✘  MongoDB connection failed →", err.message);
    process.exit(1);
  });

export default app;
