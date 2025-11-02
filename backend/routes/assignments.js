const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const Assignment = require('../models/Assignment');
const Student = require('../models/Student');
const upload = require('../middleware/upload');

const router = express.Router();

// Create assignment (Teacher)
router.post('/', auth, authorize('teacher'), upload.array('attachments', 5), async (req, res) => {
  try {
    const { title, description, class: classId, subject, dueDate, totalMarks } = req.body;

    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size
    })) : [];

    const assignment = new Assignment({
      title,
      description,
      class: classId,
      subject,
      assignedBy: req.user.id,
      dueDate: new Date(dueDate),
      totalMarks: totalMarks || 100,
      attachments
    });

    await assignment.save();

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get assignments
router.get('/', auth, async (req, res) => {
  try {
    const { classId, subject } = req.query;
    let query = { isActive: true };

    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user.id });
      if (student) {
        query.class = student.class;
      }
    } else if (classId) {
      query.class = classId;
    }

    if (subject) query.subject = subject;

    const assignments = await Assignment.find(query)
      .populate('class', 'name grade')
      .populate('subject', 'name code')
      .populate('assignedBy', 'profile.firstName profile.lastName')
      .sort({ createdAt: -1 });

    res.json({ assignments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit assignment (Student)
router.post('/:id/submit', auth, authorize('student'), upload.array('files', 3), async (req, res) => {
  try {
    const { text } = req.body;
    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const files = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size
    })) : [];

    const isLate = new Date() > assignment.dueDate;

    const submission = {
      student: student._id,
      files,
      text,
      isLate
    };

    // Check if already submitted
    const existingSubmission = assignment.submissions.find(
      sub => sub.student.toString() === student._id.toString()
    );

    if (existingSubmission) {
      return res.status(400).json({ message: 'Assignment already submitted' });
    }

    assignment.submissions.push(submission);
    await assignment.save();

    res.json({
      message: 'Assignment submitted successfully',
      submission
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;