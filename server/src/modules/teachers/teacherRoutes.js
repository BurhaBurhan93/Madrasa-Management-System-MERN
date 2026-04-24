const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const ctrl = require('./teacherController');

router.use(auth);

router.get('/dashboard', ctrl.getDashboardStats);
router.get('/students', ctrl.getStudents);
router.get('/subjects', ctrl.getSubjects);
router.get('/classes', ctrl.getClasses);
router.get('/sessions', ctrl.getSessions);
router.post('/sessions', ctrl.createSession);
router.post('/attendance', ctrl.markAttendance);
router.get('/attendance/session/:sessionId', ctrl.getAttendanceBySession);
router.get('/attendance/report', ctrl.getAttendanceReport);
router.get('/assignments', ctrl.getAssignments);
router.post('/assignments', ctrl.createAssignment);
router.put('/assignments/:id', ctrl.updateAssignment);
router.delete('/assignments/:id', ctrl.deleteAssignment);
router.get('/exams', ctrl.getExams);
router.get('/results', ctrl.getResults);
router.post('/results/save-marks', ctrl.saveMarks);
router.get('/complaints', ctrl.getComplaints);
router.put('/complaints/:id/status', ctrl.updateComplaintStatus);
router.get('/leave-types', ctrl.getLeaveTypes);
router.get('/leaves', ctrl.getMyLeaves);
router.post('/leaves', ctrl.applyLeave);
router.get('/payslips', ctrl.getMyPayslips);

module.exports = router;
