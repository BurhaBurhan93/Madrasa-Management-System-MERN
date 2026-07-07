const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    default: '12:00 PM'
  },
  location: {
    type: String,
    default: 'N/A'
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['Personal', 'Study Group', 'Meeting', 'Reminder', 'Other'],
    default: 'Personal'
  },
  status: {
    type: String,
    enum: ['upcoming', 'completed'],
    default: 'upcoming'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
