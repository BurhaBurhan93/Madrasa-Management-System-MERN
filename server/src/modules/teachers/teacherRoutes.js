const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { authorizeRoles } = require('../../middleware/auth');
const ctrl = require('./teacherController');

router.use(auth, authorizeRoles('teacher', 'admin'));

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
router.post('/complaints', ctrl.createComplaint);
router.put('/complaints/:id', ctrl.updateComplaint);
router.delete('/complaints/:id', ctrl.deleteComplaint);
router.put('/complaints/:id/status', ctrl.updateComplaintStatus);
router.get('/complaints/:id/feedback', ctrl.getComplaintFeedback);
router.post('/complaints/:id/feedback', ctrl.addComplaintFeedback);
router.delete('/complaint-feedback/:id', ctrl.deleteComplaintFeedback);

router.get('/feedback', ctrl.getTeacherFeedbacks);
router.get('/feedback/stats', ctrl.getTeacherFeedbackStats);
router.post('/feedback', ctrl.createTeacherFeedback);
router.put('/feedback/:id', ctrl.updateTeacherFeedback);
router.delete('/feedback/:id', ctrl.deleteTeacherFeedback);
router.get('/leave-types', ctrl.getLeaveTypes);
router.get('/leaves', ctrl.getMyLeaves);
router.post('/leaves', ctrl.applyLeave);
router.get('/payslips', ctrl.getMyPayslips);

module.exports = router;
