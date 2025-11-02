const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const Student = require('../models/Student');
const Content = require('../models/Content');
const Notice = require('../models/Notice');
const Leave = require('../models/Leave');
const Exam = require('../models/Exam');
const upload = require('../middleware/upload');

const router = express.Router();

// Get student dashboard
router.get('/dashboard', auth, authorize('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id })
      .populate('class', 'name grade')
      .populate('user', 'profile');

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Get recent attendance
    const recentAttendance = student.attendance.slice(-10);
    
    // Get notices for student's class
    const notices = await Notice.find({
      $or: [
        { 'targetAudience.roles': 'student' },
        { 'targetAudience.classes': student.class._id }
      ],
      isActive: true
    }).sort({ createdAt: -1 }).limit(5);

    // Calculate attendance percentage
    const totalDays = student.attendance.length;
    const presentDays = student.attendance.filter(a => a.status === 'present').length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    res.json({
      student,
      attendancePercentage,
      recentAttendance,
      feeStatus: student.feeStatus,
      notices
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get attendance history
router.get('/attendance', auth, authorize('student'), async (req, res) => {
  try {
    const { page = 1, limit = 20, month, year } = req.query;
    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    let query = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query = {
        date: { $gte: startDate, $lte: endDate }
      };
    }

    const attendance = student.attendance.filter(record => {
      if (month && year) {
        const recordDate = new Date(record.date);
        return recordDate >= query.date.$gte && recordDate <= query.date.$lte;
      }
      return true;
    });

    const startIndex = (page - 1) * limit;
    const paginatedAttendance = attendance.slice(startIndex, startIndex + parseInt(limit));

    // Calculate attendance percentage
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    res.json({
      attendance: paginatedAttendance,
      totalRecords: attendance.length,
      attendancePercentage
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get e-content
router.get('/content', auth, authorize('student'), async (req, res) => {
  try {
    const { subject, type, page = 1, limit = 10 } = req.query;
    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const query = {
      class: student.class,
      isActive: true
    };

    if (subject) query.subject = subject;
    if (type) query.type = type;

    const skip = (page - 1) * limit;
    const content = await Content.find(query)
      .populate('subject', 'name code')
      .populate('uploadedBy', 'profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Content.countDocuments(query);

    res.json({
      content,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Apply for leave
router.post('/leave', auth, authorize('student'), upload.array('attachments', 3), async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path
    })) : [];

    const leave = new Leave({
      student: student._id,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      attachments
    });

    await leave.save();

    res.status(201).json({
      message: 'Leave application submitted successfully',
      leave
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get leave applications
router.get('/leave', auth, authorize('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const leaves = await Leave.find({ student: student._id })
      .populate('approvedBy', 'profile.firstName profile.lastName')
      .sort({ createdAt: -1 });

    res.json({ leaves });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get timetable
router.get('/timetable', auth, authorize('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id })
      .populate({
        path: 'class',
        populate: {
          path: 'timetable.periods.subject timetable.periods.teacher',
          select: 'name code profile.firstName profile.lastName'
        }
      });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.json({ timetable: student.class.timetable });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get upcoming exams
router.get('/exams', auth, authorize('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const exams = await Exam.find({
      class: student.class,
      date: { $gte: new Date() },
      isActive: true
    })
    .populate('subject', 'name code')
    .populate('createdBy', 'profile.firstName profile.lastName')
    .sort({ date: 1 });

    res.json({ exams });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;