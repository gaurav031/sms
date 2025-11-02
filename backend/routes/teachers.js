const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Content = require('../models/Content');
const Notice = require('../models/Notice');
const Leave = require('../models/Leave');
const upload = require('../middleware/upload');
const notificationService = require('../utils/notificationService');

const router = express.Router();

// Get teacher dashboard
router.get('/dashboard', auth, authorize('teacher'), async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id })
      .populate('subjects', 'name code')
      .populate('classes.class', 'name grade');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    // Get students count for assigned classes
    const classIds = teacher.classes.map(c => c.class._id);
    const studentsCount = await Student.countDocuments({ class: { $in: classIds } });

    // Get recent content uploads
    const recentContent = await Content.find({ uploadedBy: req.user.id })
      .populate('subject', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      teacher,
      studentsCount,
      recentContent
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get assigned students
router.get('/students', auth, authorize('teacher'), async (req, res) => {
  try {
    const { classId, section } = req.query;
    const teacher = await Teacher.findOne({ user: req.user.id });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    // Check if teacher is assigned to this class
    const assignedClass = teacher.classes.find(c => 
      c.class.toString() === classId && (!section || c.section === section)
    );

    if (!assignedClass) {
      return res.status(403).json({ message: 'Not authorized for this class' });
    }

    const query = { class: classId };
    if (section) query.section = section;

    const students = await Student.find(query)
      .populate('user', 'profile email')
      .sort({ rollNumber: 1 });

    res.json({ students });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Take attendance
router.post('/attendance', auth, authorize('teacher'), async (req, res) => {
  try {
    const { classId, section, subject, date, attendance } = req.body;
    const teacher = await Teacher.findOne({ user: req.user.id });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    // Verify teacher assignment
    const assignedClass = teacher.classes.find(c => 
      c.class.toString() === classId && (!section || c.section === section)
    );

    if (!assignedClass) {
      return res.status(403).json({ message: 'Not authorized for this class' });
    }

    // Update attendance for each student
    const attendancePromises = attendance.map(async (record) => {
      const student = await Student.findById(record.studentId);
      if (student) {
        student.attendance.push({
          date: new Date(date),
          status: record.status,
          subject,
          markedBy: req.user.id
        });
        await student.save();
      }
    });

    await Promise.all(attendancePromises);

    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload content
router.post('/content', auth, authorize('teacher'), upload.single('file'), async (req, res) => {
  try {
    const { title, description, type, classId, subject, url, tags } = req.body;
    const teacher = await Teacher.findOne({ user: req.user.id });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    // Verify teacher assignment
    const assignedClass = teacher.classes.find(c => c.class.toString() === classId);
    if (!assignedClass) {
      return res.status(403).json({ message: 'Not authorized for this class' });
    }

    const contentData = {
      title,
      description,
      type,
      class: classId,
      subject,
      uploadedBy: req.user.id,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    };

    if (type === 'link') {
      contentData.content = { url };
    } else if (req.file) {
      contentData.content = {
        file: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          path: req.file.path,
          size: req.file.size,
          mimeType: req.file.mimetype
        }
      };
    }

    const content = new Content(contentData);
    await content.save();

    // Notify students
    const students = await Student.find({ class: classId }).populate('user');
    const notificationPromises = students.map(student => 
      notificationService.notifyUser(
        req.io,
        student.user,
        'New Content Available',
        `New ${type} "${title}" has been uploaded for your class`,
        'assignment',
        { contentId: content._id },
        'medium',
        true
      )
    );

    await Promise.all(notificationPromises);

    res.status(201).json({
      message: 'Content uploaded successfully',
      content
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get uploaded content
router.get('/content', auth, authorize('teacher'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const content = await Content.find({ uploadedBy: req.user.id })
      .populate('class', 'name grade')
      .populate('subject', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Content.countDocuments({ uploadedBy: req.user.id });

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

// Get teacher's assigned classes and subjects
router.get('/assignments', auth, authorize('teacher'), async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id })
      .populate('subjects', 'name code')
      .populate('classes.class', 'name grade sections');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    res.json({
      subjects: teacher.subjects,
      classes: teacher.classes
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get leave applications for teacher's classes
router.get('/leave-applications', auth, authorize('teacher'), async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    const classIds = teacher.classes.map(c => c.class);
    const students = await Student.find({ class: { $in: classIds } });
    const studentIds = students.map(s => s._id);

    const leaves = await Leave.find({ student: { $in: studentIds } })
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: 'profile'
        }
      })
      .sort({ createdAt: -1 });

    res.json({ leaves });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve/Reject leave
router.put('/leave/:id', auth, authorize('teacher'), async (req, res) => {
  try {
    const { status, comments } = req.body;
    
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status,
        comments,
        approvedBy: req.user.id,
        approvalDate: new Date()
      },
      { new: true }
    ).populate({
      path: 'student',
      populate: {
        path: 'user',
        select: 'profile email'
      }
    });

    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    // Send notification to student
    await notificationService.notifyUser(
      req.io,
      leave.student.user,
      `Leave Application ${status}`,
      `Your leave application has been ${status}. ${comments || ''}`,
      'leave',
      { leaveId: leave._id },
      'high',
      true
    );

    res.json({ message: 'Leave status updated successfully', leave });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Post notice
router.post('/notices', auth, authorize('teacher'), async (req, res) => {
  try {
    const { title, content, type, priority, targetClasses, targetSections } = req.body;
    const teacher = await Teacher.findOne({ user: req.user.id });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    const notice = new Notice({
      title,
      content,
      type,
      priority,
      targetAudience: {
        roles: ['student'],
        classes: targetClasses,
        sections: targetSections
      },
      publishedBy: req.user.id
    });

    await notice.save();

    // Notify targeted students
    const query = {};
    if (targetClasses && targetClasses.length > 0) {
      query.class = { $in: targetClasses };
    }
    if (targetSections && targetSections.length > 0) {
      query.section = { $in: targetSections };
    }

    const students = await Student.find(query).populate('user');
    const notificationPromises = students.map(student => 
      notificationService.notifyUser(
        req.io,
        student.user,
        `New Notice: ${title}`,
        content.substring(0, 100) + '...',
        'notice',
        { noticeId: notice._id },
        priority,
        true
      )
    );

    await Promise.all(notificationPromises);

    res.status(201).json({
      message: 'Notice posted successfully',
      notice
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;