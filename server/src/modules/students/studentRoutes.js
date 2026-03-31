const express = require('express');
const router = express.Router();
const ctrl = require('./studentController');
const authenticateToken = require('../../middleware/auth');

const ensureStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Access denied. Students only.' });
  }
  next();
};

router.use(authenticateToken);
router.use(ensureStudent);

router.get('/profile', ctrl.getStudentProfile);
router.put('/profile', ctrl.updateStudentProfile);

router.get('/courses', ctrl.getStudentCourses);
router.get('/attendance', ctrl.getAttendanceRecords);
router.get('/assignments', ctrl.getAssignments);
router.get('/results', ctrl.getExamResults);

router.get('/fees', ctrl.getFeePayments);

router.get('/complaints', ctrl.getStudentComplaints);
router.post('/complaints', ctrl.submitComplaint);

// Leave routes
router.get('/leaves', ctrl.getStudentLeaves);
router.post('/leaves', ctrl.createStudentLeave);

// Education routes
router.get('/education', ctrl.getStudentEducation);
router.post('/education', ctrl.createStudentEducation);
router.put('/education/:id', ctrl.updateStudentEducation);
router.delete('/education/:id', ctrl.deleteStudentEducation);

// Degree routes
router.get('/degrees', ctrl.getStudentDegrees);

// Library routes
router.get('/books', ctrl.getBooks);
router.get('/borrowed-books', ctrl.getBorrowedBooks);
router.post('/books/:id/borrow', ctrl.borrowBook);
router.post('/books/:id/return', ctrl.returnBook);
router.post('/books/:id/renew', ctrl.renewBook);

// Documents and Results routes
router.get('/documents', ctrl.getStudentDocuments);
router.get('/final-results', ctrl.getStudentFinalResults);

module.exports = router;
