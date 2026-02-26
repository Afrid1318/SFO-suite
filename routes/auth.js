const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if ((!email && !username) || !password) {
      return res.status(400).json({ success: false, error: "Missing credentials" });
    }

    const query = email ? { email } : { username };
    const user = await User.findOne(query);

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    // Additional check: ensure email is from @nestgroup.net domain
    if (!user.email.endsWith('@nestgroup.net')) {
      return res.status(403).json({ success: false, error: "Access restricted to @nestgroup.net domain" });
    }

    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    res.json({
      success: true,
      user: req.session.user,
      redirect: user.role === "admin" ? "/admin.html" : "/home.html"
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ success: false });
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

router.get("/me", async (req, res) => {
  try {
    const sessionUser = req.session.user;
    if (!sessionUser?.id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await User.findById(sessionUser.id).select("_id username email role");
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: "Not authenticated" });
    }

    req.session.user = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role
    };

    res.json(req.session.user);
  } catch (err) {
    console.error("ME ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
