const express = require('express');
const router = express.Router();
const authenticateToken = require('../../middleware/auth');
const { getDashboardStats } = require('./teacherController');
const Student = require('../../models/Student');
const User = require('../../models/User');
const Subject = require('../../models/Subject');
const Class = require('../../models/Class');
const Assignment = require('../../models/Assignment');
const Exam = require('../../models/Exam');
const AttendanceRecord = require('../../models/AttendanceRecord');
const Complaint = require('../../models/Complaint');

const ensureTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Teachers only.' });
  }
  next();
};

router.use(authenticateToken);
router.use(ensureTeacher);

// Get teacher dashboard stats
router.get('/dashboard', getDashboardStats);

// Get all students
router.get('/students', async (req, res) => {
  try {
    const students = await Student.find({ status: 'active' })
      .populate('userId', 'name email')
      .limit(10);
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all subjects
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await Subject.find({ isActive: true }).limit(10);
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all assignments
router.get('/assignments', async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('subject', 'name')
      .populate('class', 'name section')
      .limit(10);
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all exams
router.get('/exams', async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate('subject', 'name')
      .populate('class', 'name section')
      .limit(10);
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance records
router.get('/attendance', async (req, res) => {
  try {
    const attendance = await AttendanceRecord.find()
      .populate('student', 'studentId')
      .populate('subject', 'name')
      .limit(10);
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get complaints assigned to teacher
router.get('/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('submittedBy', 'name')
      .limit(10);
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
