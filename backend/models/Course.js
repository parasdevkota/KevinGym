const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  schedule:    { type: String, required: true },
  time:        { type: String },
  description: { type: String },
  studio:      { type: String },
  vendorId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('Course', courseSchema);
