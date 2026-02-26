const express = require("express");
const Booking = require("../models/booking");
const Complaint = require("../models/complaint");
const { sendBookingConfirmation, sendComplaintConfirmation } = require("../config/email");
const { requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

/* ------------------------------
   SEND EMAIL WITH PDF
------------------------------ */
router.post("/send/:id", requireAdmin, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // If PDF buffer is sent in the request body, use it
    const pdfBuffer = req.body.pdfBuffer ? Buffer.from(req.body.pdfBuffer, 'base64') : null;

    const result = await sendBookingConfirmation(booking, pdfBuffer);

    if (result.success) {
      res.json({ 
        success: true, 
        message: "Email sent successfully",
        messageId: result.messageId 
      });
    } else {
      res.status(500).json({ 
        error: result.message || result.error || "Failed to send email" 
      });
    }
  } catch (err) {
    console.error("Email route error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ------------------------------
   SEND EMAIL TO SPECIFIC ADDRESS
------------------------------ */
router.post("/send-to", requireAdmin, async (req, res) => {
  try {
    const { bookingId, email, pdfBuffer } = req.body;
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Temporarily override email for custom recipient
    const originalEmail = booking.email;
    booking.email = email;

    const buffer = pdfBuffer ? Buffer.from(pdfBuffer, 'base64') : null;
    const result = await sendBookingConfirmation(booking, buffer);

    // Restore original email
    booking.email = originalEmail;

    if (result.success) {
      res.json({ 
        success: true, 
        message: `Email sent to ${email}`,
        messageId: result.messageId 
      });
    } else {
      res.status(500).json({ 
        error: result.message || result.error || "Failed to send email" 
      });
    }
  } catch (err) {
    console.error("Email route error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ------------------------------
   SEND COMPLAINT EMAIL WITH PDF
------------------------------ */
router.post("/send-complaint/:id", requireAdmin, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    // If PDF buffer is sent in the request body, use it
    const pdfBuffer = req.body.pdfBuffer ? Buffer.from(req.body.pdfBuffer, 'base64') : null;

    const result = await sendComplaintConfirmation(complaint, pdfBuffer);

    if (result.success) {
      res.json({ 
        success: true, 
        message: "Email sent successfully",
        messageId: result.messageId 
      });
    } else {
      res.status(500).json({ 
        error: result.message || result.error || "Failed to send email" 
      });
    }
  } catch (err) {
    console.error("Complaint email route error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
