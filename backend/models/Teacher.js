const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacherId: {
    type: String,
    required: true,
    unique: true
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  classes: [{
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    section: String,
    isClassTeacher: { type: Boolean, default: false }
  }],
  qualifications: [{
    degree: String,
    institution: String,
    year: Number
  }],
  experience: {
    totalYears: Number,
    previousSchools: [String]
  },
  salary: {
    basic: Number,
    allowances: Number,
    deductions: Number
  },
  joiningDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Teacher', teacherSchema);