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

router.post('/complaints', ctrl.submitComplaint);

module.exports = router;
