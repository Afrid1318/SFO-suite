const User = require("../models/User");

function requireLogin(req, res, next) {
  if (req.session.user) return next();
  res.status(401).json({ error: "Login required" });
}

async function requireAdmin(req, res, next) {
  try {
    const sessionUser = req.session.user;
    if (!sessionUser?.id) {
      return res.status(401).json({ error: "Login required" });
    }

    const user = await User.findById(sessionUser.id).select("_id username email role");
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: "Session expired" });
    }

    req.session.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role
    };

    if (String(user.role || "").toLowerCase() !== "admin") {
      return res.status(403).json({ error: "Admin only" });
    }

    next();
  } catch (err) {
    console.error("AUTH MIDDLEWARE ERROR:", err);
    res.status(500).json({ error: "Authorization failed" });
  }
}

module.exports = { requireLogin, requireAdmin };
