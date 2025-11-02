const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  credits: { type: Number, default: 1 },
  type: {
    type: String,
    enum: ['core', 'elective', 'practical'],
    default: 'core'
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema);