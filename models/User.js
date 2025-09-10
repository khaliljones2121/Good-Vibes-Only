const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  notificationTimes: {
    type: [String], // Array of time strings, e.g. "09:00", "17:00"
    default: ["09:00", "13:00", "17:00", "21:00"]
  },
  affirmationFrequency: {
    type: Number,
    default: 4
  },
  avatar: { type: String },
});

module.exports = mongoose.model('User', userSchema);
