const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
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
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  totalMarks: {
    type: Number,
    default: 100
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number
  }],
  submissions: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    submittedAt: { type: Date, default: Date.now },
    files: [{
      filename: String,
      originalName: String,
      path: String,
      size: Number
    }],
    text: String,
    marksObtained: Number,
    feedback: String,
    isLate: { type: Boolean, default: false }
  }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);