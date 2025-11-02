const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['video', 'document', 'link', 'assignment'],
    required: true
  },
  content: {
    url: String,
    file: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimeType: String
    }
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [String],
  isActive: { type: Boolean, default: true },
  accessCount: { type: Number, default: 0 },
  lastAccessed: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Content', contentSchema);