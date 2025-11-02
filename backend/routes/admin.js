const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Notice = require('../models/Notice');
const emailService = require('../utils/emailService');
const notificationService = require('../utils/notificationService');

const router = express.Router();

// Generate random password
const generatePassword = () => {
  return Math.random().toString(36).slice(-8);
};

// Create user (Student/Teacher/Staff)
router.post('/users', auth, authorize('admin'), async (req, res) => {
  try {
    const { email, role, profile, studentData, teacherData } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate temporary password
    const tempPassword = generatePassword();

    // Create user
    const user = new User({
      email,
      password: tempPassword,
      role,
      profile
    });

    await user.save();

    // Create role-specific profile
    if (role === 'student' && studentData) {
      const student = new Student({
        user: user._id,
        studentId: studentData.studentId,
        class: studentData.class,
        section: studentData.section,
        rollNumber: studentData.rollNumber,
        parentInfo: studentData.parentInfo,
        academicInfo: studentData.academicInfo
      });
      await student.save();
    } else if (role === 'teacher' && teacherData) {
      const teacher = new Teacher({
        user: user._id,
        teacherId: teacherData.teacherId,
        subjects: teacherData.subjects,
        classes: teacherData.classes,
        qualifications: teacherData.qualifications,
        experience: teacherData.experience
      });
      await teacher.save();
    }

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user, tempPassword);
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
    }

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile
      },
      tempPassword
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users with pagination
router.get('/users', auth, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
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

// Update user
router.put('/users/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { profile, isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { profile, isActive },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user
router.delete('/users/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete role-specific data
    if (user.role === 'student') {
      await Student.findOneAndDelete({ user: user._id });
    } else if (user.role === 'teacher') {
      await Teacher.findOneAndDelete({ user: user._id });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create class
router.post('/classes', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, grade, sections, subjects } = req.body;

    const classData = new Class({
      name,
      grade,
      sections,
      subjects
    });

    await classData.save();

    res.status(201).json({
      message: 'Class created successfully',
      class: classData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all classes
router.get('/classes', auth, authorize('admin', 'teacher', 'principal'), async (req, res) => {
  try {
    const classes = await Class.find({ isActive: true })
      .populate('subjects', 'name code')
      .populate('sections.classTeacher', 'profile.firstName profile.lastName')
      .sort({ grade: 1, name: 1 });

    res.json({ classes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create subject
router.post('/subjects', auth, authorize('admin'), async (req, res) => {
  try {
    const { name, code, description, credits, type } = req.body;

    const subject = new Subject({
      name,
      code,
      description,
      credits,
      type
    });

    await subject.save();

    res.status(201).json({
      message: 'Subject created successfully',
      subject
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all subjects
router.get('/subjects', auth, authorize('admin', 'teacher', 'principal'), async (req, res) => {
  try {
    const subjects = await Subject.find({ isActive: true }).sort({ name: 1 });
    res.json({ subjects });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get dashboard stats
router.get('/dashboard', auth, authorize('admin', 'principal'), async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ isActive: true });
    const totalTeachers = await Teacher.countDocuments({ isActive: true });
    const totalClasses = await Class.countDocuments({ isActive: true });
    const totalSubjects = await Subject.countDocuments({ isActive: true });

    // Get recent registrations
    const recentUsers = await User.find()
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      stats: {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalSubjects
      },
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Assign teacher to class and subjects
router.post('/teachers/:id/assign', auth, authorize('admin'), async (req, res) => {
  try {
    const { classes, subjects } = req.body;
    
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { classes, subjects },
      { new: true }
    ).populate('subjects classes.class user');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json({
      message: 'Teacher assigned successfully',
      teacher
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all teachers for assignment
router.get('/teachers', auth, authorize('admin'), async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .populate('user', 'profile email')
      .populate('subjects', 'name code')
      .populate('classes.class', 'name grade');

    res.json({ teachers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update student fee status
router.put('/students/:id/fees', auth, authorize('admin'), async (req, res) => {
  try {
    const { totalFees, paidFees } = req.body;
    
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        'feeStatus.totalFees': totalFees,
        'feeStatus.paidFees': paidFees,
        'feeStatus.pendingFees': totalFees - paidFees,
        'feeStatus.lastPaymentDate': paidFees > 0 ? new Date() : undefined
      },
      { new: true }
    ).populate('user', 'profile email');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Send notification if fees are updated
    await notificationService.notifyUser(
      req.io,
      student.user,
      'Fee Status Updated',
      `Your fee status has been updated. Pending amount: ₹${student.feeStatus.pendingFees}`,
      'fee',
      { feeStatus: student.feeStatus },
      'medium',
      true
    );

    res.json({
      message: 'Fee status updated successfully',
      student
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get students by class
router.get('/students/class/:classId', auth, authorize('admin'), async (req, res) => {
  try {
    const students = await Student.find({ class: req.params.classId })
      .populate('user', 'profile email')
      .populate('class', 'name grade');

    res.json({ students });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Post admin notice
router.post('/notices', auth, authorize('admin'), async (req, res) => {
  try {
    const { title, content, type, priority, targetRoles, targetClasses } = req.body;

    const notice = new Notice({
      title,
      content,
      type,
      priority,
      targetAudience: {
        roles: targetRoles || ['all'],
        classes: targetClasses || []
      },
      publishedBy: req.user.id
    });

    await notice.save();

    // Send notifications to targeted users
    let users = [];
    if (targetRoles?.includes('all') || !targetRoles) {
      users = await User.find({ isActive: true });
    } else {
      users = await User.find({ role: { $in: targetRoles }, isActive: true });
    }

    const notificationPromises = users.map(user => 
      notificationService.notifyUser(
        req.io,
        user,
        `New Notice: ${title}`,
        content.substring(0, 100) + '...',
        'notice',
        { noticeId: notice._id },
        priority,
        true
      )
    );

    await Promise.all(notificationPromises);

    res.status(201).json({ message: 'Notice posted successfully', notice });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Generate timetable
router.post('/timetable/generate', auth, authorize('admin'), async (req, res) => {
  try {
    const { classId, subjects } = req.body;
    
    const classData = await Class.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const periods = [1, 2, 3, 4, 5, 6];
    const timeSlots = [
      { period: 1, startTime: '09:00', endTime: '09:45' },
      { period: 2, startTime: '09:45', endTime: '10:30' },
      { period: 3, startTime: '10:45', endTime: '11:30' },
      { period: 4, startTime: '11:30', endTime: '12:15' },
      { period: 5, startTime: '13:00', endTime: '13:45' },
      { period: 6, startTime: '13:45', endTime: '14:30' }
    ];

    const timetable = [];
    
    for (const day of days) {
      const daySchedule = {
        day,
        periods: []
      };

      for (let i = 0; i < periods.length; i++) {
        const subject = subjects[i % subjects.length];
        const timeSlot = timeSlots[i];
        
        daySchedule.periods.push({
          period: timeSlot.period,
          subject: subject.subjectId,
          teacher: subject.teacherId,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime
        });
      }
      
      timetable.push(daySchedule);
    }

    classData.timetable = timetable;
    await classData.save();

    res.json({ message: 'Timetable generated successfully', timetable });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;