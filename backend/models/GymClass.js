const mongoose = require('mongoose');

const gymClassSchema = new mongoose.Schema({
  classId: { type: String, required: true, unique: true },
  name: { type: String, default: '' },
  classroom: { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  capacity: { type: Number, default: 20 },
  enrolled: { type: Number, default: 0 },
});

module.exports = mongoose.model('GymClass', gymClassSchema);
