const express = require("express");
const Booking = require("../models/booking");
const { requireLogin, requireAdmin } = require("../middleware/authMiddleware");
const { sendBookingConfirmation } = require("../config/email");

const router = express.Router();

const objectIdPattern = /^[a-fA-F0-9]{24}$/;

async function updateBookingByIdOrTrackId(idOrTrackId, update) {
  let booking = null;

  if (objectIdPattern.test(idOrTrackId)) {
    booking = await Booking.findByIdAndUpdate(idOrTrackId, update, { new: true });
  }

  if (!booking) {
    booking = await Booking.findOneAndUpdate({ trackId: idOrTrackId }, update, { new: true });
  }

  return booking;
}

async function deleteBookingByIdOrTrackId(idOrTrackId) {
  let booking = null;

  if (objectIdPattern.test(idOrTrackId)) {
    booking = await Booking.findByIdAndDelete(idOrTrackId);
  }

  if (!booking) {
    booking = await Booking.findOneAndDelete({ trackId: idOrTrackId });
  }

  return booking;
}

/* ------------------------------
   CREATE BOOKING
------------------------------ */
router.post("/", requireLogin, async (req, res) => {
  try {
    const { room, date, start, end, user, email, ...otherFields } = req.body;

    if (!room || !date || !start || !end) {
      return res.status(400).json({ error: "Missing required booking fields" });
    }

    // Combine date and time into Date objects for conflict checking
    const startTime = new Date(`${date}T${start}`);
    const endTime = new Date(`${date}T${end}`);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return res.status(400).json({ error: "Invalid date or time format" });
    }

    if (startTime >= endTime) {
      return res.status(400).json({ error: "End time must be after start time" });
    }

    // Block past dates
    const now = new Date();
    if (startTime < now) {
      return res.status(400).json({ error: "Cannot book a meeting in the past" });
    }

    // Check for overlaps (StartA < EndB) and (EndA > StartB)
    const overlap = await Booking.findOne({
      room,
      date,
      status: { $ne: "REJECTED" },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime }
    });

    if (overlap) {
      return res.status(409).json({ error: "Room already booked for this time slot" });
    }

    const booking = new Booking({
      ...otherFields,
      user: req.session.user?.username || user,
      email: req.session.user?.email || email,
      room,
      date,
      start,
      end,
      startTime,
      endTime,
      status: "PENDING"
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    console.error("CREATE BOOKING ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ------------------------------
   TRACK BOOKING (PUBLIC/USER)
------------------------------ */
router.get("/track/:trackId", async (req, res) => {
  try {
    const booking = await Booking.findOne({ trackId: req.params.trackId });
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/* ------------------------------
   GET ARCHIVED (ADMIN ONLY)
   Returns completed meetings (APPROVED and time passed) or REJECTED
------------------------------ */
router.get("/archived", requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const bookings = await Booking.find({ 
      $or: [
        { status: "REJECTED" },
        { status: "APPROVED", endTime: { $lt: now } }
      ]
    }).sort({ date: -1, startTime: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch archives" });
  }
});

/* ------------------------------
   GET ALL / PENDING (ALL USERS)
------------------------------ */
router.get("/", requireLogin, async (req, res) => {
  try {
    let query = {};
    const { status, pendingOnly } = req.query;

    if (pendingOnly === "true") {
      query.status = "PENDING";
    } else if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

/* ------------------------------
   UPDATE STATUS (ADMIN ONLY)
------------------------------ */
const updateStatus = async (req, res) => {
  try {
    const status = String(req.body?.status || "").toUpperCase();
    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const booking = await updateBookingByIdOrTrackId(req.params.id, { status });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Send email notification when status changes to APPROVED or REJECTED
    if ((status === "APPROVED" || status === "REJECTED") && booking.email) {
      try {
        await sendBookingConfirmation(booking);
        console.log(`✅ Notification email sent to ${booking.email}`);
      } catch (emailErr) {
        console.error("Email notification failed:", emailErr);
        // Don't fail the request if email fails
      }
    }

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
};

router.put("/:id", requireAdmin, updateStatus);
router.put("/:id/status", requireAdmin, updateStatus);

/* ------------------------------
   DELETE (ADMIN ONLY)
------------------------------ */
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const booking = await deleteBookingByIdOrTrackId(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete booking" });
  }
});

module.exports = router;
