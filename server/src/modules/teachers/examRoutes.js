const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { authorizeRoles } = require('../../middleware/auth');
const ctrl = require('./examController');

// Teacher exam routes (teacher/admin only)
router.get('/teacher/exams', auth, authorizeRoles('teacher', 'admin'), ctrl.getExams);
router.post('/teacher/exams', auth, authorizeRoles('teacher', 'admin'), ctrl.createExam);
router.get('/teacher/exams/:id', auth, authorizeRoles('teacher', 'admin'), ctrl.getExamById);
router.put('/teacher/exams/:id', auth, authorizeRoles('teacher', 'admin'), ctrl.updateExam);
router.delete('/teacher/exams/:id', auth, authorizeRoles('teacher', 'admin'), ctrl.deleteExam);
router.put('/teacher/exams/:id/publish', auth, authorizeRoles('teacher', 'admin'), ctrl.publishExam);
router.put('/teacher/exams/:id/close', auth, authorizeRoles('teacher', 'admin'), ctrl.closeExam);
router.get('/teacher/exams/:examId/questions', auth, authorizeRoles('teacher', 'admin'), ctrl.getQuestions);
router.post('/teacher/exams/:examId/questions', auth, authorizeRoles('teacher', 'admin'), ctrl.addQuestion);
router.put('/teacher/exams/:examId/questions/:questionId', auth, authorizeRoles('teacher', 'admin'), ctrl.updateQuestion);
router.delete('/teacher/exams/:examId/questions/:questionId', auth, authorizeRoles('teacher', 'admin'), ctrl.deleteQuestion);
router.get('/teacher/exams/:examId/submissions', auth, authorizeRoles('teacher', 'admin'), ctrl.getSubmissions);

router.get('/student/exams', auth, ctrl.getPublishedExams);
router.get('/student/exams/:id', auth, ctrl.getExamForAttempt);
router.post('/student/exams/:id/submit', auth, ctrl.submitExam);
router.get('/student/exams/:id/my-submission', auth, ctrl.getMySubmission);

module.exports = router;
