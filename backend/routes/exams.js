const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const Exam = require('../models/Exam');
const Student = require('../models/Student');

const router = express.Router();

// Create exam (Teacher/Admin)
router.post('/', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { name, type, class: classId, subject, date, duration, totalMarks, passingMarks } = req.body;

    const exam = new Exam({
      name,
      type,
      class: classId,
      subject,
      date: new Date(date),
      duration,
      totalMarks,
      passingMarks,
      createdBy: req.user.id
    });

    await exam.save();

    res.status(201).json({
      message: 'Exam created successfully',
      exam
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get exams
router.get('/', auth, async (req, res) => {
  try {
    const { classId, subject, type } = req.query;
    let query = { isActive: true };

    if (classId) query.class = classId;
    if (subject) query.subject = subject;
    if (type) query.type = type;

    const exams = await Exam.find(query)
      .populate('class', 'name grade')
      .populate('subject', 'name code')
      .populate('createdBy', 'profile.firstName profile.lastName')
      .sort({ date: -1 });

    res.json({ exams });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add exam results (Teacher/Admin)
router.post('/:id/results', auth, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { results } = req.body;

    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      { results },
      { new: true }
    ).populate('results.student', 'user rollNumber');

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.json({
      message: 'Results added successfully',
      exam
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;