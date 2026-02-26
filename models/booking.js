const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  trackId: String,
  user: String,
  email: String,
  division: String,
  room: String,
  team: String,
  meetingType: String,
  date: String,
  start: String,
  end: String,
  attendees: Number,
  visitors: Number,

  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },

  status: { type: String, default: "PENDING" }
}, { timestamps: true });

module.exports = mongoose.model("Booking", BookingSchema);
