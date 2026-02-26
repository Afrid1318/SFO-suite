const express = require("express");
const Booking = require("../models/booking");
const { requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

/* GET ALL BOOKINGS */
router.get("/", requireAdmin, async (req, res) => {
  const bookings = await Booking.find().sort({ date: 1 });
  res.json(bookings);
});

/* BULK UPDATE STATUS */
router.put("/bulk", requireAdmin, async (req, res) => {
  const { ids, status } = req.body;

  await Booking.updateMany(
    { trackId: { $in: ids } },
    { status }
  );

  res.json({ success: true });
});

module.exports = router;
