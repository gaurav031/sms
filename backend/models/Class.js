const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  grade: {
    type: Number,
    required: true
  },
  sections: [{
    name: String,
    capacity: Number,
    classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }
  }],
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  timetable: [{
    day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] },
    periods: [{
      period: Number,
      subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
      teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
      startTime: String,
      endTime: String
    }]
  }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Class', classSchema);