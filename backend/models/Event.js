const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['academic', 'sports', 'cultural', 'holiday', 'meeting', 'exam'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  location: String,
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: {
    roles: [{ type: String, enum: ['student', 'teacher', 'parent', 'all'] }],
    classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
    specific: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);