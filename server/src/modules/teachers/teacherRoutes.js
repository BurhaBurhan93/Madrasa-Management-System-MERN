const express = require('express');
const router = express.Router();
const authenticateToken = require('../../middleware/auth');
const ctrl = require('./teacherController');

const ensureTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Teachers only.' });
  }
  next();
};

router.use(authenticateToken);
router.use(ensureTeacher);

// Dashboard
router.get('/dashboard', ctrl.getDashboardStats);

// Students
router.get('/students', ctrl.getStudents);

// Subjects
router.get('/subjects', ctrl.getSubjects);

// Classes
router.get('/classes', ctrl.getClasses);

// Attendance Sessions
router.get('/sessions', ctrl.getSessions);
router.post('/sessions', ctrl.createSession);

// Attendance Records
router.post('/attendance', ctrl.markAttendance);
router.get('/attendance/session/:sessionId', ctrl.getAttendanceBySession);
router.get('/attendance/report', ctrl.getAttendanceReport);

// Assignments
router.get('/assignments', ctrl.getAssignments);
router.post('/assignments', ctrl.createAssignment);
router.put('/assignments/:id', ctrl.updateAssignment);
router.delete('/assignments/:id', ctrl.deleteAssignment);

// Exams
router.get('/exams', ctrl.getExams);

// Marks / Results
router.get('/results', ctrl.getResults);
router.post('/results/save-marks', ctrl.saveMarks);

// Complaints
router.get('/complaints', ctrl.getComplaints);
router.put('/complaints/:id/status', ctrl.updateComplaintStatus);

// Leave
router.get('/leave-types', ctrl.getLeaveTypes);
router.get('/leaves', ctrl.getMyLeaves);
router.post('/leaves', ctrl.applyLeave);

// Payslip
router.get('/payslips', ctrl.getMyPayslips);

module.exports = router;
