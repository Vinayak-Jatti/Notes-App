/* ===================================================
   middleware/auth.js — Session Verification
   ===================================================
   Reads the signed cookie "userId" that was set
   during login.  Looks up that user in MongoDB and
   attaches the full document to req.user so that
   every downstream route can use it directly.
   =================================================== */

import User from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  // cookie-parser verifies the signature automatically.
  // If the cookie was tampered with it will NOT appear
  // in req.signedCookies — only in req.cookies (unsigned).
  const userId = req.signedCookies?.userId;

  // No valid cookie → go to login
  if (!userId) {
    return res.redirect("/auth/login");
  }

  try {
    // Pull the user record so routes have the full object
    const user = await User.findById(userId).select("name email");

    if (!user) {
      // Cookie references a deleted user — clear it
      res.clearCookie("userId");
      return res.redirect("/auth/login");
    }

    // ✔ Attach to request — routes use req.user.id, req.user.name, etc.
    req.user = user;
    next();
  } catch (err) {
    // Malformed ObjectId or DB error — clear cookie, go to login
    console.error("Auth middleware error →", err.message);
    res.clearCookie("userId");
    return res.redirect("/auth/login");
  }
};
