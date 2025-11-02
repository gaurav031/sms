const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const Subject = require('../models/Subject');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await Class.deleteMany({});
    await Subject.deleteMany({});

    // Create subjects
    const subjects = await Subject.insertMany([
      { name: 'Mathematics', code: 'MATH101', type: 'core' },
      { name: 'English', code: 'ENG101', type: 'core' },
      { name: 'Science', code: 'SCI101', type: 'core' },
      { name: 'History', code: 'HIST101', type: 'elective' }
    ]);

    // Create classes
    const classes = await Class.insertMany([
      {
        name: 'Class 10',
        grade: 10,
        sections: [{ name: 'A', capacity: 40 }, { name: 'B', capacity: 40 }],
        subjects: subjects.map(s => s._id)
      },
      {
        name: 'Class 9',
        grade: 9,
        sections: [{ name: 'A', capacity: 40 }],
        subjects: subjects.map(s => s._id)
      }
    ]);

    // Create demo users
    // Admin user
    const adminUser = await User.create({
      email: 'admin@school.com',
      password: 'password123',
      role: 'admin',
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        phone: '1234567890',
        gender: 'male'
      },
      isActive: true,
      emailVerified: true
    });

    // Teacher user
    const teacherUser = await User.create({
      email: 'teacher@school.com',
      password: 'password123',
      role: 'teacher',
      profile: {
        firstName: 'John',
        lastName: 'Teacher',
        phone: '1234567891',
        gender: 'male'
      },
      isActive: true,
      emailVerified: true
    });

    // Student user
    const studentUser = await User.create({
      email: 'student@school.com',
      password: 'password123',
      role: 'student',
      profile: {
        firstName: 'Jane',
        lastName: 'Student',
        phone: '1234567892',
        gender: 'female'
      },
      isActive: true,
      emailVerified: true
    });

    // Create teacher profile
    await Teacher.create({
      user: teacherUser._id,
      teacherId: 'T001',
      subjects: [subjects[0]._id, subjects[1]._id],
      classes: [
        { class: classes[0]._id, section: 'A', isClassTeacher: true },
        { class: classes[1]._id, section: 'A', isClassTeacher: false }
      ],
      qualifications: [
        { degree: 'B.Ed', institution: 'University College', year: 2020 }
      ],
      experience: { totalYears: 3 },
      joiningDate: new Date('2021-01-01')
    });

    // Create student profile
    await Student.create({
      user: studentUser._id,
      studentId: 'S001',
      class: classes[0]._id,
      section: 'A',
      rollNumber: 1,
      parentInfo: {
        fatherName: 'John Doe',
        motherName: 'Jane Doe',
        guardianPhone: '9876543210',
        guardianEmail: 'parent@example.com'
      },
      feeStatus: {
        totalFees: 50000,
        paidFees: 30000,
        pendingFees: 20000
      },
      attendance: [
        { date: new Date(), status: 'present', markedBy: teacherUser._id },
        { date: new Date(Date.now() - 86400000), status: 'present', markedBy: teacherUser._id },
        { date: new Date(Date.now() - 172800000), status: 'absent', markedBy: teacherUser._id }
      ]
    });

    console.log('Demo data seeded successfully!');
    console.log('\nDemo Credentials:');
    console.log('Admin: admin@school.com / password123');
    console.log('Teacher: teacher@school.com / password123');
    console.log('Student: student@school.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  await seedData();
};

run();