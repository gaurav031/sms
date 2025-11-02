const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  section: String,
  rollNumber: { type: Number, required: true },
  admissionDate: { type: Date, default: Date.now },
  parentInfo: {
    fatherName: String,
    motherName: String,
    guardianPhone: String,
    guardianEmail: String,
    emergencyContact: String
  },
  academicInfo: {
    previousSchool: String,
    medicalInfo: String,
    bloodGroup: String
  },
  feeStatus: {
    totalFees: { type: Number, default: 0 },
    paidFees: { type: Number, default: 0 },
    pendingFees: { type: Number, default: 0 },
    lastPaymentDate: Date
  },
  attendance: [{
    date: { type: Date, required: true },
    status: { type: String, enum: ['present', 'absent', 'late'], required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  busPass: {
    isActive: { type: Boolean, default: false },
    route: String,
    pickupPoint: String,
    validUntil: Date
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

studentSchema.virtual('attendancePercentage').get(function() {
  if (this.attendance.length === 0) return 0;
  const presentDays = this.attendance.filter(a => a.status === 'present').length;
  return Math.round((presentDays / this.attendance.length) * 100);
});

module.exports = mongoose.model('Student', studentSchema);