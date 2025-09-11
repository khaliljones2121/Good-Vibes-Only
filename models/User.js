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

  breathingTechniques: {
    type: [String],
    default: [
      '4-7-8 Breathing',
      'Box Breathing',
      'Diaphragmatic Breathing'
    ]
  },

  meditationReminders: {
    type: [String],
    default: [
      'Take 2 minutes to focus on your breath.',
      'Pause and meditate for 5 minutes.',
      'Practice mindfulness for a moment.'
    ]
  },

  breathingNotificationTimes: {
    type: [String],
    default: ['09:00', '13:00']
  },

  meditationNotificationTimes: {
    type: [String],
    default: ['10:00', '18:00']
  },
});

module.exports = mongoose.model('User', userSchema);
