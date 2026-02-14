const Student = require('../models/Student');
const User = require('../models/User');
const Course = require('../models/Subject'); // Assuming subjects are courses for students
const AttendanceRecord = require('../models/AttendanceRecord');
const Exam = require('../models/Exam');
const ExamAnswer = require('../models/ExamAnswer');
const FeePayment = require('../models/FeePayment');
const Complaint = require('../models/Complaint');
const Assignment = require('../models/Assignment');

const jwt = require('jsonwebtoken');

// Get student profile
const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id }).populate('userId');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json({
      id: student._id,
      name: student.userId.name,
      email: student.userId.email,
      studentId: student.studentId,
      phone: student.phone,
      dateOfBirth: student.dateOfBirth,
      address: student.address,
      enrollmentDate: student.enrollmentDate,
      status: student.status,
      courseId: student.courseId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update student profile
const updateStudentProfile = async (req, res) => {
  try {
    const { phone, address, dateOfBirth } = req.body;
    
    const student = await Student.findOneAndUpdate(
      { userId: req.user.id },
      { phone, address, dateOfBirth },
      { new: true }
    ).populate('userId');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json({
      id: student._id,
      name: student.userId.name,
      email: student.userId.email,
      studentId: student.studentId,
      phone: student.phone,
      dateOfBirth: student.dateOfBirth,
      address: student.address,
      enrollmentDate: student.enrollmentDate,
      status: student.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student courses
const getStudentCourses = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Assuming courseId refers to Subject model
    const courses = await Course.find({ _id: { $in: student.courseId } });
    
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student attendance records
const getAttendanceRecords = async (req, res) => {
  try {
    const records = await AttendanceRecord.find({ 
      studentId: req.user.id 
    }).populate('courseId');
    
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student assignments
const getAssignments = async (req, res) => {
  try {
    // Find student to get their enrolled courses
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Get assignments for the student's courses
    const assignments = await Assignment.find({
      courseId: { $in: student.courseId }
    }).populate('courseId');
    
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student exam results
const getExamResults = async (req, res) => {
  try {
    const results = await ExamAnswer.find({ 
      studentId: req.user.id 
    }).populate('examId');
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student fee payments
const getFeePayments = async (req, res) => {
  try {
    const payments = await FeePayment.find({ 
      studentId: req.user.id 
    }).sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit complaint
const submitComplaint = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    const complaint = new Complaint({
      studentId: req.user.id,
      title,
      description,
      category,
      status: 'pending'
    });
    
    await complaint.save();
    
    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudentProfile,
  updateStudentProfile,
  getStudentCourses,
  getAttendanceRecords,
  getAssignments,
  getExamResults,
  getFeePayments,
  submitComplaint
};