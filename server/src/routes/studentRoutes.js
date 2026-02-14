const express = require('express');
const router = express.Router();
const { 
  getStudentProfile, 
  updateStudentProfile, 
  getStudentCourses, 
  getAttendanceRecords,
  getAssignments,
  getExamResults,
  getFeePayments,
  submitComplaint
} = require('../controllers/studentController');
const authenticateToken = require('../middleware/auth');

// Middleware to ensure user is a student
const ensureStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Access denied. Students only.' });
  }
  next();
};

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Apply student role check to all routes
router.use(ensureStudent);

// Student profile routes
router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);

// Student academic routes
router.get('/courses', getStudentCourses);
router.get('/attendance', getAttendanceRecords);
router.get('/assignments', getAssignments);
router.get('/results', getExamResults);

// Student finance routes
router.get('/fees', getFeePayments);

// Student communication routes
router.post('/complaints', submitComplaint);

module.exports = router;