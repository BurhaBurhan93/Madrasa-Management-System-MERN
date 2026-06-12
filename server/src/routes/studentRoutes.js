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
  submitComplaint,
  getStudentComplaints,
  getStudentLeaves,
  createStudentLeave,
  getStudentEducation,
  createStudentEducation,
  getStudentDegrees,
  getBooks,
  getBorrowedBooks,
  getStudentDocuments,
  getStudentFinalResults,
  getExams
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
router.get('/complaints', getStudentComplaints);
router.post('/complaints', submitComplaint);

// Student leave routes
router.get('/leaves', getStudentLeaves);
router.post('/leaves', createStudentLeave);

// Student education routes
router.get('/education', getStudentEducation);
router.post('/education', createStudentEducation);

// Student degree routes
router.get('/degrees', getStudentDegrees);

// Student library routes
router.get('/books', getBooks);
router.get('/borrowed-books', getBorrowedBooks);

// Student documents routes
router.get('/documents', getStudentDocuments);

// Student exam routes
router.get('/exams', getExams);
router.get('/exam-results', getExamResults);
router.get('/final-results', getStudentFinalResults);

module.exports = router;