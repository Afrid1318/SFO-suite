const express = require("express");
const User = require("../models/User");
const Booking = require("../models/booking");
const { requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

/* ------------------------------
   USER MANAGEMENT
------------------------------ */
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.post("/users", requireAdmin, async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.put("/users/:id", requireAdmin, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { role: req.body.role });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.delete("/users/:id", requireAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

/* ------------------------------
   ANALYTICS
------------------------------ */
router.get("/analytics", requireAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find({ status: "APPROVED" });
    const roomUsage = {};
    const hourUsage = {};
    const dateUsage = {};

    bookings.forEach(b => {
      roomUsage[b.room] = (roomUsage[b.room] || 0) + 1;
      const hour = new Date(b.startTime).getHours();
      hourUsage[hour] = (hourUsage[hour] || 0) + 1;
      dateUsage[b.date] = (dateUsage[b.date] || 0) + 1;
    });

    res.json({
      totalBookings: bookings.length,
      roomUsage,
      hourUsage,
      dateUsage
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load analytics" });
  }
});

module.exports = router;
