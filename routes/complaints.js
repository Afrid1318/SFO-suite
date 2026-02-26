const express = require("express");
const Complaint = require("../models/complaint");
const { requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

/* ------------------------------
   CREATE COMPLAINT
------------------------------ */
router.post("/", async (req, res) => {
  try {
    const { subject, description, user, email } = req.body;

    if (!subject || !description || !user || !email) {
      return res.status(400).json({ error: "Missing required complaint fields" });
    }

    const complaint = new Complaint({
      subject,
      description,
      user,
      email,
      status: "PENDING"
    });

    await complaint.save();
    res.status(201).json(complaint);
  } catch (err) {
    console.error("CREATE COMPLAINT ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ------------------------------
   GET ALL COMPLAINTS (ADMIN ONLY)
------------------------------ */
router.get("/", requireAdmin, async (req, res) => {
  try {
    let query = {};
    const { status } = req.query;

    if (status) {
      query.status = status;
    }

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

/* ------------------------------
   UPDATE STATUS (ADMIN ONLY)
------------------------------ */
router.put("/:id/status", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    // Send email notification if email is configured
    try {
      const { sendComplaintConfirmation } = require("../config/email");
      await sendComplaintConfirmation(complaint);
    } catch (emailErr) {
      console.warn("Email notification failed:", emailErr.message);
    }

    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

/* ------------------------------
   DELETE COMPLAINT (ADMIN ONLY)
------------------------------ */
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete complaint" });
  }
});

module.exports = router;
