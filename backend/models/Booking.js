const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gymClass: { type: mongoose.Schema.Types.ObjectId, ref: 'GymClass', required: true },
  status: { type: String, enum: ['active', 'cancelled'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
