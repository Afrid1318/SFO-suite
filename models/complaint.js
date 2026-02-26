const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({
  subject: String,
  description: String,
  user: String,
  email: String,
  status: { type: String, default: "PENDING" }
}, { timestamps: true });

module.exports = mongoose.model("Complaint", ComplaintSchema);
